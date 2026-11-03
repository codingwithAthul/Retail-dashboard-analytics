import { useCallback } from 'react';
import { MapView } from './components/MapView';
import { StoreSwitcher } from './components/StoreSwitcher';
import type { Tab } from './components/TabNav';
import { STORES, getStore } from './data/stores';
import { AnalyticsPage } from './views/AnalyticsPage';
import { StoreOverview } from './views/StoreOverview';
import { renderAnalytics } from './views/registry';
import { useHashRoute } from './lib/useHashRoute';

const STORE_IDS = STORES.map((s) => s.id);
const DEFAULT_ROUTE = { storeId: STORES[0].id, tab: 'overview' as Tab };

export default function App() {
  const [{ storeId, tab }, navigate] = useHashRoute(STORE_IDS, DEFAULT_ROUTE);
  const store = getStore(storeId) ?? STORES[0];
  const select = useCallback((id: string) => navigate({ storeId: id, tab }), [navigate, tab]);
  const setTab = useCallback((next: Tab) => navigate({ storeId, tab: next }), [navigate, storeId]);

  return (
    <div className="app">
      <header className="topbar glass">
        <h1 className="topbar__title">Store Insights</h1>
        <span className="topbar__meta">Shoppers Drug Mart · Vancouver</span>
        <span className="topbar__spacer" />
        <StoreSwitcher stores={STORES} selectedId={store.id} onSelect={select} />
      </header>

      {tab === 'overview' ? (
        <div className="stage">
          <MapView stores={STORES} selectedId={store.id} onSelect={select} leftInset={416} />
          <aside className="panel glass" aria-label={`${store.name} details`}>
            <StoreOverview store={store} onOpen={setTab} />
          </aside>
        </div>
      ) : (
        <AnalyticsPage store={store} tab={tab} onTab={setTab} {...renderAnalytics(tab, store)} />
      )}
    </div>
  );
}
