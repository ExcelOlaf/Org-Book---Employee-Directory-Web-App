import { S3Handler } from 'aws-lambda';
import { S3, DynamoDB } from 'aws-sdk';

// Create clients for S3 and DynamoDB
const s3 = new S3();
const ddb = new DynamoDB.DocumentClient();

// Environment variables from CDK
const TABLE_NAME = process.env.TABLE_NAME!;
const PRIMARY_KEY = process.env.PRIMARY_KEY || 'EmployeeID';

// Handler for S3 upload events
export const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      // Fetch uploaded file from S3
      const object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
      if (!object.Body) continue;

      // Parse the JSON data
      const data = JSON.parse(object.Body.toString('utf-8'));
      const items = Array.isArray(data) ? data : [data];

      // Insert or Update each record in DynamoDB
      for (const item of items) {
        if (!(PRIMARY_KEY in item)) {
          console.warn(`Skipping record without ${PRIMARY_KEY}:`, item);
          continue;
        }

        const updateFields = Object.keys(item).filter((k) => k !== PRIMARY_KEY);
        const exprNames: Record<string, string> = {};
        const exprValues: Record<string, any> = {};

        updateFields.forEach((f) => {
          exprNames[`#${f}`] = f;
          exprValues[`:${f}`] = item[f];
        });

        // Add lastUpdated field for tracking
        exprNames['#lastUpdated'] = 'lastUpdated';
        exprValues[':lastUpdated'] = new Date().toISOString();
        updateFields.push('lastUpdated');

        const updateExpr = `SET ${updateFields.map((f) => `#${f} = :${f}`).join(', ')}`;

        await ddb
          .update({
            TableName: TABLE_NAME,
            Key: { [PRIMARY_KEY]: item[PRIMARY_KEY] },
            UpdateExpression: updateExpr,
            ExpressionAttributeNames: exprNames,
            ExpressionAttributeValues: exprValues,
          })
          .promise();
      }

      console.log(`✅ Successfully processed file: s3://${bucket}/${key}`);
    } catch (error) {
      console.error(`❌ Failed to process ${key}:`, error);
    }
  }
};
