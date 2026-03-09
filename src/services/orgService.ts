import { API_BASE_URL } from "../utils/apiRoute";

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

const CACHE_KEY = "org_tree_cache";
const CACHE_DURATION = 5 * 60 * 1000;
const USE_BATCH_ENDPOINT = false;

interface CachedTree {
  data: Person;
  timestamp: number;
}

function getCachedTree(rootEmployeeId: number): Person | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp }: CachedTree = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    if (data.id !== rootEmployeeId) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedTree(tree: Person): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: tree, timestamp: Date.now() }));
  } catch {
    // ignore
  }
}

export function clearOrgTreeCache(): void {
  localStorage.removeItem(CACHE_KEY);
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
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`);
    if (!response.ok) return null;
    const body = await response.json();
    return typeof body === "string" ? JSON.parse(body) : body;
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
      const cached = getCachedTree(rootEmployeeId);
      if (cached) return cached;
    }

    const rootEmployee = await fetchEmployeeById(rootEmployeeId);
    if (!rootEmployee) return null;

    const rootPerson = await buildTreeLevel(rootEmployee, 1, maxDepth, new Set());
    setCachedTree(rootPerson);
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
  const res = await fetch(`${API_BASE_URL}/departments`);
  if (!res.ok) throw new Error(`Failed to fetch departments (status ${res.status})`);
  const deptNames = (await res.json()) as string[];
  return deptNames.filter((name): name is string => name !== null).sort((a, b) => a.localeCompare(b));
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