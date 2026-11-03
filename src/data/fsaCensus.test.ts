import { fsaCensus, fsaOf } from './fsaCensus';
import { getSource } from './sources';
import { VANCOUVER_LISTINGS } from './vancouverListings';

describe('2021 census by postal area', () => {
  it('reads the postal area from an address', () => {
    expect(fsaOf('1020 Denman St, Vancouver, BC V6G 2M5')).toBe('V6G');
    expect(fsaOf('no postal code')).toBeUndefined();
  });

  it.each(VANCOUVER_LISTINGS)('$shortName has a census profile for its postal area', (listing) => {
    const census = fsaCensus(listing);
    expect(census).toBeDefined();
    expect(census!.code).toBe(fsaOf(listing.address));
    expect(census!.geography).toContain('Postal area');
  });

  it('every measure has an area and a Metro Vancouver value', () => {
    for (const listing of VANCOUVER_LISTINGS) {
      for (const m of fsaCensus(listing)!.measures) {
        expect(m.area, `${listing.id} ${m.label}`).not.toBe('');
        expect(m.metro).not.toBe('');
      }
    }
  });

  it('age bands add up to 100% of residents', () => {
    for (const listing of VANCOUVER_LISTINGS) {
      const total = fsaCensus(listing)!.ageBands.reduce((a, b) => a + b.share, 0);
      expect(total, listing.id).toBeCloseTo(1, 1);
    }
  });

  it('cites the Statistics Canada profile page for the postal area', () => {
    const census = fsaCensus(VANCOUVER_LISTINGS[0])!;
    const page = getSource(census.sources[0]);
    expect(page.url).toContain('statcan.gc.ca');
    expect(page.url).toContain(`2021A0011${census.code}`);
  });

  it('formats money, rates and counts', () => {
    const denman = fsaCensus(VANCOUVER_LISTINGS.find((l) => l.id === '201')!)!;
    const value = (label: string) => denman.measures.find((m) => m.label === label)!.area;
    expect(value('Population (2021)')).toMatch(/^\d{1,3}(,\d{3})*$/);
    expect(value('Median household income (2020)')).toMatch(/^\$\d{1,3}(,\d{3})*$/);
    expect(value('Households that rent')).toMatch(/^\d+\.\d%$/);
  });
});
