import { dynamo } from "../shared/db-client";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const tableName = "Employee";

export const handler = async (event: any) => {
  const employeeId = event.pathParameters?.employeeId;
  const firstName = event.queryStringParameters?.firstName;
  const lastName = event.queryStringParameters?.lastName;

  // Validate input
  if (!employeeId && !firstName && !lastName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Provide EmployeeID or first/last name" }),
    };
  }

  try {
    // 🟢 Case 1: Lookup by ID (fast O(1))
    if (employeeId) {
      const id = Number(employeeId);
      if (isNaN(id)) {
        return { statusCode: 400, body: JSON.stringify({ message: "EmployeeID must be a number" }) };
      }

      const result = await dynamo.send(
        new GetCommand({
          TableName: tableName,
          Key: { EmployeeID: id },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.Item ?? {}),
      };
    }

    // 🟢 Case 2: Lookup by name (case-insensitive)
    const firstLower = firstName?.toLowerCase();
    const lastLower = lastName?.toLowerCase();

    // Example assumes you have a GSI for FirstNameLower + LastNameLower
    const result = await dynamo.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "FirstNameLower-LastNameLower-index", // <- Replace with your GSI name
        KeyConditionExpression: "FirstNameLower = :f and LastNameLower = :l",
        ExpressionAttributeValues: {
          ":f": firstLower,
          ":l": lastLower,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items ?? []),
    };
  } catch (err) {
    console.error("Error fetching employee:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) };
  }
};
