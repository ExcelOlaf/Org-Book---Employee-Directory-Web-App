import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const API_URL = process.env.API_URL || "https://7ioctu70uj.execute-api.us-east-2.amazonaws.com";

const client = new DynamoDBClient({
  region: "us-east-2",
});

const ddb = DynamoDBDocumentClient.from(client);

export { ddb, API_URL };