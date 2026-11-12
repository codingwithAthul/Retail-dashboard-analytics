import { listingNeighbours, storeNeighbours } from './neighbours';
import { STORES } from './stores';
import { VANCOUVER_LISTINGS } from './vancouverListings';

const DENMAN = VANCOUVER_LISTINGS.find((l) => l.id === '201')!;

describe('neighbours panel data', () => {
  it('gives every Vancouver store its places, calls and notes', () => {
    for (const l of VANCOUVER_LISTINGS) {
      const n = listingNeighbours(l)!;
      expect(n, l.id).toBeDefined();
      expect(n.calls).toHaveLength(7);
      expect(n.notesArea).toMatch(/^postal area [A-Z]\d[A-Z]$/);
    }
  });

  it('ties each nearby chain to the categories it draws shoppers for', () => {
    const row = listingNeighbours(DENMAN)!.rows.find((r) => r.name === 'No Frills')!;
    expect(row.loblaw).toBe(true);
    expect(row.categories).toContain('Fresh grocery');
    expect(row.categoriesLabel).toBe('Draws shoppers for');
    expect(row.source?.url).toMatch(/^https:\/\//);
  });

  it('marks independents as inferred', () => {
    const rows = listingNeighbours(DENMAN)!.rows.filter((r) => r.confidence === 'inferred');
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(r.basisNote).toMatch(/^inferred from/);
  });

  it('summarises the walk', () => {
    expect(listingNeighbours(DENMAN)!.summary).toMatch(/within 800 m, about a 10-minute walk\.$/);
  });

  it('uses the researched calls and UBC census for profiled stores', () => {
    for (const s of STORES) {
      const n = storeNeighbours(s);
      expect(n.calls).toBe(s.categoryCalls);
      expect(n.notes.map((x) => x.title)).toContain('Younger than Metro');
    }
  });
});
