import { dynamo } from "../shared/db-client";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { buildApiHeaders } from "../shared/http-headers";

const tableName = process.env.TABLE_NAME || "Employee";

// GSIs:
// 1️⃣ FirstNameLower-LastNameLower-index (PK=FirstNameLower, SK=LastNameLower)
// 2️⃣ FirstNameLower-index

// 3️⃣ LastNameLower-index


export const handler = async (event: any) => {
  const headers = buildApiHeaders(event);
  const query = event.queryStringParameters ?? {};
  const { FirstName, LastName, Position, Title } = query;
  const positionTerm = String(Position ?? Title ?? "").trim().toLowerCase();

  const filterByPosition = (items: any[]) => {
    if (!positionTerm) return items;
    return items.filter((item) =>
      String(item?.Title ?? "").toLowerCase().includes(positionTerm)
    );
  };

  const ok = (items: any[]) => ({
    statusCode: 200,
    headers,
    body: JSON.stringify(items),
  });

  // ✅ Must provide at least one supported search field
  if (!FirstName && !LastName && !positionTerm) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Provide at least FirstName, LastName, or Position to search.",
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

      return ok(filterByPosition(result.Items ?? []));
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

      return ok(filterByPosition(result.Items ?? []));
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

      return ok(filterByPosition(result.Items ?? []));
    }

    // ✅ Case 4: Position only
    if (positionTerm) {
      const matches: any[] = [];
      let ExclusiveStartKey: Record<string, any> | undefined;

      do {
        const result = await dynamo.send(
          new ScanCommand({
            TableName: tableName,
            ExclusiveStartKey,
          })
        );

        matches.push(...filterByPosition(result.Items ?? []));
        ExclusiveStartKey = result.LastEvaluatedKey as Record<string, any> | undefined;
      } while (ExclusiveStartKey);

      return ok(matches);
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid search combination" }),
    };
  } catch (err: any) {
    console.error("❌ Search error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: err.message,
      }),
    };
  }
};
