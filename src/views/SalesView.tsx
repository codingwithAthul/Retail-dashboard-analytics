import { useMemo } from 'react';
import { KpiTile } from '../components/KpiTile';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { categorySales, pharmacySplit, salesKpis, topItems, yearOverYear } from '../data/sales';
import type { Store } from '../data/types';
import { count, money2, moneyShort, percent, signedPercent } from '../lib/format';

export function SalesView({ store }: { store: Store }) {
  const data = useMemo(
    () => ({
      kpis: salesKpis(store.id),
      yoy: yearOverYear(store.id),
      categories: categorySales(store.id),
      items: topItems(store.id),
      split: pharmacySplit(store.id),
    }),
    [store.id],
  );
  const { kpis, split } = data;

  return (
    <>
      <SampleDataNotice />

      <div className="grid">
        <div className="span-3">
          <KpiTile
            label="Sales, last 12 months"
            value={moneyShort(kpis.ttmSales)}
            delta={{ text: `${signedPercent(kpis.yoy)} vs prior year`, positive: kpis.yoy >= 0 }}
          />
        </div>
        <div className="span-3">
          <KpiTile label="Transactions" value={count(kpis.transactions)} note="Last 12 months" />
        </div>
        <div className="span-3">
          <KpiTile label="Average basket" value={money2(kpis.averageBasket)} note="Sales ÷ transactions" />
        </div>
        <div className="span-3">
          <KpiTile label="Pharmacy share" value={percent(split.pharmacy)} note={`Front store ${percent(split.frontStore)}`} />
        </div>
      </div>
    </>
  );
}
