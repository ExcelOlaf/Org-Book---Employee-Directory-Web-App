import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// 👇 Pull table name from environment variable (set by CDK)
const TABLE_NAME = process.env.EMPLOYEE_TABLE!;

// Optional: strongly type an Employee
interface Employee {
  EmployeeID: number;
  Name?: string;
  Address?: string;
  DepartmentCode?: string;
  ManagerID?: number;
}

export const handler = async (event: any) => {
  const action = event.action;

  // Fetch a single employee and their direct reports
  if (action === "getEmployee") {
    const emp = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { EmployeeID: event.EmployeeID } // 👈 must match table schema
    }));

    let reports: Employee[] = [];

    // If the employee exists, query reports using ManagerIndex GSI
    if (emp.Item) {
      const resp = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "ManagerIndex", // only works if you’ve created a GSI on ManagerID
        KeyConditionExpression: "ManagerID = :m",
        ExpressionAttributeValues: { ":m": emp.Item.EmployeeID }
      }));
      reports = (resp.Items as Employee[]) ?? [];
    }

    return { employee: emp.Item, reports };
  }

  return { message: "Unknown action", received: event };
};
