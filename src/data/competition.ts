import { distanceKm } from '../lib/geo';
import { COMPETITORS } from './competitors';
import type { Category, Competitor, Store } from './types';

export interface NearbyCompetitor extends Competitor {
  km: number;
}

/** Competitors within a radius of a store, nearest first. */
export function competitorsNear(store: Store, radiusKm = 1.2): NearbyCompetitor[] {
  return COMPETITORS.map((c) => ({ ...c, km: distanceKm(store.coords, c.coords) }))
    .filter((c) => c.km <= radiusKm)
    .sort((a, b) => a.km - b.km);
}

/** Categories that appear in the store's decisions, in a stable order for the overlap matrix. */
export const MATRIX_CATEGORIES: Category[] = [
  'Pharmacy',
  'OTC health',
  'Beauty',
  'Personal care',
  'Convenience food',
  'Fresh grocery',
  'Household',
];

export function overlaps(c: Competitor, category: Category): boolean {
  return c.categories.includes(category);
}
