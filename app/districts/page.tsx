'use client';

import React, { useMemo } from 'react';
import { useData } from '@/components/providers';
import { DataTable, ErrorBox, ExportMenu, Loading, ProgressBar, SectionTitle } from '@/components/ui';
import { SimpleBars, CHART_COLORS } from '@/components/charts';
import { districtRollup, divisionRollup } from '@/lib/stats';

export default function DistrictsPage() {
  const { data, loading, error } = useData();
  const districts = useMemo(() => (data ? districtRollup(data) : []), [data]);
  const divisions = useMemo(() => (data ? divisionRollup(data) : []), [data]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const lowest = [...districts].sort((a, b) => a.compliancePct - b.compliancePct).slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">District &amp; Division Analysis</h1>
          <p className="text-sm text-gray-500">Geographic compliance breakdown (§18–§19) — sorted by weakest overall compliance</p>
        </div>
        <ExportMenu preset="district-summary" />
      </div>

      <div className="card p-4">
        <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-2">Lowest-compliance districts (top 10 by risk)</p>
        <SimpleBars data={lowest.map((d) => ({ name: d.district, 'Overall %': d.compliancePct }))} xKey="name"
          bars={[{ key: 'Overall %', color: CHART_COLORS.red }]} height={260} layout="vertical" />
      </div>

      <SectionTitle>District-wise Analysis (§18)</SectionTitle>
      <DataTable
        rows={districts.map((d) => ({ ...d, id: d.district }))}
        pageSize={15}
        columns={[
          { key: 'district', label: 'District', render: (r) => <span className="font-bold text-brand-green">{r.district}</span> },
          { key: 'division', label: 'Division' },
          { key: 'large', label: 'Large Joy.', sortVal: (r) => r.large },
          { key: 'mini', label: 'Mini Joy.', sortVal: (r) => r.mini },
          { key: 'rides', label: 'Rides', sortVal: (r) => r.rides },
          { key: 'expiredCerts', label: 'Exp. Certs', sortVal: (r) => r.expiredCerts, render: (r) => <b style={{ color: '#BC3A3A' }}>{r.expiredCerts}</b> },
          { key: 'nearCerts', label: 'Near Certs', sortVal: (r) => r.nearCerts, render: (r) => <b style={{ color: '#B45309' }}>{r.nearCerts}</b> },
          { key: 'foodCourts', label: 'Food Courts', sortVal: (r) => r.foodCourts },
          { key: 'expiredPfa', label: 'Exp. PFA', sortVal: (r) => r.expiredPfa, render: (r) => <b style={{ color: '#BC3A3A' }}>{r.expiredPfa}</b> },
          { key: 'parking', label: 'Parking', sortVal: (r) => r.parking },
          { key: 'expiredAgreements', label: 'Exp. Agr.', sortVal: (r) => r.expiredAgreements, render: (r) => <b style={{ color: '#BC3A3A' }}>{r.expiredAgreements}</b> },
          { key: 'compliancePct', label: 'Overall %', sortVal: (r) => r.compliancePct, render: (r) => (
            <div className="flex items-center gap-2 min-w-[110px]"><ProgressBar pct={r.compliancePct} height={8} /><b className="text-xs">{r.compliancePct}%</b></div>
          )},
        ]}
      />

      <SectionTitle>Division-wise Analysis (§19)</SectionTitle>
      <DataTable
        rows={divisions.map((d) => ({ ...d, id: d.division }))}
        pageSize={10}
        columns={[
          { key: 'division', label: 'Division', render: (r) => <span className="font-bold text-brand-green">{r.division}</span> },
          { key: 'joylands', label: 'Joylands', sortVal: (r) => r.joylands },
          { key: 'foodCourts', label: 'Food Courts', sortVal: (r) => r.foodCourts },
          { key: 'parking', label: 'Parking Stands', sortVal: (r) => r.parking },
          { key: 'fitnessPct', label: 'Fitness Cert. %', sortVal: (r) => r.fitnessPct, render: (r) => <b>{r.fitnessPct}%</b> },
          { key: 'pfaPct', label: 'PFA %', sortVal: (r) => r.pfaPct, render: (r) => <b>{r.pfaPct}%</b> },
          { key: 'agreementPct', label: 'Agreement %', sortVal: (r) => r.agreementPct, render: (r) => <b>{r.agreementPct}%</b> },
        ]}
      />
    </div>
  );
}
