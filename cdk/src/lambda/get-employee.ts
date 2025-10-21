import { dynamo } from "../shared/db-client"
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const tableName = "Employee";

export const handler = async (event: any) => {
    let employeeId = event.pathParameters?.employeeId;
    if (!employeeId) {
        return { statusCode: 400, body: JSON.stringify({ message: "Missing EmployeeID" }) };
    }
    try {
        employeeId = Number(employeeId);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: "EmployeeID must be a number" }) };
    }

    const result = await dynamo.send(
            new GetCommand({
                TableName: tableName,
                Key: { EmployeeID: employeeId }
            })
        );

        return { statusCode: 200, body: JSON.stringify(result.Item ?? {}) };
}