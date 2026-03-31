import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { fetchOrgData, findPeopleByDepartment, departments } from "../services/orgService";
import { API_BASE_URL } from "../utils/apiRoute";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import EmployeePreviewTrigger from "../components/EmployeePreviewTrigger";

export default function DepartmentView() {
  const navigate = useNavigate();
  const { deptId } = useParams<{deptId: string}>();
  const departmentName = deptId ? decodeURIComponent(deptId) : "";
  const [employees, setEmployees] = useState<{ EmployeeID: number, FirstName: string, LastName: string, Title: string, }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authenticatedFetch(`${API_BASE_URL}/departments/${departmentName}`)
      .then((res) => res.json())
      .then((employees) => {
        setEmployees(employees);
      })
      .catch((error) => {
        console.error("Error loading department employees:", error);
        setEmployees([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [departmentName]);

  // const dept = departments.find((d) => d.id === id);

  return (
    <div className="dept-view">
      <button className="dept-view__back-btn" onClick={() => navigate("/departments")}>
        ← Back to Departments
      </button>

      <h2 className="dept-view__header">
        {departmentName ? `${departmentName} Department (${employees.length} Employees)` : "Department"}
      </h2>

      {loading ? (
        <div className="dept-view__empty">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="dept-view__empty">
          No employees found for department: <b>{departmentName || "(missing)"}</b>
        </div>
      ) : (
        <ul className="dept-view__list">
          {employees.map((emp) => (
            <li key={emp.EmployeeID}>
              <EmployeePreviewTrigger
                employeeId={emp.EmployeeID}
                onNavigate={() => navigate(`/person/${emp.EmployeeID}`)}
                variant="block"
                className="dept-view__list-item dept-view__list-item--preview"
                ariaLabel={`View profile for ${emp.FirstName} ${emp.LastName}`}
              >
                <div><strong>{`${emp.FirstName} ${emp.LastName}`}</strong></div>
                <div>{emp.Title}</div>
              </EmployeePreviewTrigger>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}