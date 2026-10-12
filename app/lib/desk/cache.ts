// A small keyed query cache for the student desk (contract section 10).
//
// Every screen reads through useDeskResource(key, load). The agent stream and
// the feed poll call invalidate(keys) with the contract's InvalidateKey words;
// INVALIDATES (types.ts) maps each word to the resource keys it refreshes.
// "match:*" style patterns cover every resource with that prefix.
//
// Rules:
// - Stale while revalidate: an invalidated resource keeps showing its data
//   while it refetches, so tabs never blank out after an agent turn.
// - Only resources somebody is looking at refetch at once; the rest are
//   marked stale and refetch when they are next mounted.
// - One request per resource at a time. A result that arrives after a newer
//   request started is dropped, so an old page can never overwrite a new one.
// - `params` varies one key (for example the Home filter chip): each params
//   value is its own entry, and invalidating the key refreshes all of them.
//
// No React state lives in module scope on the server: entries are only
// written from effects and event handlers, which run in the browser.
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { INVALIDATES, type Bootstrap, type DeskResourceKey, type InvalidateKey } from "./types";

type Loader = () => Promise<unknown>;

export interface ResourceSnapshot<T = unknown> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  stale: boolean;
  /** Epoch ms of the last successful load or set, 0 when never. */
  updatedAt: number;
}

interface Entry {
  snap: ResourceSnapshot;
  load: Loader | null;
  subs: number;
  gen: number;
  inflight: Promise<unknown> | null;
  listeners: Set<() => void>;
}

const EMPTY: ResourceSnapshot = Object.freeze({ data: undefined, error: null, loading: false, stale: false, updatedAt: 0 });
const entries = new Map<string, Entry>();
const defaults = new Map<string, Loader>();

/** Entry id: the key, plus "|" and the params when there are any. */
export function entryId(key: string, params?: unknown): string {
  if (params === undefined || params === null || params === "") return key;
  return `${key}|${typeof params === "string" ? params : JSON.stringify(params)}`;
}

function baseKey(id: string): string {
  const i = id.indexOf("|");
  return i < 0 ? id : id.slice(0, i);
}

/** "match:*" matches "match:12"; anything else must be equal. */
export function patternMatches(pattern: string, key: string): boolean {
  return pattern.endsWith("*") ? key.startsWith(pattern.slice(0, -1)) : pattern === key;
}

function entry(id: string): Entry {
  let e = entries.get(id);
  if (!e) {
    e = { snap: EMPTY, load: null, subs: 0, gen: 0, inflight: null, listeners: new Set() };
    entries.set(id, e);
  }
  return e;
}

function write(e: Entry, patch: Partial<ResourceSnapshot>) {
  e.snap = { ...e.snap, ...patch };
  for (const l of e.listeners) l();
}

function loaderFor(id: string, e: Entry): Loader | null {
  return e.load ?? defaults.get(baseKey(id)) ?? null;
}

/** Fetch one entry now. Resolves with the data, or rejects with the error. */
export function fetchResource(id: string): Promise<unknown> {
  const e = entry(id);
  const load = loaderFor(id, e);
  if (!load) return Promise.resolve(e.snap.data);
  const gen = ++e.gen;
  write(e, { loading: true });
  const p = (async () => load())().then(
    (data) => {
      if (gen === e.gen) {
        e.inflight = null;
        write(e, { data, error: null, loading: false, stale: false, updatedAt: Date.now() });
      }
      return data;
    },
    (error: unknown) => {
      if (gen === e.gen) {
        e.inflight = null;
        write(e, { error, loading: false });
      }
      throw error;
    },
  );
  e.inflight = p;
  // Callers that do not await must not see an unhandled rejection: the error is on the snapshot.
  p.catch(() => {});
  return p;
}

function ensure(id: string) {
  const e = entry(id);
  if (e.inflight) return;
  if (e.snap.updatedAt === 0 || e.snap.stale || (e.snap.error && e.snap.data === undefined)) void fetchResource(id).catch(() => {});
}

/**
 * Mark an entry as on screen with its loader, fetching it if it has no fresh
 * data. Returns the release function. useDeskResource is built on this.
 */
export function watchResource(id: string, load: Loader): () => void {
  const e = entry(id);
  e.load = load;
  e.subs++;
  ensure(id);
  return () => {
    e.subs--;
  };
}

/**
 * Refresh everything the given invalidate words cover. Mounted resources
 * refetch now; the rest refetch when they are next mounted.
 */
