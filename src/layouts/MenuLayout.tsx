import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useAuth } from "../App";

type MenuItem = {
  name: string;
  path: string;
};

const FALLBACK_ID = 730467;

const staticMenuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Department Lookup", path: "/departments" },
  { name: "Employee Lookup", path: "/employees" },
  { name: "Settings", path: "/settings" },
];

export default function MenuLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: _user, signOut } = useAuth();
  const [orgTreePath, setOrgTreePath] = useState(`/org-tree/${FALLBACK_ID}`);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        const payload = session.tokens?.idToken?.payload as Record<string, any> | undefined;
        const employeeId = payload?.["employeeId"] ?? payload?.["custom:employeeId"];
        setOrgTreePath(`/org-tree/${employeeId ?? FALLBACK_ID}`);
      })
      .catch(() => setOrgTreePath(`/org-tree/${FALLBACK_ID}`));
  }, []);

  const menuItems: MenuItem[] = [
    ...staticMenuItems,
    { name: "Org Tree", path: orgTreePath },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="menu-layout">
      <aside className="menu-layout__sidebar">
        <div className="menu-layout__header">
          <button className="menu-layout__title" onClick={() => navigate(menuItems[0].path)}>OrgBook</button>
        </div>
        <nav className="menu-layout__nav">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                className={`menu-layout__button ${isActive ? "menu-layout__button--active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="menu-layout__footer">
          <button className="menu-layout__button" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="menu-layout__main">
        <Outlet />
      </main>
    </div>
  );
}