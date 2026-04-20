import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from "@aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import MenuLayout from "./layouts/MenuLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentLookup from "./pages/DepartmentLookup";
import DepartmentView from "./pages/DepartmentView";
import OrgTree from "./pages/OrgTree";
import EmployeeSearch from "./pages/EmployeeSearch";
import Fun from "./pages/Fun";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

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

function DashboardRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        const payload = session.tokens?.idToken?.payload as Record<string, any> | undefined;
        const employeeId = payload?.["employeeId"] ?? payload?.["custom:employeeId"];
        setTarget(employeeId ? `/person/${employeeId}` : "/person/730467");
      })
      .catch(() => setTarget("/person/730467"));
  }, []);

  if (!target) return null;
  return <Navigate to={target} replace />;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));

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

    return cancel;
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
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Login />}
          />

          <Route element={<MenuLayout />}>
            <Route
              path="dashboard"
              element={
                <ProtectedRoute user={user}>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments"
              element={
                <ProtectedRoute user={user}>
                  <DepartmentLookup />
                </ProtectedRoute>
              }
            />
            <Route
              path="departments/:deptId"
              element={
                <ProtectedRoute user={user}>
                  <DepartmentView />
                </ProtectedRoute>
              }
            />
            <Route
              path="org-tree/:id"
              element={
                <ProtectedRoute user={user}>
                  <OrgTree />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees"
              element={
                <ProtectedRoute user={user}>
                  <EmployeeSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="fun"
              element={
                <ProtectedRoute user={user}>
                  <Fun />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute user={user}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="person/:id"
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