import type { Store } from '../data/types';

interface Props {
  stores: Store[];
  /** The selected store, or null when a page that is not about one store is open. */
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCompare: () => void;
  /** Opens the network overlap page; the tab is left out without it. */
  onNetwork?: () => void;
  /** Which multi-store page is open. Without it, a null selectedId means the compare page. */
  page?: 'compare' | 'network';
}

/** Keyboard-friendly alternative to clicking map pins, plus the pages that look at several stores. */
export function StoreSwitcher({ stores, selectedId, onSelect, onCompare, onNetwork, page }: Props) {
  const open = page ?? (selectedId === null ? 'compare' : undefined);
  return (
    <div className="segmented" role="tablist" aria-label="Select store">
      {stores.map((s) => (
        <button key={s.id} role="tab" aria-selected={!open && s.id === selectedId} onClick={() => onSelect(s.id)}>
          {s.shortName}
        </button>
      ))}
      <button role="tab" aria-selected={open === 'compare'} onClick={onCompare}>
        Compare
      </button>
      {onNetwork && (
        <button role="tab" aria-selected={open === 'network'} onClick={onNetwork}>
          Network
        </button>
      )}
    </div>
  );
}
