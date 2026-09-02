'use client';

import React, { useMemo, useState } from 'react';
import { ComplianceStatus } from '@/lib/types';
import { STATUS_META, fmtDate } from '@/lib/compliance';
import { useData } from './providers';

// ---------- primitives ----------
export function KpiCard({ label, value, sub, tone = 'green', onClick }: {
  label: string; value: React.ReactNode; sub?: string;
  tone?: 'green' | 'gold' | 'red' | 'orange' | 'blue' | 'grey'; onClick?: () => void;
}) {
  const bar = { green: '#F4B942', gold: '#F4B942', red: '#BC3A3A', orange: '#D97706', blue: '#2155A3', grey: '#6B7280' }[tone];
  return (
    <div className={`kpi ${onClick ? 'cursor-pointer hover:shadow-card transition' : ''}`} onClick={onClick}>
      <span className="absolute top-0 left-0 right-0 h-1.5" style={{ background: bar }} />
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="kpi-sub">{sub}</span>}
    </div>
  );
}

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  const cls: Record<ComplianceStatus, string> = {
    VALID: 'badge-valid', UPCOMING: 'badge-upcoming', NEAR_EXPIRY: 'badge-near',
    CRITICAL: 'badge-critical', EXPIRED: 'badge-expired', MISSING: 'badge-missing',
  };
  return <span className={`badge ${cls[status]}`}>{STATUS_META[status].short}</span>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center my-6">
      <span className="title-pill">{children}</span>
    </div>
  );
}

export function ProgressBar({ pct, height = 10 }: { pct: number; height?: number }) {
  const color = pct >= 80 ? '#0D6B5E' : pct >= 60 ? '#F4B942' : pct >= 40 ? '#D97706' : '#BC3A3A';
  return (
    <div className="w-full rounded-full bg-black/10 overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)` }} />
    </div>
  );
}

export function RefreshCallout() {
  const { data } = useData();
  const m = data?.meta;
  return (
    <div className="callout">
      <span>⟳</span>
      <span>Last Data Refresh: <b>{fmtDate(m?.lastRefresh?.slice(0, 10))} {m?.lastRefresh ? new Date(m.lastRefresh).toTimeString().slice(0, 5) : ''}</b></span>
      <span className="text-gray-400">·</span>
      <span>Status: <b>{m?.status === 'success' ? 'Successful' : m?.status ?? '—'}</b></span>
      {m?.filesProcessed?.length ? (
        <><span className="text-gray-400">·</span><span className="text-xs text-gray-600">{m.filesProcessed.length} Excel file(s)</span></>
      ) : null}
    </div>
  );
}

// ---------- export menu (§28) ----------
const EXPORT_DATASETS = [
  ['master', 'Master Compliance Report'],
  ['expired-certificates', 'Expired Fitness Certificates'],
  ['near-expiry-certificates', 'Near Expiry Fitness Certificates'],
  ['expired-pfa', 'Expired PFA Licenses'],
  ['near-expiry-pfa', 'Near Expiry PFA Licenses'],
  ['expired-agreements', 'Expired Parking Agreements'],
  ['near-expiry-agreements', 'Near Expiry Parking Agreements'],
  ['joyland-register', 'Complete Joyland Register'],
  ['foodcourt-register', 'Complete Food Court Register'],
  ['parking-register', 'Complete Parking Stand Register'],
  ['district-summary', 'District Summary'],
] as const;

