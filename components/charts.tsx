'use client';

import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

export const CHART_COLORS = {
  green: '#0A3B1E', green2: '#14522A', teal: '#0D6B5E', gold: '#F4B942',
  golddark: '#E0A82E', mint: '#C8E6D9', blue: '#2155A3', orange: '#D97706',
  red: '#BC3A3A', grey: '#6B7280', amber: '#B45309',
};

const TOOLTIP_STYLE = {
  borderRadius: 12, border: '2px solid #C8E6D9', fontSize: 12,
  fontWeight: 600 as const, background: '#fff',
};

export function KindDonut({ large, mini }: { large: number; mini: number }) {
  const data = [
    { name: 'Large Joylands', value: large, color: CHART_COLORS.green },
    { name: 'Mini Joylands', value: mini, color: CHART_COLORS.gold },
  ];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3} strokeWidth={0}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusStack({ title, counts }: {
  title?: string;
  counts: { valid: number; upcoming: number; near: number; critical: number; expired: number; missing: number };
}) {
  const data = [{
    name: title ?? 'Documents',
    Valid: counts.valid, Upcoming: counts.upcoming, 'Near Expiry': counts.near,
    Critical: counts.critical, Expired: counts.expired, Missing: counts.missing,
  }];
  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="Valid" stackId="s" fill={CHART_COLORS.teal} radius={[8, 0, 0, 8]} />
        <Bar dataKey="Upcoming" stackId="s" fill={CHART_COLORS.blue} />
        <Bar dataKey="Near Expiry" stackId="s" fill={CHART_COLORS.gold} />
        <Bar dataKey="Critical" stackId="s" fill={CHART_COLORS.orange} />
        <Bar dataKey="Expired" stackId="s" fill={CHART_COLORS.red} />
        <Bar dataKey="Missing" stackId="s" fill={CHART_COLORS.grey} radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleBars({ data, xKey, bars, height = 260, layout = 'horizontal' }: {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; color: string; stack?: boolean }[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
}) {
  const vertical = layout === 'vertical';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, left: vertical ? 8 : 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4EDE5" />
        {vertical ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fontWeight: 700, fill: '#0A3B1E' }} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fontWeight: 700, fill: '#0A3B1E' }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} fill={b.color} stackId={b.stack ? 'x' : undefined} radius={b.stack ? undefined : [6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
