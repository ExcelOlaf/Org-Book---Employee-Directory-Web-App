import type { ReactNode } from "react";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  user: any; // Amplify user object
  requiredGroups?: string[];
  children: ReactNode;
}

/**
 * ProtectedRoute component that enforces group-based access control.
 * If the user doesn't have the required groups, redirects to dashboard.
 */
export default function ProtectedRoute({ 
  user, 
  requiredGroups = ["Admin"], 
  children 
}: ProtectedRouteProps) {
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getGroups = async () => {
      try {
        const session = await fetchAuthSession();
        // The ID token is in the tokens
        const idToken = session.tokens?.idToken;
        const groups = idToken?.payload?.["cognito:groups"] as string[] || [];
        setUserGroups(groups);
        console.log("Groups from session:", groups);
      } catch (error) {
        console.error("Error fetching session:", error);
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

  // Check if user has at least one of the required groups
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

  return <>{children}</>;
}
