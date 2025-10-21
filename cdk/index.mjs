import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"; 
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const s3 = new S3Client({ region: "us-east-2" });
const ddb = new DynamoDBClient({});

// Stream helper
const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });

export const handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    // ✅ Get table name from environment variable or key prefix
    let tableName = process.env.TABLE_NAME;
    if (!tableName && key.includes("/")) {
      const maybe = key.split("/")[0];
      if (maybe.toLowerCase().startsWith("table-"))
        tableName = maybe.replace(/^table-/, "");
    }

    if (!tableName) throw new Error("No DynamoDB table specified!");

    // ✅ Read file from S3
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await streamToString(obj.Body);
    const items = JSON.parse(body);

    if (!Array.isArray(items))
      throw new Error("Expected an array of items in the file.");

    // ✅ Insert items directly into DynamoDB
    for (const item of items) {
      // 🖼 Add default profile picture if missing
      if (!item.ProfilePicture) {
        item.ProfilePicture = { S: "https://mployee-data-bucket.s3.us-east-2.amazonaws.com/defaultpfp.png" };
      }

      await ddb.send(
        new PutItemCommand({
          TableName: tableName,
          Item: item,
        })
      );
    }

    console.log(`✅ Inserted ${items.length} items into ${tableName} from ${key}`);
  }
};
