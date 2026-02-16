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

export default function MenuLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="menu-layout">
      <aside className="menu-layout__sidebar">
        <div className="menu-layout__header">
          <h1 className="menu-layout__title">OrgBook</h1>
        </div>

        <nav className="menu-layout__nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`menu-layout__button ${isActive ? "menu-layout__button--active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="menu-layout__main">
        <Outlet />
      </main>
    </div>
  );
}