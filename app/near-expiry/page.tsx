'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import {
  DataTable, ErrorBox, FilterBar, Filters, Loading, SectionTitle,
  StatusBadge, applyDocFilters,
} from '@/components/ui';
import { ComplianceDoc, DOC_LABEL } from '@/lib/types';
import { fmtDate } from '@/lib/compliance';

const URGENT = ['CRITICAL', 'NEAR_EXPIRY', 'UPCOMING'];

export default function NearExpiryPage() {
  const { data, loading, error } = useData();
  const [filters, setFilters] = useState<Filters>({});

  const all = useMemo(() => (data?.documents ?? [])
    .filter((d) => URGENT.includes(d.status))
    .sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999)), [data]);

  const options = useMemo(() => ({
    divisions: [...new Set((data?.documents ?? []).map((d) => d.division))].sort(),
    districts: [...new Set((data?.documents ?? []).map((d) => d.district))].sort(),
    tehsils: [...new Set((data?.documents ?? []).map((d) => d.tehsil))].sort(),
  }), [data]);
  const filtered = useMemo(() => applyDocFilters(all, filters), [all, filters]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const columns = [
    { key: 'facilityName', label: 'Facility', render: (d: ComplianceDoc) => <span className="font-bold text-brand-green">{d.facilityName}{d.rideName ? <span className="font-normal text-gray-500"> · {d.rideName}</span> : ''}</span> },
    { key: 'docType', label: 'Document', render: (d: ComplianceDoc) => DOC_LABEL[d.docType] },
    { key: 'district', label: 'District' },
    { key: 'expiryDate', label: 'Expiry', render: (d: ComplianceDoc) => <b>{fmtDate(d.expiryDate)}</b>, sortVal: (d: ComplianceDoc) => d.expiryDate ?? '' },
    { key: 'daysRemaining', label: 'Days Left', sortVal: (d: ComplianceDoc) => d.daysRemaining ?? 9999 },
    { key: 'status', label: 'Status', render: (d: ComplianceDoc) => <StatusBadge status={d.status} /> },
  ];

  const group = (sts: string[], docType: string) =>
    filtered.filter((d) => d.docType === docType && sts.includes(d.status));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-brand-green">Near Expiry — Upcoming Renewals</h1>
        <p className="text-sm text-gray-500">All documents expiring within the Critical / Near-Expiry / Upcoming windows (§15–§16)</p>
      </div>

      <FilterBar filters={filters} setFilters={setFilters} options={options} showDocType />

      <SectionTitle>Fitness Certificates Expiring Soon ({group(URGENT, 'fitness_certificate').length})</SectionTitle>
      <DataTable rows={group(URGENT, 'fitness_certificate')} columns={columns} pageSize={8} />

      <SectionTitle>PFA Licenses Expiring Soon ({group(URGENT, 'pfa_license').length})</SectionTitle>
      <DataTable rows={group(URGENT, 'pfa_license')} columns={columns} pageSize={8} />

      <SectionTitle>Parking Agreements Expiring Soon ({group(URGENT, 'parking_agreement').length})</SectionTitle>
      <DataTable rows={group(URGENT, 'parking_agreement')} columns={columns} pageSize={8} />
    </div>
  );
}
