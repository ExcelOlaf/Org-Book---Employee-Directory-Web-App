import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import express from 'express';
import serverlessExpress from 'serverless-express';

const app = express();

app.use(express.json());

// Your API routes will go here
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Export the serverless handler
export const handler = serverlessExpress({ app });