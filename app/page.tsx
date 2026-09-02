'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, ExportMenu, KpiCard, Loading, ProgressBar,
  RefreshCallout, SectionTitle, StatusBadge,
} from '@/components/ui';
import { KindDonut, SimpleBars, StatusStack, CHART_COLORS } from '@/components/charts';
import { actionList, computeStats, divisionRollup } from '@/lib/stats';
import { DOC_LABEL, ComplianceDoc } from '@/lib/types';
import { fmtDate } from '@/lib/compliance';

export default function ExecutiveDashboard() {
  const { data, loading, error } = useData();
  const stats = useMemo(() => (data ? computeStats(data) : null), [data]);
  const divisions = useMemo(() => (data ? divisionRollup(data) : []), [data]);
  const urgent = useMemo(() => (data ? actionList(data.documents, 8) : []), [data]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data || !stats) return <Loading />;

  const s = stats;
  const moduleBars = [
    { name: 'Joyland Certificates', Compliance: s.joyland.compliancePct },
    { name: 'PFA Licenses', Compliance: s.foodCourt.compliancePct },
    { name: 'Parking Agreements', Compliance: s.parking.compliancePct },
  ];

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Executive Dashboard</h1>
          <p className="text-sm text-gray-500">Punjab-wide compliance overview · Joylands · Food Courts · Parking Stands</p>
        </div>
        <div className="flex gap-2"><RefreshCallout /><ExportMenu /></div>
      </div>

      {/* overall compliance strip */}
      <div className="card p-5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-center">
          <div>
            <p className="kpi-label">Overall Compliance Score</p>
            <p className="font-display text-5xl text-brand-green">{s.overallPct}%</p>
            <p className="text-xs mt-1 font-semibold" style={{ color: s.overallPct >= 80 ? CHART_COLORS.teal : s.overallPct >= 60 ? CHART_COLORS.amber : CHART_COLORS.red }}>
              {s.overallPct >= 80 ? '✔ Healthy' : s.overallPct >= 60 ? '⚠ Needs attention' : '✖ Critical'}
            </p>
          </div>
          {[
            { label: 'Joyland Fitness', pct: s.joyland.compliancePct },
            { label: 'Food Court PFA', pct: s.foodCourt.compliancePct },
            { label: 'Parking Agreements', pct: s.parking.compliancePct },
          ].map((m) => (
            <div key={m.label} className={`p-3 rounded-xl border-2 ${m.label === s.weakest.label ? 'border-status-expired/50 bg-[#FBE1DE]/40' : 'border-black/5'}`}>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-brand-green">{m.label}</span><span>{m.pct}%</span>
              </div>
              <ProgressBar pct={m.pct} />
              {m.label === s.weakest.label && <p className="text-[0.65rem] font-bold text-status-expired mt-1.5">⚠ Weakest category</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Joyland KPIs (§1) */}
      <SectionTitle>Joylands · Fitness Certificates</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Total Joylands" value={s.joyland.totalFacilities} sub="Large + Mini" />
        <KpiCard label="Large Joylands" value={s.joyland.large} />
        <KpiCard label="Mini Joylands" value={s.joyland.mini} />
        <KpiCard label="Total Rides" value={s.joyland.totalRides} />
        <KpiCard label="Valid Certificates" value={s.joyland.valid} tone="green" />
        <KpiCard label="Near Expiry" value={s.joyland.nearExpiry + s.joyland.critical} tone="orange" sub="≤ 30 days" />
        <KpiCard label="Expired" value={s.joyland.expired} tone="red" />
      </div>

      {/* Food court + parking KPIs */}
      <SectionTitle>Food Courts · PFA Licenses &nbsp;&nbsp;|&nbsp;&nbsp; Parking Stands · Agreements</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <KpiCard label="Food Courts" value={s.foodCourt.totalFacilities} />
        <KpiCard label="Valid PFA" value={s.foodCourt.valid} />
        <KpiCard label="PFA Near Expiry" value={s.foodCourt.nearExpiry + s.foodCourt.critical} tone="orange" />
        <KpiCard label="Expired PFA" value={s.foodCourt.expired + s.foodCourt.missing} tone="red" sub="incl. missing" />
        <KpiCard label="Parking Stands" value={s.parking.totalFacilities} />
        <KpiCard label="Valid Agreements" value={s.parking.valid} />
        <KpiCard label="Agreements Near Expiry" value={s.parking.nearExpiry + s.parking.critical} tone="orange" />
        <KpiCard label="Expired" value={s.parking.expired + s.parking.missing} tone="red" sub="incl. missing" />
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="font-extrabold text-sm text-brand-green mb-1 uppercase tracking-wider text-[0.72rem]">Large vs Mini Joylands</p>
          <KindDonut large={s.joyland.large} mini={s.joyland.mini} />
          <p className="text-center text-xs text-gray-500 -mt-2">Total Joylands = {s.joyland.large} + {s.joyland.mini} = <b>{s.joyland.totalFacilities}</b></p>
        </div>
        <div className="card p-4">
          <p className="font-extrabold text-sm text-brand-green mb-1 uppercase tracking-wider text-[0.72rem]">Compliance % by Category (§20)</p>
          <SimpleBars data={moduleBars} xKey="name" bars={[{ key: 'Compliance', color: CHART_COLORS.green }]} height={230} />
        </div>
        <div className="card p-4 space-y-3">
          <p className="font-extrabold text-sm text-brand-green uppercase tracking-wider text-[0.72rem]">Document Status Mix</p>
          {([
            ['Fitness Certificates', s.joyland],
            ['PFA Licenses', s.foodCourt],
            ['Parking Agreements', s.parking],
          ] as [string, typeof s.joyland][]).map(([label, mm]) => {
            return (
              <div key={label}>
                <p className="text-xs font-bold text-gray-600 mb-1">{label}</p>
                <StatusStack counts={{ valid: mm.valid, upcoming: mm.upcoming, near: mm.nearExpiry, critical: mm.critical, expired: mm.expired, missing: mm.missing }} />
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.62rem] font-bold mt-1 text-gray-500">
                  <span style={{ color: CHART_COLORS.teal }}>■ Valid {mm.valid}</span>
                  <span style={{ color: CHART_COLORS.blue }}>■ Upcoming {mm.upcoming}</span>
                  <span style={{ color: CHART_COLORS.golddark }}>■ Near {mm.nearExpiry}</span>
                  <span style={{ color: CHART_COLORS.orange }}>■ Critical {mm.critical}</span>
                  <span style={{ color: CHART_COLORS.red }}>■ Expired {mm.expired}</span>
                  <span style={{ color: CHART_COLORS.grey }}>■ Missing {mm.missing}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action required (§15) */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="font-display text-lg" style={{ color: '#BC3A3A' }}>⚠ ACTION REQUIRED</h2>
          <Link href="/near-expiry" className="btn-ghost !py-1 text-xs">View all near-expiry →</Link>
        </div>
        <DataTable<ComplianceDoc>
          rows={urgent}
          pageSize={8}
          columns={[
            { key: 'facilityName', label: 'Facility', render: (d) => <span className="font-bold text-brand-green">{d.facilityName}{d.rideName ? <span className="font-normal text-gray-500"> · {d.rideName}</span> : ''}</span> },
            { key: 'district', label: 'District', sortVal: (d) => d.district },
            { key: 'docType', label: 'Document', render: (d) => DOC_LABEL[d.docType] },
            { key: 'expiryDate', label: 'Expiry Date', render: (d) => fmtDate(d.expiryDate), sortVal: (d) => d.expiryDate ?? '' },
            { key: 'daysRemaining', label: 'Days', sortVal: (d) => d.daysRemaining ?? -9999, render: (d) => <b style={{ color: (d.daysRemaining ?? 0) < 0 ? '#BC3A3A' : '#B45309' }}>{d.daysRemaining ?? '—'}</b> },
            { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
            { key: 'action', label: 'Action Required', render: (d) => <span className="text-xs font-semibold">{d.status === 'EXPIRED' ? '🔴 Immediate renewal / inspection' : d.status === 'CRITICAL' ? '🟠 Renew within 7 days' : d.status === 'NEAR_EXPIRY' ? '🟡 Start renewal process' : '🔵 Plan renewal'}</span> },
          ]}
        />
      </div>

      {/* Division compliance (§19 preview) */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-extrabold text-sm text-brand-green uppercase tracking-wider text-[0.72rem]">Division-wise Compliance</p>
          <Link href="/districts" className="btn-ghost !py-1 !px-3 text-xs">District analysis →</Link>
        </div>
        <SimpleBars
          data={divisions.map((d) => ({ name: d.division, 'Fitness %': d.fitnessPct, 'PFA %': d.pfaPct, 'Agreement %': d.agreementPct }))}
          xKey="name"
          bars={[
            { key: 'Fitness %', color: CHART_COLORS.green },
            { key: 'PFA %', color: CHART_COLORS.gold },
            { key: 'Agreement %', color: CHART_COLORS.teal },
          ]}
          height={280}
          layout="vertical"
        />
      </div>
    </div>
  );
}
