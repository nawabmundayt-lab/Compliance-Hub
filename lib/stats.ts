// ============================================================
// PSBA Compliance Hub — pure KPI/stat computation helpers
// Client-safe (no fs). All numbers derive from the dataset —
// nothing hard-coded (requirement §24).
// ============================================================

import { ComplianceDoc, Dataset, DocType, Facility, FacilityType } from './types';
import { compliancePct } from './compliance';

export const byType = (f: Facility[], t: FacilityType) => f.filter((x) => x.type === t);
export const docsOf = (d: ComplianceDoc[], t: DocType) => d.filter((x) => x.docType === t);

const ACTIONABLE = new Set(['EXPIRED', 'CRITICAL', 'NEAR_EXPIRY', 'UPCOMING']);

export interface ModuleStats {
  totalFacilities: number;
  totalDocs: number;
  valid: number;
  upcoming: number;
  nearExpiry: number;
  critical: number;
  expired: number;
  missing: number;
  compliancePct: number;
}

export function moduleStats(facilities: Facility[], docs: ComplianceDoc[], type: FacilityType): ModuleStats {
  const dt: DocType = type === 'joyland' ? 'fitness_certificate' : type === 'food_court' ? 'pfa_license' : 'parking_agreement';
  const d = docsOf(docs, dt);
  const count = (s: string) => d.filter((x) => x.status === s).length;
  const valid = count('VALID');
  // Missing documents are excluded from the % denominator only for joylands
  // (per-ride certs). For food courts & parking the doc represents the facility
  // itself, so MISSING counts against compliance (§9: not compliant merely by existing).
  const denominator = type === 'joyland' ? d.filter((x) => x.status !== 'MISSING').length : byType(facilities, type).length;
  return {
    totalFacilities: byType(facilities, type).length,
    totalDocs: d.length,
    valid,
    upcoming: count('UPCOMING'),
    nearExpiry: count('NEAR_EXPIRY'),
    critical: count('CRITICAL'),
    expired: count('EXPIRED'),
    missing: count('MISSING'),
    compliancePct: compliancePct(valid, denominator),
  };
}

export interface AllStats {
  joyland: ModuleStats & { large: number; mini: number; totalRides: number };
  foodCourt: ModuleStats;
  parking: ModuleStats;
  overallPct: number;
  weakest: { label: string; pct: number };
  actionRequired: number;
}

export function computeStats(data: Pick<Dataset, 'facilities' | 'documents'>): AllStats {
  const jBase = moduleStats(data.facilities, data.documents, 'joyland');
  const joyFac = byType(data.facilities, 'joyland');
  const fc = moduleStats(data.facilities, data.documents, 'food_court');
  const pk = moduleStats(data.facilities, data.documents, 'parking_stand');

  const modules = [
    { label: 'Joyland Fitness Certificates', pct: jBase.compliancePct },
    { label: 'Food Court PFA Licenses', pct: fc.compliancePct },
    { label: 'Parking Agreements', pct: pk.compliancePct },
  ];
  const weakest = [...modules].sort((a, b) => a.pct - b.pct)[0];
  const overallPct = Math.round((modules.reduce((a, m) => a + m.pct, 0) / modules.length) * 10) / 10;

  return {
    joyland: {
      ...jBase,
      large: joyFac.filter((f) => f.joylandKind === 'Large').length,
      mini: joyFac.filter((f) => f.joylandKind === 'Mini').length,
      totalRides: joyFac.reduce((a, f) => a + (f.totalRides ?? 0), 0),
    },
    foodCourt: fc,
    parking: pk,
    overallPct,
    weakest,
    actionRequired: data.documents.filter((d) => ACTIONABLE.has(d.status)).length,
  };
}

/** Priority-sorted urgent records (§15) */
export function actionList(docs: ComplianceDoc[], limit?: number): ComplianceDoc[] {
  const w = { EXPIRED: 0, CRITICAL: 1, NEAR_EXPIRY: 2, UPCOMING: 3, MISSING: 4, VALID: 5 } as const;
  const urgent = docs
    .filter((d) => ACTIONABLE.has(d.status))
    .sort((a, b) => w[a.status] - w[b.status] || (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999));
  return limit ? urgent.slice(0, limit) : urgent;
}

