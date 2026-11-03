export interface ScreenPoint<T> {
  item: T;
  x: number;
  y: number;
}

export interface Cluster<T> {
  items: T[];
  x: number;
  y: number;
}

/**
 * Greedy screen-space clustering: each point joins the first cluster whose centre is
 * closer than `radius` pixels, otherwise it starts a new one. Centres are the mean of
 * their members. Small and fast enough for a few hundred pins.
 */
export function clusterPoints<T>(points: ScreenPoint<T>[], radius: number): Cluster<T>[] {
  const clusters: (Cluster<T> & { sx: number; sy: number })[] = [];
  for (const p of points) {
    const hit = clusters.find((c) => Math.hypot(c.x - p.x, c.y - p.y) < radius);
    if (hit) {
      hit.items.push(p.item);
      hit.sx += p.x;
      hit.sy += p.y;
      hit.x = hit.sx / hit.items.length;
      hit.y = hit.sy / hit.items.length;
    } else {
      clusters.push({ items: [p.item], x: p.x, y: p.y, sx: p.x, sy: p.y });
    }
  }
  return clusters.map(({ items, x, y }) => ({ items, x, y }));
}
