'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useData } from './providers';
import { fmtDateTime } from '@/lib/compliance';
import { DOC_LABEL } from '@/lib/types';

const NAV = [
  { href: '/', label: 'Executive Dashboard', icon: '📊' },
  { href: '/joylands', label: 'Joylands', icon: '🎡' },
  { href: '/certificates', label: 'Fitness Certificates', icon: '📜' },
  { href: '/food-courts', label: 'Food Courts · PFA', icon: '🍽️' },
  { href: '/parking', label: 'Parking Stands', icon: '🅿️' },
  { href: '/near-expiry', label: 'Near Expiry', icon: '⏰' },
  { href: '/expired', label: 'Expired', icon: '🚫' },
  { href: '/calendar', label: 'Expiry Calendar', icon: '📅' },
  { href: '/districts', label: 'District Analysis', icon: '🗺️' },
  { href: '/data-quality', label: 'Data Quality', icon: '🧹' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

function GlobalSearch() {
  const { data } = useData();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!data || q.trim().length < 2) return [];
    const needle = q.trim().toLowerCase();
    const hits = data.documents.filter((d) =>
      [d.facilityName, d.docNumber, d.rideName, d.rideId, d.district, d.tehsil]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))
    );
    return hits.slice(0, 12);
  }, [data, q]);

  return (
    <div className="relative flex-1 max-w-xl">
      <input
        className="w-full rounded-pill bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand-gold focus:bg-white/15 transition"
        placeholder="🔎 Search facility, ride, certificate / license / agreement no, district, tehsil…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 card overflow-hidden z-50 max-h-96 overflow-y-auto scroll-slim">
          {results.map((r) => (
            <div key={r.id} className="px-4 py-2.5 border-b border-black/5 hover:bg-[#FFF9E6] flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-bold text-brand-green truncate">{r.facilityName}{r.rideName ? ` · ${r.rideName}` : ''}</p>
                <p className="text-xs text-gray-500 truncate">
                  {DOC_LABEL[r.docType]} {r.docNumber ? `· ${r.docNumber}` : ''} · {r.district}
                </p>
              </div>
              <span className={`badge badge-${r.status === 'NEAR_EXPIRY' ? 'near' : r.status.toLowerCase().replace('_expiry', '')}`}>
                {r.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, loading, refresh } = useData();
  const meta = data?.meta;

  return (
    <div className="min-h-screen flex">
      {/* ===== Sidebar — dark green, gold accents (as per template) ===== */}
      <aside className="w-60 shrink-0 flex flex-col sticky top-0 h-screen" style={{ background: 'linear-gradient(180deg,#0A3B1E 0%, #14522A 100%)' }}>
        <div className="h-2 bg-brand-gold" />
        <div className="flex flex-col items-center pt-5 pb-4 px-4 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-gold overflow-hidden flex items-center justify-center shadow-bar">
            <Image src="/psba-logo.png" alt="PSBA Logo" width={56} height={56} className="object-contain" />
          </div>
          <p className="mt-3 text-center text-brand-gold font-extrabold tracking-widest text-xs">PSBA</p>
          <p className="text-center text-white/90 text-[0.7rem] font-semibold leading-tight">Punjab Sahulat Bazaar Authority</p>
          <p className="text-center text-white/50 text-[0.62rem] mt-1">Facilities Compliance &amp; Monitoring</p>
        </div>
        <nav className="flex-1 overflow-y-auto scroll-slim p-3 space-y-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`nav-item ${pathname === n.href ? 'active' : ''}`}>
              <span aria-hidden>{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 text-[0.62rem] text-white/40 text-center border-t border-white/10">
          Government of the Punjab · v1.0
        </div>
      </aside>

      {/* ===== Main ===== */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 shadow-bar" style={{ background: '#0A3B1E' }}>
          <div className="px-5 py-3 flex items-center gap-4">
            <GlobalSearch />
            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="text-[0.62rem] uppercase tracking-widest text-white/50">Last Data Refresh</span>
              <span className="text-xs font-bold text-brand-gold">{fmtDateTime(meta?.lastRefresh)}</span>
            </div>
            <span className={`hidden sm:inline text-[0.65rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-pill ${meta?.status === 'success' ? 'bg-brand-gold text-brand-green' : meta?.status === 'failed' ? 'bg-status-expired text-white' : 'bg-white/20 text-white'}`}>
              {meta?.status ?? '…'}
            </span>
            <button onClick={refresh} disabled={loading} className="btn-gold disabled:opacity-60">
              {loading ? '⟳ Working…' : '⟳ Refresh Data'}
            </button>
          </div>
          <div className="h-1.5 bg-brand-gold" />
        </header>

        <main className="flex-1 p-5 lg:p-7 max-w-[1600px] w-full mx-auto">{children}</main>

        <footer className="px-6 py-4 text-center text-xs text-gray-500">
          PSBA Compliance Hub · Facilities Compliance &amp; Monitoring Dashboard · Punjab Sahulat Bazaar Authority
        </footer>
      </div>
    </div>
  );
}
