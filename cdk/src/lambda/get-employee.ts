import { dynamo } from "../shared/db-client"
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const tableName = "Employee";

export const handler = async (event: any) => {
  let employeeId = event.pathParameters?.employeeId;
  if (!employeeId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: JSON.stringify({ message: "Missing EmployeeID" })

    };
  }
  try {
    employeeId = Number(employeeId);
  } catch {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
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
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
      },
      body: JSON.stringify({ message: `No employee found with ID ${employeeId}` })
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    },
    body: JSON.stringify(result.Item ?? {})
  };
}