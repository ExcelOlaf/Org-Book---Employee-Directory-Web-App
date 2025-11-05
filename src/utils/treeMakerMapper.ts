import type { Person } from "../services/orgService";

export function buildTreeMakerData(root: Person) {
  const tree: Record<string, any> = {};
  const treeParams: Record<string, any> = {};

  function recurse(person: Person) {
    treeParams[person.id] = {
      trad: `${person.name}\n${person.title}`,
      person
    };

    if (person.reports && person.reports.length > 0) {
      tree[person.id] = {};
      person.reports.forEach((child) => {
        tree[person.id][child.id] = "";
        recurse(child);
      });
    } else {
      tree[person.id] = "";
    }
  }

  recurse(root);
  return { tree, treeParams };
}
