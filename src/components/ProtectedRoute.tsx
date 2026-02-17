import type { ReactNode } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  user: any; // Amplify user object
  requiredGroups?: string[]; // If empty/undefined, just validates token exists
  children: ReactNode;
}

/**
 * ProtectedRoute component that enforces token validation and optional group-based access control.
 * - Always validates that a valid auth session exists with token
 * - If requiredGroups specified, enforces group membership
 * - If no requiredGroups, allows any authenticated user
 */
export default function ProtectedRoute({ 
  user, 
  requiredGroups, 
  children 
}: ProtectedRouteProps) {
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const session = await fetchAuthSession();
        // The ID token is in the tokens
        const idToken = session.tokens?.idToken;
        
        if (!idToken) {
          console.error("No valid ID token found");
          setHasValidToken(false);
          setUserGroups([]);
          return;
        }
        
        setHasValidToken(true);
        const groups = idToken?.payload?.["cognito:groups"] as string[] || [];
        setUserGroups(groups);
        console.log("Groups from session:", groups);
      } catch (error) {
        console.error("Error fetching session:", error);
        setHasValidToken(false);
        setUserGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    getGroups();
  }, [user]);

  if (isLoading) {
    return <div style={{ padding: "50px", textAlign: "center" }}>Loading...</div>;
  }

  // First check: Must have a valid token
  if (!hasValidToken) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Authentication Error</h2>
        <p>Unable to verify your authentication token.</p>
        <button onClick={() => window.location.reload()} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  // Second check: If specific groups required, verify membership
  if (requiredGroups && requiredGroups.length > 0) {
    const hasRequiredGroup = requiredGroups.some(group => 
      userGroups.includes(group)
    );

    if (!hasRequiredGroup) {
      return (
        <div style={{ padding: "50px", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to access this page.</p>
          <p>Required group: {requiredGroups.join(", ")}</p>
          <p>Your groups: {userGroups.length > 0 ? userGroups.join(", ") : "None"}</p>
          <a href="/dashboard" style={{ color: "blue", textDecoration: "underline" }}>
            Return to Dashboard
          </a>
        </div>
      );
    }
  }

  // All checks passed
  return <>{children}</>;
}
