import type { Category } from './types';

/**
 * What the 2021 census around a store says about who lives there, and what that means
 * for the shelves. Each note states the local figure next to Metro Vancouver's, then
 * makes one call a store manager can act on. These are rules of thumb (Inferred), not
 * sales results; see Research/12-stock-notes.md.
 */
export interface HomeLanguage {
  name: string;
  /** Share of residents who speak it most often at home, in percent. */
  share: number;
}

export interface AreaNumbers {
  medianAge: number | null;
  medianHouseholdIncome: number | null;
  /** Shares in percent. */
  renters: number | null;
  immigrants: number | null;
  nonPermanentResidents: number | null;
  lowIncome: number | null;
  /** Residents 65 and older, and under 15. */
  seniors: number | null;
  children: number | null;
  /** Households of one person, and households with children at home. */
  onePersonHouseholds: number | null;
  householdsWithChildren: number | null;
  /** Residents who can hold a conversation in neither English nor French. */
  noEnglishOrFrench: number | null;
  homeLanguages: HomeLanguage[];
}

/** Vancouver CMA, 2021 census (Statistics Canada, Census Profile, CMA 933). */
export const METRO: AreaNumbers = {
  medianAge: 40.8,
  medianHouseholdIncome: 90000,
  renters: 37.8,
  immigrants: 41.8,
  nonPermanentResidents: 5.1,
  lowIncome: 11.1,
  seniors: 17.4,
  children: 14.1,
  onePersonHouseholds: 29.0,
  householdsWithChildren: 25.3,
  noEnglishOrFrench: 5.4,
  homeLanguages: [
    { name: 'Mandarin', share: 5.8 },
    { name: 'Punjabi', share: 5.2 },
    { name: 'Cantonese', share: 5.0 },
    { name: 'Korean', share: 1.5 },
    { name: 'Tagalog', share: 1.4 },
    { name: 'Persian', share: 1.2 },
    { name: 'Spanish', share: 1.0 },
    { name: 'Vietnamese', share: 0.7 },
    { name: 'Hindi', share: 0.6 },
    { name: 'Russian', share: 0.5 },
    { name: 'Arabic', share: 0.4 },
    { name: 'Japanese', share: 0.3 },
  ],
};

/**
 * Metro Vancouver A (UBC and the University Endowment Lands), 2021 census; see census.ts.
 * Age shares come from the age counts there (2,145 of 18,610 are 65+, 2,730 under 15).
 */
export const UBC_AREA: AreaNumbers = {
  medianAge: 31.4,
  medianHouseholdIncome: 63600,
  renters: 57.3,
  immigrants: 46,
  nonPermanentResidents: 18.5,
  lowIncome: 30,
  seniors: 11.5,
  children: 14.7,
  onePersonHouseholds: 32.8,
  householdsWithChildren: 24.9,
  noEnglishOrFrench: 5.1,
  homeLanguages: [
    { name: 'Mandarin', share: 19.6 },
    { name: 'Korean', share: 3.4 },
    { name: 'Cantonese', share: 2.2 },
    { name: 'Persian', share: 2 },
  ],
};

export interface StockNote {
  /** What sets the area apart, in a few words. */
  title: string;
  /** The census figure behind it, next to Metro Vancouver's, as a sentence. */
  evidence: string;
  /** The call: what to do on the shelves or at the counter. */
  detail: string;
  categories: Category[];
}

/** The most notes a store shows; the strongest differences come first. */
export const MAX_NOTES = 3;

const pct = (n: number) => `${n.toFixed(1)}%`;
const money = (n: number) => `$${n.toLocaleString('en-CA')}`;

/** "about 1 in 4" for shares a reader can picture; undefined when a fraction would mislead. */
function oneIn(share: number): string | undefined {
  if (share < 9 || share > 55) return undefined;
  const n = Math.round(100 / share);
  return Math.abs(100 / n - share) <= 2.5 ? `About 1 in ${n}` : undefined;
}

/** Where each language's shoppers' familiar brands come from, for the call. */
const BRANDS_FROM: Record<string, string> = {
  Mandarin: 'Chinese and other Asian',
  Cantonese: 'Chinese and other Asian',
  Punjabi: 'South Asian',
  Hindi: 'South Asian',
  Tagalog: 'Filipino',
  Korean: 'Korean',
  Persian: 'Persian',
  Spanish: 'Latin American',
  Vietnamese: 'Vietnamese',
  Russian: 'Eastern European',
  Arabic: 'Middle Eastern',
  Japanese: 'Japanese',
};

/**
 * How an area's share compares with Metro's, as a call's opening words:
 * "About twice Metro's share of seniors", "About 39% more seniors than Metro".
 */
