import { PreTokenGenerationTriggerEvent, PreTokenGenerationTriggerHandler } from "aws-lambda";

/**
 * Pre Token Generation Lambda Trigger
 * Adds custom claims (email, groups) to both ID token and access token
 * Use trigger version V2_0 in Cognito for access token claims
 */
export const handler: PreTokenGenerationTriggerHandler = async (event: PreTokenGenerationTriggerEvent) => {
  console.log("Pre-token generation event:", JSON.stringify(event, null, 2));

  const email = event.request.userAttributes.email;
  const groups = event.request.groupConfiguration?.groupsToOverride || [];

  // Check trigger version
  if (event.triggerSource === "TokenGeneration_HostedAuth" || event.triggerSource === "TokenGeneration_Authentication") {
    // V2_0 trigger - adds claims to both ID token and access token
    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: {
        email: email,
        groups: groups.join(','),
      },
      groupOverrideDetails: {
        groupsToOverride: groups,
      }
    };
  } else {
    // V1_0 trigger - only adds to ID token
    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: {
        email: email,
        groups: groups.join(','),
      },
    };
  }

  console.log("Modified response:", JSON.stringify(event.response, null, 2));
  return event;
};
