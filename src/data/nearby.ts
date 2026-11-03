import data from './generated/nearby.json';
import type { Competitor } from './types';

/**
 * Pharmacies and supermarkets within a 10-minute walk of each directory store, from
 * OpenStreetMap. Written by the pipeline (`python -m etl nearby`); method and limits in
 * Research/10-nearby-pharmacies-and-supermarkets.md.
 */
export interface NearbyPlace {
  name: string;
  kind: 'Pharmacy' | 'Supermarket';
  /** The Loblaw banner, when the place is one. */
  loblaw: string | null;
  coords: [number, number];
  distanceM: number;
  /** OpenStreetMap element: n (node), w (way) or r (relation) and its id. */
  osm: string;
}

export interface NearbySummary {
  places: NearbyPlace[];
  pharmacies: number;
  supermarkets: number;
  /** Other Shoppers Drug Mart stores in the radius: the network overlapping itself. */
  shoppers: number;
  /** Other Loblaw banners (not Shoppers Drug Mart) in the radius. */
  otherLoblaw: number;
}

export const NEARBY_RADIUS_M: number = data.radiusM;

const STORES = data.stores as unknown as Record<string, NearbyPlace[]>;

const OSM_TYPES: Record<string, string> = { n: 'node', w: 'way', r: 'relation' };

/** The OpenStreetMap page for a place. */
export const osmUrl = (osm: string) => `https://www.openstreetmap.org/${OSM_TYPES[osm[0]]}/${osm.slice(1)}`;

/** What is within a 10-minute walk of a store; undefined when the store is not in the data. */
export function nearbyFor(storeId: string): NearbySummary | undefined {
  const places = STORES[storeId];
  if (!places) return undefined;
  return {
    places,
    pharmacies: places.filter((p) => p.kind === 'Pharmacy' && p.loblaw !== 'Shoppers Drug Mart').length,
    supermarkets: places.filter((p) => p.kind === 'Supermarket').length,
    shoppers: places.filter((p) => p.loblaw === 'Shoppers Drug Mart').length,
    otherLoblaw: places.filter((p) => p.loblaw && p.loblaw !== 'Shoppers Drug Mart').length,
  };
}

/** Nearby places as map pins. Other Shoppers Drug Mart stores are left out: they already have store pins. */
export function nearbyPins(summary: NearbySummary | undefined): Competitor[] {
  return (summary?.places ?? []).filter((p) => p.loblaw !== 'Shoppers Drug Mart').map((p) => ({
    id: p.osm,
    name: p.loblaw ? `${p.name} (Loblaw)` : p.name,
    kind: p.kind,
    address: '',
    coords: p.coords,
    approximate: false,
    categories: [],
    sources: [],
  }));
}
