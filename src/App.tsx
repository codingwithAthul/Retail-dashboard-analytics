import { useCallback, useMemo } from 'react';
import { MapView, type MapPin } from './components/MapView';
import { StoreSearch } from './components/StoreSearch';
import { StoreSwitcher } from './components/StoreSwitcher';
import type { Tab } from './components/TabNav';
import { DIRECTORY, hasProfile } from './data/directory';
import { nearbyFor, nearbyPins } from './data/nearby';
import { STORES, getStore } from './data/stores';
import type { Store } from './data/types';
import { AnalyticsPage } from './views/AnalyticsPage';
import { ComparePage } from './views/ComparePage';
import { ListingOverview } from './views/ListingOverview';
import { NetworkPage } from './views/NetworkPage';
import { StoreBrief } from './views/StoreBrief';
import { StoreOverview } from './views/StoreOverview';
import { renderAnalytics } from './views/registry';
import { useHashRoute } from './lib/useHashRoute';
import { useMediaQuery } from './lib/useMediaQuery';

const STORE_IDS = DIRECTORY.map((s) => s.id);
const PINS: MapPin[] = DIRECTORY.map((s) => ({ ...s, profiled: hasProfile(s) }));
const DEFAULT_ROUTE = { storeId: STORES[0].id, tab: 'overview' as Tab };

export default function App() {
  const [{ storeId, tab, compare: pair }, navigate] = useHashRoute(STORE_IDS, DEFAULT_ROUTE);
  const profile = getStore(storeId);
  // Stores known only from public directories have no analytics tabs or brief yet.
  const listing = profile ? undefined : DIRECTORY.find((s) => s.id === storeId);
  const store = profile ?? STORES[0];
  const view = listing && tab !== 'compare' && tab !== 'network' ? 'overview' : tab;
  const phone = useMediaQuery('(max-width: 760px)');
  // A directory store shows the pharmacies and supermarkets within a 10-minute walk.
  const nearby = useMemo(() => (listing ? nearbyPins(nearbyFor(listing.id)) : undefined), [listing]);
  const select = useCallback(
    (id: string) => navigate({ storeId: id, tab: tab === 'compare' || tab === 'network' || !getStore(id) ? 'overview' : tab }),
    [navigate, tab],
  );
  const compare = useCallback(() => navigate({ storeId, tab: 'compare' }), [navigate, storeId]);
  const network = useCallback(() => navigate({ storeId, tab: 'network' }), [navigate, storeId]);
  const pick = useCallback((a: string, b: string) => navigate({ storeId, tab: 'compare', compare: [a, b] }), [navigate, storeId]);
  // Only profiled stores have the data to compare; anything else falls back to the first two.
  const [compareA, compareB] = (pair && pair.every((id) => getStore(id)) ? pair.map((id) => getStore(id)!) : STORES.slice(0, 2)) as [
    Store,
    Store,
  ];
  const setTab = useCallback((next: Tab) => navigate({ storeId, tab: next }), [navigate, storeId]);
  const brief = useCallback(() => navigate({ storeId, tab: 'brief' }), [navigate, storeId]);

  return (
    <div className="app">
      <header className="topbar glass">
        <h1 className="topbar__title">Store Insights</h1>
        <span className="topbar__meta">Shoppers Drug Mart · Vancouver</span>
        <span className="topbar__spacer" />
        <StoreSearch stores={DIRECTORY} onSelect={select} />
        <StoreSwitcher
          stores={STORES}
          selectedId={tab === 'compare' || tab === 'network' ? null : storeId}
          page={tab === 'compare' || tab === 'network' ? tab : undefined}
          onSelect={select}
          onCompare={compare}
          onNetwork={network}
        />
      </header>

      {view === 'network' ? (
        <NetworkPage onSelect={select} />
      ) : view === 'compare' ? (
        <ComparePage a={compareA} b={compareB} stores={STORES} onChange={pick} notComparable={DIRECTORY.length - STORES.length} />
      ) : view === 'brief' ? (
        <StoreBrief store={store} onBack={() => setTab('overview')} />
      ) : view === 'overview' ? (
        <div className="stage">
          <MapView
            stores={PINS}
            competitors={nearby}
            selectedId={storeId}
            onSelect={select}
            leftInset={phone ? 0 : 416}
            topInset={phone ? 130 : 96}
            bottomInset={phone ? Math.round(window.innerHeight * 0.55) : 0}
            legend
          />
          <aside className="panel glass" aria-label={`${(listing ?? store).name} details`}>
            {listing ? (
              <ListingOverview listing={listing} onSelect={select} />
            ) : (
              <StoreOverview store={store} onOpen={setTab} onBrief={brief} />
            )}
          </aside>
        </div>
      ) : (
        <AnalyticsPage store={store} tab={view} onTab={setTab} {...renderAnalytics(view, store)} />
      )}
    </div>
  );
}
