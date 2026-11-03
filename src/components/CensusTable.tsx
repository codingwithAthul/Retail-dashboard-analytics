import type { CensusProfile } from '../data/census';
import { SourceLinks } from './SourceLinks';

/** The census measures for an area next to Metro Vancouver, with the source line. */
export function CensusTable({ census }: { census: CensusProfile }) {
  return (
    <>
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
        <SourceLinks ids={census.sources} />.{census.note && ` ${census.note}`}
      </p>
    </>
  );
}
