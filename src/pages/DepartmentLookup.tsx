import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { departments } from "../services/orgService";

export default function DepartmentLookup() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="dept-lookup">
      <div className="dept-lookup__container">
        <h1 className="dept-lookup__title">Department Lookup</h1>
        <div className="dept-lookup__grid">
          {departments.map((dept) => (
            <DeptTile
              key={dept.id}
              label={dept.name}
              onClick={() => navigate(`/departments/${dept.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DeptTile({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="dept-lookup__card" onClick={onClick}>
      {label}
    </div>
  );
}