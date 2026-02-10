
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MenuLayout from "./layouts/MenuLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentLookup from "./pages/DepartmentLookup";
import DepartmentView from "./pages/DepartmentView";
import OrgTree from "./pages/OrgTree";
import EmployeeSearch from "./pages/EmployeeSearch";
import Settings from "./pages/Settings";


export default function App() {
  return (
    <Router>
    <Routes>
            {/* Login page with no sidebar */}
    <Route path="/" element={<Login />} />
    
            {/* Everything else uses the left sidebar layout */}
          <Route element={<MenuLayout />}>
          <Route path="/dashboard" element={<Navigate to="/person/730467" replace />} />
          <Route path="/departments" element={<DepartmentLookup />} />
          <Route path="/departments/:deptId" element={<DepartmentView />} />
          <Route path="/org-tree" element={<OrgTree />} />
          <Route path="/employees" element={<EmployeeSearch />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/person/:id" element={<Dashboard />} />
          </Route>
          </Routes>
          </Router>
  );
}

