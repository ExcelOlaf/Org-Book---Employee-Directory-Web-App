import { getEmployee, listEmployees } from "./database.js";

// (async () => {
//   try {
//     const employee = await getEmployee(123456); // replace with a real EmployeeID in DynamoDB
//     console.log("Employee details:", employee);
//   } catch (error) {
//     console.error("Error fetching employee:", error);
//   }
// })();

async function testGetEmployee() {
  try {
    const employee = await getEmployee(123456); // replace with a real EmployeeID in DynamoDB
    console.log("Employee details:", employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
  }
}

async function testListEmployees() {
  try {
    const employees = await listEmployees();
    console.log("All employees:", employees);
  } catch (error) {
    console.error("Error listing employees:", error);
  }
}

const tests = {
  getEmployee: testGetEmployee,
  listEmployees: testListEmployees,
};

const testName = process.argv[2];

if (tests[testName]) {
  tests[testName]();
} else {
  console.error(`Test "${testName}" not found. Available tests: ${Object.keys(tests).join(", ")}`);
}
