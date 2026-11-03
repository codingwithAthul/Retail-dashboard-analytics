import { clusterPoints } from './cluster';

describe('clusterPoints', () => {
  it('groups points closer than the radius and keeps distant ones apart', () => {
    const out = clusterPoints(
      [
        { item: 'a', x: 0, y: 0 },
        { item: 'b', x: 10, y: 0 },
        { item: 'c', x: 100, y: 100 },
      ],
      30,
    );
    expect(out.map((c) => c.items)).toEqual([['a', 'b'], ['c']]);
    expect(out[0]).toMatchObject({ x: 5, y: 0 });
  });

  it('returns one cluster per point when none are close', () => {
    expect(clusterPoints([{ item: 1, x: 0, y: 0 }, { item: 2, x: 50, y: 0 }], 30)).toHaveLength(2);
  });

  it('handles no points', () => {
    expect(clusterPoints([], 30)).toEqual([]);
  });
});
