/** How sure we are about a value shown in the dashboard. */
export type Confidence = 'verified' | 'inferred' | 'estimate' | 'sample';

export type LatLng = [number, number];

export type StoreFormat = 'Conventional' | 'Large format' | 'Urban / mixed-use' | 'Simply Pharmacy';

export type Category =
  | 'Pharmacy'
  | 'OTC health'
  | 'Beauty'
  | 'Personal care'
  | 'Convenience food'
  | 'Fresh grocery'
  | 'Household'
  | 'Seasonal';

export type Decision = 'Compete' | 'Differentiate' | 'Avoid';

export interface Source {
  id: string;
  title: string;
  url: string;
}

export interface Fact {
  label: string;
  value: string;
  confidence: Confidence;
  sources?: string[];
}

export interface LeadershipRole {
  role: string;
  /** Left empty on purpose: names are filled in later by the store team. */
  name: string | null;
}

export interface Segment {
  name: string;
  share: number; // 0..1
}

export interface Demographics {
  segments: Segment[];
  ageBands: Segment[];
  incomeTier: Fact;
  drivers: string[];
  seasonality: string;
  nearby: { name: string; kind: string; note: string }[];
  facts: Fact[];
}

export interface CategoryCall {
  category: Category;
  rival: string;
  decision: Decision;
  reason: string;
}

export interface Store {
  id: string;
  number: string;
  name: string;
  shortName: string;
  banner: string;
  division: string;
  format: StoreFormat;
  address: string;
  phone: string;
  hours: string;
  coords: LatLng;
  services: string[];
  summary: string[];
  leadership: LeadershipRole[];
  differentiators: Fact[];
  demographics: Demographics;
  categoryCalls: CategoryCall[];
  sources: string[];
}

export interface Competitor {
  id: string;
  name: string;
  kind: string;
  address: string;
  coords: LatLng;
  /** True when the pin is placed from the street address, not a surveyed point. */
  approximate: boolean;
  categories: Category[];
  sources: string[];
}
