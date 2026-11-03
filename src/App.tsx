import { useCallback, useState } from 'react';
import { MapView } from './components/MapView';
import { StoreSwitcher } from './components/StoreSwitcher';
import type { Tab } from './components/TabNav';
import { STORES, getStore } from './data/stores';
import { AnalyticsPage } from './views/AnalyticsPage';
import { StoreOverview } from './views/StoreOverview';
import { renderAnalytics } from './views/registry';

export default function App() {
  const [storeId, setStoreId] = useState(STORES[0].id);
  const [tab, setTab] = useState<Tab>('overview');
  const store = getStore(storeId) ?? STORES[0];
  const select = useCallback((id: string) => setStoreId(id), []);

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
