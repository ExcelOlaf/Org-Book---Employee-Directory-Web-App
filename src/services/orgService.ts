// src/services/orgService.ts

export interface Person {
  id: number;
  name: string;
  title: string;
  reports?: Person[];
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
      reports: [
        { id: 4, name: "Carol Lee", title: "Engineering Manager", reports: [] },
        { id: 5, name: "David Kim", title: "QA Lead", reports: [] },
      ],
    },
    {
      id: 3,
      name: "Eve Martin",
      title: "VP of Marketing",
      reports: [
        { id: 6, name: "Frank Wright", title: "Marketing Manager", reports: [] }
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
