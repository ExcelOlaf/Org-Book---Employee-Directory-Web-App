import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
 
type MenuItem = {
  name: string;
  path: string;
};
 
const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Department Lookup", path: "/departments" },
  { name: "Employee Lookup", path: "/employees" },
  { name: "Org Tree", path: "/org-tree" },
  { name: "Settings", path: "/settings" },
];
 
const rootStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "#020617",
  color: "white",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
 
const sidebarStyle: React.CSSProperties = {
  width: "220px",
  backgroundColor: "#020617",
  color: "white",
  display: "flex",
  flexDirection: "column",
  padding: "24px 16px",
  boxSizing: "border-box",
};
 
const menuButtonStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #4b5563",
  backgroundColor: "#ffffffff",
  cursor: "pointer",
  fontSize: "14px",
  marginBottom: "12px",
};
 
const menuButtonActiveStyle: React.CSSProperties = {
  ...menuButtonStyle,
  backgroundColor: "#7d7d7dff",
};
 
const mainStyle: React.CSSProperties = {
  flex: 1,
  padding: "24px",
  boxSizing: "border-box",
};
 
export default function MenuLayout() {
  const navigate = useNavigate();
  const location = useLocation();
 
  return (
<div style={rootStyle}>
      {/* LEFT COLUMN SIDEBAR ONLY */}
<aside style={sidebarStyle}>
<div style={{ marginBottom: "24px", paddingLeft: "4px" }}>
<h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>
            OrgBook
</h1>
</div>
 
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
<button
                key={item.path}
                style={isActive ? menuButtonActiveStyle : menuButtonStyle}
                onClick={() => navigate(item.path)}
>
                {item.name}
</button>
            );
          })}
</nav>
</aside>
 
      {/* RIGHT SIDE CONTENT AREA */}
<main style={mainStyle}>
<Outlet />
</main>
</div>
  );
}