'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, ExportMenu, FilterBar, Filters, KpiCard, Loading,
  ProgressBar, SectionTitle, StatusBadge, applyDocFilters,
} from '@/components/ui';
import { RecordEditor } from '@/components/editors';
import { ComplianceDoc } from '@/lib/types';
import { fmtDate, compliancePct } from '@/lib/compliance';
import { byType } from '@/lib/stats';

export default function FoodCourtsPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});
  const [editing, setEditing] = useState<ComplianceDoc | null>(null);

  const licenses = useMemo(() => (data?.documents ?? []).filter((d) => d.docType === 'pfa_license'), [data]);
  const totalFoodCourts = useMemo(() => byType(data?.facilities ?? [], 'food_court').length, [data]);
  const options = useMemo(() => ({
    divisions: [...new Set(licenses.map((d) => d.division))].sort(),
    districts: [...new Set(licenses.map((d) => d.district))].sort(),
    tehsils: [...new Set(licenses.map((d) => d.tehsil))].sort(),
  }), [licenses]);
  const filtered = useMemo(() => applyDocFilters(licenses, filters), [licenses, filters]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const c = (st: string) => filtered.filter((d) => d.status === st).length;
  const expiredOrMissing = c('EXPIRED') + c('MISSING');
  const pct = compliancePct(c('VALID'), totalFoodCourts);

  // §10 — compliance summary table
  const summary = [
    { label: 'Valid', n: c('VALID'), cls: 'badge-valid' },
    { label: 'Upcoming (≤60d)', n: c('UPCOMING'), cls: 'badge-upcoming' },
    { label: 'Near Expiry (≤30d)', n: c('NEAR_EXPIRY'), cls: 'badge-near' },
    { label: 'Critical (≤7d)', n: c('CRITICAL'), cls: 'badge-critical' },
    { label: 'Expired', n: c('EXPIRED'), cls: 'badge-expired' },
    { label: 'Missing License', n: c('MISSING'), cls: 'badge-missing' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Food Courts · PFA License Monitoring</h1>
          <p className="text-sm text-gray-500">A Food Court is compliant only when its <b>Punjab Food Authority (PFA) license</b> is valid (§7–§10)</p>
        </div>
        <ExportMenu preset="foodcourt-register" />
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <KpiCard label="Total Food Courts" value={totalFoodCourts} />
        <KpiCard label="Valid PFA Licenses" value={c('VALID')} />
        <KpiCard label="Near Expiry (≤30d)" value={c('NEAR_EXPIRY')} tone="orange" />
        <KpiCard label="Critical (≤7d)" value={c('CRITICAL')} tone="orange" />
        <KpiCard label="Expired" value={c('EXPIRED')} tone="red" />
        <KpiCard label="Missing License" value={c('MISSING')} tone="grey" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="uppercase tracking-wider text-brand-green">PFA License Compliance % (Valid ÷ Total Food Courts × 100)</span>
            <span>{pct}%</span>
          </div>
          <ProgressBar pct={pct} height={16} />
          {expiredOrMissing > 0 && (
            <p className="text-xs font-semibold text-status-expired mt-2">⚠ {expiredOrMissing} food court(s) non-compliant (expired or missing license)</p>
          )}
        </div>
        <div className="card p-4 space-y-1.5">
          <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green">PFA License Status Summary</p>
          {summary.map((s) => (
            <div key={s.label} className="flex items-center justify-between border-b border-black/5 pb-1">
              <span className={`badge ${s.cls} !text-[0.62rem]`}>{s.label}</span>
              <span className="font-display text-lg text-brand-green">{s.n}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>PFA License Register</SectionTitle>
      <DataTable<ComplianceDoc>
        rows={filtered}
        columns={[
          { key: 'facilityName', label: 'Food Court', render: (d) => <span className="font-bold text-brand-green">{d.facilityName}</span> },
          { key: 'division', label: 'Division' },
          { key: 'district', label: 'District' },
          { key: 'tehsil', label: 'Tehsil' },
          { key: 'docNumber', label: 'PFA License No', render: (d) => <span className="font-mono text-xs font-bold">{d.docNumber || '— MISSING —'}</span> },
          { key: 'issueDate', label: 'Issue', render: (d) => fmtDate(d.issueDate) },
          { key: 'expiryDate', label: 'Expiry', render: (d) => <b>{fmtDate(d.expiryDate)}</b>, sortVal: (d) => d.expiryDate ?? '' },
          { key: 'daysRemaining', label: 'Days Left', sortVal: (d) => d.daysRemaining ?? -9999, render: (d) => <b style={{ color: (d.daysRemaining ?? 0) < 0 ? '#BC3A3A' : (d.daysRemaining ?? 99) <= 30 ? '#B45309' : '#0D6B5E' }}>{d.daysRemaining ?? '—'}</b> },
          { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
          { key: 'edit', label: '', render: (d) => <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => setEditing(d)}>✏️ Edit</button> },
        ]}
      />
      {editing && <RecordEditor doc={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
