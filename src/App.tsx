import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuLayout from "./layouts/MenuLayout";
 
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DepartmentLookup from "./pages/DepartmentLookup";
import OrgTree from "./pages/OrgTree";
import EmployeeSearch from "./pages/EmployeeSearch";
import Settings from "./pages/Settings";
import PersonView from "./pages/PersonView";
 
export default function App() {
  return (
    <Router>
    <Routes>
            {/* Login page with no sidebar */}
    <Route path="/" element={<Login />} />
    
            {/* Everything else uses the left sidebar layout */}
    <Route element={<MenuLayout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/departments" element={<DepartmentLookup />} />
    <Route path="/org-tree" element={<OrgTree />} />
    <Route path="/employees" element={<EmployeeSearch />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/person/:id" element={<PersonView />} />
    </Route>
    </Routes>
    </Router>
  );
}