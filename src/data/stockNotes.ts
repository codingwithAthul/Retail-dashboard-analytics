import type { Category } from './types';

/**
 * What the 2021 census around a store suggests it should stock. Each note fires only when
 * the area differs clearly from Metro Vancouver, and names the figure behind it. These are
 * rules of thumb (Inferred), not sales results; see Research/12-stock-notes.md.
 */
export interface AreaNumbers {
  medianAge: number | null;
  medianHouseholdIncome: number | null;
  /** Shares in percent. */
  renters: number | null;
  immigrants: number | null;
  nonPermanentResidents: number | null;
  lowIncome: number | null;
}

/** Vancouver CMA, 2021 census (Statistics Canada, Census Profile, CMA 933). */
export const METRO: AreaNumbers = {
  medianAge: 40.8,
  medianHouseholdIncome: 90000,
  renters: 37.8,
  immigrants: 41.8,
  nonPermanentResidents: 5.1,
  lowIncome: 11.1,
};

/** Metro Vancouver A (UBC and the University Endowment Lands), 2021 census; see census.ts. */
export const UBC_AREA: AreaNumbers = {
  medianAge: 31.4,
  medianHouseholdIncome: 63600,
  renters: 57.3,
  immigrants: 46,
  nonPermanentResidents: 18.5,
  lowIncome: 30,
};

export interface StockNote {
  title: string;
  detail: string;
  categories: Category[];
  /** The census figure behind the note, next to Metro Vancouver. */
  evidence: string;
}

const age = (n: number) => n.toFixed(1);
const pct = (n: number) => `${n.toFixed(1)}%`;
const money = (n: number) => `$${n.toLocaleString('en-CA')}`;

export function stockNotes(area: AreaNumbers): StockNote[] {
  const notes: StockNote[] = [];
  const m = METRO as Required<{ [K in keyof AreaNumbers]: number }>;

  if (area.medianAge != null && area.medianAge >= m.medianAge + 3) {
    notes.push({
      title: 'Older than Metro',
      detail: 'Home health care, mobility and incontinence aids, vitamins, and pharmacy services such as medication reviews and blister packs.',
      categories: ['Pharmacy', 'OTC health'],
      evidence: `Median age ${age(area.medianAge)}, Metro Vancouver ${age(m.medianAge)}`,
    });
  } else if (area.medianAge != null && area.medianAge <= m.medianAge - 3) {
    notes.push({
      title: 'Younger than Metro',
      detail: 'Trend beauty, skin care, sexual health, and grab-and-go food and drinks.',
      categories: ['Beauty', 'Personal care', 'Convenience food'],
      evidence: `Median age ${age(area.medianAge)}, Metro Vancouver ${age(m.medianAge)}`,
    });
  }

  if (area.renters != null && area.renters >= m.renters + 15) {
    notes.push({
      title: 'Most households rent',
      detail: 'Small homes and little storage: smaller pack sizes and top-up household basics over bulk.',
      categories: ['Household'],
      evidence: `${pct(area.renters)} rent, Metro Vancouver ${pct(m.renters)}`,
    });
  }

  const income = area.medianHouseholdIncome;
  if (income != null && income >= m.medianHouseholdIncome * 1.25) {
    notes.push({
      title: 'Higher income than Metro',
      detail: 'Prestige beauty, premium vitamins and natural health lines can carry more space.',
      categories: ['Beauty', 'OTC health'],
      evidence: `Median household income ${money(income)}, Metro Vancouver ${money(m.medianHouseholdIncome)}`,
    });
  } else if (
    (income != null && income <= m.medianHouseholdIncome * 0.8) ||
    (area.lowIncome != null && area.lowIncome >= m.lowIncome + 5)
  ) {
    notes.push({
      title: 'Lower income than Metro',
      detail: 'Lead with value: Life Brand and no name lines, PC Optimum offers and the weekly flyer.',
      categories: ['Personal care', 'Household', 'OTC health'],
      evidence:
        income != null && income <= m.medianHouseholdIncome * 0.8
          ? `Median household income ${money(income)}, Metro Vancouver ${money(m.medianHouseholdIncome)}`
          : `${pct(area.lowIncome!)} low income, Metro Vancouver ${pct(m.lowIncome)}`,
    });
  }

  if (area.immigrants != null && area.immigrants >= m.immigrants + 8) {
    notes.push({
      title: 'Many residents born outside Canada',
      detail: 'International foods and beauty brands shoppers know from home, and multilingual pharmacy service.',
      categories: ['Beauty', 'Convenience food', 'Pharmacy'],
      evidence: `${pct(area.immigrants)} immigrants, Metro Vancouver ${pct(m.immigrants)}`,
    });
  }

  if (area.nonPermanentResidents != null && area.nonPermanentResidents >= m.nonPermanentResidents + 4) {
    notes.push({
      title: 'Many students and temporary residents',
      detail: 'Travel sizes, starter kits for a new home, phone and transit cards, and late hours.',
      categories: ['Personal care', 'Household', 'Convenience food'],
      evidence: `${pct(area.nonPermanentResidents)} non-permanent residents, Metro Vancouver ${pct(m.nonPermanentResidents)}`,
    });
  }

  return notes;
}
