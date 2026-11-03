interface Props {
  label: string;
  value: string;
  delta?: { text: string; positive: boolean };
  note?: string;
}

export function KpiTile({ label, value, delta, note }: Props) {
  return (
    <div className="card kpi">
      <p className="eyebrow">{label}</p>
      <p className="kpi__value">{value}</p>
      {delta && (
        <p className={`kpi__delta ${delta.positive ? 'is-up' : 'is-down'}`}>
          <span aria-hidden="true">{delta.positive ? '▲' : '▼'}</span> {delta.text}
        </p>
      )}
      {note && <p className="kpi__note">{note}</p>}
    </div>
  );
}
