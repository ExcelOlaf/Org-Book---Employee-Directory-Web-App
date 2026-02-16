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


/**
 * Fetch departments from API.
 * Endpoint returns: string[] (e.g., ["Engineering", "Human Resources", ...])
 * We convert to: {id, name}[] for routing/cards.
 */
export async function fetchDepartments(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(`${API_BASE_URL}/departments`);

  if (!res.ok) {
    throw new Error(`Failed to fetch departments (status ${res.status})`);
  }

  const deptNames = (await res.json()) as string[];

  // normalize + dedupe
  const uniqueNames = Array.from(
    new Set(
      deptNames
        .filter((n) => typeof n === "string")
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
    )
  );

  // map to {id, name}
  return uniqueNames.map((name) => ({
    id: name,
    name,
  }));
}

/** Temporary static org data (replace later with API call) */
const orgData: Person = {
  id: 1,
  name: "Alice Johnson",
  title: "CEO",
  reports: [
    {
      id: 2,
      name: "Bob Smith",
      title: "VP of Engineering",
      dept: "engineering",
      managerId: 1,
      reports: [
        { id: 4, name: "Carol Lee", title: "Engineering Manager", dept: "engineering", managerId: 2, reports: [] },
        { id: 5, name: "David Kim", title: "QA Lead", dept: "qa", managerId: 2, reports: [] },
        { id: 6, name: "Extol Olaf", title: "IT Lead", dept: "it", managerId: 2, reports: [] },
      ],
    },
    {
      id: 3,
      name: "Eve Martin",
      title: "VP of Marketing",
      dept: "business",
      managerId: 1,
      reports: [
        { id: 7, name: "Frank Wright", title: "Sales Manager", dept: "sales", managerId: 3, reports: [] },
        { id: 8, name: "Lisa Walker", title: "HR Manager", dept: "hr", managerId: 3, reports: [] },
      ],
    },
  ],
};

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

/** Recursive search helper */
export function findPeopleByDepartment(person: Person, dept: string, results: Person[] = []): Person[] {
  if (person.dept === dept) results.push(person);
  if (person.reports) {
    for (const report of person.reports) {
      findPeopleByDepartment(report, dept, results);
    }
  }
  return results;
}

/** Simulate async fetch (mock API) */
export async function fetchOrgData(): Promise<Person> {
  // Later this will make an API call
  return Promise.resolve(orgData);
}

/** Fetch a specific person by ID */
export async function fetchPersonById(id: number): Promise<Person | null> {
  const data = await fetchOrgData();
  return findPersonById(data, id);
}
