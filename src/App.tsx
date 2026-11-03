import { useCallback } from 'react';
import { MapView } from './components/MapView';
import { StoreSwitcher } from './components/StoreSwitcher';
import type { Tab } from './components/TabNav';
import { STORES, getStore } from './data/stores';
import { AnalyticsPage } from './views/AnalyticsPage';
import { ComparePage } from './views/ComparePage';
import { StoreOverview } from './views/StoreOverview';
import { renderAnalytics } from './views/registry';
import { useHashRoute } from './lib/useHashRoute';
import { useMediaQuery } from './lib/useMediaQuery';

const STORE_IDS = STORES.map((s) => s.id);
const DEFAULT_ROUTE = { storeId: STORES[0].id, tab: 'overview' as Tab };

export default function App() {
  const [{ storeId, tab }, navigate] = useHashRoute(STORE_IDS, DEFAULT_ROUTE);
  const store = getStore(storeId) ?? STORES[0];
  const phone = useMediaQuery('(max-width: 760px)');
  const select = useCallback((id: string) => navigate({ storeId: id, tab: tab === 'compare' ? 'overview' : tab }), [navigate, tab]);
  const compare = useCallback(() => navigate({ storeId, tab: 'compare' }), [navigate, storeId]);
  const setTab = useCallback((next: Tab) => navigate({ storeId, tab: next }), [navigate, storeId]);

  return (
    <div className="app">
      <header className="topbar glass">
        <h1 className="topbar__title">Store Insights</h1>
        <span className="topbar__meta">Shoppers Drug Mart · Vancouver</span>
        <span className="topbar__spacer" />
        <StoreSwitcher stores={STORES} selectedId={tab === 'compare' ? null : store.id} onSelect={select} onCompare={compare} />
      </header>

      {tab === 'compare' ? (
        <ComparePage a={STORES[0]} b={STORES[1]} />
      ) : tab === 'overview' ? (
        <div className="stage">
          <MapView
            stores={STORES}
            selectedId={store.id}
            onSelect={select}
            leftInset={phone ? 0 : 416}
            topInset={phone ? 130 : 96}
            bottomInset={phone ? Math.round(window.innerHeight * 0.55) : 0}
          />
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
