import { DIRECTORY } from './directory';
import { NETWORK_RADIUS_M, networkRows, networkSummary } from './network';

describe('Shoppers Drug Mart network overlap', () => {
  const rows = networkRows();

  it('has one row per store on the map', () => {
    expect(rows).toHaveLength(DIRECTORY.length);
    expect(new Set(rows.map((r) => r.id)).size).toBe(DIRECTORY.length);
  });

  it('measures other Shoppers Drug Mart stores from the store positions, both ways', () => {
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const r of rows) {
      for (const o of r.otherSdm) {
        expect(o.id).not.toBe(r.id);
        expect(o.distanceM).toBeLessThanOrEqual(NETWORK_RADIUS_M);
        // If A is near B, B is near A at the same distance.
        expect(byId.get(o.id)!.otherSdm.find((x) => x.id === r.id)?.distanceM).toBe(o.distanceM);
      }
    }
  });

  it('knows Robson & Burrard and Granville are about 440 m apart', () => {
    const robson = rows.find((r) => r.id === '2245')!;
    const granville = robson.otherSdm.find((o) => o.id === '2277');
    expect(granville?.distanceM).toBeGreaterThan(400);
    expect(granville?.distanceM).toBeLessThan(480);
  });

  it('lists sister Loblaw banners, never Shoppers Drug Mart itself', () => {
    const denman = rows.find((r) => r.id === '201')!;
    expect(denman.sisters.map((s) => s.loblaw)).toContain('No Frills');
    for (const r of rows) for (const s of r.sisters) expect(s.loblaw).not.toBe('Shoppers Drug Mart');
  });

  it('puts the most overlapped stores first', () => {
    const counts = rows.map((r) => r.otherSdm.length);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  it('summarises the network', () => {
    const s = networkSummary(rows);
    expect(s.stores).toBe(DIRECTORY.length);
    expect(s.withOtherSdm).toBe(rows.filter((r) => r.otherSdm.length > 0).length);
    expect(s.withSister).toBe(rows.filter((r) => r.sisters.length > 0).length);
    expect(s.closestPair!.distanceM).toBeLessThanOrEqual(Math.min(...rows.flatMap((r) => r.otherSdm.map((o) => o.distanceM))));
  });
});