export function ExportMenu({ preset }: { preset?: (typeof EXPORT_DATASETS)[number][0] }) {
  const [open, setOpen] = useState(false);
  const items = preset ? EXPORT_DATASETS.filter(([k]) => k === preset) : EXPORT_DATASETS;
  const go = (ds: string, fmt: 'xlsx' | 'csv') => { window.open(`/api/export?dataset=${ds}&format=${fmt}`, '_blank'); setOpen(false); };
  if (preset) {
    return (
      <span className="inline-flex gap-1.5">
        <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => go(preset, 'xlsx')}>⬇ Excel</button>
        <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => go(preset, 'csv')}>⬇ CSV</button>
      </span>
    );
  }
  return (
    <div className="relative">
      <button className="btn-green" onClick={() => setOpen(!open)}>⬇ Export ▾</button>
      {open && (
        <div className="absolute right-0 top-full mt-2 card p-2 w-80 z-50 max-h-96 overflow-y-auto scroll-slim">
          {items.map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-tint text-xs">
              <span className="font-semibold text-brand-green">{label}</span>
              <span className="flex gap-1 shrink-0">
                <button className="px-2 py-0.5 rounded-md bg-brand-gold text-brand-green font-bold" onClick={() => go(k, 'xlsx')}>XLSX</button>
                <button className="px-2 py-0.5 rounded-md bg-brand-mint text-brand-green font-bold" onClick={() => go(k, 'csv')}>CSV</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- filter bar (§22) ----------
export interface Filters {
  division?: string; district?: string; tehsil?: string;
  status?: string; kind?: string; docType?: string; q?: string;
}

export function FilterBar({ filters, setFilters, options, showKind, showDocType }: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  options: { divisions: string[]; districts: string[]; tehsils: string[] };
  showKind?: boolean; showDocType?: boolean;
}) {
  const sel = (key: keyof Filters, label: string, vals: string[]) => (
    <select className="input" value={filters[key] ?? ''} onChange={(e) => setFilters({ ...filters, [key]: e.target.value || undefined })}>
      <option value="">{label}</option>
      {vals.map((v) => <option key={v} value={v}>{v}</option>)}
    </select>
  );
  return (
    <div className="card p-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-extrabold uppercase tracking-wider text-brand-green">🔽 Filters</span>
      {sel('division', 'All Divisions', options.divisions)}
      {sel('district', 'All Districts', options.districts)}
      {sel('tehsil', 'All Tehsils', options.tehsils)}
      {showKind && sel('kind', 'Large + Mini', ['Large', 'Mini'])}
      {showDocType && sel('docType', 'All Documents', ['fitness_certificate', 'pfa_license', 'parking_agreement'])}
      {sel('status', 'All Statuses', ['VALID', 'UPCOMING', 'NEAR_EXPIRY', 'CRITICAL', 'EXPIRED', 'MISSING'])}
      <button className="btn-red !py-1.5 !px-4 text-xs ml-auto" onClick={() => setFilters({})}>Reset Filters</button>
    </div>
  );
}

export function applyDocFilters<T extends { division: string; district: string; tehsil: string; status: ComplianceStatus; docType?: string }>(
  rows: T[], f: Filters
): T[] {
  return rows.filter((r) =>
    (!f.division || r.division === f.division) &&
    (!f.district || r.district === f.district) &&
    (!f.tehsil || r.tehsil === f.tehsil) &&
    (!f.status || r.status === f.status) &&
    (!f.docType || r.docType === f.docType)
  );
}

// ---------- generic data table ----------
export interface Col<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortVal?: (row: T) => string | number;
  className?: string;
}

export function DataTable<T extends { id: string }>({ columns, rows, pageSize = 12, footer }: {
  columns: Col<T>[]; rows: T[]; pageSize?: number; footer?: React.ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const val = col.sortVal ?? ((row: T) => String((row as Record<string, unknown>)[col.key] ?? ''));
    return [...rows].sort((a, b) => {
      const va = val(a); const vb = val(b);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return asc ? cmp : -cmp;
    });
  }, [rows, sortKey, asc, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scroll-slim max-h-[560px] overflow-y-auto">
        <table className="tbl">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="cursor-pointer select-none" onClick={() => {
                  if (sortKey === c.key) setAsc(!asc); else { setSortKey(c.key); setAsc(true); }
                  setPage(0);
                }}>
                  {c.label} {sortKey === c.key ? (asc ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr><td colSpan={columns.length} className="text-center !py-8 text-gray-400">No records match the current filters.</td></tr>
            )}
            {view.map((row) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.className}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer}
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-black/5 text-xs text-gray-500">
          <span>{sorted.length} records · page {page + 1} / {pages}</span>
          <span className="flex gap-1">
            <button className="btn-ghost !py-0.5 !px-3" disabled={page === 0} onClick={() => setPage(page - 1)}>‹ Prev</button>
            <button className="btn-ghost !py-0.5 !px-3" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next ›</button>
          </span>
        </div>
      )}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-brand-mint border-t-brand-gold animate-spin" />
      <p className="text-sm font-semibold text-brand-green">Loading compliance data…</p>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="card p-6 border-2 border-status-expired/40">
      <p className="font-bold text-status-expired">Data load failed</p>
      <p className="text-sm text-gray-600 mt-1">{message}</p>
    </div>
  );
}
