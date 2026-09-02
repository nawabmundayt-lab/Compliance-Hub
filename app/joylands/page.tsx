'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, ExportMenu, FilterBar, Filters, KpiCard, Loading,
  ProgressBar, SectionTitle, applyDocFilters,
} from '@/components/ui';
import { KindDonut, SimpleBars, CHART_COLORS } from '@/components/charts';
import { Facility } from '@/lib/types';
import { compliancePct } from '@/lib/compliance';

export default function JoylandsPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});

  const joylands = useMemo(() => (data?.facilities ?? []).filter((f) => f.type === 'joyland'), [data]);
  const options = useMemo(() => ({
    divisions: [...new Set(joylands.map((f) => f.division))].sort(),
    districts: [...new Set(joylands.map((f) => f.district))].sort(),
    tehsils: [...new Set(joylands.map((f) => f.tehsil))].sort(),
  }), [joylands]);

  const filtered = useMemo(() => joylands.filter((f) =>
    (!filters.division || f.division === filters.division) &&
    (!filters.district || f.district === filters.district) &&
    (!filters.tehsil || f.tehsil === filters.tehsil) &&
    (!filters.kind || f.joylandKind === filters.kind)
  ), [joylands, filters]);

  const docsFor = (f: Facility) => (data?.documents ?? []).filter((d) => d.facilityId === f.id);

  // charts data from filtered set
  const byDiv = useMemo(() => {
    const map = new Map<string, { name: string; Large: number; Mini: number }>();
    for (const f of filtered) {
      const e = map.get(f.division) ?? { name: f.division || '—', Large: 0, Mini: 0 };
      if (f.joylandKind === 'Large') e.Large++; else e.Mini++;
      map.set(f.division, e);
    }
    return [...map.values()].sort((a, b) => b.Large + b.Mini - (a.Large + a.Mini));
  }, [filtered]);
  const byDistrict = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((f) => map.set(f.district, (map.get(f.district) ?? 0) + 1));
    return [...map.entries()].map(([name, v]) => ({ name, Joylands: v })).sort((a, b) => b.Joylands - a.Joylands).slice(0, 12);
  }, [filtered]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const large = filtered.filter((f) => f.joylandKind === 'Large').length;
  const mini = filtered.length - large;
  const allDocs = filtered.flatMap((f) => docsFor(f));
  const valid = allDocs.filter((d) => d.status === 'VALID').length;
  const expired = allDocs.filter((d) => d.status === 'EXPIRED').length;
  const near = allDocs.filter((d) => ['CRITICAL', 'NEAR_EXPIRY'].includes(d.status)).length;
  const pct = compliancePct(valid, allDocs.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Joyland Module</h1>
          <p className="text-sm text-gray-500">Large / Mini classification · rides · fitness certificate monitoring (§2–§6)</p>
        </div>
        <ExportMenu preset="joyland-register" />
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} showKind />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Total Joylands" value={filtered.length} sub="= Large + Mini" />
        <KpiCard label="Large Joylands" value={large} />
        <KpiCard label="Mini Joylands" value={mini} />
        <KpiCard label="Total Rides" value={filtered.reduce((a, f) => a + (f.totalRides ?? 0), 0)} />
        <KpiCard label="Fitness Compliance" value={`${pct}%`} sub={`${valid} valid · ${near} near · ${expired} expired`} tone={pct >= 80 ? 'green' : pct >= 60 ? 'orange' : 'red'} />
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="uppercase tracking-wider text-brand-green">Fitness Certificate Compliance (Valid ÷ Total × 100)</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar pct={pct} height={14} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-1">Large vs Mini (filtered)</p>
          <KindDonut large={large} mini={mini} />
        </div>
        <div className="card p-4">
          <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-1">Joylands by Division</p>
          <SimpleBars data={byDiv} xKey="name" bars={[{ key: 'Large', color: CHART_COLORS.green, stack: true }, { key: 'Mini', color: CHART_COLORS.gold, stack: true }]} height={260} />
        </div>
        <div className="card p-4">
          <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-1">Joylands by District (top 12)</p>
          <SimpleBars data={byDistrict} xKey="name" bars={[{ key: 'Joylands', color: CHART_COLORS.teal }]} height={260} layout="vertical" />
        </div>
      </div>

      <SectionTitle>Joyland Register</SectionTitle>
      <DataTable<Facility>
        rows={filtered}
        pageSize={14}
        columns={[
          { key: 'name', label: 'Joyland Name', render: (f) => <span className="font-bold text-brand-green">{f.name}</span> },
          { key: 'joylandKind', label: 'Type', render: (f) => <span className={`badge ${f.joylandKind === 'Large' ? 'badge-valid' : 'badge-near'}`}>{f.joylandKind ?? '—'}</span> },
          { key: 'division', label: 'Division' },
          { key: 'district', label: 'District' },
          { key: 'tehsil', label: 'Tehsil' },
          { key: 'totalRides', label: 'Rides', sortVal: (f) => f.totalRides ?? 0, render: (f) => <b>{f.totalRides ?? 0}</b> },
          { key: 'activeRides', label: 'Active', sortVal: (f) => f.activeRides ?? 0 },
          {
            key: 'certs', label: 'Certificates (V/N/E)',
            render: (f) => {
              const docs = docsFor(f);
              const v = docs.filter((d) => d.status === 'VALID').length;
              const n = docs.filter((d) => ['CRITICAL', 'NEAR_EXPIRY', 'UPCOMING'].includes(d.status)).length;
              const e = docs.filter((d) => d.status === 'EXPIRED').length;
              return <span className="text-xs font-bold"><span style={{ color: CHART_COLORS.teal }}>{v}</span> / <span style={{ color: CHART_COLORS.golddark }}>{n}</span> / <span style={{ color: CHART_COLORS.red }}>{e}</span></span>;
            },
          },
          { key: 'location', label: 'Address', render: (f) => <span className="text-xs text-gray-600">{f.location}</span> },
          { key: 'remarks', label: 'Remarks', render: (f) => <span className="text-xs text-gray-500">{f.remarks || '—'}</span> },
        ]}
      />
    </div>
  );
}
