import { useCallback, useState } from 'react';
import { MapView } from './components/MapView';
import { StoreSwitcher } from './components/StoreSwitcher';
import { STORES, getStore } from './data/stores';

export default function App() {
  const [storeId, setStoreId] = useState(STORES[0].id);
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

      <div className="stage">
        <MapView stores={STORES} selectedId={store.id} onSelect={select} leftInset={416} />
        <aside className="panel glass" aria-label={`${store.name} details`}>
          <div>
            <p className="eyebrow">
              {store.banner} {store.number}
            </p>
            <h2>{store.shortName}</h2>
            <p className="muted">{store.address}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
