import { useMemo } from 'react';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { KpiTile } from '../components/KpiTile';
import { NETWORK_RADIUS_M, networkRows, networkSummary } from '../data/network';

interface Props {
  onSelect: (id: string) => void;
}

/** Where Shoppers Drug Mart stores sit within a walk of each other, and next to sister Loblaw banners. */
export function NetworkPage({ onSelect }: Props) {
  const rows = useMemo(() => networkRows(), []);
  const summary = useMemo(() => networkSummary(rows), [rows]);
  const dense = rows.filter((r) => r.otherSdm.length >= 3);

  return (
    <main className="page">
      <div className="page__inner">
        <header className="page__head">
          <div>
            <p className="eyebrow">Network</p>
            <h2>Where the network overlaps</h2>
            <p className="muted">
              Every store on the map, with the other Shoppers Drug Mart stores and sister Loblaw banners within a 10-minute
              walk ({NETWORK_RADIUS_M} m, straight line). Overlap is a question of each store's role, not of competition.
            </p>
          </div>
        </header>

        <div className="grid">
          <div className="span-4">
            <KpiTile
              label="Stores near another Shoppers"
              value={`${summary.withOtherSdm} of ${summary.stores}`}
              note={`Within 800 m${dense.length > 0 ? `; ${dense.length} have three or more` : ''}`}
            />
          </div>
          <div className="span-4">
            <KpiTile
              label="Stores near a sister banner"
              value={`${summary.withSister} of ${summary.stores}`}
              note="No Frills, T&T, Independent, Loblaws"
            />
          </div>
          <div className="span-4">
            <KpiTile
              label="Closest pair"
              value={summary.closestPair ? `${summary.closestPair.distanceM} m` : 'None'}
              note={summary.closestPair && `${summary.closestPair.a} and ${summary.closestPair.b}`}
            />
          </div>
        </div>

        <section className="card" aria-labelledby="network-table-title">
          <h3 id="network-table-title">
            Store by store <ConfidenceBadge level="verified" />
          </h3>
          <p className="takeaway">
            {dense.length > 0 &&
              `${dense.map((r) => r.shortName).join(', ')} each have three or more other Shoppers within a walk. `}
            Choose a store to open it.
          </p>
          <table className="table network-table">
            <caption className="visually-hidden">
              Shoppers Drug Mart stores and sister Loblaw banners within {NETWORK_RADIUS_M} m of each store
            </caption>
            <thead>
              <tr>
                <th scope="col">Store</th>
                <th scope="col">Other Shoppers Drug Mart</th>
                <th scope="col">Sister Loblaw banners</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row">
                    <button type="button" className="link-button" onClick={() => onSelect(r.id)}>
                      {r.shortName}
                    </button>
                    <span className="network-table__area">{r.neighbourhood}</span>
                  </th>
                  <td>{r.otherSdm.map((o) => `${o.shortName} ${o.distanceM} m`).join(', ') || 'None'}</td>
                  <td>
                    {r.sisters.map((s) => `${s.loblaw} ${s.distanceM} m`).join(', ') ||
                      (r.surveyed ? 'None' : 'Not surveyed yet')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="footnote">
            Shoppers Drug Mart distances are measured between the store positions on the map. Sister banners come from
            OpenStreetMap and may miss recently opened stores; see Research/10-nearby-pharmacies-and-supermarkets.md.
          </p>
        </section>
      </div>
    </main>
  );
}
