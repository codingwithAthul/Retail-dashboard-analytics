import { competitorsNear } from '../data/competition';
import { categorySales, IS_SAMPLE, PERIOD_END, pharmacySplit, salesKpis } from '../data/sales';
import type { Store } from '../data/types';
import { money2, moneyShort, monthYear, percent, signedPercent } from '../lib/format';
import { formatDistance } from '../lib/geo';

interface Props {
  store: Store;
  onBack: () => void;
}

/** One-page summary of a store, laid out to print on a single Letter or A4 sheet. */
export function StoreBrief({ store, onBack }: Props) {
  const kpis = salesKpis(store.id);
  const headline: [string, string][] = [
    ['Sales, last 12 months', moneyShort(kpis.ttmSales)],
    ['Growth vs prior year', kpis.yoy === null ? '–' : signedPercent(kpis.yoy)],
    ['Average basket', money2(kpis.averageBasket)],
    ['Pharmacy share', percent(pharmacySplit(store.id).pharmacy)],
  ];
  const categories = categorySales(store.id).slice(0, 4);
  const segments = [...store.demographics.segments].sort((a, b) => b.share - a.share).slice(0, 3);
  const rivals = competitorsNear(store);

  return (
    <main className="page brief-page">
      <div className="brief-actions no-print">
        <button type="button" className="button button--plain" onClick={onBack}>
          <span aria-hidden="true">‹</span> Back to store
        </button>
        <button type="button" className="button" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>

      <article className="brief" aria-labelledby="brief-title">
        <header className="brief__head">
          <div>
            <p className="eyebrow">
              {store.banner} {store.number} · Store brief
            </p>
            <h2 id="brief-title">{store.shortName}</h2>
            <p className="muted">
              {store.address} · {store.hours} · {store.phone}
            </p>
          </div>
          <p className="brief__date">Sales data to {monthYear(PERIOD_END)}</p>
        </header>

        {IS_SAMPLE && (
          <p className="brief__note" role="note">
            Sales figures are synthetic sample data for demonstration. Customer, location and competitor facts come from public sources.
          </p>
        )}

        <section className="brief__kpis" aria-label="Headline numbers">
          {headline.map(([label, value]) => (
            <div key={label}>
              <p className="eyebrow">{label}</p>
              <p className="brief__kpi">{value}</p>
            </div>
          ))}
        </section>

        <div className="brief__cols">
          <section>
            <h3>Summary</h3>
            <ul className="bullets">
              {store.summary.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Key differentiators</h3>
            <dl className="brief__dl">
              {store.differentiators.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h3>Main customers</h3>
            <ul className="bullets">
              {segments.map((s) => (
                <li key={s.name}>
                  {s.name}, about {percent(s.share)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Top categories</h3>
            <ul className="bullets">
              {categories.map((c) => (
                <li key={c.category}>
                  {c.category}, {percent(c.share)} of sales
                </li>
              ))}
            </ul>
          </section>

          <section className="brief__wide">
            <h3>Where to compete</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Main rival</th>
                  <th>Call</th>
                </tr>
              </thead>
              <tbody>
                {store.categoryCalls.map((c) => (
                  <tr key={c.category}>
                    <td>{c.category}</td>
                    <td>{c.rival}</td>
                    <td>{c.decision}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h3>Competitors within 1.2 km</h3>
            <ul className="bullets">
              {rivals.map((c) => (
                <li key={c.id}>
                  {c.name}, ≈{formatDistance(c.km)}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Store leadership</h3>
            <dl className="brief__dl">
              {store.leadership.map((r) => (
                <div key={r.role}>
                  <dt>{r.role}</dt>
                  <dd className={r.name ? undefined : 'placeholder'}>{r.name ?? 'Not yet added'}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <footer className="brief__foot">
          Store Insights · independent portfolio project, not affiliated with or endorsed by Loblaw Companies Limited or Shoppers Drug Mart.
        </footer>
      </article>
    </main>
  );
}
