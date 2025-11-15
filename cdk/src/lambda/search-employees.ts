import { dynamo } from "../shared/db-client";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.TABLE_NAME || "Employee";

// GSIs:
// 1️⃣ FirstNameLower-LastNameLower-index (PK=FirstNameLower, SK=LastNameLower)
// 2️⃣ FirstNameLower-index

// 3️⃣ LastNameLower-index


export const handler = async (event: any) => {
  const query = event.queryStringParameters ?? {};
  const { FirstName, LastName } = query;

  // ✅ Must provide at least first or last name
  if (!FirstName && !LastName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Provide at least FirstName or LastName to search.",
      }),
    };
  }

  try {
    // ✅ Case 1: First + Last
    if (FirstName && LastName) {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: "FirstNameLower-LastNameLower-index",
          KeyConditionExpression: "FirstNameLower = :f AND LastNameLower = :l",
          ExpressionAttributeValues: {
            ":f": FirstName.toLowerCase(),
            ":l": LastName.toLowerCase(),
          },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.Items ?? []),
      };
    }

    // ✅ Case 2: First name only
    if (FirstName) {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: "FirstNameLower-index",
          KeyConditionExpression: "FirstNameLower = :f",
          ExpressionAttributeValues: {
            ":f": FirstName.toLowerCase(),
          },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.Items ?? []),
      };
    }

    // ✅ Case 3: Last name only
    if (LastName) {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: tableName,
          IndexName: "LastNameLower-index",
          KeyConditionExpression: "LastNameLower = :l",
          ExpressionAttributeValues: {
            ":l": LastName.toLowerCase(),
          },
        })
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.Items ?? []),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid search combination" }),
    };
  } catch (err: any) {
    console.error("❌ Search error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message,
      }),
    };
  }
};
