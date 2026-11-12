import { MATRIX_CATEGORIES } from './competition';
import { NEARBY_RADIUS_M, type NearbyPlace } from './nearby';
import type { Category, CategoryCall, Confidence } from './types';

/**
 * What the pharmacies and supermarkets near each store mainly sell, mapped to Shoppers
 * Drug Mart's categories. Chains are profiled from their own websites or trade press;
 * independents are inferred from the map's shop type (and, for a few, their name).
 * Method and sources: Research/11-what-nearby-stores-sell.md.
 */
export interface ChainProfile {
  chain: string;
  /** Matched against the OpenStreetMap name, case ignored. */
  match: RegExp;
  mainlySells: string;
  /** SDM categories the chain carries. */
  sells: Category[];
  /** Categories where the chain is a destination: a shopper would go there for it. */
  strong: Category[];
  sources: { title: string; url: string }[];
}

const FULL_LINE: Category[] = ['Fresh grocery', 'Convenience food', 'Household', 'Personal care'];
const FRONT_STORE: Category[] = ['Pharmacy', 'OTC health', 'Beauty', 'Personal care'];

export const CHAIN_PROFILES: ChainProfile[] = [
  {
    chain: 'London Drugs',
    match: /london drugs/i,
    mainlySells: 'Pharmacy, cosmetics and personal care, plus electronics, computers, appliances, photo and home goods',
    sells: [...FRONT_STORE, 'Convenience food', 'Household', 'Seasonal'],
    strong: ['Pharmacy', 'OTC health', 'Beauty', 'Personal care', 'Household'],
    sources: [{ title: 'London Drugs: about us', url: 'https://www.londondrugs.com/about-london-drugs/about-us.html' }],
  },
  {
    chain: 'Pharmasave',
    match: /pharmasave/i,
    mainlySells: 'Pharmacy with a front store of health, beauty, personal care, vitamins and home health care',
    sells: FRONT_STORE,
    strong: ['Pharmacy', 'OTC health'],
    sources: [{ title: 'Pharmasave', url: 'https://pharmasave.com/' }],
  },
  {
    chain: 'Rexall',
    match: /rexall|pharma ?plus/i,
    mainlySells: 'Pharmacy with beauty, personal care and everyday convenience items',
    sells: [...FRONT_STORE, 'Convenience food'],
    strong: ['Pharmacy', 'OTC health'],
    sources: [{ title: 'Rexall', url: 'https://www.rexall.ca/' }],
  },
  {
    chain: 'Pure Integrative Pharmacy',
    match: /pure inte(g|rg)r?ative/i,
    mainlySells: 'Pharmacy built around professional-grade supplements and natural health products',
    sells: ['Pharmacy', 'OTC health', 'Beauty'],
    strong: ['Pharmacy', 'OTC health'],
    sources: [{ title: 'Pure Integrative Pharmacy: natural health', url: 'https://purepharmacy.com/pages/natural-health' }],
  },
  {
    chain: 'Banner pharmacy',
    match: /medicine shoppe|\bi\.?d\.?a\.?\b|pharmachoice|guardian/i,
    mainlySells: 'Independently owned pharmacy under a buying banner: dispensary first, small front store',
    sells: ['Pharmacy', 'OTC health', 'Personal care'],
    strong: ['Pharmacy'],
    sources: [
      { title: 'McKesson Canada: our brands', url: 'https://mckesson.ca/our-brands' },
      { title: 'PharmaChoice: about', url: 'https://www.pharmachoice.com/?p=20' },
    ],
  },
  {
    chain: 'Costco',
    match: /costco/i,
    mainlySells: 'Pharmacy inside a membership warehouse: bulk groceries, fresh food, household goods and electronics',
    sells: [...FRONT_STORE, ...FULL_LINE.filter((c) => c !== 'Personal care')],
    strong: ['Fresh grocery', 'Household'],
    sources: [{ title: 'Costco Canada', url: 'https://www.costco.ca/' }],
  },
  {
    chain: 'Safeway',
    match: /safeway/i,
    mainlySells: 'Full supermarket: produce, meat, bakery, deli and floral; many stores have a pharmacy',
    sells: [...FULL_LINE, 'Pharmacy', 'OTC health'],
    strong: ['Fresh grocery', 'Convenience food', 'Household'],
    sources: [
      { title: 'Empire: grocery and retail banners', url: 'https://empireco.ca/about/businesses/grocery-and-retail' },
      { title: 'Safeway Canada', url: 'https://www.safeway.ca/' },
    ],
  },
  {
    chain: 'Save-On-Foods',
    match: /save-?on-?foods/i,
    mainlySells: 'Full supermarket: produce, meat and seafood, bakery, deli and floral; many stores have a pharmacy',
    sells: [...FULL_LINE, 'Pharmacy', 'OTC health'],
    strong: ['Fresh grocery', 'Convenience food', 'Household'],
    sources: [{ title: 'Pattison Food Group: retail banners', url: 'https://pattisonfoodgroup.com/retail-banners' }],
  },
  {
    chain: 'IGA',
    match: /\biga\b/i,
    mainlySells: 'Full supermarket: produce, meat, dairy, bakery, deli, frozen, household and pet care',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Convenience food', 'Household'],
    sources: [{ title: 'IGA BC: shop online', url: 'https://shop.igabc.com/' }],
  },
  {
    chain: 'Urban Fare',
    match: /urban fare/i,
    mainlySells: 'Upscale urban supermarket: produce (much of it organic), bakery, deli and ready meals, meat and seafood',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [{ title: 'Urban Fare: deli and ready-made meals', url: 'https://www.urbanfare.com/categories/deli-ready-made-meals-id-30726' }],
  },
  {
    chain: 'Nesters Market',
    match: /nesters/i,
    mainlySells: 'Supermarket: organic produce, bakery, deli and bistro, meat and seafood, natural and organic aisle',
    sells: [...FULL_LINE, 'OTC health'],
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [
      { title: 'Nesters Market: produce', url: 'https://www.nestersmarket.com/produce/' },
      { title: 'Nesters Market: deli and bistro', url: 'https://www.nestersmarket.com/deli-bistro/' },
    ],
  },
  {
    chain: 'Loblaws City Market',
    match: /loblaw/i,
    mainlySells: 'Urban supermarket: produce, meat, seafood, deli, bakery and a large range of prepared meals; some have a pharmacy',
    sells: [...FULL_LINE, 'Pharmacy', 'OTC health', 'Beauty'],
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [
      { title: 'Loblaw careers: City Market', url: 'https://careers.loblaw.ca/retail/city-market' },
      {
        title: 'Loblaw: new Loblaws City Market opens in South Granville',
        url: 'https://www.loblaw.ca/en/new-loblaws-city-market-opens-in-south-granville-bringing-fresh-meals-everyday-value-and-convenient-grocery-shopping-to-vancouver/',
      },
    ],
  },
  {
    chain: 'No Frills',
    match: /no ?frills/i,
    mainlySells: 'Discount supermarket: produce, meat, dairy, bakery, frozen and everyday groceries at low prices',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Household'],
    sources: [{ title: 'No Frills: price match', url: 'https://nofrills.ca/en/collection/price-match' }],
  },
  {
    chain: 'Your Independent Grocer',
    match: /independent grocer/i,
    mainlySells: 'Full supermarket (Loblaw franchise): produce, meat, bakery, deli and everyday groceries',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Household'],
    sources: [{ title: 'Your Independent Grocer', url: 'https://www.yourindependentgrocer.ca/' }],
  },
  {
    chain: 'Whole Foods Market',
    match: /whole foods/i,
    mainlySells: 'Natural and organic supermarket: produce, prepared foods and bakery, plus supplements and body care',
    sells: [...FULL_LINE, 'OTC health', 'Beauty'],
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [{ title: 'Whole Foods Market: departments', url: 'https://www.wholefoodsmarket.com/departments' }],
  },
  {
    chain: 'Choices Market',
    match: /choice'?s market/i,
    mainlySells: 'Natural and organic grocer: organic produce, deli and salad bar, gluten-free bakery, supplements and natural body care',
    sells: [...FULL_LINE, 'OTC health', 'Beauty'],
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [{ title: 'Choices Markets: about us', url: 'https://www.choicesmarkets.com/company/' }],
  },
  {
    chain: 'Fresh St. Market',
    match: /fresh st(reet|\.)? market/i,
    mainlySells: 'Fresh-led supermarket: produce, meat, seafood, bakery, deli, cheese, bulk and ready-to-eat',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [
      { title: 'Fresh St. Market: seafood', url: 'https://www.freshstmarket.com/about-us/departments/seafood' },
      {
        title: 'Retail Insider: inside Fresh St. Market Vancouver House',
        url: 'https://retail-insider.com/retail-insider/2020/02/inside-downtown-vancouvers-newest-grocery-store-fresh-st-market-photos/',
      },
    ],
  },
  {
    chain: 'T&T Supermarket',
    match: /t ?& ?t/i,
    mainlySells: 'Asian supermarket: produce, live seafood, meat, bakery, hot food and Asian packaged goods',
    sells: FULL_LINE,
    strong: ['Fresh grocery', 'Convenience food'],
    sources: [
      { title: 'Grocery Dive: inside T&T Supermarket', url: 'https://www.grocerydive.com/news/inside-t-and-t-supermarket-bellevue-washington/734929/' },
    ],
  },
  {
    chain: 'H Mart',
    match: /\bh ?mart\b/i,
    mainlySells: 'Korean supermarket: produce, marinated meats, seafood and Korean groceries',
    sells: ['Fresh grocery', 'Convenience food', 'Household'],
    strong: ['Fresh grocery'],
    sources: [{ title: 'Chicago Magazine: H Mart', url: 'https://www.chicagomag.com/?p=22138' }],
  },
  {
    chain: 'Sungiven Foods',
    match: /sungiven/i,
    mainlySells: 'Fresh-focused Asian grocer, mostly own brands: produce, eggs, meat, seafood, baked goods and ready meals',
    sells: ['Fresh grocery', 'Convenience food'],
    strong: ['Fresh grocery'],
    sources: [{ title: 'Canadian Grocer: inside Sungiven Foods', url: 'https://canadiangrocer.com/inside-sungiven-foods-fresh-focused-growth' }],
  },
  {
    chain: 'PriceSmart Foods',
    match: /price ?smart/i,
    mainlySells: 'Value supermarket for Asian and Western shoppers: produce, specialty meat and seafood, snacks and meals to go',
    sells: FULL_LINE,
    strong: ['Fresh grocery'],
    sources: [{ title: 'PriceSmart Foods Broadway media release', url: 'https://dam.cdn.saveonfoods.com/PDFs/Media-Release/PSF-Broadway-Media-Release.pdf' }],
  },
  {
    chain: 'Buy-Low Foods',
    match: /buy-?low/i,
    mainlySells: 'Value supermarket: produce, meat, deli, bakery, dairy and bulk foods',
    sells: FULL_LINE,
    strong: ['Fresh grocery'],
    sources: [{ title: 'Western Grocer: Buy-Low Foods price position', url: 'https://westerngrocer.com/?p=17129' }],
  },
  {
    chain: "Kin's Farm Market",
    match: /kin'?s farm/i,
    mainlySells: 'Produce store: local and imported fruit and vegetables',
    sells: ['Fresh grocery'],
    strong: ['Fresh grocery'],
    sources: [{ title: "Wikipedia: Kin's Farm Market", url: 'https://en.wikipedia.org/wiki/Kin%27s_Farm_Market' }],
  },
  {
    chain: 'Fruiticana',
    match: /fruiticana/i,
    mainlySells: 'South Asian grocer known for fresh produce and spices',
    sells: ['Fresh grocery'],
    strong: ['Fresh grocery'],
    sources: [{ title: 'Canadian Grocer: tour Fruiticana', url: 'https://canadiangrocer.com/tour-bcs-south-asian-specialist-fruiticana' }],
  },
  {
    chain: 'Fujiya',
    match: /fujiya/i,
    mainlySells: 'Japanese grocer: sushi and bento made daily, Japanese pantry, snacks and frozen food',
    sells: ['Convenience food', 'Fresh grocery'],
    strong: ['Convenience food'],
    sources: [{ title: 'Daily Hive: Fujiya', url: 'https://dailyhive.com/vancouver/cheap-eats-vancouver-fujiya-foods' }],
  },
  {
    chain: 'ABURI Market',
    match: /aburi/i,
    mainlySells: 'Premium Japanese grocer: grab-and-go sushi and bento, imported snacks, wagyu and seafood, tableware',
    sells: ['Convenience food', 'Fresh grocery'],
    strong: ['Convenience food'],
    sources: [{ title: 'Daily Hive: ABURI Market downtown', url: 'https://dailyhive.com/vancouver/aburi-market-granville' }],
  },
  {
    chain: 'Meinhardt Fine Foods',
    match: /meinhardt/i,
    mainlySells: 'Gourmet grocer: large take-out deli and imported specialty foods',
    sells: ['Convenience food', 'Fresh grocery'],
    strong: ['Convenience food'],
    sources: [{ title: 'Daily Hive: Meinhardt downtown store closes', url: 'https://dailyhive.com/vancouver/meinhardt-downtown-closed' }],
  },
];

