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

export default function ParkingPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});
  const [editing, setEditing] = useState<ComplianceDoc | null>(null);

  const agreements = useMemo(() => (data?.documents ?? []).filter((d) => d.docType === 'parking_agreement'), [data]);
  const contractors = useMemo(() => new Map((data?.facilities ?? []).filter((f) => f.type === 'parking_stand').map((f) => [f.id, f.contractor])), [data]);
  const totalStands = useMemo(() => byType(data?.facilities ?? [], 'parking_stand').length, [data]);
  const options = useMemo(() => ({
    divisions: [...new Set(agreements.map((d) => d.division))].sort(),
    districts: [...new Set(agreements.map((d) => d.district))].sort(),
    tehsils: [...new Set(agreements.map((d) => d.tehsil))].sort(),
  }), [agreements]);
  const filtered = useMemo(() => applyDocFilters(agreements, filters), [agreements, filters]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const c = (st: string) => filtered.filter((d) => d.status === st).length;
  const pct = compliancePct(c('VALID'), totalStands);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Parking Stands · Agreement Monitoring</h1>
          <p className="text-sm text-gray-500">Days Remaining = Agreement End Date − Today (§11–§13)</p>
        </div>
        <ExportMenu preset="parking-register" />
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} />

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <KpiCard label="Parking Stands" value={totalStands} />
        <KpiCard label="Valid Agreements" value={c('VALID')} />
        <KpiCard label="Upcoming (≤60d)" value={c('UPCOMING')} tone="blue" />
        <KpiCard label="Near Expiry (≤30d)" value={c('NEAR_EXPIRY')} tone="orange" />
        <KpiCard label="Critical (≤7d)" value={c('CRITICAL')} tone="orange" />
        <KpiCard label="Expired" value={c('EXPIRED')} tone="red" />
        <KpiCard label="No Agreement Data" value={c('MISSING')} tone="grey" />
      </div>

      <SectionTitle>Parking Agreement Compliance</SectionTitle>
      <div className="card p-4">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <span className="uppercase tracking-wider text-brand-green">Valid Agreements ÷ Total Parking Stands × 100</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar pct={pct} height={16} />
      </div>

      <SectionTitle>Agreement Register</SectionTitle>
      <DataTable<ComplianceDoc>
        rows={filtered}
        columns={[
          { key: 'facilityName', label: 'Parking Stand', render: (d) => <span className="font-bold text-brand-green">{d.facilityName}</span> },
          { key: 'contractor', label: 'Contractor / Holder', render: (d) => <span className="text-xs font-semibold text-gray-700">{contractors.get(d.facilityId) || '—'}</span> },
          { key: 'district', label: 'District' },
          { key: 'docNumber', label: 'Agreement No', render: (d) => <span className="font-mono text-xs font-bold">{d.docNumber || '— NO DATA —'}</span> },
          { key: 'issueDate', label: 'Start', render: (d) => fmtDate(d.issueDate) },
          { key: 'expiryDate', label: 'End', render: (d) => <b>{fmtDate(d.expiryDate)}</b>, sortVal: (d) => d.expiryDate ?? '' },
          { key: 'daysRemaining', label: 'Days Left', sortVal: (d) => d.daysRemaining ?? -9999, render: (d) => <b style={{ color: (d.daysRemaining ?? 0) < 0 ? '#BC3A3A' : (d.daysRemaining ?? 99) <= 30 ? '#B45309' : '#0D6B5E' }}>{d.daysRemaining ?? '—'}</b> },
          { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
          { key: 'edit', label: '', render: (d) => <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => setEditing(d)}>✏️ Edit</button> },
        ]}
      />
      {editing && <RecordEditor doc={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
