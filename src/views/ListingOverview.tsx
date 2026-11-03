import { CensusTable } from '../components/CensusTable';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { Section } from '../components/Section';
import { ShareBars } from '../components/ShareBars';
import { fsaCensus } from '../data/fsaCensus';
import { NEARBY_RADIUS_M, nearbyFor, osmUrl } from '../data/nearby';
import { STORES } from '../data/stores';
import type { StoreListing } from '../data/types';
import { distanceKm, formatDistance } from '../lib/geo';

interface Props {
  listing: StoreListing;
  onSelect: (id: string) => void;
}

/** Panel for a store known only from public directories: what is checked, and what is not yet there. */
export function ListingOverview({ listing, onSelect }: Props) {
  const nearest = [...STORES]
    .map((s) => ({ store: s, km: distanceKm(listing.coords, s.coords) }))
    .sort((a, b) => a.km - b.km)[0];
  const census = fsaCensus(listing);
  const nearby = nearbyFor(listing.id);

  return (
    <>
      <header>
        <p className="eyebrow">
          {listing.banner} #{listing.id}
        </p>
        <h2>{listing.shortName}</h2>
        <p className="muted">{listing.address}</p>
        <div className="chips">
          <span className="chip">{listing.format === 'Not yet known' ? 'Format not yet known' : listing.format}</span>
          <span className="chip">{listing.neighbourhood}</span>
        </div>
      </header>

      <div className="notice notice--estimate" role="note">
        <span>
          Public directory listing. The address is checked against a second public source; there is no store profile
          yet.
          {listing.approximate ? ' The map position is approximate.' : ''}
        </span>
      </div>

      {census && (
        <Section title={`2021 census, postal area ${census.code}`} aside={<ConfidenceBadge level="verified" />}>
          <p className="muted">
            Residents of every address whose postal code starts with {census.code}. That is wider than the store's walk-in
            trade area, and counts residents, not shoppers.
          </p>
          <CensusTable census={census} />
          <ShareBars
            data={census.ageBands}
            label={`Residents by age, postal area ${census.code}, 2021 census`}
            color="var(--teal)"
            height={180}
          />
        </Section>
      )}

      {nearby && (
        <Section title="Within a 10-minute walk" aside={<ConfidenceBadge level="verified" />}>
          <p className="muted">
            {nearby.pharmacies} other {nearby.pharmacies === 1 ? 'pharmacy' : 'pharmacies'}, {nearby.supermarkets}{' '}
            {nearby.supermarkets === 1 ? 'supermarket' : 'supermarkets'}
            {nearby.shoppers > 0 &&
              `, ${nearby.shoppers} other Shoppers Drug Mart ${nearby.shoppers === 1 ? 'store' : 'stores'}`}
            {nearby.otherLoblaw > 0 &&
              `, ${nearby.otherLoblaw} Loblaw ${nearby.otherLoblaw === 1 ? 'store' : 'stores'} under other banners`}{' '}
            within {NEARBY_RADIUS_M} m. Grey pins on the map; Loblaw stores are marked in the list.
          </p>
          {nearby.places.length > 0 && (
            <table className="table">
              <caption className="visually-hidden">Pharmacies and supermarkets within {NEARBY_RADIUS_M} m</caption>
              <thead>
                <tr>
                  <th scope="col">Place</th>
                  <th scope="col">Kind</th>
                  <th scope="col" className="num">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                {nearby.places.map((p) => (
                  <tr key={p.osm}>
                    <th scope="row">
                      <a href={osmUrl(p.osm)} target="_blank" rel="noreferrer">
                        {p.name}
                      </a>
                      {p.loblaw && <span className="chip chip--small">Loblaw</span>}
                    </th>
                    <td>{p.kind}</td>
                    <td className="num">{p.distanceM} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="footnote">
            Source: OpenStreetMap contributors. Straight-line distance; the map may miss recently opened or unmapped
            stores.
          </p>
        </Section>
      )}

      <Section title="Not yet available">
        <p className="muted">
          Sales, customer segments, category decisions and a one-page brief are built only for the profiled stores so far.
        </p>
      </Section>

      {nearest && (
        <Section title="Nearest profiled store">
          <button type="button" className="entry-card" onClick={() => onSelect(nearest.store.id)}>
            <strong>{nearest.store.shortName}</strong>
            <span>
              {nearest.store.banner} {nearest.store.number}, {formatDistance(nearest.km)} away
            </span>
            <span aria-hidden="true" className="entry-card__chevron">
              ›
            </span>
          </button>
        </Section>
      )}
    </>
  );
}
