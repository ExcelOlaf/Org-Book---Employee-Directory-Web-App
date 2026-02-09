import { API_BASE_URL } from "../utils/apiRoute.ts"


export type EmployeeData = {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentName: string;
};

export type SearchParams = {
  FirstName?: string;
  LastName?: string;
};

export async function searchEmployees(params: SearchParams): Promise<EmployeeData[] | null> {
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

