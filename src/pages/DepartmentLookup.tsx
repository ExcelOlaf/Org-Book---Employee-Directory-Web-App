import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../services/orgService";

export default function DepartmentLookup() {
  console.log("DepartmentLookup UPDATED - running fetchDepartments()");
  const [departments, setDepartments] = useState<{id:string; name:string}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments().then(setDepartments);
  }, []);


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