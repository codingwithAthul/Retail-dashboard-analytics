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
