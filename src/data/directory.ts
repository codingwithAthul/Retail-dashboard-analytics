import { STORES } from './stores';
import type { Store, StoreListing } from './types';
import { VANCOUVER_LISTINGS } from './vancouverListings';

/** A profiled store as a map listing. */
export function toListing(store: Store): StoreListing {
  return {
    id: store.id,
    name: store.name,
    shortName: store.shortName,
    banner: store.banner,
    format: store.format,
    address: store.address,
    neighbourhood: 'UBC',
    coords: store.coords,
    approximate: false,
    source: 'profile',
  };
}

/** Stores known only from public directories. Added once each address has a checked map position. */
export const DIRECTORY_ONLY: StoreListing[] = VANCOUVER_LISTINGS;

/** Every store on the map: profiled stores first, then directory listings by name. */
export const DIRECTORY: StoreListing[] = [
  ...STORES.map(toListing),
  ...[...DIRECTORY_ONLY].sort((a, b) => a.shortName.localeCompare(b.shortName)),
];

export interface StoreFilters {
  query?: string;
  banner?: string;
  format?: string;
  neighbourhood?: string;
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** True when every word of the query appears in the store's number, name, address or neighbourhood. */
export function matchesQuery(store: StoreListing, query: string): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalise([store.id, store.name, store.shortName, store.address, store.neighbourhood].join(' '));
  return words.every((w) => haystack.includes(w));
}

/** Stores that pass every filter that is set. Empty filters keep everything. */
export function filterStores(stores: StoreListing[], filters: StoreFilters): StoreListing[] {
  return stores.filter(
    (s) =>
      (!filters.banner || s.banner === filters.banner) &&
      (!filters.format || s.format === filters.format) &&
      (!filters.neighbourhood || s.neighbourhood === filters.neighbourhood) &&
      matchesQuery(s, filters.query ?? ''),
  );
}

export interface Facet {
  value: string;
  count: number;
}

/** Distinct values of one field with their store counts, most common first. */
export function facet(stores: StoreListing[], field: 'banner' | 'format' | 'neighbourhood'): Facet[] {
  const counts = new Map<string, number>();
  for (const s of stores) counts.set(s[field], (counts.get(s[field]) ?? 0) + 1);
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** True when the store has a full profile (summary, demographics, sales, competitors). */
export const hasProfile = (store: StoreListing) => store.source === 'profile';
