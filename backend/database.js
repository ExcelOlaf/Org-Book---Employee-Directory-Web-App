import API_URL from "./databaseClient.js";

export async function getEmployee(id) {
  const response = await fetch(`${API_URL}/items/${id}`);
  if (!response.ok) {
    throw new Error(`Error fetching employee: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function listEmployees() {
  const response = await fetch(`${API_URL}/items`);
  if (!response.ok) {
    throw new Error(`Error listing employees: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}