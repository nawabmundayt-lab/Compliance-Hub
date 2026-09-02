'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, FilterBar, Filters, KpiCard, Loading,
  SectionTitle, StatusBadge, applyDocFilters,
} from '@/components/ui';
import { ComplianceDoc, DOC_LABEL } from '@/lib/types';
import { fmtDate } from '@/lib/compliance';

export default function ExpiredPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});

  const expired = useMemo(() => (data?.documents ?? [])
    .filter((d) => d.status === 'EXPIRED' || d.status === 'MISSING')
    .sort((a, b) => (a.status === 'EXPIRED' ? 0 : 1) - (b.status === 'EXPIRED' ? 0 : 1)), [data]);

  const options = useMemo(() => ({
    divisions: [...new Set((data?.documents ?? []).map((d) => d.division))].sort(),
    districts: [...new Set((data?.documents ?? []).map((d) => d.district))].sort(),
    tehsils: [...new Set((data?.documents ?? []).map((d) => d.tehsil))].sort(),
  }), [data]);
  const filtered = useMemo(() => applyDocFilters(expired, filters), [expired, filters]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const ex = filtered.filter((d) => d.status === 'EXPIRED');
  const ms = filtered.filter((d) => d.status === 'MISSING');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl" style={{ color: '#BC3A3A' }}>Expired &amp; Missing Compliance Documents</h1>
        <p className="text-sm text-gray-500">These records require <b>immediate action</b> — renewals must not be missed further.</p>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} showDocType />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Expired (total)" value={ex.length} tone="red" />
        <KpiCard label="Fitness Certs" value={ex.filter((d) => d.docType === 'fitness_certificate').length} tone="red" />
        <KpiCard label="PFA Licenses" value={ex.filter((d) => d.docType === 'pfa_license').length} tone="red" />
        <KpiCard label="Agreements" value={ex.filter((d) => d.docType === 'parking_agreement').length} tone="red" />
        <KpiCard label="Missing / No Data" value={ms.length} tone="grey" />
      </div>

      <SectionTitle>Action Required — Expired Documents</SectionTitle>
      <DataTable<ComplianceDoc>
        rows={filtered}
        columns={[
          { key: 'facilityName', label: 'Facility', render: (d) => <span className="font-bold text-brand-green">{d.facilityName}{d.rideName ? <span className="font-normal text-gray-500"> · {d.rideName}</span> : ''}</span> },
          { key: 'docType', label: 'Document', render: (d) => DOC_LABEL[d.docType] },
          { key: 'district', label: 'District' },
          { key: 'docNumber', label: 'Document No', render: (d) => <span className="font-mono text-xs">{d.docNumber || '—'}</span> },
          { key: 'expiryDate', label: 'Expired On', render: (d) => <b style={{ color: '#BC3A3A' }}>{fmtDate(d.expiryDate)}</b>, sortVal: (d) => d.expiryDate ?? '' },
          { key: 'daysRemaining', label: 'Overdue By', sortVal: (d) => d.daysRemaining ?? -9999, render: (d) => d.status === 'EXPIRED' ? <b style={{ color: '#BC3A3A' }}>{Math.abs(d.daysRemaining ?? 0)} days</b> : '—' },
          { key: 'status', label: 'Status', render: (d) => <StatusBadge status={d.status} /> },
          { key: 'action', label: 'Action Required', render: (d) => <span className="text-xs font-semibold">{d.status === 'MISSING' ? '📋 Record license/agreement data' : '🔴 Immediate renewal + inspection'}</span> },
        ]}
      />
    </div>
  );
}
