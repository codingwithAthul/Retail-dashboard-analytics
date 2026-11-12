import { competitorsNear } from './competition';
import { fsaArea, fsaOf } from './fsaCensus';
import { NEARBY_RADIUS_M, nearbyFor, osmUrl } from './nearby';
import { profileFor, shelfCalls } from './sellers';
import { UBC_AREA, stockNotes, type StockNote } from './stockNotes';
import type { Category, CategoryCall, Confidence, Store, StoreListing } from './types';

/** One place near a store, as the neighbours panel lists it. */
export interface NeighbourRow {
  id: string;
  name: string;
  /** Map page for the place, when there is one. */
  href?: string;
  loblaw: boolean;
  kind: string;
  distanceM: number;
  mainlySells: string;
  /** How sure the "mainly sells" line is. */
  confidence: Confidence;
  /** Shown after the line for an inferred profile, e.g. "inferred from the map". */
  basisNote?: string;
  source?: { title: string; url: string };
  /** The store categories this place matters for. */
  categories: Category[];
  categoriesLabel: string;
}

/** Everything the neighbours panel shows for one store. */
export interface Neighbours {
  rows: NeighbourRow[];
  /** One line saying what was searched and what was found. */
  summary: string;
  footnote: string;
  calls: CategoryCall[];
  callsNote: string;
  notes: StockNote[];
  /** The census area behind the notes, e.g. "postal area V6G". */
  notesArea: string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** A store known from public directories: OpenStreetMap places, chain profiles and rules. */
export function listingNeighbours(listing: StoreListing): Neighbours | undefined {
  const nearby = nearbyFor(listing.id);
  if (!nearby) return undefined;
  const rows = nearby.places.map((p): NeighbourRow => {
    const profile = profileFor(p);
    const sdm = profile.chain === 'Shoppers Drug Mart';
    return {
      id: p.osm,
      name: p.name,
      href: osmUrl(p.osm),
      loblaw: p.loblaw != null,
      kind: p.kind,
      distanceM: p.distanceM,
      mainlySells: profile.mainlySells,
      confidence: profile.confidence,
      basisNote: profile.basis === 'name' ? 'inferred from its name' : profile.basis === 'map type' ? 'inferred from the map' : undefined,
      source: profile.sources[0],
      categories: sdm ? [] : profile.strong,
      categoriesLabel: 'Draws shoppers for',
    };
  });
  const parts = [plural(nearby.pharmacies, 'other pharmacy', 'other pharmacies'), plural(nearby.supermarkets, 'supermarket', 'supermarkets')];
  if (nearby.shoppers) parts.push(plural(nearby.shoppers, 'other Shoppers Drug Mart store', 'other Shoppers Drug Mart stores'));
  if (nearby.otherLoblaw) parts.push(plural(nearby.otherLoblaw, 'Loblaw store under another banner', 'Loblaw stores under other banners'));
  const area = fsaArea(listing);
  return {
    rows,
    summary: `${parts.join(', ')} within ${NEARBY_RADIUS_M} m, about a 10-minute walk.`,
    footnote:
      'Source: OpenStreetMap contributors. Straight-line distance; the map may miss new or unmapped stores. What a chain sells is its usual range, from its own site or trade press; one store may lack a department.',
    calls: shelfCalls(nearby.places),
    callsNote:
      'From what the places nearby sell: avoid what a destination store next door does better, differentiate where it overlaps, compete where nobody nearby is strong. A rule, not sales data.',
    notes: area ? stockNotes(area) : [],
    notesArea: `postal area ${fsaOf(listing.address) ?? ''}`.trim(),
  };
}

/** A profiled store: surveyed competitors and the researched category calls. */
export function storeNeighbours(store: Store): Neighbours {
  const near = competitorsNear(store);
  return {
    rows: near.map((c) => ({
      id: c.id,
      name: c.name,
      loblaw: false,
      kind: c.kind,
      distanceM: Math.round(c.km * 1000),
      mainlySells: c.kind,
      confidence: 'verified',
      categories: c.categories,
      categoriesLabel: 'Overlaps on',
    })),
    summary: `${plural(near.length, 'retailer', 'retailers')} selling the store's categories within 1.2 km.`,
    footnote: 'Surveyed from public sources; see the Competitors tab for the map and sources.',
    calls: store.categoryCalls,
    callsNote: 'Researched for this store; see the Competitors tab for the full reasoning.',
    notes: store.demographics.census?.code === '5915020' ? stockNotes(UBC_AREA) : [],
    notesArea: store.demographics.census ? store.demographics.census.area : 'the store area',
  };
}