export interface PlaceProfile {
  /** The chain, when the place is one. */
  chain?: string;
  mainlySells: string;
  sells: Category[];
  strong: Category[];
  /** Verified for a chain profiled from sources; inferred for an independent. */
  confidence: Confidence;
  /** What the profile rests on. */
  basis: 'chain' | 'name' | 'map type';
  sources: { title: string; url: string }[];
}

const SDM = /shoppers/i;

/** What a nearby place mainly sells. */
export function profileFor(place: Pick<NearbyPlace, 'name' | 'kind' | 'loblaw'>): PlaceProfile {
  if (place.loblaw === 'Shoppers Drug Mart' || SDM.test(place.name)) {
    return {
      chain: 'Shoppers Drug Mart',
      mainlySells: 'Another Shoppers Drug Mart: the same offer',
      sells: FRONT_STORE,
      strong: [],
      confidence: 'verified',
      basis: 'chain',
      sources: [],
    };
  }
  const chain = CHAIN_PROFILES.find((c) => c.match.test(place.name));
  if (chain) {
    const { mainlySells, sells, strong, sources } = chain;
    return { chain: chain.chain, mainlySells, sells, strong, confidence: 'verified', basis: 'chain', sources };
  }
  if (place.kind === 'Pharmacy') {
    return {
      mainlySells: 'Independent pharmacy: prescriptions and over-the-counter medicine',
      sells: ['Pharmacy', 'OTC health'],
      strong: ['Pharmacy'],
      confidence: 'inferred',
      basis: 'map type',
      sources: [],
    };
  }
  if (/\bproduce\b|fruit|greengrocer/i.test(place.name)) {
    return { mainlySells: 'Produce shop', sells: ['Fresh grocery'], strong: [], confidence: 'inferred', basis: 'name', sources: [] };
  }
  if (/\bmeats?\b|butcher|halal/i.test(place.name)) {
    return { mainlySells: 'Butcher and grocery: fresh meat', sells: ['Fresh grocery'], strong: [], confidence: 'inferred', basis: 'name', sources: [] };
  }
  return {
    mainlySells: 'Independent grocer: range and size not checked',
    sells: ['Fresh grocery', 'Convenience food'],
    strong: [],
    confidence: 'inferred',
    basis: 'map type',
    sources: [],
  };
}

