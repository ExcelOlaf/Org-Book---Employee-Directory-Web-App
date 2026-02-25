import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Amplify } from "aws-amplify"
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito"
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

// Use sessionStorage so tokens are cleared when the tab/window is closed.
// Wrap in an async adapter because Amplify's KeyValueStorageInterface requires
// Promise-returning methods, but the native sessionStorage API is synchronous.
const sessionStorageAdapter = {
  setItem: (key: string, value: string) => Promise.resolve(sessionStorage.setItem(key, value)),
  getItem: (key: string) => Promise.resolve(sessionStorage.getItem(key)),
  removeItem: (key: string) => Promise.resolve(sessionStorage.removeItem(key)),
  clear: () => Promise.resolve(sessionStorage.clear()),
};
cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorageAdapter)

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
