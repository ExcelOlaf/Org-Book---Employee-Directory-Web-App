import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import crypto from "crypto";

const REGION = process.env.AWS_REGION || "us-east-2";
const USER_POOL_ID = process.env.USER_POOL_ID || "us-east-2_00owBPrPI";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "noreply@orgbooksd.com";
const APP_URL = process.env.APP_URL || "https://your-app.example.com/login";
// Optional: configuration set name to enable SES event publishing (Delivery/Bounce/Complaint)
const SES_CONFIG_SET = process.env.SES_CONFIG_SET;

if (!USER_POOL_ID) {
  // It's okay to throw at runtime if env not set; CDK will set these.
  console.warn("USER_POOL_ID not set in env");
}
if (!SENDER_EMAIL) {
  console.warn("SENDER_EMAIL not set in env");
}

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const ses = new SESClient({ region: REGION });

function randomFrom(chars: string, n: number) {
  const buf = crypto.randomBytes(n);
  return Array.from(buf).map(b => chars[b % chars.length]).join('');
}

function generateStrongTempPassword(length = 16): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "~`!@#$%^&*()_-+=|\\{}[]:;\"'<>,.?/"; // common safe symbols

  // Ensure required characters (as array of single chars)
  const requiredPieces = [
    randomFrom(upper, 1),
    randomFrom(lower, 1),
    randomFrom(digits, 1),
    randomFrom(symbols, 2), // ensure at least two symbols
  ];
  const required = requiredPieces.reduce<string[]>((acc, s) => acc.concat(s.split('')), []);

  // Build remainder
  const all = upper + lower + digits + symbols;
  const restCount = Math.max(0, length - required.length);
  const rest = randomFrom(all, restCount).split('');

  // Combine and shuffle
  const combined = required.slice().concat(rest);
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1);
    const tmp = combined[i];
    combined[i] = combined[j];
    combined[j] = tmp;
  }
  return combined.join('');
}

async function trySetPassword(username: string, poolId: string, password: string) {
  return cognito.send(new AdminSetUserPasswordCommand({
    UserPoolId: poolId,
    Username: username,
    Password: password,
    Permanent: false,
  }));
}

/**
 * Create user (SUPPRESS message), set a temporary password (retries if password policy rejects it),
 * optionally add group, then send an SES invite.
 *
 * Returns { tempPassword } for internal use only (avoid logging in production).
 */
export async function createAndInviteUser(email: string, opts?: { group?: string; tempPassword?: string; appUrl?: string; employeeId?: string | number }) {
  if (!email) throw new Error("email required");
  if (!USER_POOL_ID) throw new Error("USER_POOL_ID env var is missing");
  if (!SENDER_EMAIL) throw new Error("SENDER_EMAIL env var is missing");

  // Create user (suppress built-in email)
  try {
    const userAttributes: { Name: string; Value: string }[] = [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
    ];
    if (opts?.employeeId !== undefined) {
      userAttributes.push({ Name: "custom:employeeId", Value: String(opts.employeeId) });
    }
    await cognito.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: userAttributes,
      MessageAction: "SUPPRESS",
    }));
  } catch (err: any) {
    if (err.name && err.name !== "UsernameExistsException") {
      throw err;
    }
    // if user exists, we'll still try to set password and group
  }

  // Try setting a password that fits the policy; retry a few times on InvalidPasswordException
  const maxAttempts = 5;
  let attempt = 0;
  let lastPassword = opts?.tempPassword;
  while (attempt < maxAttempts) {
    attempt++;
    const pw = lastPassword || generateStrongTempPassword(16);
    try {
      await trySetPassword(email, USER_POOL_ID, pw);
      // success: attach group and send email
      if (opts?.group) {
        await cognito.send(new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: email,
          GroupName: opts.group,
        }));
      }

      const appUrl = opts?.appUrl || APP_URL;
      const subject = "You've been invited";
      const htmlBody = `
        <p>Hello,</p>
        <p>You've been invited to the app. Sign in using the temporary password below and change it on first login.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${pw}</p>
        <p><a href="${appUrl}">Open app</a></p>
      `;
      const textBody = `You've been invited.\nEmail: ${email}\nTemporary password: ${pw}\nOpen: ${appUrl}`;

      const sendParams: any = {
        Destination: { ToAddresses: [email] },
        Source: SENDER_EMAIL,
        ReplyToAddresses: [SENDER_EMAIL],
        Message: {
          Subject: { Data: subject },
          Body: {
            Html: { Data: htmlBody },
            Text: { Data: textBody },
          },
        },
      };
      if (SES_CONFIG_SET) sendParams.ConfigurationSetName = SES_CONFIG_SET;

      const sendResult = await ses.send(new SendEmailCommand(sendParams));

      // Log SES send result (MessageId) for troubleshooting/delivery tracing
      try {
        console.info(`SES send result for ${email}: ${JSON.stringify(sendResult)}`);
      } catch (e) {
        // ignore logging errors
      }

      // return the password for internal use only
      return { tempPassword: pw };
    } catch (err: any) {
      // If Cognito password policy rejects it, retry with a new password
      if (err.name === "InvalidPasswordException" || (err.__type && err.__type.includes('InvalidPasswordException'))) {
        // generate new password and retry
        lastPassword = undefined;
        console.warn(`Password attempt ${attempt} rejected by Cognito policy; retrying (attempt ${attempt + 1})`);
        if (attempt >= maxAttempts) {
          throw new Error("Exceeded attempts to generate a password that meets Cognito policy");
        }
        continue;
      }
      // other errors bubble up
      throw err;
    }
  }

  throw new Error("Failed to set temporary password");
}
