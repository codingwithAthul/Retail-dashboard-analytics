import { STORES } from './stores';
import { VANCOUVER_LISTINGS } from './vancouverListings';

describe('City of Vancouver store listings', () => {
  it('has the 29 checked stores, each once', () => {
    expect(VANCOUVER_LISTINGS).toHaveLength(29);
    const ids = VANCOUVER_LISTINGS.map((s) => s.id);
    expect(new Set(ids).size).toBe(29);
    expect(new Set(VANCOUVER_LISTINGS.map((s) => s.shortName)).size).toBe(29);
  });

  it('never reuses a profiled store number', () => {
    const profiled = new Set(STORES.map((s) => s.id));
    expect(VANCOUVER_LISTINGS.some((s) => profiled.has(s.id))).toBe(false);
  });

  it.each(VANCOUVER_LISTINGS)('$shortName sits inside the City of Vancouver', ({ coords: [lat, lng] }) => {
    expect(lat).toBeGreaterThan(49.198);
    expect(lat).toBeLessThan(49.316);
    expect(lng).toBeGreaterThan(-123.225);
    expect(lng).toBeLessThan(-123.022);
  });

  it('is labelled as public-directory data with a full address', () => {
    for (const s of VANCOUVER_LISTINGS) {
      expect(s.source).toBe('public-directory');
      expect(s.address).toMatch(/, Vancouver, BC V\d[A-Z] \d[A-Z]\d$/);
    }
  });

  it('marks the four unchecked positions as approximate', () => {
    expect(VANCOUVER_LISTINGS.filter((s) => s.approximate).map((s) => s.id).sort()).toEqual(['222', '2228', '2279', '288']);
  });
});
