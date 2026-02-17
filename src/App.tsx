import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import MenuLayout from "./layouts/MenuLayout";

import Dashboard from "./pages/Dashboard";
import DepartmentLookup from "./pages/DepartmentLookup";
import DepartmentView from "./pages/DepartmentView";
import OrgTree from "./pages/OrgTree";
import EmployeeSearch from "./pages/EmployeeSearch";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <header style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 1rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 600 }}>Welcome, {user?.username ?? "user"}</div>
            <div>
              <button onClick={signOut} style={{ padding: "0.35rem 0.6rem", cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          </header>

          <Router>
            <Routes>
              {/* Root redirects to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Routes using the left sidebar layout - all protected */}
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
        </>
      )}
    </Authenticator>
  );
}