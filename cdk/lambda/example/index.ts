import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const message = body.message;
    return {
      statusCode: 200,
      body: JSON.stringify({ message }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong" }),
    };
  }
};

// **Test invocation for local development**
if (require.main === module) {
  const testEvent = {
    body: JSON.stringify({ message: "Hello World!" }),
  } as APIGatewayProxyEvent;

  handler(testEvent).then(console.log).catch(console.error);
}
