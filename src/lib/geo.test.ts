import { centroid, distanceKm, formatDistance } from './geo';

describe('geo', () => {
  it('measures about 1.5 km between the two UBC stores', () => {
    const km = distanceKm([49.25404, -123.23656], [49.2658, -123.246]);
    expect(km).toBeGreaterThan(1.4);
    expect(km).toBeLessThan(1.6);
  });

  it('returns zero for the same point', () => {
    expect(distanceKm([49.26, -123.24], [49.26, -123.24])).toBe(0);
  });

  it('centres between points', () => {
    expect(centroid([[0, 0], [2, 4]])).toEqual([1, 2]);
  });

  it('rejects an empty list', () => {
    expect(() => centroid([])).toThrow();
  });

  it('formats metres under 1 km and kilometres above', () => {
    expect(formatDistance(0.42)).toBe('420 m');
    expect(formatDistance(1.48)).toBe('1.5 km');
  });
});
