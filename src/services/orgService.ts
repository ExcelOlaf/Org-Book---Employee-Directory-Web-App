// src/services/orgService.ts
import { API_BASE_URL } from "../utils/apiRoute";

export interface Person {
  id: number;
  name: string;
  title: string;
  dept?: string;
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

/**
 * Legacy static departments (kept so other pages don't break).
 * DepartmentLookup should NOT use this anymore — use fetchDepartments().
 */
export const departments = [
  { id: "hr", name: "HR" },
  { id: "engineering", name: "Engineering" },
  { id: "sales", name: "Sales" },
  { id: "it", name: "IT" },
  { id: "business", name: "Business" },
  { id: "qa", name: "QA" },
];

const CACHE_KEY = 'org_tree_cache';
const CACHE_DURATION = 5 * 60 * 1000;
const USE_BATCH_ENDPOINT = false;

interface CachedTree {
  data: Person;
  timestamp: number;
}

function getCachedTree(): Person | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp }: CachedTree = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

function setCachedTree(tree: Person): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: tree,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error setting cache:', error);
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
      return parsed
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x) && x > 0);
    }
  } catch (error) {
    console.error('Failed to parse DirectReportsList:', error);
  }
  
  return [];
}

async function fetchEmployeeById(employeeId: number): Promise<EmployeeRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${employeeId}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch employee ${employeeId}: ${response.status}`);
      return null;
    }

    const body = await response.json();
    return typeof body === "string" ? JSON.parse(body) : body;
  } catch (error) {
    console.error(`Error fetching employee ${employeeId}:`, error);
    return null;
  }
}

async function fetchEmployeesByIds(employeeIds: number[]): Promise<Map<number, EmployeeRecord>> {
  const employeeMap = new Map<number, EmployeeRecord>();
  
  if (employeeIds.length === 0) return employeeMap;
  
  if (USE_BATCH_ENDPOINT) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/batch`, {
        method: 'POST',
        body: JSON.stringify({ ids: employeeIds }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const employees: EmployeeRecord[] = await response.json();
        employees.forEach((emp: EmployeeRecord) => {
          employeeMap.set(emp.EmployeeID, emp);
        });
        return employeeMap;
      } else {
        console.warn('Batch endpoint failed, falling back to individual fetches');
      }
    } catch (error) {
      console.error('Batch fetch error:', error);
      console.warn('Falling back to individual fetches');
    }
  }
  
  const promises = employeeIds.map(id => fetchEmployeeById(id));
  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      employeeMap.set(employeeIds[index], result.value);
    } else if (result.status === 'rejected') {
      console.error(`Failed to fetch employee ${employeeIds[index]}:`, result.reason);
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
    managerId: employee.ManagerID,
    reports: reports,
  };
}

export async function fetchOrgTree(
  rootEmployeeId: number,
  maxDepth: number = 3,
  useCache: boolean = true
): Promise<Person | null> {
  try {
    if (useCache) {
      const cached = getCachedTree();
      if (cached && cached.id === rootEmployeeId) {
        console.log('Using cached org tree');
        return cached;
      }
    }

    const rootEmployee = await fetchEmployeeById(rootEmployeeId);
    if (!rootEmployee) {
      console.error(`Root employee ${rootEmployeeId} not found`);
      return null;
    }

    const visitedIds = new Set<number>();
    const rootPerson = await buildTreeLevel(rootEmployee, 1, maxDepth, visitedIds);
    
    setCachedTree(rootPerson);
    
    return rootPerson;
  } catch (error) {
    console.error("Error fetching org tree:", error);
    return null;
  }
}

async function buildTreeLevel(
  employee: EmployeeRecord,
  currentDepth: number,
  maxDepth: number,
  visitedIds: Set<number> = new Set()
): Promise<Person> {
  if (visitedIds.has(employee.EmployeeID)) {
    console.warn(`Circular reference detected for employee ${employee.EmployeeID}`);
    return convertToPerson(employee, []);
  }
  
  visitedIds.add(employee.EmployeeID);

  const directReportIds = parseDirectReportsList(employee.DirectReportsList);

  if (currentDepth >= maxDepth || directReportIds.length === 0) {
    return convertToPerson(employee, []);
  }

  const validReportIds = directReportIds.filter(id => !visitedIds.has(id));
  
  if (validReportIds.length === 0) {
    return convertToPerson(employee, []);
  }

  const directReportsMap = await fetchEmployeesByIds(validReportIds);

  const missingIds = validReportIds.filter(id => !directReportsMap.has(id));
  if (missingIds.length > 0) {
    console.warn(`Missing employees for ${employee.FirstName} ${employee.LastName}: ${missingIds.join(', ')}`);
  }

  const reportsPromises = Array.from(directReportsMap.values()).map(reportEmployee =>
    buildTreeLevel(reportEmployee, currentDepth + 1, maxDepth, new Set(visitedIds))
  );

  const reports = await Promise.all(reportsPromises);

  return convertToPerson(employee, reports);
}

export async function fetchOrgData(useCache: boolean = true): Promise<Person | null> {
  const LOGGED_IN_EMPLOYEE_ID = 730467;
  return fetchOrgTree(LOGGED_IN_EMPLOYEE_ID, 3, useCache);
}

export async function fetchOrgDataFromEmployee(employeeId: number, useCache: boolean = false): Promise<Person | null> {
  return fetchOrgTree(employeeId, 3, useCache);
}


/**
 * Fetch departments from API.
 * Endpoint returns: string[] (e.g., ["Engineering", "Human Resources", ...])
 */
export async function fetchDepartments(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/departments`);

  if (!res.ok) {
    throw new Error(`Failed to fetch departments (status ${res.status})`);
  }

  const deptNames = (await res.json()) as string[];

  return deptNames
    .filter((name): name is string => name !== null)
    .sort((a, b) => a.localeCompare(b));
}

/** Recursive search helper */
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

export function findPeopleByDepartment(person: Person, dept: string, results: Person[] = []): Person[] {
  if (person.dept === dept) results.push(person);
  if (person.reports) {
    for (const report of person.reports) {
      findPeopleByDepartment(report, dept, results);
    }
  }
  return results;
}

export async function fetchPersonById(id: number): Promise<Person | null> {
  const employee = await fetchEmployeeById(id);
  if (!employee) return null;
  return convertToPerson(employee);
}

export function getTotalReportsCount(person: Person): number {
  if (!person.reports || person.reports.length === 0) return 0;
  
  let count = person.reports.length;
  person.reports.forEach(report => {
    count += getTotalReportsCount(report);
  });
  
  return count;
}

export async function testEmployeeData(employeeId: number): Promise<{
  exists: boolean;
  employee?: EmployeeRecord;
  directReportsCount?: number;
  directReportIds?: number[];
  error?: string;
}> {
  try {
    const employee = await fetchEmployeeById(employeeId);
    
    if (!employee) {
      return { exists: false, error: 'Employee not found' };
    }
    
    const directReportIds = parseDirectReportsList(employee.DirectReportsList);
    
    return {
      exists: true,
      employee,
      directReportsCount: directReportIds.length,
      directReportIds,
    };
  } catch (error) {
    return { 
      exists: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}