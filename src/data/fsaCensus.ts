import type { CensusProfile } from './census';
import data from './generated/fsaCensus.json';
import type { StoreListing } from './types';

/**
 * 2021 census profiles for the postal areas (forward sortation areas) that hold the
 * directory stores. Written by the pipeline (`python -m etl census`) from the
 * Statistics Canada Census Profile API; see Research/09-census-by-postal-area.md.
 */
interface AreaProfile {
  population: number | null;
  medianAge: number | null;
  medianHouseholdIncome: number | null;
  renters: number | null;
  immigrants: number | null;
  nonPermanentResidents: number | null;
  lowIncome: number | null;
  ageBands: { name: string; count: number | null }[];
  ageTotal: number | null;
}

const AREAS = data.areas as Record<string, AreaProfile>;

/** Statistics Canada profile page for a postal area. */
export const fsaPageUrl = (fsa: string) => data.page.replace('{fsa}', fsa);

/** Source ids for every postal area in the data, used by sources.ts. */
export const FSA_CODES = Object.keys(AREAS);

export const fsaSourceId = (fsa: string) => `censusFsa${fsa}`;

/** The postal area (first three characters of the postal code) at the end of an address. */
export function fsaOf(address: string): string | undefined {
  return address.match(/\b([A-Z]\d[A-Z])\s?\d[A-Z]\d\s*$/i)?.[1].toUpperCase();
}

/** The raw census figures for a store's postal area; undefined when the area is not in the data. */
export function fsaArea(listing: Pick<StoreListing, 'address'>): AreaProfile | undefined {
  const fsa = fsaOf(listing.address);
  return fsa ? AREAS[fsa] : undefined;
}

const count = (n: number | null) => (n == null ? 'Not published' : n.toLocaleString('en-CA'));
const money = (n: number | null) => (n == null ? 'Not published' : `$${n.toLocaleString('en-CA')}`);
const rate = (n: number | null) => (n == null ? 'Not published' : `${n.toFixed(1)}%`);
const age = (n: number | null) => (n == null ? 'Not published' : n.toFixed(1));

/** The census card for a directory store, from its postal area; undefined when the area is not in the data. */
export function fsaCensus(listing: Pick<StoreListing, 'address'>): CensusProfile | undefined {
  const fsa = fsaOf(listing.address);
  const a = fsa ? AREAS[fsa] : undefined;
  if (!fsa || !a) return undefined;
  const total = a.ageTotal ?? a.ageBands.reduce((n, b) => n + (b.count ?? 0), 0);
  return {
    year: 2021,
    area: `Postal area ${fsa}`,
    code: fsa,
    geography: `Postal area ${fsa}`,
    coverage: 'every address whose postal code starts with these three characters, a wider area than a walk-in trade area',
    measures: [
      { label: 'Population (2021)', area: count(a.population), metro: '2,642,825' },
      { label: 'Median age', area: age(a.medianAge), metro: '40.8' },
      { label: 'Median household income (2020)', area: money(a.medianHouseholdIncome), metro: '$90,000' },
      { label: 'Households that rent', area: rate(a.renters), metro: '37.8%' },
      { label: 'Immigrants', area: rate(a.immigrants), metro: '41.8%' },
      { label: 'Non-permanent residents', area: rate(a.nonPermanentResidents), metro: '5.1%' },
      { label: 'Low income (LIM-AT)', area: rate(a.lowIncome), metro: '11.1%' },
    ],
    ageBands: a.ageBands.map((b) => ({ name: b.name, share: total ? (b.count ?? 0) / total : 0 })),
    sources: [fsaSourceId(fsa), 'census933'],
  };
}
