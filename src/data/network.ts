import { DIRECTORY } from './directory';
import { NEARBY_RADIUS_M, nearbyFor, type NearbyPlace } from './nearby';
import type { StoreListing } from './types';
import { distanceKm } from '../lib/geo';

/** The same 10-minute walk used for nearby places. */
export const NETWORK_RADIUS_M = NEARBY_RADIUS_M;

export interface NeighbourStore {
  id: string;
  shortName: string;
  distanceM: number;
}

export interface NetworkRow {
  id: string;
  shortName: string;
  neighbourhood: string;
  /** Other Shoppers Drug Mart stores within the radius, measured between store positions, nearest first. */
  otherSdm: NeighbourStore[];
  /** Other Loblaw banners within the radius, from OpenStreetMap, nearest first. Empty when not surveyed. */
  sisters: NearbyPlace[];
  /** True when nearby places have been surveyed for this store. */
  surveyed: boolean;
}

const metres = (a: StoreListing, b: StoreListing) => Math.round(distanceKm(a.coords, b.coords) * 1000);

/** One row per store on the map: where the network overlaps itself and sits next to sister banners. */
export function networkRows(stores: StoreListing[] = DIRECTORY): NetworkRow[] {
  return stores
    .map((s) => {
      const nearby = nearbyFor(s.id);
      return {
        id: s.id,
        shortName: s.shortName,
        neighbourhood: s.neighbourhood,
        otherSdm: stores
          .filter((o) => o.id !== s.id)
          .map((o) => ({ id: o.id, shortName: o.shortName, distanceM: metres(s, o) }))
          .filter((o) => o.distanceM <= NETWORK_RADIUS_M)
          .sort((a, b) => a.distanceM - b.distanceM),
        sisters: (nearby?.places ?? []).filter((p) => p.loblaw && p.loblaw !== 'Shoppers Drug Mart'),
        surveyed: nearby !== undefined,
      };
    })
    .sort((a, b) => b.otherSdm.length - a.otherSdm.length || b.sisters.length - a.sisters.length || a.shortName.localeCompare(b.shortName));
}

export interface NetworkSummary {
  stores: number;
  withOtherSdm: number;
  withSister: number;
  closestPair?: { a: string; b: string; distanceM: number };
}

export function networkSummary(rows: NetworkRow[]): NetworkSummary {
  let closestPair: NetworkSummary['closestPair'];
  for (const r of rows) {
    const o = r.otherSdm[0];
    if (o && (!closestPair || o.distanceM < closestPair.distanceM)) closestPair = { a: r.shortName, b: o.shortName, distanceM: o.distanceM };
  }
  return {
    stores: rows.length,
    withOtherSdm: rows.filter((r) => r.otherSdm.length > 0).length,
    withSister: rows.filter((r) => r.sisters.length > 0).length,
    closestPair,
  };
}
