import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../shared/s3-client";

const imageBucketName = "mployee-data-bucket";

export const handler = async (event: any) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
    };

    const employeeId = event.pathParameters?.employeeId;
    if (!employeeId) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing employeeId" }) };
    }

    const fileType = "image/png";
    const key = `profile-pictures/${employeeId}.png`;

    const command = new PutObjectCommand({
        Bucket: imageBucketName,
        Key: key,
        ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const pictureUrl = `https://${imageBucketName}.s3.amazonaws.com/${key}`;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ uploadUrl, pictureUrl }),
    };
};