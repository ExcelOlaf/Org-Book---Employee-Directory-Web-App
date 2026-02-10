import { useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate } from "react-router-dom";

type EmployeeData = {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentName: string;
  // title: string;
};

type SearchParams = {
  FirstName?: string;
  LastName?: string;
}

async function searchEmployees(params: SearchParams): Promise<EmployeeData[] | null> {
  const url = new URL(`${API_BASE_URL}/employees/search`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  const response = await fetch(url.toString());
  // use authorization later

  if (!response.ok) {
    return null;
  }
  return response.json();
}


export default function EmployeeSearch() {
  const navigate = useNavigate();

  const [queryFirstName, setQueryFirstName] = useState("");
  const [queryLastName, setQueryLastName] = useState("");
  const [employees, setEmployees] = useState<EmployeeData[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const employeesData = (await searchEmployees({ FirstName: queryFirstName, LastName: queryLastName })) as EmployeeData[];
    setEmployees(employeesData || null);
    setSearched(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Employee Lookup</h1>

      <div className="flex gap-2">
        <input style={{ color: "white" }}
          type="text"
          placeholder="First Name:"
          value={queryFirstName}
          onChange={(e) => setQueryFirstName(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />

        <input style={{ color: "white" }}
          type="text"
          placeholder="Last Name"
          value={queryLastName}
          onChange={(e) => setQueryLastName(e.target.value)}
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
        <table style={{ color: "white", width: "50%", textAlign: "center" }}>
          <thead>
            <tr>
              <th>Name</th><th>Department</th><th>ID</th>
            </tr>
          </thead>
          <tbody>
            {employees?.map((item, index) => (
              <tr key={index}>
                <td><a onClick={() => navigate(`../person/${item.EmployeeID}`)}>{`${item.FirstName} ${item.LastName}`}</a></td><td>{item.DepartmentName}</td><td>{item.EmployeeID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
