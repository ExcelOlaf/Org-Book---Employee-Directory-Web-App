import apiClient from "./client.js";

export async function getEmployees() {
  const response = await apiClient.get("/employees");
  return response.data;
}

export async function getEmployeeById(id) {
  const response = await apiClient.get(`/employees/${id}`);
  return response.data;
}
