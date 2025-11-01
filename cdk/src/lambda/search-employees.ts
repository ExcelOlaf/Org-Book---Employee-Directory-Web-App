import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../shared/db-client"

export const handler = async (event: any) => {
    const query = event.queryStringParameters ?? {};

    const filterParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(query)) {
        const nameKey = `#${key}`;
        const valueKey = `:${key}`;

        filterParts.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = value;
    }

    const params: any = { TableName: process.env.TABLE_NAME };

    if (filterParts.length > 0) {
        params.FilterExpression = filterParts.join(" AND ");
        params.ExpressionAttributeNames = expressionAttributeNames;
        params.ExpressionAttributeValues = expressionAttributeValues;
    }

    try {
        const result = await dynamo.send(new ScanCommand(params));
        return { statusCode: 200, body: JSON.stringify(result.Items) };
    } catch (err: any) {
        return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
}