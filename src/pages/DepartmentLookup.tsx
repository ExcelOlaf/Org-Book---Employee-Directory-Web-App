import { useNavigate} from "react-router-dom";
import {departments} from "../services/orgService";



const styles = {
  page: { minHeight: "100vh", background: "#f7f7f9", padding: "32px 24px" },
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
    background: "#d94141",
    borderRadius: 16,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: 0.5,
    cursor: "pointer",
    transition:
      "transform .15s ease, box-shadow .15s ease, background .15s ease",
  },
 
};

export default function DepartmentLookup() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Department Lookup</h1>

      <div style={styles.grid}>
        {departments.map((dept) => (
          <DeptTile
            key={dept.id}
            label={dept.name}
            onClick={() => navigate(`/departments/${dept.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function DeptTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div
      style={styles.card}
      onClick={onClick}
      onMouseEnter={(e) =>
        Object.assign(e.currentTarget.style)
      }
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = styles.card.boxShadow as string;
      }}
    >
      {label}
    </div>
  );
}