export function gapToMetro(area: number, metro: number, noun: string): string {
  const ratio = area / metro;
  if (ratio >= 1.75) {
    const r = Math.round(ratio * 2) / 2;
    return `About ${r === 2 ? 'twice' : `${r} times`} Metro's share of ${noun}`;
  }
  if (ratio <= 0.5) return `Under half Metro's share of ${noun}`;
  const change = Math.round(Math.abs(ratio - 1) * 100);
  return `About ${change}% ${ratio > 1 ? 'more' : 'fewer'} ${noun} than Metro`;
}

interface Candidate extends StockNote {
  /** How far past its threshold the figure is; 1 means just over. */
  strength: number;
}

export function stockNotes(area: AreaNumbers): StockNote[] {
  const m = METRO as Required<{ [K in Exclude<keyof AreaNumbers, 'homeLanguages'>]: number }> & AreaNumbers;
  const found: Candidate[] = [];

  const seniors = area.seniors;
  if (seniors != null && seniors >= m.seniors + 4) {
    const lead = oneIn(seniors);
    found.push({
      title: 'Older than most of Vancouver',
      evidence: `${lead ? `${lead} residents is` : `${pct(seniors)} of residents are`} 65 or older${lead ? ` (${pct(seniors)})` : ''}, against ${pct(m.seniors)} across Metro Vancouver.`,
      detail: `${gapToMetro(seniors, m.seniors, 'seniors')}: give home health care, incontinence and mobility aids a full bay, and offer blister packs and medication reviews at the pharmacy.`,
      categories: ['Pharmacy', 'OTC health'],
      strength: (seniors - m.seniors) / 4,
    });
  }

  const age = area.medianAge;
  if (age != null && age <= m.medianAge - 3) {
    found.push({
      title: 'Younger than most of Vancouver',
      evidence: `Half the residents are younger than ${age.toFixed(1)}. Across Metro Vancouver the midpoint is ${m.medianAge.toFixed(1)}.`,
      detail: `Residents are about ${Math.round(m.medianAge - age)} years younger than Metro: give more facings to skin care, trend cosmetics, sexual health and cold drinks, and take them from home health care.`,
      categories: ['Beauty', 'Personal care', 'Convenience food'],
      strength: (m.medianAge - age) / 3,
    });
  }

  const families = area.householdsWithChildren;
  const children = area.children;
  if (families != null && families >= m.householdsWithChildren + 5) {
    found.push({
      title: 'A family neighbourhood',
      evidence: `${pct(families)} of households have children at home, against ${pct(m.householdsWithChildren)} across Metro Vancouver.`,
      detail: `${gapToMetro(families, m.householdsWithChildren, 'households with children')}: keep diapers, formula and children's cold and fever medicine fully stocked, and never let them run out.`,
      categories: ['Personal care', 'OTC health', 'Convenience food'],
      strength: (families - m.householdsWithChildren) / 5,
    });
  } else if (children != null && children <= m.children - 5) {
    found.push({
      title: 'Few children',
      evidence: `Only ${pct(children)} of residents are under 15, against ${pct(m.children)} across Metro Vancouver.`,
      detail: `${gapToMetro(children, m.children, 'children')}: cut baby care to diapers, wipes and formula and give the space to adult personal care, but keep those three fully stocked.`,
      categories: ['Personal care'],
      strength: (m.children - children) / 5,
    });
  }

  const alone = area.onePersonHouseholds;
  const livesAlone = alone != null && alone >= m.onePersonHouseholds + 10;
  if (livesAlone) {
    const rent = area.renters != null ? `, and ${pct(area.renters)} rent (Metro ${pct(m.renters)})` : '';
    found.push({
      title: 'Mostly people living alone',
      evidence: `${pct(alone)} of households are one person, against ${pct(m.onePersonHouseholds)} across Metro Vancouver${rent}.`,
      detail: `${gapToMetro(alone, m.onePersonHouseholds, 'one-person households')}: sell single-serve meals and small packs of paper towel and detergent, but don't give space to bulk packs.`,
      categories: ['Household', 'Convenience food'],
      strength: (alone - m.onePersonHouseholds) / 10,
    });
  }

  const income = area.medianHouseholdIncome;
  const low = area.lowIncome;
  // Where most people live alone, household income is low partly because households are
  // small, so only the low-income share counts there.
  const lowHousehold = income != null && income <= m.medianHouseholdIncome * 0.8 && !livesAlone;
  if (income != null && income >= m.medianHouseholdIncome * 1.25) {
    const above = Math.round((income / m.medianHouseholdIncome - 1) * 100);
    found.push({
      title: 'Higher incomes',
      evidence: `Median household income is ${money(income)}, ${above}% above Metro Vancouver's ${money(m.medianHouseholdIncome)}.`,
      detail: `Incomes are about ${above}% above Metro: give prestige beauty, premium vitamins and natural health more space, but keep Life Brand on the shelf.`,
      categories: ['Beauty', 'OTC health'],
      strength: (income / m.medianHouseholdIncome - 1) / 0.25,
    });
  } else if ((low != null && low >= m.lowIncome + 5) || lowHousehold) {
    const byShare = low != null && low >= m.lowIncome + 5;
    found.push({
      title: 'Price matters here',
      evidence: byShare
        ? `${pct(low!)} of residents are on a low income, against ${pct(m.lowIncome)} across Metro Vancouver.`
        : `Median household income is ${money(income!)}, against ${money(m.medianHouseholdIncome)} across Metro Vancouver.`,
      detail: `${
        byShare
          ? gapToMetro(low!, m.lowIncome, 'people on a low income')
          : `Incomes are about ${Math.round((1 - income! / m.medianHouseholdIncome) * 100)}% below Metro`
      }: lead with Life Brand and no name and keep flyer deals at the front, but don't drop the national brands.`,
      categories: ['Personal care', 'Household', 'OTC health'],
      strength: byShare ? (low! - m.lowIncome) / 5 : (1 - income! / m.medianHouseholdIncome) / 0.2,
    });
  }

  const [top] = area.homeLanguages;
  const metroShare = m.homeLanguages.find((l) => l.name === top?.name)?.share ?? 0;
  if (top && top.share >= 8 && top.share >= metroShare * 2) {
    const noOfficial = area.noEnglishOrFrench;
    const barrier = noOfficial != null && noOfficial >= m.noEnglishOrFrench + 3;
    const lead = oneIn(top.share);
    found.push({
      title: `Many speak ${top.name} at home`,
      evidence:
        `${lead ? `${lead} residents speaks` : `${pct(top.share)} of residents speak`} ${top.name} most often at home${lead ? ` (${pct(top.share)})` : ''}, against ${pct(metroShare)} across Metro Vancouver.` +
        (barrier ? ` ${pct(noOfficial!)} speak neither English nor French (Metro ${pct(m.noEnglishOrFrench)}).` : ''),
      detail: `${gapToMetro(top.share, metroShare, `${top.name} speakers`)}: ${barrier ? 'have' : 'try to have'} a ${top.name}-speaking staff member on each pharmacy shift, and carry the ${BRANDS_FROM[top.name] ?? top.name} beauty and food brands these shoppers already know.`,
      categories: ['Pharmacy', 'Beauty', 'Convenience food'],
      strength: (top.share - metroShare) / 6,
    });
  }

  const temporary = area.nonPermanentResidents;
  if (temporary != null && temporary >= m.nonPermanentResidents + 4) {
    found.push({
      title: 'Many students and newcomers',
      evidence: `${pct(temporary)} of residents are on temporary permits, mostly students and workers, against ${pct(m.nonPermanentResidents)} across Metro Vancouver.`,
      detail: `${gapToMetro(temporary, m.nonPermanentResidents, 'students and temporary residents')}: stock travel sizes and first-apartment basics, and build stock before late August, when new students arrive.`,
      categories: ['Personal care', 'Household', 'Convenience food'],
      strength: (temporary - m.nonPermanentResidents) / 4,
    });
  }

  if (found.length === 0) return [typicalNote(area)];
  return found
    .sort((a, b) => b.strength - a.strength)
    .slice(0, MAX_NOTES)
    .map(({ strength: _, ...note }) => note);
}

