import type { Tab } from '../components/TabNav';

export interface Route {
  storeId: string;
  tab: Tab;
}

const TABS: Tab[] = ['overview', 'demographics', 'sales', 'competitors'];

/** Parse "#/store/2247/sales" into a route. Unknown parts fall back to the defaults. */
export function parseHash(hash: string, validStoreIds: string[], fallback: Route): Route {
  const [, storeId, tab] = hash.match(/^#\/store\/([^/]+)(?:\/([a-z]+))?\/?$/) ?? [];
  if (!storeId || !validStoreIds.includes(storeId)) return fallback;
  return { storeId, tab: TABS.includes(tab as Tab) ? (tab as Tab) : 'overview' };
}

export function toHash({ storeId, tab }: Route): string {
  return tab === 'overview' ? `#/store/${storeId}` : `#/store/${storeId}/${tab}`;
}
