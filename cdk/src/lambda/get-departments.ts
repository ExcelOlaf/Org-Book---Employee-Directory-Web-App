import { dynamo } from "../shared/db-client";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.TABLE_NAME || "Employee";

export const handler = async () => {
    const result = await dynamo.send(
        new ScanCommand({
            TableName: tableName,
            ProjectionExpression: "DepartmentName",
        })
    );

    const unique = [
        ...new Set(result.Items?.map((i) => i.DepartmentName) ?? []),
    ];

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,OPTIONS",
        },
        body: JSON.stringify(unique ?? []),
    };
};
