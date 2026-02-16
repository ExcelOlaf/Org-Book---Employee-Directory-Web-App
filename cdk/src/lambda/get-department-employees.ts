import { dynamo } from "../shared/db-client";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.TABLE_NAME || "Employee";

export const handler = async (event: any) => {
    const departmentName = decodeURIComponent(event.pathParameters?.departmentName);
    if (!departmentName) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify({
                message: "Missing a department name",
            }),
        };
    }

    try {
        const result = await dynamo.send(
            new QueryCommand({
                TableName: tableName,
                IndexName: "Department-Name-index",
                KeyConditionExpression: "DepartmentName = :dept",
                ExpressionAttributeValues: {
                    ":dept": departmentName,
                },
            })
        );

        const simplified = result.Items?.map(({ EmployeeID, FirstName, LastName }) => ({
            EmployeeID,
            FirstName,
            LastName,
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify(simplified ?? []),
        };
    } catch (err: any) {
        console.error("Error:", err);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify({
                message: "Internal Server Error",
                error: err.message,
            }),
        };
    }
};
