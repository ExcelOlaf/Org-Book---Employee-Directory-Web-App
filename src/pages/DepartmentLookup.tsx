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

  return (
    <div className="dept-lookup">
      {!selectedDept ? (
        <div className="dept-lookup__container">
          <h1 className="dept-lookup__title">Department Lookup</h1>

          <div className="dept-lookup__grid">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="dept-lookup__card"
                onClick={() => setSelectedDept(dept.id)}
              >
                {dept.name}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dept-lookup__container">
          <button
            className="dept-lookup__back-btn"
            onClick={() => setSelectedDept(null)}
          >
            ← Back to Departments
          </button>

          <h2 className="dept-lookup__dept-header">{selectedDept} Department</h2>

          <ul className="dept-lookup__list">
            {(mockEmployees[selectedDept] || []).map((emp) => (
              <li
                key={emp}
                className="dept-lookup__list-item"
                onClick={() => navigate(`/org-tree/${encodeURIComponent(emp)}`)}
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