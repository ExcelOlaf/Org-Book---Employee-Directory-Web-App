import { useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";
import { useNavigate } from "react-router-dom";

type EmployeeData = {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentName: string;
};

type SearchParams = {
  FirstName?: string;
  LastName?: string;
};

async function searchEmployees(params: SearchParams): Promise<EmployeeData[] | null> {
  const url = new URL(`${API_BASE_URL}/employees/search`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString());
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
    const employeesData = (await searchEmployees({
      FirstName: queryFirstName,
      LastName: queryLastName,
    })) as EmployeeData[];
    setEmployees(employeesData || null);
    setSearched(true);
  };

  return (
    <div className="employee-search">
      <h1 className="employee-search__title">Employee Lookup</h1>

      <div className="employee-search__form">
        <input
          type="text"
          placeholder="First Name"
          value={queryFirstName}
          onChange={(e) => setQueryFirstName(e.target.value)}
          className="employee-search__input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={queryLastName}
          onChange={(e) => setQueryLastName(e.target.value)}
          className="employee-search__input"
        />
        <button onClick={handleSearch} className="employee-search__button">
          Search
        </button>
      </div>

      {searched && (
        <table className="employee-search__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {employees && employees.length > 0 ? (
              employees.map((item, index) => (
                <tr key={index}>
                  <td><a onClick={() => navigate(`../person/${item.EmployeeID}`)}>{`${item.FirstName} ${item.LastName}`}</a></td>
                  <td>{item.DepartmentName}</td>
                  <td>{item.EmployeeID}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="employee-search__no-results">
                  No employees found
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}