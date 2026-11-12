import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { Neighbours } from '../data/neighbours';
import { ConfidenceBadge } from './ConfidenceBadge';
import { DecisionBadge } from './DecisionBadge';

export type NeighbourTab = 'store' | 'nearby' | 'stock' | 'notes';

const LABELS: Record<NeighbourTab, string> = {
  store: 'Store',
  nearby: 'Nearby',
  stock: 'What to stock',
  notes: 'Stock notes',
};

interface Props {
  data: Neighbours;
  /** On phones the store details share the sheet, as the first tab. */
  store?: ReactNode;
}

/** Nearby stores, what to stock because of them, and what the census suggests, one tab each. */
export function NeighbourPanel({ data, store }: Props) {
  const tabs: NeighbourTab[] = store ? ['store', 'nearby', 'stock', 'notes'] : ['nearby', 'stock', 'notes'];
  const [current, setCurrent] = useState<NeighbourTab>(tabs[0]);
  const shown = tabs.includes(current) ? current : tabs[0];
  const base = useId();
  const tabId = (t: NeighbourTab) => `${base}-tab-${t}`;
  const panelId = (t: NeighbourTab) => `${base}-panel-${t}`;

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = tabs[(tabs.indexOf(shown) + step + tabs.length) % tabs.length];
    setCurrent(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <div className="neighbours">
      <div className="segmented neighbours__tabs" role="tablist" aria-label="Neighbours and stock">
        {tabs.map((t) => (
          <button
            key={t}
            id={tabId(t)}
            type="button"
            role="tab"
            aria-selected={t === shown}
            aria-controls={panelId(t)}
            tabIndex={t === shown ? 0 : -1}
            onClick={() => setCurrent(t)}
            onKeyDown={onKey}
          >
            {LABELS[t]}
          </button>
        ))}
      </div>

      <div className="neighbours__body" id={panelId(shown)} role="tabpanel" aria-labelledby={tabId(shown)}>
        {shown === 'store' && store}
        {shown === 'nearby' && <NearbyList data={data} />}
        {shown === 'stock' && <StockCalls data={data} />}
        {shown === 'notes' && <StockNotes data={data} />}
      </div>
    </div>
  );
}

function NearbyList({ data }: { data: Neighbours }) {
  return (
    <>
      <div className="section__head">
        <h3>Within a 10-minute walk</h3>
        <ConfidenceBadge level="verified" />
      </div>
      <p className="muted">{data.summary}</p>
      {data.rows.length > 0 && (
        <ul className="place-list" aria-label="Nearby places">
          {data.rows.map((r) => (
            <li key={r.id} className="place">
              <div className="place__head">
                <span className="place__name">
                  {r.href ? (
                    <a href={r.href} target="_blank" rel="noreferrer">
                      {r.name}
                    </a>
                  ) : (
                    r.name
                  )}
                  {r.loblaw && <span className="chip chip--small">Loblaw</span>}
                </span>
                <span className="place__distance">{r.distanceM} m</span>
              </div>
              <p className="place__sells">
                {r.kind !== r.mainlySells && <span className="place__kind">{r.kind} · </span>}
                {r.mainlySells}
                {r.basisNote && <span className="place__basis"> ({r.basisNote})</span>}
                {r.source && (
                  <>
                    {' '}
                    <a href={r.source.url} target="_blank" rel="noreferrer" aria-label={`Source: ${r.source.title}`}>
                      [source]
                    </a>
                  </>
                )}
              </p>
              {r.categories.length > 0 && (
                <p className="place__drives">
                  {r.categoriesLabel}: {r.categories.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="footnote">{data.footnote}</p>
    </>
  );
}

function StockCalls({ data }: { data: Neighbours }) {
  return (
    <>
      <div className="section__head">
        <h3>What to stock, given the neighbours</h3>
        <ConfidenceBadge level="inferred" />
      </div>
      <p className="muted">{data.callsNote}</p>
      <table className="table calls-table">
        <caption className="visually-hidden">Stock calls by category, from the places nearby</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Call and why</th>
          </tr>
        </thead>
        <tbody>
          {data.calls.map((c) => (
            <tr key={c.category}>
              <th scope="row">{c.category}</th>
              <td>
                <DecisionBadge decision={c.decision} />
                <span className="calls-table__rival">{c.rival}</span>
                <span className="calls-table__reason">{c.reason}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function StockNotes({ data }: { data: Neighbours }) {
  return (
    <>
      <div className="section__head">
        <h3>What the neighbourhood suggests</h3>
        <ConfidenceBadge level="inferred" />
      </div>
      <p className="muted">
        From the 2021 census for {data.notesArea}, where it differs clearly from Metro Vancouver. Rules of thumb to check
        against sales, not sales results.
      </p>
      {data.notes.length === 0 ? (
        <p>Close to the Metro Vancouver average on every measure checked, so the census suggests no change to the usual range.</p>
      ) : (
        <ul className="note-list">
          {data.notes.map((n) => (
            <li key={n.title} className="note">
              <strong>{n.title}</strong>
              <p>{n.detail}</p>
              <p className="note__evidence">{n.evidence}</p>
              <p className="place__drives">Categories: {n.categories.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
