import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartData } from '../components/ChartData';
import { weekendGap } from '../data/compare';
import { KpiTile } from '../components/KpiTile';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { categorySales, IS_SAMPLE, pharmacySplit, salesKpis, topItems, weekdaySales, yearOverYear } from '../data/sales';
import type { Store } from '../data/types';
import { count, money, money2, moneyShort, percent, signedPercent } from '../lib/format';

const axis = { stroke: 'var(--text-3)', fontSize: 12, tickLine: false, axisLine: false } as const;
const DAY_NAMES: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};
/** Round axis ticks (0, 5K, 10K…) so short money labels never round to odd values like $17K. */
function roundTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)!;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--separator)', borderRadius: 10, fontSize: 13 };

export function SalesView({ store }: { store: Store }) {
  const data = useMemo(
    () => ({
      kpis: salesKpis(store.id),
      yoy: yearOverYear(store.id),
      categories: categorySales(store.id),
      items: topItems(store.id),
      split: pharmacySplit(store.id),
      weekdays: weekdaySales(store.id),
    }),
    [store.id],
  );
  const { kpis, yoy, categories, items, split, weekdays } = data;
  const peak = yoy.reduce((a, b) => (b.current > a.current ? b : a));
  const low = yoy.reduce((a, b) => (b.current < a.current ? b : a));
  const busiest = weekdays.reduce((a, b) => (b.averageSales > a.averageSales ? b : a));
  const quietest = weekdays.reduce((a, b) => (b.averageSales < a.averageSales ? b : a));
  const weekdayTicks = roundTicks(busiest.averageSales);
  const weekendDiff = weekendGap(store.id);

  return (
    <>
      {IS_SAMPLE && <SampleDataNotice />}

      <div className="grid">
        <div className="span-3">
          <KpiTile
            label="Sales, last 12 months"
            value={moneyShort(kpis.ttmSales)}
            delta={kpis.yoy === null ? undefined : { text: `${signedPercent(kpis.yoy)} vs prior year`, positive: kpis.yoy >= 0 }}
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

      <div className="grid">
        <section className="card span-8" aria-labelledby="trend-title">
          <h3 id="trend-title">Monthly sales, this year vs last year</h3>
          <p className="takeaway">
            Peak in {peak.label} ({moneyShort(peak.current)}), low in {low.label} ({moneyShort(low.current)}). {store.demographics.seasonality}
          </p>
          <div className="chart" role="img" aria-label={`Line chart of monthly sales for the last 12 months against the year before. Peak ${peak.label}, low ${low.label}.`}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yoy} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--separator)" />
                <XAxis dataKey="label" {...axis} />
                <YAxis {...axis} tickFormatter={moneyShort} width={56} domain={[0, 'auto']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Line name="Last 12 months" dataKey="current" stroke="var(--blue)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                <Line name="Year before" dataKey="previous" stroke="var(--gray)" strokeWidth={2} strokeDasharray="4 4" dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ChartData
            caption="Monthly sales, last 12 months and year before"
            headers={['Month', 'Last 12 months', 'Year before']}
            rows={yoy.map((p) => [p.label, money(p.current), p.previous === null ? '–' : money(p.previous)])}
          />
        </section>

        <section className="card span-4" aria-labelledby="mix-title">
          <h3 id="mix-title">Sales by category</h3>
          <p className="takeaway">
            {categories[0].category} leads at {percent(categories[0].share)} of sales.
          </p>
          <div className="chart" role="img" aria-label={`Bar chart of sales by category. ${categories.map((c) => `${c.category} ${percent(c.share)}`).join(', ')}.`}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <XAxis type="number" hide domain={[0, 'auto']} />
                <YAxis type="category" dataKey="category" {...axis} width={112} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="sales" name="Sales" fill="var(--blue)" radius={[0, 6, 6, 0]} barSize={16} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartData
            caption="Sales by category"
            headers={['Category', 'Sales', 'Share']}
            rows={categories.map((c) => [c.category, money(c.sales), percent(c.share)])}
          />
        </section>

        <section className="card span-8" aria-labelledby="items-title">
          <h3 id="items-title">Best-selling front-store items</h3>
          <p className="takeaway">
            {items[0].name} sells the most units; {[...items].sort((a, b) => b.revenue - a.revenue)[0].name} brings in the most revenue.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th className="num">Units</th>
                <th className="num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.name}>
                  <td>{i.name}</td>
                  <td className="muted">{i.category}</td>
                  <td className="num">{count(i.units)}</td>
                  <td className="num">{money(i.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card span-4" aria-labelledby="weekday-title">
          <h3 id="weekday-title">Average sales by weekday</h3>
          <p className="takeaway">
            Busiest on {DAY_NAMES[busiest.day]}, quietest on {DAY_NAMES[quietest.day]}. Weekends run {percent(Math.abs(weekendDiff))}{' '}
            {weekendDiff < 0 ? 'below' : 'above'} weekdays.
          </p>
          <div className="chart" role="img" aria-label={`Bar chart of average daily sales by weekday. Busiest ${DAY_NAMES[busiest.day]}, quietest ${DAY_NAMES[quietest.day]}.`}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekdays} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--separator)" />
                <XAxis dataKey="day" {...axis} />
                <YAxis {...axis} tickFormatter={moneyShort} width={56} ticks={weekdayTicks} domain={[0, weekdayTicks[weekdayTicks.length - 1]]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} cursor={{ fill: 'var(--surface-2)' }} />
                <Bar dataKey="averageSales" name="Average sales" fill="var(--blue)" radius={[6, 6, 0, 0]} barSize={20} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartData
            caption="Average daily sales by weekday"
            headers={['Day', 'Average sales']}
            rows={weekdays.map((d) => [DAY_NAMES[d.day], money(d.averageSales)])}
          />
        </section>
      </div>
    </>
  );
}
