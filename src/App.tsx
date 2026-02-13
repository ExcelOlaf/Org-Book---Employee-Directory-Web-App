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
              
              {/* Routes using the left sidebar layout */}
              <Route element={<MenuLayout />}>
                <Route path="/dashboard" element={<Navigate to="/person/730467" replace />} />
                <Route path="/departments" element={<DepartmentLookup />} />
                <Route path="/departments/:deptId" element={<DepartmentView />} />
                <Route path="/org-tree" element={<OrgTree />} />
                <Route path="/employees" element={<EmployeeSearch />} />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute user={user} requiredGroups={["Admin"]}>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/person/:id" element={<Dashboard />} />
              </Route>
            </Routes>
          </Router>
        </>
      )}
    </Authenticator>
  );
}