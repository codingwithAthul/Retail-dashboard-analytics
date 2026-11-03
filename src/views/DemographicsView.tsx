import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { KpiTile } from '../components/KpiTile';
import { SampleDataNotice } from '../components/SampleDataNotice';
import { ShareBars } from '../components/ShareBars';
import { SourceLinks } from '../components/SourceLinks';
import type { Store } from '../data/types';
import { percent } from '../lib/format';

export function DemographicsView({ store }: { store: Store }) {
  const d = store.demographics;
  const [first, second] = [...d.segments].sort((a, b) => b.share - a.share);

  return (
    <>
      <SampleDataNotice level="estimate">
        Segment and age shares are estimates built from public research, not measured counts. Confirm with PC Optimum loyalty data.
      </SampleDataNotice>

      <div className="grid">
        <div className="span-4">
          <KpiTile label="Most present" value={first.name} note={`About ${percent(first.share)} of customers (estimate)`} />
        </div>
        <div className="span-4">
          <KpiTile label="Second most present" value={second.name} note={`About ${percent(second.share)} of customers (estimate)`} />
        </div>
        <div className="span-4">
          <KpiTile label="Income tier" value={d.incomeTier.value.split(' (')[0].split(';')[0]} note={d.incomeTier.value} />
        </div>
      </div>

      <div className="grid">
        <section className="card span-6" aria-labelledby="seg-title">
          <h3 id="seg-title">
            Customer segments <ConfidenceBadge level="estimate" />
          </h3>
          <p className="takeaway">
            {first.name} and {second.name.toLowerCase()} make up about {percent(first.share + second.share)} of visits.
          </p>
          <ShareBars data={d.segments} label="Customer segments" />
        </section>

        <section className="card span-6" aria-labelledby="age-title">
          <h3 id="age-title">
            Age profile <ConfidenceBadge level="estimate" />
          </h3>
          <p className="takeaway">{d.seasonality}</p>
          <ShareBars data={d.ageBands} label="Age profile" color="var(--teal)" />
        </section>
      </div>

      <div className="grid">
        <section className="card span-4" aria-labelledby="drivers-title">
          <h3 id="drivers-title">Why they come back</h3>
          <ul className="bullets">
            {d.drivers.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>

        <section className="card span-4" aria-labelledby="nearby-title">
          <h3 id="nearby-title">What is nearby</h3>
          <dl className="rows">
            {d.nearby.map((n) => (
              <div className="row row--stacked" key={n.name}>
                <dt>
                  {n.name} <span className="chip">{n.kind}</span>
                </dt>
                <dd className="muted">{n.note}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="card span-4" aria-labelledby="facts-title">
          <h3 id="facts-title">Area facts</h3>
          <dl className="rows">
            {d.facts.map((f) => (
              <div className="row" key={f.label}>
                <dt>{f.label}</dt>
                <dd>
                  {f.value}
                  <SourceLinks ids={f.sources} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
