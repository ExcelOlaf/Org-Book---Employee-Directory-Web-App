import apiClient from "./client.js";

export async function getDepartments() {
  const response = await apiClient.get("/departments");
  return response.data;
}
