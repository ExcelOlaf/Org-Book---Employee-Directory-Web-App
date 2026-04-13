import { API_BASE_URL } from "../utils/apiRoute.ts";
import { authenticatedFetch } from "../utils/authenticatedFetch";
import { getCachedSearch, setCachedSearch } from "./dbCache";

export type EmployeeData = {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  DepartmentName: string;
};

export type SearchParams = {
  FirstName?: string;
  LastName?: string;
  Position?: string;
};

export async function searchEmployees(params: SearchParams): Promise<EmployeeData[] | null> {
  const url = new URL(`${API_BASE_URL}/employees/search`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.append(key, String(value));
    }
  });

  const cacheKey = url.search; // e.g. "?FirstName=John"
  const cached = await getCachedSearch<EmployeeData[]>(cacheKey);
  if (cached) return cached;

  try {
    const response = await authenticatedFetch(url.toString());
    if (!response.ok) return null;
    const data: EmployeeData[] = await response.json();
    void setCachedSearch(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

