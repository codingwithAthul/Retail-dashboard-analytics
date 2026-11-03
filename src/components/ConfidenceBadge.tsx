import type { Confidence } from '../data/types';

const LABELS: Record<Confidence, { text: string; title: string; className: string }> = {
  verified: { text: 'Verified', title: 'Stated by a cited public source', className: 'badge--verified' },
  inferred: { text: 'Inferred', title: 'Reasoned from verified facts; see /Research', className: 'badge--estimate' },
  estimate: { text: 'Estimate', title: 'Estimated share, not measured', className: 'badge--estimate' },
  sample: { text: 'Sample data', title: 'Synthetic data for demonstration, not real store data', className: 'badge--sample' },
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const { text, title, className } = LABELS[level];
  return (
    <span className={`badge ${className}`} title={title}>
      {text}
    </span>
  );
}
