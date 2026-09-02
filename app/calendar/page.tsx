'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import { ErrorBox, Loading, SectionTitle } from '@/components/ui';
import { SimpleBars, CHART_COLORS } from '@/components/charts';
import { expiryByMonth } from '@/lib/stats';
import { fmtDate } from '@/lib/compliance';

export default function CalendarPage() {
  const { data, loading, error } = useData();
  const [docType, setDocType] = useState<string>('all');

  const buckets = useMemo(() => {
    if (!data) return [];
    const docs = docType === 'all' ? data.documents : data.documents.filter((d) => d.docType === docType);
    return expiryByMonth(docs, new Date().toISOString().slice(0, 10), 6);
  }, [data, docType]);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return <Loading />;

  const peak = Math.max(...buckets.map((b) => b.total), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-brand-green">Expiry Calendar</h1>
          <p className="text-sm text-gray-500">Plan renewal work in advance — renewals due per month (§17)</p>
        </div>
        <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option value="all">All document types</option>
          <option value="fitness_certificate">Fitness Certificates</option>
          <option value="pfa_license">PFA Licenses</option>
          <option value="parking_agreement">Parking Agreements</option>
        </select>
      </div>

      <div className="card p-4">
        <p className="font-extrabold text-[0.72rem] uppercase tracking-wider text-brand-green mb-2">Upcoming expiries — next 6 months</p>
        <SimpleBars
          data={buckets.map((b) => ({ name: b.label, 'Fitness Certificates': b.fitness, 'PFA Licenses': b.pfa, 'Parking Agreements': b.parking }))}
          xKey="name"
          bars={[
            { key: 'Fitness Certificates', color: CHART_COLORS.green, stack: true },
            { key: 'PFA Licenses', color: CHART_COLORS.gold, stack: true },
            { key: 'Parking Agreements', color: CHART_COLORS.teal, stack: true },
          ]}
          height={300}
        />
      </div>

      <SectionTitle>Monthly Renewal Schedule</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buckets.map((b) => (
          <div key={b.key} className="card p-4 relative overflow-hidden">
            <span className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gold" />
            <div className="flex items-baseline justify-between">
              <p className="font-display text-brand-green">{b.label}</p>
              <p className={`text-2xl font-display ${b.total === peak && b.total > 0 ? 'text-status-critical' : 'text-brand-green'}`}>{b.total}</p>
            </div>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between border-b border-black/5 pb-1"><span className="font-semibold text-gray-600">🎡 Fitness Certificates</span><b>{b.fitness}</b></div>
              <div className="flex justify-between border-b border-black/5 pb-1"><span className="font-semibold text-gray-600">🍽️ PFA Licenses</span><b>{b.pfa}</b></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-600">🅿️ Parking Agreements</span><b>{b.parking}</b></div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500">Renewals scheduled against dates as of {fmtDate(new Date().toISOString().slice(0, 10))} · expired documents are listed on the Expired page instead.</p>
    </div>
  );
}
