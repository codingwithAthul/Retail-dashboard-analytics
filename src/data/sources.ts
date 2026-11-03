import type { Source } from './types';

/** Public sources referenced by facts in the dashboard. Full notes live in /Research. */
export const SOURCES: Record<string, Source> = {
  sdm2247: {
    id: 'sdm2247',
    title: 'Shoppers Drug Mart store page #2247',
    url: 'https://www.shoppersdrugmart.ca/en/stores/2247-shoppers-drug-mart-ubc-wesbrook-village/',
  },
  sdm2273: {
    id: 'sdm2273',
    title: 'Shoppers Drug Mart store page #2273',
    url: 'https://www.shoppersdrugmart.ca/en/stores/2273-shoppers-drug-mart-university-of-bc/',
  },
  ubcFacts: { id: 'ubcFacts', title: 'UBC facts and figures', url: 'https://www.ubc.ca/about/facts.html' },
  uel: {
    id: 'uel',
    title: 'University Endowment Lands (2021 census)',
    url: 'https://en.wikipedia.org/wiki/University_Endowment_Lands',
  },
  liveAtUbc: {
    id: 'liveAtUbc',
    title: 'Live at UBC: errands at UBC Point Grey',
    url: 'https://www.liveatubc.ca/run-your-errands-at-ubc-point-grey/',
  },
  cortico: {
    id: 'cortico',
    title: 'Cortico: pharmacies in University Endowment Lands',
    url: 'https://cortico.health/pharmacies/university-endowment-lands-bc',
  },
  census5915020: {
    id: 'census5915020',
    title: 'Statistics Canada, Census Profile 2021: Metro Vancouver A (CSD 5915020)',
    url: 'https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021A00055915020&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0',
  },
  census933: {
    id: 'census933',
    title: 'Statistics Canada, Census Profile 2021: Vancouver CMA (933)',
    url: 'https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?Lang=E&DGUIDlist=2021S0503933&GENDERlist=1&STATISTIClist=1,4&HEADERlist=0',
  },
  sdmFormats: {
    id: 'sdmFormats',
    title: 'Research: SDM store formats',
    url: 'https://github.com/codingwithAthul/Retail-dashboard-analytics/blob/main/Research/02-sdm-store-formats.md',
  },
};

export function getSource(id: string): Source {
  const source = SOURCES[id];
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}
