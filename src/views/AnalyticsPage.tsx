import type { ReactNode } from 'react';
import { TabNav, type Tab } from '../components/TabNav';
import type { Store } from '../data/types';

interface Props {
  store: Store;
  tab: Tab;
  onTab: (tab: Tab) => void;
  title: string;
  lead: string;
  children: ReactNode;
}

/** Full-width page used by the Demographics, Sales and Competitors views. */
export function AnalyticsPage({ store, tab, onTab, title, lead, children }: Props) {
  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__head">
          <div>
            <p className="eyebrow">
              {store.shortName} · {store.number}
            </p>
            <h2>{title}</h2>
            <p className="muted">{lead}</p>
          </div>
          <TabNav current={tab} onChange={onTab} />
        </header>
        {children}
      </div>
    </main>
  );
}
