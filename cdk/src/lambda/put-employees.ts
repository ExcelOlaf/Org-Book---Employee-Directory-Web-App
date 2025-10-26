import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "../shared/db-client";
import { marshall } from '@aws-sdk/util-dynamodb';
import { s3 } from '../shared/s3-client';
import { S3Event } from "aws-lambda";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const tableName = "Employee";

// Default picture link to assign
const DEFAULT_PICTURE_URL = "https://mployee-data-bucket.s3.us-east-2.amazonaws.com/defaultpfp.png";

// files uploaded to s3 bucket should be JSON array of employees
export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const response = await s3.send(command);
      const fileContents = await streamToString(response.Body as any);
      const dataArray = JSON.parse(fileContents);

      if (!Array.isArray(dataArray)) {
        throw new Error("Expected JSON array in file");
      }

      for (const data of dataArray) {
        if (!data.EmployeeID) {
          console.warn("Skipping item with no EmployeeID:", data);
          continue;
        }

        if (!data.Picture) {
          data.Picture = DEFAULT_PICTURE_URL;
        }

        await dynamo.send(
          new PutItemCommand({
            TableName: tableName,
            Item: marshall(data),
          })
        );
      }
    } catch (err) {
      console.error(`Error processing ${key}:`, err);
    }
  }
};

// Helper function: convert S3 stream to string
const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });