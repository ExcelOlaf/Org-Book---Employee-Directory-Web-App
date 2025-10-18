import { useState } from "react";

type EmployeeData = {
  name: string;
  dept: string;
  title: string;
};

// Type-safe mock data
const mockEmployees: Record<string, EmployeeData> = {
  "1001": { name: "Alex Rivera", dept: "Engineering", title: "Software Engineer" },
  "1002": { name: "Jamie Lin", dept: "Finance", title: "Analyst" },
  "1003": { name: "Chris Patel", dept: "HR", title: "Recruiter" },
};

export default function EmployeeSearch() {
  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setSearched(true);
    const result = mockEmployees[employeeId.trim()];
    setEmployee(result || null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Lookup</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Employee ID (e.g., 1001)"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <button
          onClick={handleSearch}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Search
        </button>
      </div>

      {searched && (
        <div className="mt-6">
          {employee ? (
            <div className="border p-4 rounded bg-gray-50 shadow-sm w-fit">
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Department:</strong> {employee.dept}</p>
              <p><strong>Title:</strong> {employee.title}</p>
            </div>
          ) : (
            <p className="text-red-500">No employee found for ID “{employeeId}”.</p>
          )}
        </div>
      )}
    </div>
  );
}
