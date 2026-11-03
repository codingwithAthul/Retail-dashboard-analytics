import { CensusTable } from '../components/CensusTable';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { Section } from '../components/Section';
import { ShareBars } from '../components/ShareBars';
import { fsaCensus } from '../data/fsaCensus';
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

      <Section title="Not yet available">
        <p className="muted">
          Sales, customer segments, competitors and a one-page brief arrive once this store's profile is built from map
          data.
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
