import type { Store } from '../data/types';

interface Props {
  stores: Store[];
  /** The selected store, or null when the compare page is open. */
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCompare: () => void;
}

/** Keyboard-friendly alternative to clicking map pins, plus a way to compare stores. */
export function StoreSwitcher({ stores, selectedId, onSelect, onCompare }: Props) {
  return (
    <div className="segmented" role="tablist" aria-label="Select store">
      {stores.map((s) => (
        <button key={s.id} role="tab" aria-selected={s.id === selectedId} onClick={() => onSelect(s.id)}>
          {s.shortName}
        </button>
      ))}
      <button role="tab" aria-selected={selectedId === null} onClick={onCompare}>
        Compare
      </button>
    </div>
  );
}
