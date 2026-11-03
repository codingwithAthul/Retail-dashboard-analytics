import type { Tab } from '../components/TabNav';

/** A store tab, a store's printable brief, or the page that compares stores. */
export type View = Tab | 'brief' | 'compare';

export interface Route {
  storeId: string;
  tab: View;
}

const TABS: Tab[] = ['overview', 'demographics', 'sales', 'competitors'];

/** Parse "#/store/2247/sales" into a route. Unknown parts fall back to the defaults. */
export function parseHash(hash: string, validStoreIds: string[], fallback: Route): Route {
  if (/^#\/compare\/?$/.test(hash)) return { storeId: fallback.storeId, tab: 'compare' };
  const [, storeId, tab] = hash.match(/^#\/store\/([^/]+)(?:\/([a-z]+))?\/?$/) ?? [];
  if (!storeId || !validStoreIds.includes(storeId)) return fallback;
  if (tab === 'brief') return { storeId, tab };
  return { storeId, tab: TABS.includes(tab as Tab) ? (tab as Tab) : 'overview' };
}

export function toHash({ storeId, tab }: Route): string {
  if (tab === 'compare') return '#/compare';
  return tab === 'overview' ? `#/store/${storeId}` : `#/store/${storeId}/${tab}`;
}
