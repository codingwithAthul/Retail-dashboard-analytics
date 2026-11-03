import { DIRECTORY, facet, filterStores, hasProfile, matchesQuery, toListing } from './directory';
import { UNIVERSITY, WESBROOK } from './stores';
import type { StoreListing } from './types';

const listing = (over: Partial<StoreListing>): StoreListing => ({
  id: 'x',
  name: 'Shoppers Drug Mart Test',
  shortName: 'Test',
  banner: 'Shoppers Drug Mart',
  format: 'Conventional',
  address: '1 Main St, Vancouver, BC',
  neighbourhood: 'Downtown',
  coords: [49.28, -123.12],
  approximate: true,
  source: 'public-directory',
  ...over,
});

const SAMPLE: StoreListing[] = [
  listing({ id: 'a', shortName: 'Davie', address: '1125 Davie St, Vancouver, BC V6E 1N2', neighbourhood: 'West End' }),
  listing({ id: 'b', shortName: 'Denman', address: '1020 Denman St, Vancouver, BC V6G 2M5', neighbourhood: 'West End' }),
  listing({ id: 'c', shortName: 'Kerrisdale', address: '2303 West 41st Ave, Vancouver, BC', neighbourhood: 'Kerrisdale', format: 'Large format' }),
  listing({ id: 'd', shortName: 'No Frills Kingsway', banner: 'No Frills', neighbourhood: 'Renfrew-Collingwood', format: 'Not yet known' }),
];

describe('store directory', () => {
  it('starts with the profiled stores', () => {
    expect(DIRECTORY.slice(0, 2).map((s) => s.id)).toEqual([WESBROOK.id, UNIVERSITY.id]);
    expect(DIRECTORY.slice(0, 2).every(hasProfile)).toBe(true);
    expect(new Set(DIRECTORY.map((s) => s.id)).size).toBe(DIRECTORY.length);
  });

  it('turns a profiled store into a listing without losing its position', () => {
    const l = toListing(UNIVERSITY);
    expect(l).toMatchObject({ id: '2273', shortName: 'University Blvd', coords: UNIVERSITY.coords, approximate: false });
  });

  it('searches by number, name, street or postal code, ignoring case and punctuation', () => {
    expect(matchesQuery(toListing(WESBROOK), '2247')).toBe(true);
    expect(matchesQuery(toListing(WESBROOK), 'webber')).toBe(true);
    expect(matchesQuery(toListing(WESBROOK), 'v6s 0j9')).toBe(true);
    expect(matchesQuery(toListing(WESBROOK), 'V6S0J9')).toBe(false);
    expect(matchesQuery(toListing(WESBROOK), 'wesbrook village')).toBe(true);
    expect(matchesQuery(toListing(WESBROOK), 'davie')).toBe(false);
    expect(matchesQuery(toListing(WESBROOK), '   ')).toBe(true);
  });

  it('combines filters and search', () => {
    expect(filterStores(SAMPLE, { neighbourhood: 'West End' }).map((s) => s.id)).toEqual(['a', 'b']);
    expect(filterStores(SAMPLE, { neighbourhood: 'West End', query: 'denman' }).map((s) => s.id)).toEqual(['b']);
    expect(filterStores(SAMPLE, { banner: 'No Frills' }).map((s) => s.id)).toEqual(['d']);
    expect(filterStores(SAMPLE, { format: 'Large format' }).map((s) => s.id)).toEqual(['c']);
    expect(filterStores(SAMPLE, {})).toHaveLength(4);
  });

  it('counts filter options, most common first', () => {
    expect(facet(SAMPLE, 'neighbourhood')).toEqual([
      { value: 'West End', count: 2 },
      { value: 'Kerrisdale', count: 1 },
      { value: 'Renfrew-Collingwood', count: 1 },
    ]);
    expect(facet(SAMPLE, 'banner')[0]).toEqual({ value: 'Shoppers Drug Mart', count: 3 });
  });
});
