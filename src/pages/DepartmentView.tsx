import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {fetchOrgData,findPeopleByDepartment,departments,} from "../services/orgService";
import type { Person } from "../services/orgService";



const styles = {
  page: { minHeight: "100vh", background: "#f7f7f9", padding: "32px 24px" },
  backBtn: {
    display: "inline-block",
    marginBottom: 16,
    padding: "10px 16px",
    background: "#374151",
    color: "#4281df",
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
    background: "#0b64e0",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 18,
    marginBottom: 12,
    cursor: "pointer",
    transition: "background .15s ease",
  },
  empty: { color: "#1065ed", fontSize: 16, marginTop: 8 },
};

export default function DepartmentView() {
  const navigate = useNavigate();
  const { deptId } = useParams<{ deptId: string }>();
  const id = deptId ?? "";

  const [employees, setEmployees] = useState<Person[]>([]);

  useEffect(() => {
  async function load() {
    console.log("deptId:", id);

    const data = await fetchOrgData();
    const people = findPeopleByDepartment(data, id);

    setEmployees(people);
  }

  load();
}, [id]);

const dept = departments.find((d) => d.id === id);

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate("/departments")}>
        ← Back to Departments
      </button>

      <h2 style={styles.deptHeader}>
        {dept ? `${dept.name} Department` : "Department"}
      </h2>

      {employees.length === 0 ? (
        <div style={styles.empty}>
          No employees found for department id: <b>{id || "(missing)"}</b>
        </div>
      ) : (
        <ul style={styles.list}>
          {employees.map((emp) => (
            <li
              key={emp.id}
              style={styles.listItem}
              onClick={() => navigate(`/person/${emp.id}`)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLLIElement).style.background = "#4281df";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLLIElement).style.background = "#4281df";
              }}
            >
                {emp.name} — {emp.title}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
