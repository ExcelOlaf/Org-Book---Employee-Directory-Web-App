import { dynamo } from "../shared/db-client";
import { PutCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { s3 } from "../shared/s3-client";
import { S3Event } from "aws-lambda";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const tableName = "Employee";
const DEFAULT_PICTURE_URL =
  "https://mployee-data-bucket.s3.us-east-2.amazonaws.com/defaultpfp.png";

const sqs = new SQSClient({ region: process.env.AWS_REGION || "us-east-2" });
const INVITE_QUEUE_URL = process.env.INVITE_QUEUE_URL;

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3.send(command);
      const fileContents = await streamToString(response.Body as any);
      const dataArray = JSON.parse(fileContents);

      if (!Array.isArray(dataArray)) throw new Error("Expected JSON array");

      for (const data of dataArray) {
        if (!data.EmployeeID) {
          console.warn("Skipping item with no EmployeeID:", data);
          continue;
        }

        // Check if EmployeeID exists
        const existing = await dynamo.send(
          new GetCommand({ TableName: tableName, Key: { EmployeeID: data.EmployeeID } })
        );

        if (!existing.Item) {
          // 🟢 New item: require FirstName and LastName
          if (!data.FirstName || !data.LastName) {
            console.warn(
              "Skipping new item with missing FirstName/LastName:",
              data
            );
            continue;
          }

          // Defaults
          if (!data.Picture) data.Picture = DEFAULT_PICTURE_URL;
          data.FirstNameLower = data.FirstName.toLowerCase();
          data.LastNameLower = data.LastName.toLowerCase();

          // Put all fields dynamically
          await dynamo.send(
            new PutCommand({
              TableName: tableName,
              Item: data, // Includes all fields from JSON
            })
          );

          console.log("Created new employee:", data.EmployeeID);
        } else {
          // 🟡 Existing item: update only provided fields dynamically
          
          // Maintain consistency for lowercase fields
          if (data.FirstName) data.FirstNameLower = data.FirstName.toLowerCase();
          if (data.LastName) data.LastNameLower = data.LastName.toLowerCase();
          const updateParts: string[] = [];
          const expressionAttributeValues: Record<string, any> = {};
          const expressionAttributeNames: Record<string, string> = {};

          for (const [key, value] of Object.entries(data)) {
            if (key === "EmployeeID") continue; // Skip primary key
            const attrKey = `#${key}`;
            const valueKey = `:${key}`;
            updateParts.push(`${attrKey} = ${valueKey}`);
            expressionAttributeNames[attrKey] = key;
            expressionAttributeValues[valueKey] = value;
          }

          if (updateParts.length > 0) {
            await dynamo.send(
              new UpdateCommand({
                TableName: tableName,
                Key: { EmployeeID: data.EmployeeID },
                UpdateExpression: `SET ${updateParts.join(", ")}`,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: expressionAttributeValues,
              })
            );

            console.log("Updated existing employee:", data.EmployeeID);
          }
        }

        // Only invite when explicit flag is true
        if (data.SendInvite === true || data.SendInvite === "true") {
          // Accept multiple possible email field names from input files
          const email = data.Email || data.email || data.EmployeeEmail || data.EmailAddress || data.emailAddress;
          if (!email) {
            console.warn("SendInvite true but no email present for:", data.EmployeeID);
          } else if (!INVITE_QUEUE_URL) {
            console.error("INVITE_QUEUE_URL not set; skipping invite for", data.EmployeeID);
          } else {
            // Send both `email` and `emailAddress` to be compatible with
            // consumers that expect either key.
            const msg = {
              email,
              emailAddress: email,
              group: data.Group || data.group,
              employeeId: data.EmployeeID,
              // optionally pass tempPassword or appUrl if needed
            };
            try {
              await sqs.send(new SendMessageCommand({
                QueueUrl: INVITE_QUEUE_URL,
                MessageBody: JSON.stringify(msg),
              }));
              console.log("Enqueued invite for", email);
            } catch (e) {
              console.error("Failed to enqueue invite for", email, e);
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error processing ${key}:`, err);
    }
  }
};

// Helper: convert S3 stream to string
const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
