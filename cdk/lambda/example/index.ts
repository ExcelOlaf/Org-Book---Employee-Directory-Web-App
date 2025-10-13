import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.EMPLOYEE_TABLE!;

export const handler = async (event: any) => {
  const action = event.action;

  if (action === "createEmployee") {
    const employee = {
      employee_id: event.employee_id,
      name: event.name,
      role: event.role,
      manager_id: event.manager_id
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: employee
    }));

    return { message: "Employee created", employee };
  }

  if (action === "getEmployee") {
    const emp = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { employee_id: event.employee_id }
    }));

    // query direct reports via manager_id GSI if you added it
    let reports: any[] = [];
    if (emp.Item) {
      const resp = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "ManagerIndex",
        KeyConditionExpression: "manager_id = :m",
        ExpressionAttributeValues: { ":m": emp.Item.employee_id }
      }));
      reports = resp.Items ?? [];
    }

    return { employee: emp.Item, reports };
  }

  return { message: "Unknown action" };
};
