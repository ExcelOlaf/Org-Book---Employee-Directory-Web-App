import type { ReactNode } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

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
        // forceRefresh: true forces Amplify to re-validate against Cognito
        // rather than returning a cached in-memory token
        const session = await fetchAuthSession({ forceRefresh: true });
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

  // No valid token → redirect to login
  if (!hasValidToken) {
    return <Navigate to="/" replace />;
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
