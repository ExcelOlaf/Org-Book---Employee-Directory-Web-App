import { useState } from "react";
import { useNavigate } from "react-router-dom";

const departments = [
  { id: "hr", name: "HR" },
  { id: "engineering", name: "Engineering" },
  { id: "sales", name: "Sales" },
  { id: "it", name: "IT" },
  { id: "business", name: "Business" },
  { id: "qa", name: "QA" },
];

const mockEmployees: Record<string, string[]> = {
  hr: ["Lisa Walker", "Tom Reed", "Sandra Lin"],
  engineering: ["Marcus Hill", "Dev Patel", "Ana Gomez"],
  sales: ["Sarah Kim", "Randy Fox"],
  it: ["John Doe", "Mary Green"],
  business: ["Ella Brown"],
  qa: ["Rob Stevens"],
};

export default function DepartmentLookup() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const navigate = useNavigate();

  // —— Shared styles (no Tailwind needed) ——
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f7f7f9",
      padding: "32px 24px",
    },
    title: {
      textAlign: "center" as const,
      fontSize: 36,
      fontWeight: 800,
      color: "#0b132b",
      marginBottom: 24,
    },
    grid: {
      width: "100%",
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 24,
      maxWidth: 1200,
    },
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none" as const,
      height: 200,
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 16,
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      fontSize: 32,
      fontWeight: 700,
      letterSpacing: 0.5,
      cursor: "pointer",
      transition: "transform .15s ease, box-shadow .15s ease, background .15s ease",
    },
    cardHover: {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
      background: "#eef5ff",
    },
    backBtn: {
      display: "inline-block",
      marginBottom: 16,
      padding: "10px 16px",
      background: "#374151",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      cursor: "pointer",
    },
    deptHeader: {
      fontSize: 28,
      fontWeight: 800,
      color: "#0b132b",
      marginBottom: 16,
      textTransform: "capitalize" as const,
    },
    list: { listStyle: "none", padding: 0, margin: 0, maxWidth: 520 },
    listItem: {
      background: "#eef5ff",
      border: "1px solid #cfe0ff",
      borderRadius: 12,
      padding: "14px 16px",
      fontSize: 18,
      marginBottom: 12,
      cursor: "pointer",
      transition: "background .15s ease",
    },
  };

  return (
    <div style={styles.page}>
      {!selectedDept ? (
        <>
          <h1 style={styles.title}>Department Lookup</h1>

          <div style={styles.grid}>
            {departments.map((dept) => (
              <DeptTile
                key={dept.id}
                label={dept.name}
                onClick={() => setSelectedDept(dept.id)}
                styles={styles}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <button style={styles.backBtn} onClick={() => setSelectedDept(null)}>
            ← Back to Departments
          </button>

          <h2 style={styles.deptHeader}>{selectedDept} Department</h2>

          <ul style={styles.list}>
            {(mockEmployees[selectedDept] || []).map((emp) => (
              <li
                key={emp}
                style={styles.listItem}
                onClick={() => navigate(`/org-tree/${encodeURIComponent(emp)}`)}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLLIElement).style.background = "#e1edff")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLLIElement).style.background = "#eef5ff")
                }
              >
                {emp}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DeptTile({
  label,
  onClick,
  styles,
}: {
  label: string;
  onClick: () => void;
  styles: any;
}) {
  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) => {
        Object.assign((e.currentTarget as HTMLDivElement).style, styles.cardHover);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = styles.card.boxShadow;
        (e.currentTarget as HTMLDivElement).style.background = "#fff";
      }}
    >
      {label}
    </div>
  );
}
