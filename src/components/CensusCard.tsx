import type { CensusProfile } from '../data/census';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ShareBars } from './ShareBars';
import { SourceLinks } from './SourceLinks';

/** Official 2021 census figures for the store's area, next to Metro Vancouver. */
export function CensusCard({ census }: { census: CensusProfile }) {
  const age = census.measures.find((m) => m.label === 'Median age');
  return (
    <div className="grid">
      <section className="card span-6" aria-labelledby="census-title">
        <h3 id="census-title">
          {census.year} census: {census.area} <ConfidenceBadge level="verified" />
        </h3>
        <p className="takeaway">
          Census subdivision {census.code}: {census.coverage}.
          {age && ` Median age ${age.area}, against ${age.metro} for Metro Vancouver.`}
        </p>
        <table className="table">
          <caption className="visually-hidden">
            {census.year} census, {census.area} compared with Metro Vancouver
          </caption>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              <th scope="col" className="num">
                {census.area}
              </th>
              <th scope="col" className="num">
                Metro Vancouver
              </th>
            </tr>
          </thead>
          <tbody>
            {census.measures.map((m) => (
              <tr key={m.label}>
                <th scope="row">{m.label}</th>
                <td className="num">{m.area}</td>
                <td className="num">{m.metro}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="footnote">
          Source: Statistics Canada, 2021 Census of Population
          <SourceLinks ids={census.sources} />. Low income counts students with little reported income.
        </p>
      </section>

      <section className="card span-6" aria-labelledby="census-age-title">
        <h3 id="census-age-title">
          Residents by age (census) <ConfidenceBadge level="verified" />
        </h3>
        <p className="takeaway">Residents, not shoppers: the store's customers also include commuters and visitors.</p>
        <ShareBars data={census.ageBands} label="Residents by age, 2021 census" color="var(--teal)" />
      </section>
    </div>
  );
}
