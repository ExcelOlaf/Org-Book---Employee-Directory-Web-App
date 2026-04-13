import { dynamo } from "../shared/db-client";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { buildApiHeaders } from "../shared/http-headers";

const tableName = process.env.TABLE_NAME || "Employee";

export const handler = async (event: any) => {
    const headers = buildApiHeaders(event);
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
        headers,
        body: JSON.stringify(unique ?? []),
    };
};
