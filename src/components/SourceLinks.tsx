import { getSource } from '../data/sources';

/** Small numbered links to the public sources behind a fact. */
export function SourceLinks({ ids }: { ids?: string[] }) {
  if (!ids?.length) return null;
  return (
    <span className="sources">
      {ids.map((id, i) => {
        const s = getSource(id);
        return (
          <a key={id} href={s.url} target="_blank" rel="noreferrer" title={s.title}>
            [{i + 1}]
          </a>
        );
      })}
    </span>
  );
}
