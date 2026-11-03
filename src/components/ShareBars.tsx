import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Segment } from '../data/types';
import { percent } from '../lib/format';

interface Props {
  data: Segment[];
  label: string;
  color?: string;
  height?: number;
}

/** Horizontal bars for shares (0..1), with a screen-reader summary. */
export function ShareBars({ data, label, color = 'var(--indigo)', height = 220 }: Props) {
  const summary = data.map((d) => `${d.name} ${percent(d.share)}`).join(', ');
  return (
    <div className="chart" role="img" aria-label={`${label}: ${summary}.`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="name" width={170} stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(v) => percent(Number(v))}
            cursor={{ fill: 'var(--surface-2)' }}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--separator)', borderRadius: 10, fontSize: 13 }}
          />
          <Bar
            dataKey="share"
            name="Share"
            fill={color}
            radius={[0, 6, 6, 0]}
            barSize={16}
            isAnimationActive={false}
            label={{ position: 'right', formatter: (v: unknown) => percent(Number(v)), fontSize: 12, fill: 'var(--text-2)' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
