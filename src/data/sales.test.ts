import summary from './generated/sales.json';
import {
  categorySales,
  IS_SAMPLE,
  monthlySales,
  PERIOD_END,
  pharmacySplit,
  salesKpis,
  topItems,
  weekdaySales,
  yearOverYear,
} from './sales';
import { STORES } from './stores';
import type { Category } from './types';

const CATEGORIES: Category[] = [
  'Pharmacy', 'OTC health', 'Beauty', 'Personal care', 'Convenience food', 'Fresh grocery', 'Household', 'Seasonal',
];

describe('pipeline sales data', () => {
  it('has data for every store on the map', () => {
    for (const s of STORES) expect(summary.stores).toHaveProperty(s.id);
  });

  it('is labelled as sample data', () => {
    expect(IS_SAMPLE).toBe(true);
  });

  it('returns 24 months ending October 2026, oldest first, with month labels', () => {
    const series = monthlySales('2273');
    expect(series).toHaveLength(24);
    expect(series[0]).toMatchObject({ key: '2024-11', label: 'Nov' });
    expect(series[23]).toMatchObject({ key: '2026-10', label: 'Oct' });
    expect(PERIOD_END).toBe('2026-10');
  });

  it('throws for an unknown store', () => {
    expect(() => monthlySales('0000')).toThrow();
  });

  it.each(STORES)('$shortName: only uses the dashboard categories', (store) => {
    for (const c of categorySales(store.id)) expect(CATEGORIES).toContain(c.category);
  });

  it.each(STORES)('$shortName: category sales add up to last-12-month sales', (store) => {
    const cats = categorySales(store.id);
    expect(cats.reduce((a, c) => a + c.share, 0)).toBeCloseTo(1, 2);
    expect(cats.reduce((a, c) => a + c.sales, 0)).toBeCloseTo(salesKpis(store.id).ttmSales, -2);
  });

  it.each(STORES)('$shortName: KPIs are consistent', (store) => {
    const k = salesKpis(store.id);
    expect(k.averageBasket).toBeCloseTo(k.ttmSales / k.transactions, 6);
    expect(k.yoy).toBeCloseTo(k.ttmSales / k.priorTtmSales! - 1, 6);
  });

  it('grows faster in Wesbrook than on University Blvd', () => {
    expect(salesKpis('2247').yoy!).toBeGreaterThan(salesKpis('2273').yoy!);
  });

  it('shows a summer dip on University Blvd but not in Wesbrook', () => {
    const ratio = (id: string) => {
      const yoy = yearOverYear(id);
      return yoy.find((p) => p.label === 'Jul')!.current / yoy.find((p) => p.label === 'Sep')!.current;
    };
    expect(ratio('2273')).toBeLessThan(0.65);
    expect(ratio('2247')).toBeGreaterThan(0.9);
  });

  it('lines up each month with the same month a year before', () => {
    const series = monthlySales('2247');
    const yoy = yearOverYear('2247');
    expect(yoy[0]).toEqual({ label: 'Nov', current: series[12].sales, previous: series[0].sales });
  });

  it('sorts categories and items largest first', () => {
    const cats = categorySales('2247').map((c) => c.sales);
    expect([...cats].sort((a, b) => b - a)).toEqual(cats);
    const units = topItems('2273').map((i) => i.units);
    expect([...units].sort((a, b) => b - a)).toEqual(units);
  });

  it('keeps prescriptions out of best-selling items', () => {
    for (const s of STORES) expect(topItems(s.id).every((i) => i.category !== 'Pharmacy')).toBe(true);
  });

  it('has an average for each weekday, Monday first', () => {
    expect(weekdaySales('2273').map((d) => d.day)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });

  it('splits pharmacy and front store to 100%', () => {
    const { pharmacy, frontStore } = pharmacySplit('2273');
    expect(pharmacy + frontStore).toBeCloseTo(1, 5);
    expect(pharmacySplit('2247').pharmacy).toBeGreaterThan(pharmacy);
  });
});
