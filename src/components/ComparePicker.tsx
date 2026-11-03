import type { Store } from '../data/types';

interface Props {
  stores: Store[];
  a: Store;
  b: Store;
  onChange: (a: string, b: string) => void;
  /** How many more stores are on the map but cannot be compared yet. */
  notComparable?: number;
}

/** Choose the two stores to compare. A store cannot be compared with itself. */
export function ComparePicker({ stores, a, b, onChange, notComparable = 0 }: Props) {
  const select = (side: 'a' | 'b', current: Store, other: Store) => (
    <label className="picker__field">
      <span className="picker__label">{side === 'a' ? 'Store' : 'Compared with'}</span>
      <select
        className="picker__select"
        value={current.id}
        onChange={(e) => (side === 'a' ? onChange(e.target.value, b.id) : onChange(a.id, e.target.value))}
      >
        {stores.map((s) => (
          <option key={s.id} value={s.id} disabled={s.id === other.id}>
            {s.shortName} ({s.number})
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="picker" role="group" aria-label="Stores to compare">
      {select('a', a, b)}
      <button type="button" className="button button--plain picker__swap" onClick={() => onChange(b.id, a.id)} aria-label="Swap stores">
        ⇄
      </button>
      {select('b', b, a)}
      {notComparable > 0 && (
        <p className="picker__note muted">
          Only stores with a full profile can be compared. {notComparable} directory stores join once their profiles are
          generated.
        </p>
      )}
    </div>
  );
}
