'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '@/components/providers';
import { ErrorBox, Loading, SectionTitle } from '@/components/ui';
import { Settings } from '@/lib/types';
import { COLUMN_MAP } from '@/lib/excel';

interface ExcelFile { name: string; sizeKB: number; modified: string }

export default function SettingsPage() {
  const { data, loading, error, refresh } = useData();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    const res = await fetch('/api/settings', { cache: 'no-store' });
    const j = await res.json();
    setSettings(j.settings); setFiles(j.excelFiles);
  };
  useEffect(() => { loadSettings(); }, []);

  const dirty = useMemo(() => settings && data && JSON.stringify(settings) !== JSON.stringify(data.settings), [settings, data]);

  if ((loading && !data) || !settings) return <Loading />;
  if (error) return <ErrorBox message={error} />;

  const t = settings.thresholds;
  const setT = (k: keyof typeof t) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings({ ...settings, thresholds: { ...t, [k]: Math.max(0, parseInt(e.target.value || '0', 10)) } });

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error(await res.text());
      await refresh(); // statuses recomputed with new thresholds
      setMsg('✔ Settings saved — all statuses & compliance % recalculated.');
    } catch (e) { setMsg(`✖ ${e instanceof Error ? e.message : 'Save failed'}`); }
    finally { setSaving(false); }
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(await res.text());
      await refresh();
      await loadSettings();
      setMsg(`✔ Uploaded ${file.name} — data refreshed automatically.`);
    } catch (err) { setMsg(`✖ ${err instanceof Error ? err.message : 'Upload failed'}`); }
    finally { setUploading(false); e.target.value = ''; }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl text-brand-green">Settings</h1>
        <p className="text-sm text-gray-500">Thresholds, Excel source files and refresh configuration (§5, §23, §29.11)</p>
      </div>

      {/* Expiry thresholds */}
      <div className="card overflow-hidden">
        <div className="h-1.5 bg-brand-gold" />
        <div className="p-5 space-y-4">
          <p className="font-extrabold text-sm text-brand-green uppercase tracking-wider text-[0.72rem]">Expiry Warning Thresholds (days remaining)</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {([
              ['criticalDays', 'CRITICAL ≤', '#D97706', 'Expires within 0–7 days'],
              ['nearExpiryDays', 'NEAR EXPIRY ≤', '#B45309', 'Expires within 8–30 days'],
              ['upcomingDays', 'UPCOMING ≤', '#2155A3', 'Expires within 31–60 days'],
            ] as const).map(([key, label, color, hint]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color }}>{label}</span>
                <input type="number" min={0} className="input" value={t[key]} onChange={setT(key)} />
                <span className="text-[0.65rem] text-gray-500">{hint}</span>
              </label>
            ))}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green">Cert. validity (months)</span>
              <input type="number" min={1} max={24} className="input" value={settings.fitnessValidityMonths}
                onChange={(e) => setSettings({ ...settings, fitnessValidityMonths: Math.max(1, parseInt(e.target.value || '6', 10)) })} />
              <span className="text-[0.65rem] text-gray-500">Fitness certificates: Issue + N calendar months (§4)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500">Beyond {t.upcomingDays} days → <span className="badge badge-valid !text-[0.6rem]">VALID</span> · Below 0 days → <span className="badge badge-expired !text-[0.6rem]">EXPIRED</span></p>
          <div className="flex items-center gap-3">
            <button className="btn-gold" disabled={saving || !dirty} onClick={save}>{saving ? 'Saving…' : '💾 Save & Recalculate'}</button>
            {msg && <span className="text-xs font-bold">{msg}</span>}
          </div>
        </div>
      </div>

      {/* Excel source files */}
      <div className="card overflow-hidden">
        <div className="h-1.5 bg-brand-gold" />
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="font-extrabold text-sm text-brand-green uppercase tracking-wider text-[0.72rem]">Excel Source Files <span className="font-mono normal-case tracking-normal text-gray-400">(/data/excel)</span></p>
            <label className={`btn-green cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? 'Uploading…' : '⬆ Upload Updated Excel (.xlsx)'}
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={upload} />
            </label>
          </div>
          <table className="tbl">
            <thead><tr><th>File</th><th>Size</th><th>Last Modified</th></tr></thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name}>
                  <td className="font-mono text-xs font-bold text-brand-green">{f.name}</td>
                  <td>{f.sizeKB} KB</td>
                  <td className="text-xs text-gray-500">{new Date(f.modified).toLocaleString()}</td>
                </tr>
              ))}
              {files.length === 0 && <tr><td colSpan={3} className="text-center text-gray-400 !py-6">No Excel files found — place your 3 files in the <code className="font-mono">data/excel</code> folder or upload above.</td></tr>}
            </tbody>
          </table>
          <div className="callout !rounded-2xl text-xs">
            <span>ℹ️</span>
            <span><b>Daily auto-refresh:</b> run <code className="font-mono bg-white/70 px-1 rounded">npm run refresh</code> on a schedule (cron / Windows Task Scheduler),
            or schedule a request to <code className="font-mono bg-white/70 px-1 rounded">/api/refresh</code>. Recommended time: {String(settings.autoRefreshHour).padStart(2, '0')}:00 daily. See README § Daily refresh.</span>
          </div>
        </div>
      </div>

      {/* Column mapping reference */}
      <div className="card overflow-hidden">
        <div className="h-1.5 bg-brand-gold" />
        <div className="p-5">
          <p className="font-extrabold text-sm text-brand-green uppercase tracking-wider text-[0.72rem] mb-3">Column Mapping Layer (§25) — accepted Excel header spellings</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            {COLUMN_MAP.map((m) => (
              <div key={m.logicalField} className="text-xs border-b border-black/5 pb-1.5">
                <span className="font-extrabold text-brand-green">{m.logicalField}</span>
                <span className="text-gray-500"> ← {m.synonyms.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionTitle>Data Import → Validation → Processing → Compliance → Database → Dashboard (§31)</SectionTitle>
    </div>
  );
}
