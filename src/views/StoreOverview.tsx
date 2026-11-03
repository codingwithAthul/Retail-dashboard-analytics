import { KeyDifferentiators } from '../components/KeyDifferentiators';
import { Section } from '../components/Section';
import { StoreLeadership } from '../components/StoreLeadership';
import { TABS, type Tab } from '../components/TabNav';
import type { Store } from '../data/types';

interface Props {
  store: Store;
  onOpen: (tab: Tab) => void;
}

export function StoreOverview({ store, onOpen }: Props) {
  return (
    <>
      <header>
        <p className="eyebrow">
          {store.banner} {store.number}
        </p>
        <h2>{store.shortName}</h2>
        <p className="muted">{store.address}</p>
        <div className="chips">
          <span className="chip">{store.format}</span>
          <span className="chip">{store.hours}</span>
          <span className="chip">{store.phone}</span>
        </div>
      </header>

      <Section title="Summary">
        <ul className="bullets">
          {store.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Section>

      <nav className="entry-cards" aria-label="Analytics">
        {TABS.filter((t) => t.id !== 'overview').map((t) => (
          <button key={t.id} className="entry-card" onClick={() => onOpen(t.id)}>
            <strong>{t.label}</strong>
            <span>{t.blurb}</span>
            <span aria-hidden="true" className="entry-card__chevron">›</span>
          </button>
        ))}
      </nav>

      <KeyDifferentiators facts={store.differentiators} />
      <StoreLeadership roles={store.leadership} />

      <Section title="Pharmacy Services">
        <div className="chips">
          {store.services.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}
