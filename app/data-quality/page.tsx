'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import { DataTable, ErrorBox, KpiCard, Loading, SectionTitle } from '@/components/ui';
import { DataQualityIssue, MODULE_LABEL } from '@/lib/types';

export default function DataQualityPage() {
  const { data, loading, error } = useData();
  const [module, setModule] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');

  const issues = useMemo(() => (data?.quality ?? [])
    .filter((q) => (!module || q.module === module) && (!severity || q.severity === severity)),
    [data, module, severity]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const errors = (data.quality ?? []).filter((q) => q.severity === 'error').length;
  const warnings = (data.quality ?? []).length - errors;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl text-brand-green">Data Quality</h1>
        <p className="text-sm text-gray-500">Automatic validation of the imported Excel files — missing names, numbers, dates, duplicates, unknown districts (§26)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Issues" value={data.quality?.length ?? 0} tone="grey" />
        <KpiCard label="Errors (must fix)" value={errors} tone="red" />
        <KpiCard label="Warnings" value={warnings} tone="orange" />
        <KpiCard label="Files Processed" value={data.meta?.filesProcessed?.length ?? 0} />
      </div>

      <div className="card p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green">🔽 Filters</span>
        <select className="input" value={module} onChange={(e) => setModule(e.target.value)}>
          <option value="">All modules</option>
          <option value="joyland">Joylands</option>
          <option value="food_court">Food Courts</option>
          <option value="parking_stand">Parking Stands</option>
        </select>
        <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
          <option value="">Errors + Warnings</option>
          <option value="error">Errors only</option>
          <option value="warning">Warnings only</option>
        </select>
        <button className="btn-red !py-1.5 !px-4 text-xs ml-auto" onClick={() => { setModule(''); setSeverity(''); }}>Reset Filters</button>
      </div>

      <SectionTitle>Validation Report</SectionTitle>
      <DataTable<DataQualityIssue>
        rows={issues}
        pageSize={20}
        columns={[
          { key: 'severity', label: 'Severity', render: (q) => <span className={`badge ${q.severity === 'error' ? 'badge-expired' : 'badge-near'}`}>{q.severity}</span> },
          { key: 'module', label: 'Module', render: (q) => MODULE_LABEL[q.module] },
          { key: 'facilityName', label: 'Facility', render: (q) => <span className="font-bold text-brand-green">{q.facilityName}</span> },
          { key: 'field', label: 'Field', render: (q) => <span className="font-mono text-xs">{q.field}</span> },
          { key: 'message', label: 'Issue', render: (q) => <span className="text-xs font-semibold">{q.message}</span> },
          { key: 'value', label: 'Value', render: (q) => <span className="font-mono text-xs text-gray-500">{q.value || '—'}</span> },
          { key: 'rowRef', label: 'Excel Row', render: (q) => <span className="font-mono text-[0.65rem] text-gray-400">{q.rowRef || '—'}</span> },
        ]}
      />
      <p className="text-xs text-gray-500 text-center">Fix these rows in the source Excel files, then press <b>⟳ Refresh Data</b>. Clean data = accurate compliance numbers.</p>
    </div>
  );
}
