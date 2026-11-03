import { useMemo } from 'react';
import { DecisionBadge } from '../components/DecisionBadge';
import { KpiTile } from '../components/KpiTile';
import { MapView } from '../components/MapView';
import { SourceLinks } from '../components/SourceLinks';
import { MATRIX_CATEGORIES, competitorsNear, overlaps } from '../data/competition';
import type { Store } from '../data/types';
import { formatDistance } from '../lib/geo';

export function CompetitorsView({ store }: { store: Store }) {
  const nearby = useMemo(() => competitorsNear(store), [store]);
  const stores = useMemo(() => [store], [store]);
  const pharmacies = nearby.filter((c) => overlaps(c, 'Pharmacy')).length;
  const avoid = store.categoryCalls.filter((c) => c.decision === 'Avoid').map((c) => c.category);

  return (
    <>
      <div className="grid">
        <div className="span-4">
          <KpiTile label="Competitors within 1.2 km" value={String(nearby.length)} note="Retailers selling SDM categories" />
        </div>
        <div className="span-4">
          <KpiTile label="Other pharmacies nearby" value={String(pharmacies)} note="Compete on services, not price" />
        </div>
        <div className="span-4">
          <KpiTile label="Categories to avoid" value={avoid.join(', ') || 'None'} note="A nearby specialist wins on price" />
        </div>
      </div>

      <div className="grid">
        <section className="card span-6" aria-labelledby="cmap-title">
          <h3 id="cmap-title">Map</h3>
          <p className="takeaway">Red: this store. Grey: competitors (approximate positions from street address).</p>
          <MapView stores={stores} competitors={nearby} selectedId={store.id} topInset={40} className="map map--inline" />
        </section>

        <section className="card span-6" aria-labelledby="clist-title">
          <h3 id="clist-title">Nearby competitors</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th className="num">Distance</th>
              </tr>
            </thead>
            <tbody>
              {nearby.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.name}
                    <div className="muted" style={{ fontSize: 12 }}>
                      {c.address}
                      <SourceLinks ids={c.sources} />
                    </div>
                  </td>
                  <td className="muted">{c.kind}</td>
                  <td className="num">{c.approximate ? "≈ " : ""}{formatDistance(c.km)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="card" aria-labelledby="matrix-title">
        <h3 id="matrix-title">Who sells what</h3>
        <p className="takeaway">A tick means the competitor sells that category.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="table matrix">
            <thead>
              <tr>
                <th>Competitor</th>
                {MATRIX_CATEGORIES.map((cat) => (
                  <th key={cat}>{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nearby.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  {MATRIX_CATEGORIES.map((cat) => (
                    <td key={cat}>
                      {overlaps(c, cat) ? (
                        <span className="tick" aria-label="Yes">✓</span>
                      ) : (
                        <span className="muted" aria-label="No">–</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="calls-title">
        <h3 id="calls-title">Where to compete</h3>
        <p className="takeaway">One call per category, based on who is nearby and who shops here.</p>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Decision</th>
              <th>Main rival</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            {store.categoryCalls.map((c) => (
              <tr key={c.category}>
                <td>{c.category}</td>
                <td>
                  <DecisionBadge decision={c.decision} />
                </td>
                <td className="muted">{c.rival}</td>
                <td>{c.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
