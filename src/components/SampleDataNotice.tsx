import { ConfidenceBadge } from './ConfidenceBadge';

/** Shown on every view that uses synthetic numbers. */
export function SampleDataNotice({ children }: { children?: string }) {
  return (
    <div className="notice" role="note">
      <ConfidenceBadge level="sample" />
      <span>
        {children ??
          'Synthetic figures for demonstration only. Not real store sales. Real data would come from the store’s point-of-sale and pharmacy systems.'}
      </span>
    </div>
  );
}
