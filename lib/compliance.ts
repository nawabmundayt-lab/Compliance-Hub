// ============================================================
// PSBA Compliance Hub — Compliance calculation engine
// Requirement refs: §4 (6-calendar-month expiry), §5/§9/§12
// (status thresholds), §6/§10/§13/§20 (compliance %)
// ============================================================

import { ComplianceStatus, Thresholds } from './types';

export const DEFAULT_THRESHOLDS: Thresholds = {
  criticalDays: 7,
  nearExpiryDays: 30,
  upcomingDays: 60,
};

/** yyyy-mm-dd for a Date (local time, no TZ drift) */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Proper calendar-month addition (requirement §4):
 * 15-Jan-2026 + 6 months → 15-Jul-2026 (not +180 days).
 * Handles month-length overflow: 31-Aug + 6mo → 28/29-Feb.
 */
export function addCalendarMonths(iso: string, months: number): string {
  const d = parseISODate(iso);
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(day, daysInTarget));
  return toISODate(target);
}

export function daysBetween(fromISO: string, toISO2: string): number {
  const a = parseISODate(fromISO).getTime();
  const b = parseISODate(toISO2).getTime();
  return Math.round((b - a) / 86400000);
}

/** Days remaining until expiry from today (negative = already expired) */
export function calcDaysRemaining(expiryISO: string, today = todayISO()): number {
  return daysBetween(today, expiryISO);
}

/**
 * Status from days remaining (§5/§9/§12), thresholds configurable in Settings.
 * hasDocument=false → MISSING ("no PFA license number/date", "no agreement data").
 */
export function calcStatus(
  daysRemaining: number | undefined,
  hasDocument: boolean,
  t: Thresholds = DEFAULT_THRESHOLDS
): ComplianceStatus {
  if (!hasDocument || daysRemaining === undefined) return 'MISSING';
  if (daysRemaining < 0) return 'EXPIRED';
  if (daysRemaining <= t.criticalDays) return 'CRITICAL';
  if (daysRemaining <= t.nearExpiryDays) return 'NEAR_EXPIRY';
  if (daysRemaining <= t.upcomingDays) return 'UPCOMING';
  return 'VALID';
}

/** Human label & sort weight */
export const STATUS_META: Record<
  ComplianceStatus,
  { label: string; short: string; weight: number; color: string; bg: string }
> = {
  EXPIRED: { label: 'Expired', short: 'Expired', weight: 0, color: '#FFFFFF', bg: '#BC3A3A' },
  CRITICAL: { label: 'Critical · ≤7 days', short: 'Critical', weight: 1, color: '#FFFFFF', bg: '#D97706' },
  NEAR_EXPIRY: { label: 'Near Expiry · ≤30 days', short: 'Near Expiry', weight: 2, color: '#B45309', bg: '#FFF3CD' },
  UPCOMING: { label: 'Upcoming · ≤60 days', short: 'Upcoming', weight: 3, color: '#FFFFFF', bg: '#2155A3' },
  MISSING: { label: 'Missing / No Data', short: 'Missing', weight: 4, color: '#FFFFFF', bg: '#6B7280' },
  VALID: { label: 'Valid · >60 days', short: 'Valid', weight: 5, color: '#FFFFFF', bg: '#0D6B5E' },
};

/** Compliance percentage: valid ÷ total × 100 (§6/§10/§13) */
export function compliancePct(valid: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((valid / total) * 1000) / 10;
}

/** Nice dd-MMM-yyyy ("15-Jul-2026") used across the UI */
export function fmtDate(iso?: string): string {
  if (!iso) return '—';
  const d = parseISODate(iso);
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${String(d.getDate()).padStart(2, '0')}-${mon}-${d.getFullYear()}`;
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${fmtDate(toISODate(d))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
