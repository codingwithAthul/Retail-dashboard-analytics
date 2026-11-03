import { useId, useMemo, useState } from 'react';
import { hasProfile, matchesQuery } from '../data/directory';
import type { StoreListing } from '../data/types';

interface Props {
  stores: StoreListing[];
  onSelect: (id: string) => void;
}

const MAX_RESULTS = 8;

/** Find any store by number, name, street, postal code or local area. */
export function StoreSearch({ stores, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const matches = useMemo(() => (query.trim() ? stores.filter((s) => matchesQuery(s, query)) : []), [stores, query]);
  const shown = matches.slice(0, MAX_RESULTS);
  const open = query.trim().length > 0;

  const choose = (id: string) => {
    onSelect(id);
    setQuery('');
    setActive(0);
  };

  return (
    <div className="search">
      <input
        type="search"
        className="search__input"
        placeholder={`Find a store (${stores.length})`}
        aria-label="Find a store by number, name, street or area"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && shown[active] ? `${listId}-${shown[active].id}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, shown.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && shown[active]) {
            e.preventDefault();
            choose(shown[active].id);
          } else if (e.key === 'Escape') {
            setQuery('');
          }
        }}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label="Matching stores" className="search__results glass">
          {shown.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${s.id}`}
              role="option"
              aria-selected={i === active}
              className="search__option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(s.id)}
            >
              <span className="search__name">
                {s.shortName} <span className="muted">#{s.id}</span>
                {hasProfile(s) && <span className="chip">Profile</span>}
              </span>
              <span className="search__address">{s.address}</span>
            </li>
          ))}
          {shown.length === 0 && <li className="search__empty">No store matches “{query}”</li>}
          {matches.length > MAX_RESULTS && (
            <li className="search__empty">
              {matches.length - MAX_RESULTS} more; keep typing to narrow
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
