import type { Store } from '../data/types';

interface Props {
  stores: Store[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Keyboard-friendly alternative to clicking map pins. */
export function StoreSwitcher({ stores, selectedId, onSelect }: Props) {
  return (
    <div className="segmented" role="tablist" aria-label="Select store">
      {stores.map((s) => (
        <button key={s.id} role="tab" aria-selected={s.id === selectedId} onClick={() => onSelect(s.id)}>
          {s.shortName}
        </button>
      ))}
    </div>
  );
}
