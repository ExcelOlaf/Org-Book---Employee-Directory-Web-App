import { DynamoDBClient, PutItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({ region: "us-east-2" });

// Default picture link to assign
const DEFAULT_PICTURE_URL = "https://mployee-data-bucket.s3.us-east-2.amazonaws.com/defaultpfp.png";

export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const tableName = body?.tableName;
    const items = body?.items;

    if (!tableName || !Array.isArray(items)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
    }

    // 🔹 Insert new items (always attach Picture)
    for (const item of items) {
      // Add default picture if missing
      if (!item.Picture) {
        item.Picture = DEFAULT_PICTURE_URL;
      }

      const marshalledItem = Object.entries(item).reduce((acc, [key, value]) => {
        acc[key] = typeof value === "number"
          ? { N: value.toString() }
          : { S: value.toString() };
        return acc;
      }, {});

      await ddb.send(new PutItemCommand({
        TableName: tableName,
        Item: marshalledItem,
      }));
    }

    // 🔹 Update all existing items in the table (make sure they have Picture)
    const scanResult = await ddb.send(new ScanCommand({ TableName: tableName }));
    for (const oldItem of scanResult.Items || []) {
      if (!oldItem.Picture) {
        const employeeId = oldItem.EmployeeID?.N || oldItem.EmployeeID?.S;
        if (!employeeId) continue;

        await ddb.send(new UpdateItemCommand({
          TableName: tableName,
          Key: { EmployeeID: { N: employeeId.toString() } },
          UpdateExpression: "SET Picture = :pic",
          ExpressionAttributeValues: {
            ":pic": { S: DEFAULT_PICTURE_URL },
          },
        }));
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `✅ Inserted ${items.length} item(s) and ensured all have Picture attribute in ${tableName}` }),
    };

  } catch (err) {
    console.error("Error inserting:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
