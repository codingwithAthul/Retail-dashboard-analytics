import type { ReactNode } from 'react';

interface Props {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

/** Titled group of related content (HIG: group related items). */
export function Section({ title, aside, children }: Props) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className="section" aria-labelledby={id}>
      <div className="section__head">
        <h3 id={id}>{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}
