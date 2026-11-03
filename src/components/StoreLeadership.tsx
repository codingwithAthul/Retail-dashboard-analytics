import type { LeadershipRole } from '../data/types';
import { Section } from './Section';

export function StoreLeadership({ roles }: { roles: LeadershipRole[] }) {
  return (
    <Section title="Store Leadership" aside={<span className="badge">To be filled</span>}>
      <dl className="rows">
        {roles.map((r) => (
          <div className="row" key={r.role}>
            <dt>{r.role}</dt>
            <dd className={r.name ? undefined : 'placeholder'}>{r.name ?? 'Not yet added'}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
