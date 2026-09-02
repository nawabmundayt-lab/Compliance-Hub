'use client';

import React, { useState } from 'react';
import { ComplianceDoc, DOC_LABEL } from '@/lib/types';
import { fmtDate } from '@/lib/compliance';
import { useData } from './providers';

// §27 — update interface with auto recalculation of expiry/days/status
export function RecordEditor({ doc, onClose }: { doc: ComplianceDoc; onClose: () => void }) {
  const { updateDoc } = useData();
  const [form, setForm] = useState({
    docNumber: doc.docNumber ?? '',
    issueDate: doc.issueDate ?? '',
    expiryDate: doc.expiryDate ?? '',
    lastInspectionDate: doc.lastInspectionDate ?? '',
    renewalDate: doc.renewalDate ?? '',
    remarks: doc.remarks ?? '',
    updatedBy: doc.updatedBy ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      await updateDoc(doc.id, {
        ...form,
        issueDate: form.issueDate || undefined,
        expiryDate: form.expiryDate || undefined,
        lastInspectionDate: form.lastInspectionDate || undefined,
        renewalDate: form.renewalDate || undefined,
      }, form.updatedBy || 'Dashboard User');
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  };

  const field = (label: string, el: React.ReactElement, hint?: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-brand-green">{label}</span>
      {el}
      {hint && <span className="text-[0.68rem] text-gray-500">{hint}</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(10,59,30,0.85)' }} onClick={onClose}>
      <div className="card w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#0A3B1E,#14522A)' }}>
          <div>
            <p className="text-brand-gold font-extrabold text-sm uppercase tracking-widest">Update Record</p>
            <p className="text-white/80 text-xs">{doc.facilityName} · {DOC_LABEL[doc.docType]}{doc.rideName ? ` · ${doc.rideName}` : ''}</p>
          </div>
          <button className="text-white/70 hover:text-white text-xl leading-none" onClick={onClose}>✕</button>
        </div>
        <div className="h-1.5 bg-brand-gold" />
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field(doc.docType === 'fitness_certificate' ? 'Certificate Number' : doc.docType === 'pfa_license' ? 'PFA License Number' : 'Agreement Number',
            <input className="input" value={form.docNumber} onChange={set('docNumber')} />)}
          {field('Issue / Start Date', <input type="date" className="input" value={form.issueDate} onChange={set('issueDate')} />,
            doc.docType === 'fitness_certificate' ? 'Expiry auto-calculates = Issue + 6 calendar months' : undefined)}
          {field('Expiry / End Date', <input type="date" className="input" value={form.expiryDate} onChange={set('expiryDate')} />,
            `Current: ${fmtDate(doc.expiryDate)}`)}
          {field('Last Inspection Date', <input type="date" className="input" value={form.lastInspectionDate} onChange={set('lastInspectionDate')} />)}
          {field('Renewal Date', <input type="date" className="input" value={form.renewalDate} onChange={set('renewalDate')} />)}
          {field('Updated By', <input className="input" value={form.updatedBy} onChange={set('updatedBy')} placeholder="Your name" />)}
          <div className="sm:col-span-2">
            {field('Remarks', <textarea className="input w-full" rows={2} value={form.remarks} onChange={set('remarks')} />)}
          </div>
        </div>
        {err && <p className="px-5 pb-2 text-sm font-semibold text-status-expired">{err}</p>}
        <div className="px-5 pb-5 flex items-center justify-between gap-3">
          <p className="text-[0.7rem] text-gray-500">Saving recalculates expiry, days remaining, status &amp; compliance % automatically.</p>
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-gold" disabled={saving} onClick={save}>{saving ? 'Saving…' : '💾 Save Record'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
