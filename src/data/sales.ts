import summary from './generated/sales.json';
import type { Category } from './types';

/**
 * Sales figures come from the data pipeline (/pipeline), which writes ./generated/sales.json.
 * With no real exports supplied, the pipeline uses synthetic sample data.
 */

export interface MonthPoint {
  key: string; // YYYY-MM
  label: string; // "Oct"
  sales: number;
  transactions: number;
}

export interface CategorySales {
  category: Category;
  sales: number;
  share: number;
}

export interface ItemSales {
  name: string;
  category: Category;
  units: number;
  revenue: number;
}

export interface WeekdaySales {
  day: string;
  averageSales: number;
}

interface StoreSummary {
  months: Omit<MonthPoint, 'label'>[];
  categories: CategorySales[];
  topItems: ItemSales[];
  weekdays: WeekdaySales[];
  pharmacyShare: number;
}

interface SalesSummary {
  source: 'sample' | 'import';
  period: { start: string; end: string };
  stores: Record<string, StoreSummary>;
}

const DATA = summary as SalesSummary;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** True when the figures are synthetic sample data rather than imported store exports. */
export const IS_SAMPLE = DATA.source === 'sample';

/** Last full month in the data, e.g. "2026-10". */
export const PERIOD_END = DATA.period.end;

function storeData(storeId: string): StoreSummary {
  const data = DATA.stores[storeId];
  if (!data) throw new Error(`No sales data for store ${storeId}`);
  return data;
}

/** Monthly sales and transactions, oldest first (up to 24 months). */
export function monthlySales(storeId: string): MonthPoint[] {
  return storeData(storeId).months.map((m) => ({ ...m, label: MONTHS[Number(m.key.slice(5, 7)) - 1] }));
}

export interface SalesKpis {
  ttmSales: number;
  priorTtmSales: number | null;
  yoy: number | null;
  transactions: number;
  averageBasket: number;
}

const total = (xs: MonthPoint[], k: 'sales' | 'transactions') => xs.reduce((a, x) => a + x[k], 0);

/** Trailing-12-month KPIs, compared with the 12 months before when the data goes back that far. */
export function salesKpis(storeId: string): SalesKpis {
  const series = monthlySales(storeId);
  const last = series.slice(-12);
  const prior = series.length >= 24 ? series.slice(-24, -12) : null;
  const ttmSales = total(last, 'sales');
  const transactions = total(last, 'transactions');
  const priorTtmSales = prior ? total(prior, 'sales') : null;
  return {
    ttmSales,
    priorTtmSales,
    yoy: priorTtmSales ? ttmSales / priorTtmSales - 1 : null,
    transactions,
    averageBasket: ttmSales / transactions,
  };
}

/** Last 12 months against the same months a year earlier (null where there is no earlier data). */
export function yearOverYear(storeId: string) {
  const series = monthlySales(storeId);
  const offset = series.length - 12;
  return series.slice(-12).map((cur, i) => ({
    label: cur.label,
    current: cur.sales,
    previous: offset + i - 12 >= 0 ? series[offset + i - 12].sales : null,
  }));
}

/** Trailing-12-month sales split by category, largest first. */
export function categorySales(storeId: string): CategorySales[] {
  return storeData(storeId).categories;
}

/** Best-selling front-store items over the trailing 12 months, by units. */
export function topItems(storeId: string, limit = 8): ItemSales[] {
  return storeData(storeId).topItems.slice(0, limit);
}

/** Average daily sales for each weekday over the trailing 12 months, Monday first. */
export function weekdaySales(storeId: string): WeekdaySales[] {
  return storeData(storeId).weekdays;
}

/** Pharmacy versus front-store share of trailing-12-month sales. */
export function pharmacySplit(storeId: string) {
  const pharmacy = storeData(storeId).pharmacyShare;
  return { pharmacy, frontStore: 1 - pharmacy };
}
