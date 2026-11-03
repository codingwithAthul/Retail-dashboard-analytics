import type { Fact } from '../data/types';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Section } from './Section';

export function KeyDifferentiators({ facts }: { facts: Fact[] }) {
  return (
    <Section title="Key Differentiators">
      <dl className="rows">
        {facts.map((f) => (
          <div className="row row--stacked" key={f.label}>
            <dt>
              {f.label} <ConfidenceBadge level={f.confidence} />
            </dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
