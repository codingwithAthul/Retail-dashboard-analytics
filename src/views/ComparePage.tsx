import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartData } from '../components/ChartData';
import { ComparePicker } from '../components/ComparePicker';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { competitorsNear } from '../data/competition';
import { categoryGaps, compareKpis, sharedCompetitors, storeDistanceKm, type KpiKey } from '../data/compare';
import { IS_SAMPLE, weekdaySales } from '../data/sales';
import type { Store } from '../data/types';
import { count, DAY_NAMES, money, money2, moneyShort, percent, signedPercent } from '../lib/format';
import { formatDistance } from '../lib/geo';

const axis = { stroke: 'var(--text-3)', fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltipStyle = { background: 'var(--surface)', border: '1px solid var(--separator)', borderRadius: 10, fontSize: 13 };
const COLOR_A = 'var(--blue)';
const COLOR_B = 'var(--teal)';

const FORMAT: Record<KpiKey, (v: number) => string> = {
  ttmSales: moneyShort,
  yoy: signedPercent,
  transactions: count,
  averageBasket: money2,
  pharmacyShare: percent,
  weekendGap: signedPercent,
};

const points = (gap: number) => `${Math.round(Math.abs(gap) * 100)} pts`;

interface Props {
  a: Store;
  b: Store;
  /** Stores the user can choose between. Without it, the page compares a and b only. */
  stores?: Store[];
  onChange?: (a: string, b: string) => void;
  notComparable?: number;
}

export function ComparePage({ a, b, stores, onChange, notComparable }: Props) {
  const data = useMemo(() => {
    const gaps = categoryGaps(a, b);
    const wa = weekdaySales(a.id);
    const wb = weekdaySales(b.id);
    return {
      kpis: compareKpis(a, b),
      gaps,
      mix: gaps.map((g) => ({ category: g.category, a: g.a, b: g.b })),
      week: wa.map((d, i) => ({ day: d.day, a: d.averageSales, b: wb[i].averageSales })),
      shared: sharedCompetitors(a, b),
      nearA: competitorsNear(a),
      nearB: competitorsNear(b),
    };
  }, [a, b]);
  const leads = (side: 'a' | 'b') => data.gaps.filter((g) => g.leader === side);
  const similar = data.gaps.filter((g) => g.leader === null);
  const kpi = (key: KpiKey) => data.kpis.find((r) => r.key === key)!;
  const larger = (key: KpiKey) => ((kpi(key).a ?? 0) >= (kpi(key).b ?? 0) ? a : b);
  const busiest = (side: 'a' | 'b') => data.week.reduce((x, y) => (y[side] > x[side] ? y : x)).day;
  const topSegments = (s: Store) => [...s.demographics.segments].sort((x, y) => y.share - x.share).slice(0, 2);

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__head">
          <div>
            <p className="eyebrow">Two stores</p>
            <h2>Compare stores</h2>
            <p className="muted">
              {a.shortName} and {b.shortName}, {formatDistance(storeDistanceKm(a, b))} apart. What each does differently, and where each should specialise.
            </p>
            {stores && onChange && <ComparePicker stores={stores} a={a} b={b} onChange={onChange} notComparable={notComparable} />}
          </div>
        </header>

        {IS_SAMPLE && <SampleDataNotice />}

        <div className="grid">
          <section className="card span-6" aria-labelledby="cmp-kpi-title">
            <h3 id="cmp-kpi-title">Headline numbers</h3>
            <p className="takeaway">
              Last 12 months. {larger('averageBasket').shortName} has the bigger basket; {larger('transactions').shortName} has more transactions.
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Measure</th>
                  <th className="num">{a.shortName}</th>
                  <th className="num">{b.shortName}</th>
                </tr>
              </thead>
              <tbody>
                {data.kpis.map((r) => (
                  <tr key={r.key}>
                    <td>{r.label}</td>
                    <td className="num">{r.a === null ? '–' : FORMAT[r.key](r.a)}</td>
                    <td className="num">{r.b === null ? '–' : FORMAT[r.key](r.b)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="card span-6" aria-labelledby="cmp-focus-title">
            <h3 id="cmp-focus-title">Where each store should specialise</h3>
            <p className="takeaway">Categories where one store's share of sales is at least 3 points higher.</p>
            <dl className="compare-leads">
              <dt>{a.shortName} leads</dt>
              <dd>{leads('a').map((g) => `${g.category} (+${points(g.gap)})`).join(', ') || 'No clear lead'}</dd>
              <dt>{b.shortName} leads</dt>
              <dd>{leads('b').map((g) => `${g.category} (+${points(g.gap)})`).join(', ') || 'No clear lead'}</dd>
              <dt>Similar at both</dt>
              <dd>{similar.map((g) => g.category).join(', ') || 'None'}</dd>
            </dl>
          </section>
        </div>

        <div className="grid">
          <section className="card span-8" aria-labelledby="cmp-mix-title">
            <h3 id="cmp-mix-title">Sales mix by category</h3>
            <p className="takeaway">Share of each store's sales over the last 12 months, biggest difference first.</p>
            <div className="chart" role="img" aria-label={`Bar chart comparing category share of sales. ${data.gaps.map((g) => `${g.category}: ${a.shortName} ${percent(g.a)}, ${b.shortName} ${percent(g.b)}`).join('; ')}.`}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.mix} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--separator)" />
                  <XAxis dataKey="category" {...axis} interval={0} tickFormatter={(v: string) => v.split(' ')[0]} />
                  <YAxis {...axis} tickFormatter={(v: number) => percent(v)} width={44} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => percent(Number(v), 1)} cursor={{ fill: 'var(--surface-2)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} itemSorter={null} />
                  <Bar dataKey="a" name={a.shortName} fill={COLOR_A} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                  <Bar dataKey="b" name={b.shortName} fill={COLOR_B} radius={[6, 6, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartData
              caption="Category share of sales, both stores"
              headers={['Category', a.shortName, b.shortName, 'Difference']}
              rows={data.gaps.map((g) => [g.category, percent(g.a), percent(g.b), `${g.gap >= 0 ? '+' : '−'}${points(g.gap)}`])}
            />
          </section>

          <section className="card span-4" aria-labelledby="cmp-cust-title">
            <h3 id="cmp-cust-title">Main customers</h3>
            <p className="takeaway">Estimated from public research.</p>
            {[a, b].map((s) => (
              <div key={s.id} className="compare-block">
                <h4>{s.shortName}</h4>
                <ul className="bullets">
                  {topSegments(s).map((seg) => (
                    <li key={seg.name}>
                      {seg.name}, about {percent(seg.share)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>

        <div className="grid">
          <section className="card span-8" aria-labelledby="cmp-week-title">
            <h3 id="cmp-week-title">Weekly rhythm</h3>
            <p className="takeaway">
              Average daily sales. Busiest day: {DAY_NAMES[busiest('a')]} at {a.shortName}, {DAY_NAMES[busiest('b')]} at {b.shortName}. Staff each store to its own peak.
            </p>
            <div className="chart" role="img" aria-label={`Line chart of average daily sales by weekday for ${a.shortName} and ${b.shortName}.`}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.week} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--separator)" />
                  <XAxis dataKey="day" {...axis} />
                  <YAxis {...axis} tickFormatter={moneyShort} width={56} domain={[0, 'auto']} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} itemSorter={null} />
                  <Line dataKey="a" name={a.shortName} stroke={COLOR_A} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  <Line dataKey="b" name={b.shortName} stroke={COLOR_B} strokeWidth={2.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ChartData
              caption="Average daily sales by weekday, both stores"
              headers={['Day', a.shortName, b.shortName]}
              rows={data.week.map((d) => [d.day, money(d.a), money(d.b)])}
            />
          </section>

          <section className="card span-4" aria-labelledby="cmp-rivals-title">
            <h3 id="cmp-rivals-title">Competitors</h3>
            <p className="takeaway">
              {data.shared.length === 0
                ? 'No competitor is within 1.2 km of both stores, so each faces its own rivals.'
                : `${data.shared.map((c) => c.name).join(', ')} compete${data.shared.length === 1 ? 's' : ''} with both stores.`}
            </p>
            {[
              { store: a, near: data.nearA },
              { store: b, near: data.nearB },
            ].map(({ store, near }) => (
              <div key={store.id} className="compare-block">
                <h4>{store.shortName}</h4>
                <ul className="bullets">
                  {near.map((c) => (
                    <li key={c.id}>
                      {c.name}, ≈{formatDistance(c.km)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
