import { NEARBY_RADIUS_M, nearbyFor, nearbyPins, osmUrl } from './nearby';
import { VANCOUVER_LISTINGS } from './vancouverListings';
import { distanceKm } from '../lib/geo';

describe('nearby pharmacies and supermarkets', () => {
  it('uses a 10-minute walk', () => {
    expect(NEARBY_RADIUS_M).toBe(800);
  });

  it.each(VANCOUVER_LISTINGS)('$shortName has nearby places within the radius, nearest first', (listing) => {
    const nearby = nearbyFor(listing.id);
    expect(nearby).toBeDefined();
    const distances = nearby!.places.map((p) => p.distanceM);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
    for (const p of nearby!.places) {
      expect(p.distanceM).toBeLessThanOrEqual(NEARBY_RADIUS_M);
      // The stored distance matches the store's own map position.
      expect(Math.abs(distanceKm(listing.coords, p.coords) * 1000 - p.distanceM)).toBeLessThan(25);
    }
  });

  it('never lists a store as its own neighbour', () => {
    for (const listing of VANCOUVER_LISTINGS) {
      const self = nearbyFor(listing.id)!.places.filter((p) => p.loblaw === 'Shoppers Drug Mart' && p.distanceM < 60);
      expect(self, listing.id).toHaveLength(0);
    }
  });

  it('counts kinds and Loblaw banners', () => {
    const counts = VANCOUVER_LISTINGS.map((l) => nearbyFor(l.id)!);
    for (const n of counts) {
      expect(n.pharmacies + n.shoppers + n.supermarkets).toBe(n.places.length);
      expect(n.otherLoblaw).toBeLessThanOrEqual(n.places.length);
    }
  });

  it('links each place to OpenStreetMap', () => {
    expect(osmUrl('n123')).toBe('https://www.openstreetmap.org/node/123');
    expect(osmUrl('w9')).toBe('https://www.openstreetmap.org/way/9');
  });

  it('turns places into map pins that name Loblaw banners', () => {
    const pins = nearbyPins({
      places: [
        { name: 'No Frills', kind: 'Supermarket', loblaw: 'No Frills', coords: [49, -123], distanceM: 10, osm: 'n1' },
        { name: 'Shoppers Drug Mart', kind: 'Pharmacy', loblaw: 'Shoppers Drug Mart', coords: [49, -123], distanceM: 20, osm: 'n2' },
      ],
      pharmacies: 0,
      supermarkets: 1,
      shoppers: 1,
      otherLoblaw: 1,
    });
    expect(pins[0]).toMatchObject({ id: 'n1', name: 'No Frills (Loblaw)', coords: [49, -123] });
    // Other Shoppers Drug Mart stores already have their own store pins.
    expect(pins).toHaveLength(1);
    expect(nearbyPins(undefined)).toEqual([]);
  });
});
