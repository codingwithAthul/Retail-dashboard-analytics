import { categorySales, monthlySales, pharmacySplit, salesKpis, topItems, yearOverYear } from './sales';
import { SALES_PROFILES } from './salesProfiles';
import { STORES } from './stores';

describe('sample sales', () => {
  it('has a profile for every store', () => {
    for (const s of STORES) expect(SALES_PROFILES[s.id]).toBeDefined();
  });

  it('is deterministic between calls', () => {
    expect(monthlySales('2247')).toEqual(monthlySales('2247'));
  });

  it('returns 24 months ending October 2026, oldest first', () => {
    const series = monthlySales('2273');
    expect(series).toHaveLength(24);
    expect(series[0].key).toBe('2024-11');
    expect(series[23].key).toBe('2026-10');
  });

  it('throws for an unknown store', () => {
    expect(() => monthlySales('0000')).toThrow();
  });

  it.each(STORES)('$shortName: category mix adds up to 100%', (store) => {
    const total = Object.values(SALES_PROFILES[store.id].mix).reduce((a, b) => a + (b ?? 0), 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it.each(STORES)('$shortName: year-over-year growth is close to the profile', (store) => {
    const { yoy } = salesKpis(store.id);
    expect(yoy).toBeCloseTo(SALES_PROFILES[store.id].growth, 1);
  });

  it('shows a summer dip on University Blvd but not in Wesbrook', () => {
    const july = (id: string) => yearOverYear(id).find((p) => p.label === 'Jul')!.current;
    const sept = (id: string) => yearOverYear(id).find((p) => p.label === 'Sep')!.current;
    expect(july('2273') / sept('2273')).toBeLessThan(0.65);
    expect(july('2247') / sept('2247')).toBeGreaterThan(0.9);
  });

  it('sorts categories and items largest first', () => {
    const cats = categorySales('2247').map((c) => c.sales);
    expect([...cats].sort((a, b) => b - a)).toEqual(cats);
    const units = topItems('2273').map((i) => i.units);
    expect([...units].sort((a, b) => b - a)).toEqual(units);
  });

  it('splits pharmacy and front store to 100%', () => {
    const { pharmacy, frontStore } = pharmacySplit('2273');
    expect(pharmacy + frontStore).toBeCloseTo(1, 5);
    expect(pharmacySplit('2247').pharmacy).toBeGreaterThan(pharmacy);
  });
});
