"use client";

import Dexie, { type Table } from "dexie";

/**
 * Offline-first layer. Reads are cached per-URL; writes made while
 * offline are queued and replayed to the server when connectivity
 * returns. Queue replay is FIFO to preserve causal order.
 */

export interface QueuedMutation {
  id?: number;
  url: string;
  method: string;
  body: string | null;
  queuedAt: number;
}

export interface CachedResponse {
  url: string;
  data: string;
  cachedAt: number;
}

class KhulaDB extends Dexie {
  mutations!: Table<QueuedMutation, number>;
  cache!: Table<CachedResponse, string>;

  constructor() {
    super("khulagrow");
    this.version(1).stores({
      mutations: "++id, queuedAt",
      cache: "url, cachedAt",
    });
  }
}

export const localDB = typeof window !== "undefined" ? new KhulaDB() : null;

export async function pendingCount(): Promise<number> {
  if (!localDB) return 0;
  return localDB.mutations.count();
}

/** GET with cache-fallback: network first, IndexedDB when offline. */
export async function apiGet<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    if (localDB) {
      await localDB.cache.put({
        url,
        data: JSON.stringify(data),
        cachedAt: Date.now(),
      });
    }
    return data as T;
  } catch (err) {
    if (localDB) {
      const cached = await localDB.cache.get(url);
      if (cached) return JSON.parse(cached.data) as T;
    }
    throw err;
  }
}

/**
 * Mutation with offline queueing. Returns { queued: true } when the
 * write was stored locally instead of sent.
 */
export async function apiMutate<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<{ queued: boolean; data?: T; error?: string }> {
  const payload = body === undefined ? null : JSON.stringify(body);
  try {
    const res = await fetch(url, {
      method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { queued: false, error: data?.error ?? `Request failed (${res.status})` };
    }
    return { queued: false, data: data as T };
  } catch {
    // Network failure — queue for later sync.
    if (localDB) {
      await localDB.mutations.add({
        url,
        method,
        body: payload,
        queuedAt: Date.now(),
      });
      return { queued: true };
    }
    return { queued: false, error: "Offline and local queue unavailable" };
  }
}

/** Replays the offline queue. Returns how many mutations were synced. */
export async function syncQueue(): Promise<number> {
  if (!localDB) return 0;
  const items = await localDB.mutations.orderBy("queuedAt").toArray();
  let synced = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.body ? { "Content-Type": "application/json" } : undefined,
        body: item.body,
      });
      // 4xx means the payload itself is bad — drop it rather than retry forever.
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        await localDB.mutations.delete(item.id!);
        if (res.ok) synced++;
      } else {
        break; // server error — stop and retry the rest later
      }
    } catch {
      break; // still offline
    }
  }
  return synced;
}
