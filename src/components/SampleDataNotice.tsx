import type { Confidence } from '../data/types';
import { ConfidenceBadge } from './ConfidenceBadge';

interface Props {
  level?: Extract<Confidence, 'sample' | 'estimate'>;
  children?: string;
}

/** Shown on every view that uses synthetic or estimated numbers. */
export function SampleDataNotice({ level = 'sample', children }: Props) {
  return (
    <div className={`notice notice--${level}`} role="note">
      <ConfidenceBadge level={level} />
      <span>
        {children ??
          'Synthetic figures for demonstration only. Not real store sales. Real data would come from the store’s point-of-sale and pharmacy systems.'}
      </span>
    </div>
  );
}
