import type { Decision } from '../data/types';

const STYLE: Record<Decision, { icon: string; className: string }> = {
  Compete: { icon: '●', className: 'badge--verified' },
  Differentiate: { icon: '◆', className: 'badge--estimate' },
  Avoid: { icon: '✕', className: 'badge--avoid' },
};

/** Decision shown with an icon and a word, never colour alone (HIG). */
export function DecisionBadge({ decision }: { decision: Decision }) {
  const { icon, className } = STYLE[decision];
  return (
    <span className={`badge ${className}`}>
      <span aria-hidden="true">{icon}</span>
      {decision}
    </span>
  );
}
