import { jitter, seededRandom } from '../lib/random';
import { SALES_PROFILES, type SalesProfile } from './salesProfiles';
import type { Category } from './types';

/** The sample series ends at the last full month before the research date. */
export const SAMPLE_END = { year: 2026, month: 10 }; // October 2026

export interface MonthPoint {
  key: string; // YYYY-MM
  label: string; // "Oct"
  sales: number;
  transactions: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function profileFor(storeId: string): SalesProfile {
  const profile = SALES_PROFILES[storeId];
  if (!profile) throw new Error(`No sales profile for store ${storeId}`);
  return profile;
}

/** 24 months of sample sales, oldest first. The second year is grown by the profile's growth rate. */
export function monthlySales(storeId: string, months = 24): MonthPoint[] {
  const p = profileFor(storeId);
  const rand = seededRandom(p.seed);
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const index = SAMPLE_END.year * 12 + (SAMPLE_END.month - 1) - i;
    const year = Math.floor(index / 12);
    const m = index % 12;
    const yearFactor = i < 12 ? 1 + p.growth : 1;
    const sales = Math.round(p.baseMonthly * p.seasonality[m] * yearFactor * jitter(rand, 0.025));
    points.push({
      key: `${year}-${String(m + 1).padStart(2, '0')}`,
      label: MONTHS[m],
      sales,
      transactions: Math.round(sales / (p.averageBasket * jitter(rand, 0.02))),
    });
  }
  return points;
}

export interface SalesKpis {
  ttmSales: number;
  priorTtmSales: number;
  yoy: number;
  transactions: number;
  averageBasket: number;
}

/** Trailing-12-month KPIs compared with the 12 months before. */
export function salesKpis(storeId: string): SalesKpis {
  const series = monthlySales(storeId, 24);
  const last = series.slice(12);
  const prior = series.slice(0, 12);
  const total = (xs: MonthPoint[], k: 'sales' | 'transactions') => xs.reduce((a, x) => a + x[k], 0);
  const ttmSales = total(last, 'sales');
  const priorTtmSales = total(prior, 'sales');
  const transactions = total(last, 'transactions');
  return {
    ttmSales,
    priorTtmSales,
    yoy: ttmSales / priorTtmSales - 1,
    transactions,
    averageBasket: ttmSales / transactions,
  };
}

/** Last 12 months against the same months a year earlier, for a year-over-year chart. */
export function yearOverYear(storeId: string) {
  const series = monthlySales(storeId, 24);
  return series.slice(12).map((cur, i) => ({ label: cur.label, current: cur.sales, previous: series[i].sales }));
}
