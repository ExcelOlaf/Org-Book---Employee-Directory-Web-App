import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../utils/apiRoute";

type EmployeeData = {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentName: string;
};

export default function Fun() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      const data: EmployeeData[] = await response.json();

      setEmployees(data);
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  }

  const fact = useMemo(() => {
    if (!employees.length) return "No employee data available.";

    const stored = sessionStorage.getItem("fun-fact");
    if (stored) return stored;

    const generatedFacts = generateFacts(employees);
    const randomFact =
      generatedFacts[Math.floor(Math.random() * generatedFacts.length)];

    sessionStorage.setItem("fun-fact", randomFact);

    return randomFact;
  }, [employees]);

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const today = new Date().toLocaleString();

  if (loading) {
    return <div style={{ padding: "80px", color: "#000" }}>Loading fun facts...</div>;
  }

  return (
    <div
      style={{
        padding: "80px 120px",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        color: "#000"
      }}
    >
      {/* top bar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{today}</span>
        <span style={{ fontWeight: 600 }}>Fun</span>
      </div>

      {/* greeting */}
      <h1
        style={{
          marginTop: "50px",
          fontSize: "42px",
          fontWeight: 700,
          color: "#000"
        }}
      >
        {getGreeting()} 👋
      </h1>

      {/* section title */}
      <h2
        style={{
          marginTop: "80px",
          fontSize: "28px",
          color: "#4f46e5",
          fontWeight: 700
        }}
      >
        Fun Fact
      </h2>

      {/* fact box */}
      <div
        style={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            padding: "50px",
            borderRadius: "16px",
            background: "#000",
            fontSize: "28px",
            lineHeight: "1.6",
            color: "#fff",
            fontWeight: 600,
            maxWidth: "900px",
            width: "100%",
            boxShadow: "0 10px 20px rgba(0,0,0,0.25)"
          }}
        >
          {fact}
        </div>
      </div>

      {/* footer */}
      <div style={{ marginTop: "auto", paddingTop: "120px" }}>
        <p
          style={{
            textAlign: "right",
            fontSize: "20px",
            color: "#000"
          }}
        >
          Have a great day 🙂
        </p>
      </div>
    </div>
  );
}

function generateFacts(employees: EmployeeData[]): string[] {
  const facts: string[] = [];

  const totalEmployees = employees.length;

  const departmentCounts: Record<string, number> = {};

  employees.forEach((e) => {
    departmentCounts[e.DepartmentName] =
      (departmentCounts[e.DepartmentName] || 0) + 1;
  });

  const sortedDepartments = Object.entries(departmentCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const largestDepartment = sortedDepartments[0];

  facts.push(
    `${largestDepartment[0]} has the most employees (${largestDepartment[1]} people).`
  );

  facts.push(
    `There are currently ${totalEmployees} employees in the organization.`
  );

  const departmentCount = Object.keys(departmentCounts).length;

  facts.push(
    `Employees are spread across ${departmentCount} departments.`
  );

  const randomEmployee =
    employees[Math.floor(Math.random() * employees.length)];

  facts.push(
    `${randomEmployee.FirstName} ${randomEmployee.LastName} works in ${randomEmployee.DepartmentName}.`
  );

  return facts;
}