import { dynamo } from "../shared/db-client";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const tableName = "Employee";

export const handler = async (event: any) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "PATCH,OPTIONS",
    };

    const employeeId = event.pathParameters?.employeeId;
    if (!employeeId) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing employeeId" }) };
    }

    const body = JSON.parse(event.body ?? "{}");
    const { Picture } = body;
    if (!Picture) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing Picture URL" }) };
    }

    await dynamo.send(new UpdateCommand({
        TableName: tableName,
        Key: { EmployeeID: Number(employeeId) },
        UpdateExpression: "SET Picture = :pic",
        ExpressionAttributeValues: { ":pic": Picture },
    }));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
    };
};