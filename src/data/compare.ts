import { distanceKm } from '../lib/geo';
import { competitorsNear } from './competition';
import { categorySales, pharmacySplit, salesKpis, weekdaySales } from './sales';
import type { Category, Competitor, Store } from './types';

/** Category share gaps smaller than this (in share points) count as "similar". */
export const SPECIALISE_THRESHOLD = 0.03;

export type KpiKey = 'ttmSales' | 'yoy' | 'transactions' | 'averageBasket' | 'pharmacyShare' | 'weekendGap';

export interface KpiRow {
  key: KpiKey;
  label: string;
  a: number | null;
  b: number | null;
}

/** Average weekend day vs average weekday: negative means weekends are quieter. */
export function weekendGap(storeId: string): number {
  const days = weekdaySales(storeId).map((d) => d.averageSales);
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  return mean(days.slice(5)) / mean(days.slice(0, 5)) - 1;
}

/** Headline numbers for two stores, side by side. */
export function compareKpis(a: Store, b: Store): KpiRow[] {
  const ka = salesKpis(a.id);
  const kb = salesKpis(b.id);
  return [
    { key: 'ttmSales', label: 'Sales, last 12 months', a: ka.ttmSales, b: kb.ttmSales },
    { key: 'yoy', label: 'Growth vs prior year', a: ka.yoy, b: kb.yoy },
    { key: 'transactions', label: 'Transactions', a: ka.transactions, b: kb.transactions },
    { key: 'averageBasket', label: 'Average basket', a: ka.averageBasket, b: kb.averageBasket },
    { key: 'pharmacyShare', label: 'Pharmacy share', a: pharmacySplit(a.id).pharmacy, b: pharmacySplit(b.id).pharmacy },
    { key: 'weekendGap', label: 'Weekends vs weekdays', a: weekendGap(a.id), b: weekendGap(b.id) },
  ];
}

export interface CategoryGap {
  category: Category;
  a: number;
  b: number;
  /** a minus b, in share points (0.05 = 5 points). */
  gap: number;
  leader: 'a' | 'b' | null;
}

/** Category shares for both stores, biggest difference first. A leader is set only past the threshold. */
export function categoryGaps(a: Store, b: Store): CategoryGap[] {
  const shares = (id: string) => new Map(categorySales(id).map((c) => [c.category, c.share]));
  const sa = shares(a.id);
  const sb = shares(b.id);
  const categories = [...new Set([...sa.keys(), ...sb.keys()])];
  return categories
    .map((category) => {
      const x = sa.get(category) ?? 0;
      const y = sb.get(category) ?? 0;
      const gap = x - y;
      const leader: CategoryGap['leader'] = Math.abs(gap) < SPECIALISE_THRESHOLD ? null : gap > 0 ? 'a' : 'b';
      return { category, a: x, b: y, gap, leader };
    })
    .sort((p, q) => Math.abs(q.gap) - Math.abs(p.gap) || p.category.localeCompare(q.category));
}

/** Competitors close enough to both stores to matter to each. */
export function sharedCompetitors(a: Store, b: Store, radiusKm = 1.2): Competitor[] {
  const nearB = new Set(competitorsNear(b, radiusKm).map((c) => c.id));
  return competitorsNear(a, radiusKm).filter((c) => nearB.has(c.id));
}

/** Straight-line distance between two stores, in km. */
export function storeDistanceKm(a: Store, b: Store): number {
  return distanceKm(a.coords, b.coords);
}
