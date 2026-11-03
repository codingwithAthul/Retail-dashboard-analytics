export type Tab = 'overview' | 'demographics' | 'sales' | 'competitors';

export const TABS: { id: Tab; label: string; blurb: string }[] = [
  { id: 'overview', label: 'Overview', blurb: '' },
  { id: 'demographics', label: 'Demographics', blurb: 'Who shops here and why they come back' },
  { id: 'sales', label: 'Sales', blurb: 'What sells, how much, and the trend' },
  { id: 'competitors', label: 'Competitors', blurb: 'Who nearby sells the same things' },
];

interface Props {
  current: Tab;
  onChange: (tab: Tab) => void;
}

export function TabNav({ current, onChange }: Props) {
  return (
    <div className="segmented" role="tablist" aria-label="Store view">
      {TABS.map((t) => (
        <button key={t.id} role="tab" aria-selected={t.id === current} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
