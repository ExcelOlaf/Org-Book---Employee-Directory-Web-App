import { API_BASE_URL } from "../utils/apiRoute";
import {
  getCachedEmployee,
  setCachedEmployee,
  getCachedOrgTree,
  setCachedOrgTree,
  clearAllOrgTrees,
  getCachedDepartments,
  setCachedDepartments,
} from "./dbCache";

export interface Person {
  id: number;
  name: string;
  title: string;
  dept?: string;
  email?: string;
  reports?: Person[];
  managerId?: number;
}

export interface EmployeeRecord {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  Title: string;
  DepartmentName: string;
  DirectReportsList?: string;
  Age?: number;
  ManagerID?: number;
  Address?: string;
  PhoneNumber?: string;
  EmailAddress?: string;
  Picture?: string;
}

const USE_BATCH_ENDPOINT = false;

export function clearOrgTreeCache(): void {
  // Also remove any legacy localStorage entry from older app versions.
  localStorage.removeItem("org_tree_cache");
  clearAllOrgTrees();
}

function parseDirectReportsList(directReportsListJson: string | undefined): number[] {
  if (!directReportsListJson) return [];
  try {
    const parsed = JSON.parse(directReportsListJson);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
    }
  } catch {
    // ignore
  }
  return [];
}

async function fetchEmployeeById(employeeId: number): Promise<EmployeeRecord | null> {
  const cached = await getCachedEmployee<EmployeeRecord>(employeeId);
  if (cached) return cached;
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`);
    if (!response.ok) return null;
    const body = await response.json();
    const employee: EmployeeRecord = typeof body === "string" ? JSON.parse(body) : body;
    void setCachedEmployee(employeeId, employee);
    return employee;
  } catch {
    return null;
  }
}

async function fetchEmployeesByIds(employeeIds: number[]): Promise<Map<number, EmployeeRecord>> {
  const employeeMap = new Map<number, EmployeeRecord>();
  if (employeeIds.length === 0) return employeeMap;

  if (USE_BATCH_ENDPOINT) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/batch`, {
        method: "POST",
        body: JSON.stringify({ ids: employeeIds }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const employees: EmployeeRecord[] = await response.json();
        employees.forEach((emp) => employeeMap.set(emp.EmployeeID, emp));
        return employeeMap;
      }
    } catch {
      // fall through to individual fetches
    }
  }

  const results = await Promise.allSettled(employeeIds.map((id) => fetchEmployeeById(id)));
  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      employeeMap.set(employeeIds[index], result.value);
    }
  });

  return employeeMap;
}

function convertToPerson(employee: EmployeeRecord, reports: Person[] = []): Person {
  return {
    id: employee.EmployeeID,
    name: `${employee.FirstName} ${employee.LastName}`,
    title: employee.Title,
    dept: employee.DepartmentName,
    email: employee.EmailAddress,
    managerId: employee.ManagerID,
    reports,
  };
}

async function buildTreeLevel(
  employee: EmployeeRecord,
  currentDepth: number,
  maxDepth: number,
  visitedIds: Set<number> = new Set()
): Promise<Person> {
  if (visitedIds.has(employee.EmployeeID)) {
    return convertToPerson(employee, []);
  }

  visitedIds.add(employee.EmployeeID);

  const directReportIds = parseDirectReportsList(employee.DirectReportsList);

  if (currentDepth >= maxDepth || directReportIds.length === 0) {
    return convertToPerson(employee, []);
  }

  const validReportIds = directReportIds.filter((id) => !visitedIds.has(id));
  if (validReportIds.length === 0) return convertToPerson(employee, []);

  const directReportsMap = await fetchEmployeesByIds(validReportIds);

  const reports = await Promise.all(
    Array.from(directReportsMap.values()).map((reportEmployee) =>
      buildTreeLevel(reportEmployee, currentDepth + 1, maxDepth, new Set(visitedIds))
    )
  );

  return convertToPerson(employee, reports);
}

export async function fetchOrgTree(
  rootEmployeeId: number,
  maxDepth: number = 4,
  useCache: boolean = true
): Promise<Person | null> {
  try {
    if (useCache) {
      const cached = await getCachedOrgTree<Person>(rootEmployeeId);
      if (cached) return cached;
    }

    const rootEmployee = await fetchEmployeeById(rootEmployeeId);
    if (!rootEmployee) return null;

    const rootPerson = await buildTreeLevel(rootEmployee, 1, maxDepth, new Set());
    void setCachedOrgTree(rootEmployeeId, rootPerson);
    return rootPerson;
  } catch {
    return null;
  }
}

export async function fetchOrgDataFromEmployee(
  employeeId: number,
  useCache: boolean = false
): Promise<Person | null> {
  return fetchOrgTree(employeeId, 4, useCache);
}

export async function fetchPersonById(id: number): Promise<Person | null> {
  const employee = await fetchEmployeeById(id);
  if (!employee) return null;
  return convertToPerson(employee);
}

export async function fetchDepartments(): Promise<string[]> {
  const cached = await getCachedDepartments();
  if (cached) return cached;
  const res = await fetch(`${API_BASE_URL}/departments`);
  if (!res.ok) throw new Error(`Failed to fetch departments (status ${res.status})`);
  const deptNames = (await res.json()) as string[];
  const sorted = deptNames.filter((name): name is string => name !== null).sort((a, b) => a.localeCompare(b));
  void setCachedDepartments(sorted);
  return sorted;
}

export function findPersonById(person: Person, id: number): Person | null {
  if (person.id === id) return person;
  if (person.reports) {
    for (const report of person.reports) {
      const found = findPersonById(report, id);
      if (found) return found;
    }
  }
  return null;
}