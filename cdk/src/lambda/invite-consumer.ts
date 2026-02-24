import { SQSEvent, Context } from "aws-lambda";
import { createAndInviteUser } from "./employee-processor";

export const handler = async (event: SQSEvent, _ctx: Context) => {
  for (const record of event.Records) {
    try {
      const body = typeof record.body === "string" ? JSON.parse(record.body) : record.body;
      const email = body.emailAddress || body.EmailAddress;
      const group = body.group || body.Group;
      if (!email) {
        console.warn("Skipping invite message without email:", body);
        continue;
      }

      // call shared helper
      await createAndInviteUser(email, { group: group, tempPassword: body.tempPassword, appUrl: body.appUrl });
      console.log(`Invite processed for ${email}`);
    } catch (err: any) {
      console.error("Failed to process invite message", err, "messageBody:", record.body);
      // Throwing will cause the message to be retried / sent to DLQ according to queue settings.
      throw err;
    }
  }
};