/** Group docs expiring in calendar months (§17) */
export function expiryByMonth(docs: ComplianceDoc[], fromISO: string, months: number) {
  const start = new Date(fromISO + 'T00:00:00');
  const buckets: { key: string; label: string; fitness: number; pfa: number; parking: number; total: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en', { month: 'long', year: 'numeric' });
    buckets.push({ key, label, fitness: 0, pfa: 0, parking: 0, total: 0 });
  }
  for (const doc of docs) {
    if (!doc.expiryDate || doc.status === 'EXPIRED') continue;
    const key = doc.expiryDate.slice(0, 7);
    const b = buckets.find((x) => x.key === key);
    if (!b) continue;
    if (doc.docType === 'fitness_certificate') b.fitness++;
    else if (doc.docType === 'pfa_license') b.pfa++;
    else b.parking++;
    b.total++;
  }
  return buckets;
}

/** District-level rollup used by District Analysis (§18) */
export function districtRollup(data: Pick<Dataset, 'facilities' | 'documents'>) {
  const districts = [...new Set(data.facilities.map((f) => f.district).filter(Boolean))].sort();
  return districts.map((dist) => {
    const facs = data.facilities.filter((f) => f.district === dist);
    const docs = data.documents.filter((d) => d.district === dist);
    const byDoc = (t: DocType) => docs.filter((d) => d.docType === t);
    const expired = (t: DocType) => byDoc(t).filter((d) => d.status === 'EXPIRED').length;
    const near = (t: DocType) => byDoc(t).filter((d) => d.status === 'CRITICAL' || d.status === 'NEAR_EXPIRY').length;
    const actionableDocs = docs.filter((d) => d.docNumber);
    const validDocs = actionableDocs.filter((d) => d.status === 'VALID').length;
    return {
      district: dist,
      division: facs[0]?.division ?? '',
      large: facs.filter((f) => f.type === 'joyland' && f.joylandKind === 'Large').length,
      mini: facs.filter((f) => f.type === 'joyland' && f.joylandKind === 'Mini').length,
      joylands: facs.filter((f) => f.type === 'joyland').length,
      rides: facs.filter((f) => f.type === 'joyland').reduce((a, f) => a + (f.totalRides ?? 0), 0),
      expiredCerts: expired('fitness_certificate'),
      nearCerts: near('fitness_certificate'),
      foodCourts: facs.filter((f) => f.type === 'food_court').length,
      expiredPfa: expired('pfa_license'),
      nearPfa: near('pfa_license'),
      parking: facs.filter((f) => f.type === 'parking_stand').length,
      expiredAgreements: expired('parking_agreement'),
      nearAgreements: near('parking_agreement'),
      compliancePct: compliancePct(validDocs, actionableDocs.length),
    };
  });
}

/** Division-level rollup (§19) */
export function divisionRollup(data: Pick<Dataset, 'facilities' | 'documents'>) {
  const divisions = [...new Set(data.facilities.map((f) => f.division).filter(Boolean))].sort();
  return divisions.map((div) => {
    const facs = data.facilities.filter((f) => f.division === div);
    const docs = data.documents.filter((d) => d.division === div);
    const pct = (t: DocType, facilityType: FacilityType) => {
      const d = docs.filter((x) => x.docType === t);
      const valid = d.filter((x) => x.status === 'VALID').length;
      return compliancePct(valid, t === 'fitness_certificate' ? d.length : facs.filter((f) => f.type === facilityType).length);
    };
    return {
      division: div,
      joylands: facs.filter((f) => f.type === 'joyland').length,
      foodCourts: facs.filter((f) => f.type === 'food_court').length,
      parking: facs.filter((f) => f.type === 'parking_stand').length,
      fitnessPct: pct('fitness_certificate', 'joyland'),
      pfaPct: pct('pfa_license', 'food_court'),
      agreementPct: pct('parking_agreement', 'parking_stand'),
    };
  });
}
