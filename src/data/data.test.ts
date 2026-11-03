import { COMPETITORS } from './competitors';
import { SOURCES, getSource } from './sources';
import { STORES, getStore } from './stores';

const sum = (xs: { share: number }[]) => xs.reduce((a, x) => a + x.share, 0);

describe('store data', () => {
  it('has the two UBC stores with unique ids', () => {
    expect(STORES.map((s) => s.id)).toEqual(['2247', '2273']);
    expect(getStore('2273')?.shortName).toBe('University Blvd');
    expect(getStore('nope')).toBeUndefined();
  });

  it.each(STORES)('$shortName: segment and age shares add up to 100%', (store) => {
    expect(sum(store.demographics.segments)).toBeCloseTo(1, 5);
    expect(sum(store.demographics.ageBands)).toBeCloseTo(1, 5);
  });

  it.each(STORES)('$shortName: leadership is placeholders only (no names published)', (store) => {
    expect(store.leadership.length).toBeGreaterThan(0);
    expect(store.leadership.every((r) => r.name === null)).toBe(true);
  });

  it.each(STORES)('$shortName: coordinates are in the UBC area', (store) => {
    const [lat, lng] = store.coords;
    expect(lat).toBeGreaterThan(49.24);
    expect(lat).toBeLessThan(49.28);
    expect(lng).toBeGreaterThan(-123.26);
    expect(lng).toBeLessThan(-123.22);
  });
});

describe('sources', () => {
  const ids = new Set(Object.keys(SOURCES));
  const referenced = [
    ...STORES.flatMap((s) => [
      ...s.sources,
      ...s.differentiators.flatMap((f) => f.sources ?? []),
      ...s.demographics.facts.flatMap((f) => f.sources ?? []),
    ]),
    ...COMPETITORS.flatMap((c) => c.sources),
  ];

  it('every referenced source exists', () => {
    for (const id of referenced) expect(ids.has(id), id).toBe(true);
  });

  it('every verified fact cites a source', () => {
    const facts = STORES.flatMap((s) => [...s.differentiators, ...s.demographics.facts]);
    for (const f of facts.filter((x) => x.confidence === 'verified')) {
      expect(f.sources?.length, f.label).toBeGreaterThan(0);
    }
  });

  it('getSource throws on an unknown id', () => {
    expect(() => getSource('missing')).toThrow();
  });
});

describe('competitors', () => {
  it('are all marked approximate until surveyed', () => {
    expect(COMPETITORS.every((c) => c.approximate)).toBe(true);
  });
});
