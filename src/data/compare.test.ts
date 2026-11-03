import { categoryGaps, compareKpis, SPECIALISE_THRESHOLD, sharedCompetitors, storeDistanceKm, weekendGap } from './compare';
import { categorySales, salesKpis } from './sales';
import { UNIVERSITY, WESBROOK } from './stores';

describe('store comparison', () => {
  it('lines up the headline numbers for both stores', () => {
    const rows = compareKpis(WESBROOK, UNIVERSITY);
    expect(rows.map((r) => r.key)).toEqual(['ttmSales', 'yoy', 'transactions', 'averageBasket', 'pharmacyShare', 'weekendGap']);
    const sales = rows.find((r) => r.key === 'ttmSales')!;
    expect(sales.a).toBe(salesKpis('2247').ttmSales);
    expect(sales.b).toBe(salesKpis('2273').ttmSales);
  });

  it('shows weekends quieter on campus and busier in the residential village', () => {
    expect(weekendGap('2273')).toBeLessThan(-0.1);
    expect(weekendGap('2247')).toBeGreaterThan(0);
  });

  it('covers every category either store sells, biggest gap first', () => {
    const gaps = categoryGaps(WESBROOK, UNIVERSITY);
    const all = new Set([...categorySales('2247'), ...categorySales('2273')].map((c) => c.category));
    expect(new Set(gaps.map((g) => g.category))).toEqual(all);
    const sizes = gaps.map((g) => Math.abs(g.gap));
    expect([...sizes].sort((x, y) => y - x)).toEqual(sizes);
  });

  it('names a leader only when the gap passes the threshold', () => {
    for (const g of categoryGaps(WESBROOK, UNIVERSITY)) {
      if (Math.abs(g.gap) < SPECIALISE_THRESHOLD) expect(g.leader).toBeNull();
      else expect(g.leader).toBe(g.gap > 0 ? 'a' : 'b');
    }
  });

  it('finds the specialisms the research expects', () => {
    const lead = (store: 'a' | 'b') => categoryGaps(WESBROOK, UNIVERSITY).filter((g) => g.leader === store).map((g) => g.category);
    expect(lead('a')).toEqual(expect.arrayContaining(['Pharmacy', 'Beauty']));
    expect(lead('b')).toContain('Convenience food');
  });

  it('is symmetric when the stores swap sides', () => {
    const ab = categoryGaps(WESBROOK, UNIVERSITY);
    const ba = categoryGaps(UNIVERSITY, WESBROOK);
    for (const g of ab) {
      const other = ba.find((x) => x.category === g.category)!;
      expect(other.gap).toBeCloseTo(-g.gap, 10);
    }
  });

  it('lists competitors near both stores and says how far apart the stores are', () => {
    const shared = sharedCompetitors(WESBROOK, UNIVERSITY, 5);
    expect(shared.length).toBeGreaterThan(0);
    expect(sharedCompetitors(WESBROOK, UNIVERSITY, 0.01)).toEqual([]);
    expect(storeDistanceKm(WESBROOK, UNIVERSITY)).toBeGreaterThan(1);
    expect(storeDistanceKm(WESBROOK, UNIVERSITY)).toBeLessThan(2);
  });
});
