import { competitorsNear, overlaps } from './competition';
import { UNIVERSITY, WESBROOK } from './stores';

describe('competition', () => {
  it('finds Save-On-Foods as the nearest rival to Wesbrook', () => {
    const near = competitorsNear(WESBROOK);
    expect(near[0].id).toBe('save-on-wesbrook');
    expect(near[0].km).toBeLessThan(0.3);
  });

  it('sorts nearest first and respects the radius', () => {
    const near = competitorsNear(UNIVERSITY, 0.6);
    expect(near.map((c) => c.km)).toEqual([...near.map((c) => c.km)].sort((a, b) => a - b));
    expect(near.every((c) => c.km <= 0.6)).toBe(true);
    expect(near.map((c) => c.id)).toContain('university-pharmacy');
  });

  it('checks category overlap', () => {
    const [saveOn] = competitorsNear(WESBROOK);
    expect(overlaps(saveOn, 'Fresh grocery')).toBe(true);
    expect(overlaps(saveOn, 'Beauty')).toBe(false);
  });
});