export function invalidate(keys: readonly InvalidateKey[] | readonly string[]): void {
  const patterns = new Set<string>();
  for (const k of keys) {
    const mapped = (INVALIDATES as Record<string, readonly string[] | undefined>)[k];
    for (const p of mapped ?? [k]) patterns.add(p);
  }
  if (!patterns.size) return;
  for (const [id, e] of entries) {
    const key = baseKey(id);
    if (![...patterns].some((p) => patternMatches(p, key))) continue;
    if (e.subs > 0 && loaderFor(id, e)) void fetchResource(id).catch(() => {});
    else if (e.snap.updatedAt) write(e, { stale: true });
  }
}

/** Put data into the cache, for example the OutreachDetail an approve returned. */
export function setResource<T>(key: DeskResourceKey | string, data: T, params?: unknown): void {
  const e = entry(entryId(key, params));
  e.gen++; // a request already in flight must not overwrite this
  e.inflight = null;
  write(e, { data, error: null, loading: false, stale: false, updatedAt: Date.now() });
}

export function peekResource<T>(key: DeskResourceKey | string, params?: unknown): T | undefined {
  return entries.get(entryId(key, params))?.snap.data as T | undefined;
}

/** The data of every entry under one key, whatever its params. */
export function peekAll<T>(key: DeskResourceKey | string): T[] {
  const out: T[] = [];
  for (const [id, e] of entries) if (baseKey(id) === key && e.snap.data !== undefined) out.push(e.snap.data as T);
  return out;
}

/** The loader used for a key when the component that mounted it has gone. */
export function setDefaultLoader(key: DeskResourceKey | string, load: Loader): void {
  defaults.set(key, load);
}

/** Drop everything (sign out, a different student, tests). */
export function resetDeskCache(): void {
  for (const e of entries.values()) {
    e.gen++;
    e.inflight = null;
    // Entries stay (mounted components hold their listeners); only the data goes.
    write(e, { ...EMPTY });
  }
  for (const [id, e] of entries) if (e.subs > 0 && e.load) void fetchResource(id).catch(() => {});
}

/**
 * Seed the cache from GET /bootstrap so the first paint needs no more calls.
 * Shapes match what each key's own API returns: `status` Status, `settings`
 * AgentSettings, `outreach` OutreachList (status all, first page), `threads`
 * ThreadList, `thread:<id>` ThreadDetail, and `top_matches` MatchCard[].
 */
export function primeFromBootstrap(b: Bootstrap): void {
  setResource("bootstrap", b);
  setResource("status", b.status);
  setResource("settings", b.settings);
  setResource("top_matches", b.top_matches);
  setResource("outreach", b.outreach);
  setResource("threads", { items: b.threads });
  if (b.thread?.thread) setResource(`thread:${b.thread.thread.id}`, b.thread);
}

export interface DeskResource<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  stale: boolean;
  reload: () => Promise<T>;
}

export interface DeskResourceOptions {
  /** Varies the key, for example a filter. Any JSON value. */
  params?: unknown;
  /** false: do not fetch (for example until a session or id is known). */
  enabled?: boolean;
}

/**
 * Read a resource. The newest `load` passed for a key is the one used for
 * refetches. `loading` is true until the first result, and during refetches.
 */
export function useDeskResource<T>(
  key: DeskResourceKey | string,
  load: () => Promise<T>,
  opts: DeskResourceOptions = {},
): DeskResource<T> {
  const id = entryId(key, opts.params);
  const enabled = opts.enabled !== false;
  const loadRef = useRef(load);
  loadRef.current = load;

  const subscribe = useCallback(
    (cb: () => void) => {
      const e = entry(id);
      e.listeners.add(cb);
      return () => {
        e.listeners.delete(cb);
      };
    },
    [id],
  );
  const getSnap = useCallback(() => entries.get(id)?.snap ?? EMPTY, [id]);
  const snap = useSyncExternalStore(subscribe, getSnap, () => EMPTY);

  useEffect(() => {
    if (!enabled) return;
    return watchResource(id, () => loadRef.current());
  }, [id, enabled]);

  const reload = useCallback(() => {
    const e = entry(id);
    if (!e.load) e.load = () => loadRef.current();
    return fetchResource(id) as Promise<T>;
  }, [id]);

  return {
    data: snap.data as T | undefined,
    error: snap.error,
    loading: snap.loading || (enabled && snap.updatedAt === 0 && !snap.error),
    stale: snap.stale,
    reload,
  };
}
