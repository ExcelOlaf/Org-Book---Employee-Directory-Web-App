import { useState } from "react";

type DepartmentData = {
  manager: string;
  employees: number;
};

// Case-insensitive mock data
const mockData: Record<string, DepartmentData> = {
  hr: { manager: "Lisa Walker", employees: 24 },
  engineering: { manager: "Marcus Hill", employees: 52 },
  finance: { manager: "Sarah Kim", employees: 17 },
};

export default function DepartmentLookup() {
  const [department, setDepartment] = useState("");
  const [result, setResult] = useState<DepartmentData | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const normalized = department.trim().toLowerCase(); // normalize input
    const data = mockData[normalized];
    setResult(data || null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Department Lookup</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter department (HR, Engineering, Finance)"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {searched && (
        <div className="mt-6">
          {result ? (
            <div className="border p-4 rounded bg-gray-50 shadow-sm w-fit">
              <p><strong>Manager:</strong> {result.manager}</p>
              <p><strong>Employees:</strong> {result.employees}</p>
            </div>
          ) : (
            <p className="text-red-500">
              No results found for “{department}”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
