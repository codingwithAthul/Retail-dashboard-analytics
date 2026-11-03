import type { Category } from './types';

/**
 * SAMPLE DATA ASSUMPTIONS. Not real store data.
 * Shapes follow the research (Research/03, Research/06); magnitudes are illustrative only.
 */
export interface SalesProfile {
  seed: number;
  /** Illustrative average monthly sales in CAD. */
  baseMonthly: number;
  /** Year-over-year growth applied to the latest 12 months. */
  growth: number;
  /** Multiplier for each calendar month, January first. */
  seasonality: number[];
  averageBasket: number;
  /** Share of sales by category; must add up to 1. */
  mix: Partial<Record<Category, number>>;
  topItems: { name: string; category: Category; price: number; weight: number }[];
}

export const SALES_PROFILES: Record<string, SalesProfile> = {
  // Wesbrook Village: residential, steady, prescription-heavy, prestige beauty.
  '2247': {
    seed: 2247,
    baseMonthly: 610_000,
    growth: 0.06,
    seasonality: [0.96, 0.93, 0.98, 0.98, 1.0, 0.98, 0.97, 0.97, 1.0, 1.01, 1.04, 1.18],
    averageBasket: 38.5,
    mix: {
      Pharmacy: 0.44,
      Beauty: 0.17,
      'OTC health': 0.11,
      'Personal care': 0.1,
      'Convenience food': 0.08,
      Household: 0.05,
      Seasonal: 0.05,
    },
    topItems: [
      { name: 'Prestige moisturiser', category: 'Beauty', price: 42, weight: 1.2 },
      { name: 'Vitamin D3 1000 IU', category: 'OTC health', price: 12, weight: 2.4 },
      { name: 'Allergy relief tablets', category: 'OTC health', price: 18, weight: 1.8 },
      { name: 'Sunscreen SPF 50', category: 'Beauty', price: 21, weight: 1.6 },
      { name: 'Baby wipes', category: 'Personal care', price: 9, weight: 2.6 },
      { name: 'Milk 2% (2 L)', category: 'Convenience food', price: 6, weight: 3.4 },
      { name: 'Greeting cards', category: 'Seasonal', price: 5, weight: 2.8 },
      { name: 'Ibuprofen 200 mg', category: 'OTC health', price: 11, weight: 2.2 },
    ],
  },
  // University Blvd: student traffic, academic calendar, front-store heavy.
  '2273': {
    seed: 2273,
    baseMonthly: 540_000,
    growth: 0.04,
    seasonality: [1.08, 1.05, 1.1, 1.12, 0.78, 0.66, 0.64, 0.7, 1.24, 1.14, 1.12, 1.17],
    averageBasket: 17.9,
    mix: {
      Pharmacy: 0.3,
      'Convenience food': 0.2,
      'Personal care': 0.14,
      'OTC health': 0.13,
      Beauty: 0.12,
      Household: 0.06,
      Seasonal: 0.05,
    },
    topItems: [
      { name: 'Energy drink 473 mL', category: 'Convenience food', price: 3.5, weight: 6.5 },
      { name: 'Bottled water 500 mL', category: 'Convenience food', price: 2, weight: 7.2 },
      { name: 'Instant noodles', category: 'Convenience food', price: 2.5, weight: 5.1 },
      { name: 'Cold and flu capsules', category: 'OTC health', price: 13, weight: 2.4 },
      { name: 'Life Brand shampoo', category: 'Personal care', price: 7, weight: 2.6 },
      { name: 'Ibuprofen 200 mg', category: 'OTC health', price: 11, weight: 2.1 },
      { name: 'Mascara (mass)', category: 'Beauty', price: 14, weight: 1.7 },
      { name: 'Ruled notebook', category: 'Seasonal', price: 4, weight: 2.3 },
    ],
  },
};
