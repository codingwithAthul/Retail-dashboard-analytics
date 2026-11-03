import type { LeadershipRole, Store } from './types';

/** Placeholder roles. Names are intentionally empty and filled in later by the store team. */
const leadership = (): LeadershipRole[] => [
  { role: 'Associate-Owner', name: null },
  { role: 'Front Store Manager', name: null },
  { role: 'Assistant Front Store Manager', name: null },
  { role: 'Pharmacy Manager', name: null },
];

export const WESBROOK: Store = {
  id: '2247',
  number: '#2247',
  name: 'Shoppers Drug Mart UBC – Wesbrook Village',
  shortName: 'Wesbrook Village',
  banner: 'Shoppers Drug Mart',
  division: 'Pharmacy',
  format: 'Urban / mixed-use',
  address: '5968 Webber Lane, Vancouver, BC V6S 0J9',
  phone: '604-224-3086',
  hours: '8 AM – 10 PM daily',
  coords: [49.25404, -123.23656],
  services: [
    'Vaccines and injections',
    'Travel health consultations',
    'Minor ailment assessments',
    'Diabetes education',
    'Passport photos',
  ],
  summary: [
    'Neighbourhood store in UBC’s main residential village, next to the Save-On-Foods grocery anchor.',
    'Serves residents first: families, faculty and staff, graduate students and retirees.',
    'Carries prestige beauty brands, unlike the University Blvd store.',
    'Four pharmacies within the village: compete on services and hours, not price.',
  ],
  leadership: leadership(),
  differentiators: [
    { label: 'Store format', value: 'Urban / mixed-use, street level in Wesbrook Village', confidence: 'inferred', sources: ['sdmFormats'] },
    { label: 'Most present demographic', value: 'Wesbrook residents (families, faculty and staff)', confidence: 'inferred' },
    { label: 'Second most present demographic', value: 'Graduate students in Wesbrook rental housing', confidence: 'inferred' },
    { label: 'Nearby schools', value: 'Norma Rose Point Elementary; University Hill schools', confidence: 'verified', sources: ['uel'] },
    { label: 'Anchor neighbour', value: 'Save-On-Foods (full grocery and pharmacy)', confidence: 'verified', sources: ['cortico', 'liveAtUbc'] },
    { label: 'Repeat-visit driver', value: 'Prescriptions and household top-ups', confidence: 'inferred' },
    { label: 'Sister store', value: 'University of BC #2273, about 1.5 km north, same Associate-Owner', confidence: 'verified', sources: ['sdm2247', 'sdm2273'] },
  ],
  demographics: {
    segments: [
      { name: 'Neighbourhood residents', share: 0.45 },
      { name: 'Graduate students', share: 0.2 },
      { name: 'Undergraduate students', share: 0.15 },
      { name: 'Faculty and staff', share: 0.12 },
      { name: 'Visitors', share: 0.08 },
    ],
    ageBands: [
      { name: 'Under 18', share: 0.12 },
      { name: '18–24', share: 0.2 },
      { name: '25–44', share: 0.36 },
      { name: '45–64', share: 0.2 },
      { name: '65+', share: 0.12 },
    ],
    incomeTier: { label: 'Income tier', value: 'Upper-middle (owner-occupied condos, faculty housing)', confidence: 'inferred' },
    drivers: ['Prescriptions and refills', 'Household and personal-care top-ups', 'Prestige beauty', 'Gifts, cards and seasonal'],
    seasonality: 'Steady through the year; residents do not leave with the academic calendar.',
    nearby: [
      { name: 'Save-On-Foods', kind: 'Grocery', note: 'Next block; draws weekly-shop traffic into the village' },
      { name: 'Norma Rose Point Elementary', kind: 'School', note: 'K–8 school serving Wesbrook families' },
      { name: 'Wesbrook residential towers', kind: 'Housing', note: 'Main source of repeat customers' },
    ],
    facts: [
      { label: 'UBC Vancouver students', value: '60,309', confidence: 'verified', sources: ['ubcFacts'] },
      { label: 'UBC Vancouver faculty and staff', value: '18,543', confidence: 'verified', sources: ['ubcFacts'] },
      { label: 'University Endowment Lands population (2021)', value: '3,193', confidence: 'verified', sources: ['uel'] },
    ],
  },
  categoryCalls: [
    { category: 'Fresh grocery', rival: 'Save-On-Foods', decision: 'Avoid', reason: 'A full grocery store is one block away with better price and range; fresh would carry high shrink.' },
    { category: 'Pharmacy', rival: 'Save-On, PharmaChoice, Careville', decision: 'Differentiate', reason: 'Four pharmacies in one village. Win on services, 8 AM–10 PM hours and PC Optimum.' },
    { category: 'Beauty', rival: 'None nearby', decision: 'Compete', reason: 'No department store within walking distance; prestige brands already carried.' },
    { category: 'OTC health', rival: 'Save-On-Foods', decision: 'Compete', reason: 'Range depth and pharmacist advice beat a grocery aisle.' },
    { category: 'Convenience food', rival: 'Save-On-Foods', decision: 'Differentiate', reason: 'Keep milk, bread and snacks for quick trips; do not fight on weekly-shop prices.' },
    { category: 'Seasonal', rival: 'Limited', decision: 'Compete', reason: 'Residents need gifts and cards; few alternatives on campus.' },
  ],
  sources: ['sdm2247', 'liveAtUbc', 'cortico', 'uel', 'ubcFacts'],
};