/** Ready-meal counters this close draw the lunch and dinner trip away. */
export const READY_MEAL_M = 400;

const CORE: Category[] = ['Pharmacy', 'OTC health', 'Beauty', 'Personal care'];

const CORE_EDGE: Record<string, string> = {
  Pharmacy: 'Core business: compete on services (vaccines, prescribing for minor ailments, longer hours).',
  'OTC health': 'Core business: pharmacist advice next to the shelf and PC Optimum points.',
  Beauty: 'Core business: the Beauty Boutique and prestige brands are the edge.',
  'Personal care': 'Core business: everyday basics, Life Brand pricing and PC Optimum offers.',
};

const label = (p: NearbyPlace) => `${p.name}, ${p.distanceM} m`;

/**
 * One call per Shoppers Drug Mart category, from the places within a 10-minute walk:
 * avoid a category a nearby destination store wins, differentiate where it overlaps,
 * compete where nobody nearby is strong. Rules are explained in Research/11.
 */
export function shelfCalls(places: NearbyPlace[]): CategoryCall[] {
  const rivals = places
    .filter((p) => p.loblaw !== 'Shoppers Drug Mart')
    .map((p) => ({ place: p, profile: profileFor(p) }))
    .filter((r) => r.profile.chain !== 'Shoppers Drug Mart')
    .sort((a, b) => a.place.distanceM - b.place.distanceM);
  const strongIn = (c: Category) => rivals.filter((r) => r.profile.strong.includes(c));
  const none = `None within ${NEARBY_RADIUS_M} m`;

  return MATRIX_CATEGORIES.map((category): CategoryCall => {
    if (CORE.includes(category)) {
      const strong = strongIn(category);
      const pharmacies = rivals.filter((r) => r.place.kind === 'Pharmacy' || r.profile.strong.includes('Pharmacy'));
      const count =
        category === 'Pharmacy'
          ? `${pharmacies.length} other ${pharmacies.length === 1 ? 'pharmacy' : 'pharmacies'} within ${NEARBY_RADIUS_M} m. `
          : '';
      return {
        category,
        decision: 'Compete',
        rival: strong[0] ? label(strong[0].place) : none,
        reason: `${count}${CORE_EDGE[category]}`,
      };
    }
    if (category === 'Fresh grocery') {
      const big = strongIn(category)[0];
      if (big) {
        return {
          category,
          decision: 'Avoid',
          rival: label(big.place),
          reason: `${big.profile.chain} sells ${big.profile.mainlySells.split(': ')[1]?.split(';')[0] ?? 'fresh food'}. Keep milk, eggs and bread for top-ups only.${big.place.loblaw ? ' It is a Loblaw store, so the trip stays in the family.' : ''}`,
        };
      }
      const small = rivals.find((r) => r.place.kind === 'Supermarket');
      if (small) {
        return {
          category,
          decision: 'Differentiate',
          rival: label(small.place),
          reason: 'Only small independent grocers nearby, range not checked: a compact fresh range (fruit, salads, milk) may work. Visit them first.',
        };
      }
      return { category, decision: 'Compete', rival: none, reason: 'No grocer within a 10-minute walk: a small fresh range fills a gap.' };
    }
    if (category === 'Convenience food') {
      const meals = strongIn(category).find((r) => r.place.distanceM <= READY_MEAL_M);
      return meals
        ? {
            category,
            decision: 'Differentiate',
            rival: label(meals.place),
            reason: `Ready meals ${meals.place.distanceM} m away: win on speed and hours with grab-and-go snacks and drinks, not meals.`,
          }
        : {
            category,
            decision: 'Compete',
            rival: none.replace(String(NEARBY_RADIUS_M), String(READY_MEAL_M)),
            reason: `No ready-meal counter within ${READY_MEAL_M} m: grab-and-go food and drinks are an easy win.`,
          };
    }
    // Household
    const full = strongIn(category)[0];
    return full
      ? {
          category,
          decision: 'Differentiate',
          rival: label(full.place),
          reason: `${full.profile.chain} carries the full range: keep top-up sizes and PC and Life Brand lines.`,
        }
      : { category, decision: 'Compete', rival: none, reason: 'No large household range nearby: stock the everyday basics.' };
  });
}
