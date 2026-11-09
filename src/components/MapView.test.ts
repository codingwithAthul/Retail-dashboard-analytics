import { TILE_ATTRIBUTION, TILE_URL } from './MapView';

describe('map tiles', () => {
  it('use a keyless tile server', () => {
    expect(TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(TILE_URL).not.toMatch(/cartocdn|key=/);
  });

  it('credit OpenStreetMap', () => {
    expect(TILE_ATTRIBUTION).toMatch(/OpenStreetMap/);
  });
});
