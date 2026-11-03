import { jitter, seededRandom } from './random';

describe('seededRandom', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = seededRandom(42);
    const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const r = seededRandom(7);
    for (let i = 0; i < 1000; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('jitter stays within the spread', () => {
    const r = seededRandom(1);
    for (let i = 0; i < 200; i++) {
      const x = jitter(r, 0.05);
      expect(x).toBeGreaterThanOrEqual(0.95);
      expect(x).toBeLessThanOrEqual(1.05);
    }
  });
});
