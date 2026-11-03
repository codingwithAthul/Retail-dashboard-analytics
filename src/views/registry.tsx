import type { ReactNode } from 'react';
import type { Tab } from '../components/TabNav';
import type { Store } from '../data/types';
import { CompetitorsView } from './CompetitorsView';
import { DemographicsView } from './DemographicsView';
import { SalesView } from './SalesView';

type AnalyticsTab = Exclude<Tab, 'overview'>;

/** Title, lead line and content for each analytics tab. */
export function renderAnalytics(tab: AnalyticsTab, store: Store): { title: string; lead: string; children: ReactNode } {
  switch (tab) {
    case 'demographics':
      return { title: 'Demographics', lead: `Who shops at ${store.shortName} and why they come back.`, children: <DemographicsView store={store} /> };
    case 'sales':
      return { title: 'Sales', lead: 'What sells, how much, and the trend.', children: <SalesView store={store} /> };
    case 'competitors':
      return { title: 'Competitors', lead: 'Who nearby sells the same things, and where not to compete.', children: <CompetitorsView store={store} /> };
  }
}
