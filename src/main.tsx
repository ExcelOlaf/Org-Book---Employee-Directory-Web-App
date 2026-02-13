import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Amplify } from "aws-amplify"
import awsExports from "./aws-exports"
import App from "./App"
import "./index.css"

// Configure Amplify with v6 format
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: awsExports.aws_user_pools_id,
      userPoolClientId: awsExports.aws_user_pools_web_client_id,
    }
  }
})

// Expose auth functions for console access to get tokens
;(async () => {
  try {
    const { fetchAuthSession, signOut } = await import("@aws-amplify/auth");
    (window as any).fetchAuthSession = fetchAuthSession;
    (window as any).signOut = signOut;
  } catch (e) {
    console.error("Failed to expose auth functions:", e);
  }
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
