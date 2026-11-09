import type { Segment } from './types';

/** One census measure for the store's area, with the Metro Vancouver value for context. */
export interface CensusMeasure {
  label: string;
  area: string;
  metro: string;
}

/** Statistics Canada 2021 Census of Population profile for the area a store sits in. */
export interface CensusProfile {
  year: 2021;
  /** Census subdivision name as Statistics Canada publishes it. */
  area: string;
  /** Census subdivision code (CSD). */
  code: string;
  /** What the census area covers, in plain words. */
  coverage: string;
  measures: CensusMeasure[];
  /** Population by age, from 100% data. Shares add up to 1. */
  ageBands: Segment[];
  sources: string[];
}

/**
 * Metro Vancouver A (CSD 5915020) is the electoral area that holds UBC and the
 * University Endowment Lands. Its 815 km² is mostly parkland and rural land, so
 * density is left out; almost all residents live on or next to campus.
 * Values are copied from the Statistics Canada Census Profile API (release 2022–2023).
 * Age counts: 0–14 2,730; 15–24 4,625; 25–44 5,170; 45–64 3,940; 65+ 2,145 (total 18,610).
 */
export const UBC_CENSUS: CensusProfile = {
  year: 2021,
  area: 'Metro Vancouver A',
  code: '5915020',
  coverage: 'UBC campus and the University Endowment Lands, plus mostly unpopulated rural land',
  measures: [
    { label: 'Population (2021)', area: '18,612', metro: '2,642,825' },
    { label: 'Growth since 2016', area: '+15.4%', metro: '+7.3%' },
    { label: 'Median age', area: '31.4', metro: '40.8' },
    { label: 'Median household income (2020)', area: '$63,600', metro: '$90,000' },
    { label: 'Households that rent', area: '57.3%', metro: '37.8%' },
    { label: 'Immigrants', area: '46.0%', metro: '41.8%' },
    { label: 'Non-permanent residents', area: '18.5%', metro: '5.1%' },
    { label: 'Low income (LIM-AT)', area: '30.0%', metro: '11.1%' },
  ],
  ageBands: [
    { name: '0–14', share: 2730 / 18610 },
    { name: '15–24', share: 4625 / 18610 },
    { name: '25–44', share: 5170 / 18610 },
    { name: '45–64', share: 3940 / 18610 },
    { name: '65+', share: 2145 / 18610 },
  ],
  sources: ['census5915020', 'census933'],
};
