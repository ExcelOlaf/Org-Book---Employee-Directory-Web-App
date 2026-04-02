import { GetObjectCommand } from "@aws-sdk/client-s3";
import { dynamo } from "../shared/db-client"
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../shared/s3-client";
import { buildApiHeaders } from "../shared/http-headers";

const tableName = "Employee";
const imageBucketName = "mployee-data-bucket";

export const handler = async (event: any) => {
  const headers = buildApiHeaders(event);
  let employeeId = event.pathParameters?.employeeId;
  if (!employeeId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Missing EmployeeID" })

    };
  }
  try {
    employeeId = Number(employeeId);
  } catch {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "EmployeeID must be a number" })
    };
  }

  const result = await dynamo.send(
    new GetCommand({
      TableName: tableName,
      Key: { EmployeeID: employeeId }
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: `No employee found with ID ${employeeId}` })
    }
  }

  
  const command = new GetObjectCommand({
    Bucket: imageBucketName,
    Key: result.Item.Picture.split("/").slice(3).join("/"),
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 300 });
  result.Item.Picture = url;
  return {
    statusCode: 200,
    headers,
    
    body: JSON.stringify(result.Item ?? {})
  };
}