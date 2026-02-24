import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, signOut as amplifySignOut } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import MenuLayout from "./layouts/MenuLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentLookup from "./pages/DepartmentLookup";
import DepartmentView from "./pages/DepartmentView";
import OrgTree from "./pages/OrgTree";
import EmployeeSearch from "./pages/EmployeeSearch";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Auth Context ──────────────────────────────────────────────────────────────
// Provides the current Cognito user object and a signOut helper to any component
// in the tree via useAuth().
interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if a session already exists when the app first loads.
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));

    // Keep state in sync when Amplify fires sign-in / sign-out events
    // (e.g. the Login page calling signIn(), or a token expiry).
    const cancel = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        getCurrentUser()
          .then(setUser)
          .catch(() => setUser(null));
      }
      if (payload.event === "signedOut") {
        setUser(null);
      }
    });

    return cancel; // unsubscribe on unmount
  }, []);

  const handleSignOut = async () => {
    await amplifySignOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Loading…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signOut: handleSignOut }}>
      <Router>
        <Routes>
          {/* Login page – redirect straight to dashboard if already signed in */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          {/* Everything else lives inside the left-sidebar shell */}
          <Route element={<MenuLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <Navigate to="/person/730467" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments"
              element={
                <ProtectedRoute user={user}>
                  <DepartmentLookup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments/:deptId"
              element={
                <ProtectedRoute user={user}>
                  <DepartmentView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org-tree"
              element={
                <ProtectedRoute user={user}>
                  <OrgTree />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute user={user}>
                  <EmployeeSearch />
                </ProtectedRoute>
              }
            />
            {/* Settings is Admin-only */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={user} requiredGroups={["Admin"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/person/:id"
              element={
                <ProtectedRoute user={user}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}