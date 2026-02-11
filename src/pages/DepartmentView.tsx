import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrgData, findPeopleByDepartment, departments } from "../services/orgService";
import type { Person } from "../services/orgService";

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
    <div className="dept-view">
      <button className="dept-view__back-btn" onClick={() => navigate("/departments")}>
        ← Back to Departments
      </button>

      <h2 className="dept-view__header">
        {dept ? `${dept.name} Department` : "Department"}
      </h2>

      {employees.length === 0 ? (
        <div className="dept-view__empty">
          No employees found for department id: <b>{id || "(missing)"}</b>
        </div>
      ) : (
        <ul className="dept-view__list">
          {employees.map((emp) => (
            <li
              key={emp.id}
              className="dept-view__list-item"
              onClick={() => navigate(`/person/${emp.id}`)}
            >
              {emp.name} — {emp.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}