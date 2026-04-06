/**
 * Persistent offline cache backed by IndexedDB via the `idb` library.
 *
 * Stores four collections with per-entry TTLs:
 *   employees     – individual EmployeeRecord objects      (24 h)
 *   orgTrees      – full Person tree rooted at an ID       ( 1 h)
 *   departments   – the sorted department name list        ( 1 h)
 *   searchResults – keyed by serialised search params      (15 m)
 *
 * All public functions are safe to call when IndexedDB is unavailable
 * (private / incognito mode on some browsers); they will silently return
 * null / do nothing rather than throwing.
 */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "phonebook-offline";
const DB_VERSION = 1;

const TTL_MS = {
  employee: 24 * 60 * 60 * 1000,  // 24 h
  orgTree:  60 * 60 * 1000,        //  1 h
  departments: 60 * 60 * 1000,     //  1 h
  search:  15 * 60 * 1000,         // 15 m
} as const;

type StoreName = "employees" | "orgTrees" | "departments" | "searchResults";

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const stores: StoreName[] = ["employees", "orgTrees", "departments", "searchResults"];
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      },
    }).catch((err) => {
      // Reset so the next call retries (e.g. after a schema conflict).
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

async function cacheGet<T>(store: StoreName, key: IDBValidKey): Promise<T | null> {
  try {
    const db = await getDB();
    const entry = (await db.get(store, key)) as CacheEntry | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
      // Stale — evict in the background and return null so fresh data is fetched.
      db.delete(store, key).catch(() => {});
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

async function cacheSet(store: StoreName, key: IDBValidKey, data: unknown, ttl: number): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry = { data, timestamp: Date.now(), ttl };
    await db.put(store, entry, key);
  } catch {
    // Storage may be full or unavailable — fail silently.
  }
}

// ── Employee records ─────────────────────────────────────────────────────────

export async function getCachedEmployee<T>(id: number): Promise<T | null> {
  return cacheGet<T>("employees", id);
}

export async function setCachedEmployee<T>(id: number, data: T): Promise<void> {
  return cacheSet("employees", id, data, TTL_MS.employee);
}

// ── Org trees ────────────────────────────────────────────────────────────────

export async function getCachedOrgTree<T>(rootId: number): Promise<T | null> {
  return cacheGet<T>("orgTrees", rootId);
}

export async function setCachedOrgTree<T>(rootId: number, data: T): Promise<void> {
  return cacheSet("orgTrees", rootId, data, TTL_MS.orgTree);
}

export function clearAllOrgTrees(): void {
  // Fire-and-forget so callers don't need to await.
  getDB()
    .then((db) => db.clear("orgTrees"))
    .catch(() => {});
}

// ── Department list ──────────────────────────────────────────────────────────

export async function getCachedDepartments(): Promise<string[] | null> {
  return cacheGet<string[]>("departments", "all");
}

export async function setCachedDepartments(data: string[]): Promise<void> {
  return cacheSet("departments", "all", data, TTL_MS.departments);
}

// ── Search results ───────────────────────────────────────────────────────────

export async function getCachedSearch<T>(query: string): Promise<T | null> {
  return cacheGet<T>("searchResults", query);
}

export async function setCachedSearch<T>(query: string, data: T): Promise<void> {
  return cacheSet("searchResults", query, data, TTL_MS.search);
}
