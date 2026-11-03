import { UBC_CENSUS } from './census';
import { getSource } from './sources';
import { STORES } from './stores';

describe('2021 census for UBC', () => {
  it('is the Metro Vancouver A census subdivision', () => {
    expect(UBC_CENSUS.code).toBe('5915020');
    expect(UBC_CENSUS.area).toBe('Metro Vancouver A');
  });

  it('age bands add up to 100% of residents', () => {
    expect(UBC_CENSUS.ageBands.reduce((a, b) => a + b.share, 0)).toBeCloseTo(1, 5);
  });

  it('every measure has an area and a Metro Vancouver value', () => {
    for (const m of UBC_CENSUS.measures) {
      expect(m.area).not.toBe('');
      expect(m.metro).not.toBe('');
    }
  });

  it('cites Statistics Canada for both geographies', () => {
    for (const id of UBC_CENSUS.sources) expect(getSource(id).url).toContain('statcan.gc.ca');
  });

  it.each(STORES)('$shortName shows the UBC census', (store) => {
    expect(store.demographics.census).toBe(UBC_CENSUS);
  });
});
