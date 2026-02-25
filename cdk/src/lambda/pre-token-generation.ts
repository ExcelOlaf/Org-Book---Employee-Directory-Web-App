import { PreTokenGenerationTriggerEvent, PreTokenGenerationTriggerHandler } from "aws-lambda";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const TABLE_NAME = process.env.TABLE_NAME || "Employee";
const USER_POOL_ID = process.env.USER_POOL_ID || "us-east-2_00owBPrPI";
const REGION = process.env.AWS_REGION || "us-east-2";

const dynamo = new DynamoDBClient({ region: REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

/**
 * Scan up to 200 employees and return a random EmployeeID.
 * Efficient enough for a typical phonebook-sized table.
 */
async function getRandomEmployeeId(): Promise<string> {
  const result = await dynamo.send(new ScanCommand({
    TableName: TABLE_NAME,
    ProjectionExpression: "EmployeeID",
    Limit: 200,
  }));
  const items = result.Items ?? [];
  if (items.length === 0) throw new Error("No employees found in table");
  const randomItem = items[Math.floor(Math.random() * items.length)];
  return String(randomItem.EmployeeID?.N ?? randomItem.EmployeeID?.S ?? "0");
}

/**
 * Pre Token Generation Lambda Trigger
 * - Injects email, groups, and employeeId into the token.
 * - If the user has no custom:employeeId (e.g. manually added dev), a random
 *   employee is assigned and persisted to their Cognito profile so subsequent
 *   logins always resolve to the same employee.
 * Use trigger version V2_0 in Cognito for access token claims.
 */
export const handler: PreTokenGenerationTriggerHandler = async (event: PreTokenGenerationTriggerEvent) => {
  console.log("Pre-token generation event:", JSON.stringify(event, null, 2));

  const email = event.request.userAttributes.email;
  const groups = event.request.groupConfiguration?.groupsToOverride || [];

  // Resolve employeeId — use stored value, or assign a random one for manual users
  let employeeId: string | undefined = event.request.userAttributes["custom:employeeId"];

  if (!employeeId) {
    try {
      employeeId = await getRandomEmployeeId();
      // Persist so the user always maps to the same employee going forward
      await cognitoClient.send(new AdminUpdateUserAttributesCommand({
        UserPoolId: USER_POOL_ID,
        Username: event.userName,
        UserAttributes: [{ Name: "custom:employeeId", Value: employeeId }],
      }));
      console.log(`Assigned random employeeId ${employeeId} to user ${event.userName}`);
    } catch (err) {
      console.error("Failed to assign random employeeId:", err);
    }
  }

  const claimsToAdd: Record<string, string> = {
    email,
    groups: groups.join(','),
    ...(employeeId ? { employeeId } : {}),
  };

  // Check trigger version
  if (event.triggerSource === "TokenGeneration_HostedAuth" || event.triggerSource === "TokenGeneration_Authentication") {
    // V2_0 trigger - adds claims to both ID token and access token
    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: claimsToAdd,
      groupOverrideDetails: {
        groupsToOverride: groups,
      }
    };
  } else {
    // V1_0 trigger - only adds to ID token
    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: claimsToAdd,
    };
  }

  console.log("Modified response:", JSON.stringify(event.response, null, 2));
  return event;
};
