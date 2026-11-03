import { parseHash, toHash } from './route';

const ids = ['2247', '2273'];
const fallback = { storeId: '2247', tab: 'overview' as const };

describe('route', () => {
  it('parses store and tab', () => {
    expect(parseHash('#/store/2273/sales', ids, fallback)).toEqual({ storeId: '2273', tab: 'sales' });
  });

  it('defaults the tab to overview', () => {
    expect(parseHash('#/store/2273', ids, fallback)).toEqual({ storeId: '2273', tab: 'overview' });
    expect(parseHash('#/store/2273/unknown', ids, fallback)).toEqual({ storeId: '2273', tab: 'overview' });
  });

  it('falls back for empty, malformed or unknown stores', () => {
    expect(parseHash('', ids, fallback)).toBe(fallback);
    expect(parseHash('#/nope', ids, fallback)).toBe(fallback);
    expect(parseHash('#/store/9999/sales', ids, fallback)).toBe(fallback);
  });

  it('opens a store brief', () => {
    expect(parseHash('#/store/2273/brief', ids, fallback)).toEqual({ storeId: '2273', tab: 'brief' });
    expect(toHash({ storeId: '2273', tab: 'brief' })).toBe('#/store/2273/brief');
  });

  it('opens the compare page', () => {
    expect(parseHash('#/compare', ids, fallback)).toEqual({ storeId: '2247', tab: 'compare' });
    expect(toHash({ storeId: '2273', tab: 'compare' })).toBe('#/compare');
  });

  it('round-trips', () => {
    for (const r of [{ storeId: '2247', tab: 'overview' as const }, { storeId: '2273', tab: 'competitors' as const }]) {
      expect(parseHash(toHash(r), ids, fallback)).toEqual(r);
    }
  });

  it('opens the compare page with two chosen stores', () => {
    expect(parseHash('#/compare/2273/2247', ids, fallback)).toEqual({ storeId: '2247', tab: 'compare', compare: ['2273', '2247'] });
    expect(toHash({ storeId: '2247', tab: 'compare', compare: ['2273', '2247'] })).toBe('#/compare/2273/2247');
  });

  it('ignores a compare pair that repeats a store or names an unknown one', () => {
    expect(parseHash('#/compare/2247/2247', ids, fallback)).toEqual({ storeId: '2247', tab: 'compare' });
    expect(parseHash('#/compare/2247/9999', ids, fallback)).toEqual({ storeId: '2247', tab: 'compare' });
  });
});
