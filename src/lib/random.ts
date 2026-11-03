/** Small seeded PRNG (mulberry32) so sample data is identical on every load and in tests. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random number in [1 - spread, 1 + spread]. */
export const jitter = (rand: () => number, spread: number) => 1 + (rand() * 2 - 1) * spread;
