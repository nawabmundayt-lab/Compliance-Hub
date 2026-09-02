'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, ExportMenu, FilterBar, Filters, Loading,
  SectionTitle, StatusBadge, applyDocFilters,
} from '@/components/ui';
import { RecordEditor } from '@/components/editors';
import { StatusStack } from '@/components/charts';
import { ComplianceDoc } from '@/lib/types';
import { addCalendarMonths, fmtDate } from '@/lib/compliance';

export default function CertificatesPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});
  const [editing, setEditing] = useState<ComplianceDoc | null>(null);

  const certs = useMemo(() => (data?.documents ?? []).filter((d) => d.docType === 'fitness_certificate'), [data]);
  const options = useMemo(() => ({
    divisions: [...new Set(certs.map((d) => d.division))].sort(),
    districts: [...new Set(certs.map((d) => d.district))].sort(),
    tehsils: [...new Set(certs.map((d) => d.tehsil))].sort(),
  }), [certs]);
  const filtered = useMemo(() => applyDocFilters(certs, filters), [certs, filters]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const c = (st: string) => filtered.filter((d) => d.status === st).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Ride Fitness Certificates</h1>
          <p className="text-sm text-gray-500">
            Expiry = Issue + <b>6 calendar months</b> (e.g. 15-Jan-2026 → {fmtDate(addCalendarMonths('2026-01-15', 6))}) · thresholds configurable in Settings (§4–§5)
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu preset="near-expiry-certificates" />
          <ExportMenu preset="expired-certificates" />
        </div>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} />

      <div className="card p-4">
        <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-1">Status overview ({filtered.length} certificates)</p>
        <StatusStack counts={{ valid: c('VALID'), upcoming: c('UPCOMING'), near: c('NEAR_EXPIRY'), critical: c('CRITICAL'), expired: c('EXPIRED'), missing: c('MISSING') }} />
      </div>

      <SectionTitle>Certificate Register</SectionTitle>
      <DataTable<ComplianceDoc>
        rows={filtered}
        columns={[
          { key: 'facilityName', label: 'Joyland', render: (d) => <span className="font-bold text-brand-green">{d.facilityName}</span> },
          { key: 'rideName', label: 'Ride', render: (d) => <span>{d.rideName ?? '—'} <span className="text-[0.65rem] text-gray-400">{d.rideCategory ?? ''}</span></span> },
          { key: 'district', label: 'District' },
          { key: 'docNumber', label: 'Certificate No', render: (d) => <span className="font-mono text-xs font-bold">{d.docNumber || '—'}</span> },
          { key: 'issueDate', label: 'Issue', render: (d) => fmtDate(d.issueDate), sortVal: (d) => d.issueDate ?? '' },
          { key: 'expiryDate', label: 'Expiry', render: (d) => <b>{fmtDate(d.expiryDate)}</b>, sortVal: (d) => d.expiryDate ?? '' },
          { key: 'daysRemaining', label: 'Days Left', sortVal: (d) => d.daysRemaining ?? -9999, render: (d) => <b style={{ color: (d.daysRemaining ?? 0) < 0 ? '#BC3A3A' : (d.daysRemaining ?? 99) <= 30 ? '#B45309' : '#0D6B5E' }}>{d.daysRemaining ?? '—'}</b> },
          { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} />, sortVal: (d) => d.status },
          { key: 'lastInspectionDate', label: 'Last Inspection', render: (d) => fmtDate(d.lastInspectionDate) },
          { key: 'edit', label: '', render: (d) => <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => setEditing(d)}>✏️ Edit</button> },
        ]}
      />
      {editing && <RecordEditor doc={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
