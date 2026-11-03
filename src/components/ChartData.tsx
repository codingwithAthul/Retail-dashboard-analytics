interface Props {
  caption: string;
  headers: string[];
  rows: (string | number)[][];
}

/** Collapsible table with the numbers behind a chart, for screen readers and exact values. */
export function ChartData({ caption, headers, rows }: Props) {
  return (
    <details className="chart-data">
      <summary>Show data</summary>
      <table className="table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={h} className={i > 0 ? 'num' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])}>
              {r.map((cell, i) => (
                <td key={i} className={i > 0 ? 'num' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