/** The one note for an area close to Metro Vancouver on every measure checked. */
function typicalNote(area: AreaNumbers): StockNote {
  const m = METRO;
  const facts = [
    area.medianHouseholdIncome != null &&
      `median household income ${money(area.medianHouseholdIncome)} (Metro ${money(m.medianHouseholdIncome!)})`,
    area.householdsWithChildren != null &&
      `${pct(area.householdsWithChildren)} of households with children (Metro ${pct(m.householdsWithChildren!)})`,
    area.seniors != null && `${pct(area.seniors)} aged 65 or older (Metro ${pct(m.seniors!)})`,
    area.medianAge != null && `median age ${area.medianAge.toFixed(1)} (Metro ${m.medianAge!.toFixed(1)})`,
  ].filter(Boolean);
  const income = area.medianHouseholdIncome;
  const gap = income != null ? Math.round(Math.abs(income / m.medianHouseholdIncome! - 1) * 100) : 0;
  const lean =
    income != null && income >= m.medianHouseholdIncome! * 1.1
      ? ` Incomes are about ${gap}% above Metro: keep premium beauty and vitamins at their usual space, but don't add more.`
      : income != null && income <= m.medianHouseholdIncome! * 0.9
        ? ` Incomes are about ${gap}% below Metro: keep Life Brand and no name easy to find, but don't add more space for them.`
        : '';
  return {
    title: 'A typical Vancouver neighbourhood',
    evidence: facts.length
      ? `${facts.join(', ')}. No figure is far enough from Metro Vancouver to change the shelves.`.replace(/^./, (c) => c.toUpperCase())
      : 'The census figures here sit close to Metro Vancouver.',
    detail: `Run the standard Shoppers range as it is.${lean} If this store needs changes, its own sales will show them; the census does not.`,
    categories: [],
  };
}
