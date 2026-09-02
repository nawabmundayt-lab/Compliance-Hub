// ============================================================
// PSBA Compliance Hub — Excel import & normalization layer
// Requirement refs: §23-§26 (auto-refresh, no hard-coding,
// column-name mapping, data-quality checks)
// ============================================================

import * as XLSX from 'xlsx';
import {
  ColumnMappingEntry, ComplianceDoc, DataQualityIssue, Dataset, Facility,
  FacilityType, JoylandKind, RefreshMeta, Settings,
} from './types';
import {
  addCalendarMonths, calcDaysRemaining, calcStatus, toISODate, todayISO,
} from './compliance';

// -----------------------------------------------------------
// Column mapping — many possible header spellings → one field
// -----------------------------------------------------------
export const COLUMN_MAP: ColumnMappingEntry[] = [
  { logicalField: 'facilityId', synonyms: ['Joyland ID', 'Food Court ID', 'Parking Stand ID', 'Facility ID', 'ID', 'Sr', 'Sr.', 'Sr No', 'Serial'] },
  { logicalField: 'facilityName', synonyms: ['Joyland Name', 'Joyland', 'Food Court Name', 'Food Court', 'Parking Stand Name', 'Parking Stand', 'Facility Name', 'Name', 'Stand Name', 'Ride Owner'] },
  { logicalField: 'joylandKind', synonyms: ['Joyland Type', 'Type', 'Large / Mini', 'Large/Mini', 'Classification', 'Joyland Category'] },
  { logicalField: 'division', synonyms: ['Division', 'Division Name'] },
  { logicalField: 'district', synonyms: ['District', 'District Name', 'City'] },
  { logicalField: 'tehsil', synonyms: ['Tehsil', 'Tehsil Name', 'Town'] },
  { logicalField: 'location', synonyms: ['Address', 'Location', 'Site', 'Area', 'Place'] },
  { logicalField: 'contractor', synonyms: ['Contractor', 'Contractor / Agreement Holder', 'Agreement Holder', 'Contractor Name', 'Holder'] },
  { logicalField: 'totalRides', synonyms: ['Total Rides', 'No of Rides', 'Rides'] },
  { logicalField: 'activeRides', synonyms: ['Active Rides', 'Operational Rides'] },
  { logicalField: 'inactiveRides', synonyms: ['Inactive Rides', 'Non-Operational Rides', 'Non Operational Rides'] },
  { logicalField: 'rideName', synonyms: ['Ride Name', 'Ride', 'Ride Title'] },
  { logicalField: 'rideId', synonyms: ['Ride ID', 'Ride No', 'Ride Number', 'Ride Code'] },
  { logicalField: 'rideCategory', synonyms: ['Ride Category', 'Ride Type', 'Category'] },
  { logicalField: 'docNumber', synonyms: ['Certificate Number', 'Certificate No', 'Fitness Certificate Number', 'Fitness Certificate No', 'PFA License Number', 'PFA Licence Number', 'PFA License No', 'License Number', 'Licence Number', 'License No', 'Agreement Number', 'Agreement No', 'Document Number'] },
  { logicalField: 'issueDate', synonyms: ['Certificate Issue Date', 'License Issue Date', 'Licence Issue Date', 'Issue Date', 'Agreement Start Date', 'Start Date', 'Date of Issue'] },
  { logicalField: 'expiryDate', synonyms: ['Certificate Expiry Date', 'License Expiry Date', 'Licence Expiry Date', 'Expiry Date', 'Fitness Certificate Expiry', 'Agreement End Date', 'End Date', 'Date of Expiry', 'Valid Upto', 'Valid Until'] },
  { logicalField: 'lastInspectionDate', synonyms: ['Last Inspection Date', 'Inspection Date', 'Last Inspection'] },
  { logicalField: 'renewalDate', synonyms: ['Renewal Date', 'Last Renewal Date', 'Renewed On'] },
  { logicalField: 'remarks', synonyms: ['Remarks', 'Remarks / Notes', 'Notes', 'Comments'] },
];

const norm = (s: unknown) =>
  String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

/** Build header → logicalField map for a sheet's header row */
function mapHeaders(headerRow: unknown[]): Record<number, string> {
  const index: Record<number, string> = {};
  headerRow.forEach((h, i) => {
    const n = norm(h);
    if (!n) return;
    for (const entry of COLUMN_MAP) {
      if (entry.synonyms.some((syn) => norm(syn) === n)) {
        index[i] = entry.logicalField;
        return;
      }
    }
  });
  return index;
}

/** Which module does this sheet belong to? (detected from headers) */
export function detectModule(headerRow: unknown[]): FacilityType | null {
  const heads = headerRow.map((h) => norm(h)).join(' | ');
  if (/pfa|food court|foodcourt/.test(heads)) return 'food_court';
  if (/parking|agreement/.test(heads)) return 'parking_stand';
  if (/joyland|ride|fitness/.test(heads)) return 'joyland';
  return null;
}

// -----------------------------------------------------------
// Cell value coercion
// -----------------------------------------------------------
function asString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return toISODate(v);
  return String(v).trim();
}

function asNumber(v: unknown): number | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

/** Accepts Date | Excel serial | dd-MMM-yyyy | yyyy-mm-dd | dd/mm/yyyy */
function asISODate(v: unknown): string | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (v instanceof Date && !isNaN(v.getTime())) return toISODate(v);
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    // Excel serial date (1900 system)
    const epoch = new Date(1899, 11, 30);
    return toISODate(new Date(epoch.getTime() + v * 86400000));
  }
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); // yyyy-mm-dd
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  const months: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  m = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{2,4})$/); // 15-Jul-2026
  if (m) {
    const mm = months[m[2].slice(0, 3).toLowerCase()];
    const yy = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    if (mm) return `${yy}-${String(mm).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/); // dd/mm/yyyy
  if (m) {
    const yy = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    return `${yy}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : toISODate(d);
}

function asJoylandKind(v: unknown): JoylandKind | undefined {
  const s = norm(v);
  if (!s) return undefined;
  if (s.startsWith('large')) return 'Large';
  if (s.startsWith('mini') || s.startsWith('small')) return 'Mini';
  return undefined;
}

// -----------------------------------------------------------
// Normalization result
// -----------------------------------------------------------
export interface NormalizeResult {
  facilities: Facility[];
  documents: ComplianceDoc[];
  quality: DataQualityIssue[];
  filesProcessed: string[];
}

const KNOWN_DISTRICTS = new Set([
  'Lahore', 'Gujranwala', 'Faisalabad', 'Multan', 'Rawalpindi', 'Bahawalpur',
  'Sargodha', 'Sialkot', 'Gujrat', 'Sheikhupura', 'Kasur', 'Okara', 'Sahiwal',
  'Jhang', 'Toba Tek Singh', 'Chiniot', 'Nankana Sahib', 'Rahim Yar Khan',
  'Bahawalnagar', 'Dera Ghazi Khan', 'Muzaffargarh', 'Layyah', 'Rajanpur',
  'Khanewal', 'Vehari', 'Lodhran', 'Attock', 'Chakwal', 'Jhelum', 'Mianwali',
  'Khushab', 'Bhakkar', 'Hafizabad', 'Mandi Bahauddin', 'Narowal', 'Pakpattan',
  'Murree', 'Talagang', 'Kot Addu', 'Wazirabad', 'Jaranwala',
]);

let seq = 0;
function qid(prefix: string) { return `${prefix}-${++seq}`; }

function quality(
  list: DataQualityIssue[], severity: 'error' | 'warning', module: FacilityType,
  facilityName: string, field: string, message: string, value?: string, rowRef?: string
) {
  list.push({ id: qid('dq'), severity, module, facilityName, field, message, value, rowRef });
}

/** Normalize all uploaded Excel workbooks into unified facilities + documents */
export function normalizeWorkbooks(
  files: { name: string; buffer: Buffer }[],
  settings: Settings
): NormalizeResult {
  seq = 0;
  const facilities = new Map<string, Facility>();
  const documents: ComplianceDoc[] = [];
  const issues: DataQualityIssue[] = [];
  const filesProcessed: string[] = [];
  const seenDocNumbers = new Map<string, string>(); // docNumber -> facility (duplicate detection)

  const upsertFacility = (f: Facility) => {
    const key = `${f.type}::${norm(f.name)}::${norm(f.district)}`;
    const existing = facilities.get(key);
    if (existing) {
      // enrich existing with any newly-known fields
      Object.assign(existing, Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== undefined && v !== '')
      ), { id: existing.id, lastUpdated: existing.lastUpdated });
      return existing;
    }
    facilities.set(key, f);
    return f;
  };

  for (const file of files) {
    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
    } catch {
      issues.push({ id: qid('dq'), severity: 'error', module: 'joyland', facilityName: '—', field: 'file', message: `Could not parse file: ${file.name}` });
      continue;
    }
    filesProcessed.push(file.name);

    for (const sheetName of wb.SheetNames) {
      const rows: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' });
      if (rows.length < 2) continue;

      // find header row = first row containing ≥2 known synonyms
      let headerIdx = -1; let headerMap: Record<number, string> = {};
      for (let r = 0; r < Math.min(rows.length, 10); r++) {
        const m = mapHeaders(rows[r]);
        if (Object.keys(m).length >= 2) { headerIdx = r; headerMap = m; break; }
      }
      if (headerIdx === -1) continue;

      const module = detectModule(rows[headerIdx]);
      if (!module) {
        issues.push({ id: qid('dq'), severity: 'warning', module: 'joyland', facilityName: '—', field: 'sheet', message: `Unrecognized sheet skipped: ${file.name} → ${sheetName}` });
        continue;
      }

      for (let r = headerIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.every((c) => asString(c) === '')) continue;
        const rec: Record<string, string | number | undefined> = {};
        Object.entries(headerMap).forEach(([colIdx, field]) => {
          const raw = row[Number(colIdx)];
          if (field.endsWith('Date') || field === 'issueDate' || field === 'expiryDate') rec[field] = asISODate(raw);
          else if (['totalRides', 'activeRides', 'inactiveRides'].includes(field)) rec[field] = asNumber(raw);
          else rec[field] = asString(raw);
        });

        const rowRef = `${sheetName}#${r + 1}`;
        const name = rec.facilityName as string;
        if (!name) {
          quality(issues, 'error', module, '(blank)', 'facilityName', 'Missing facility name', undefined, rowRef);
          continue;
        }

        const district = (rec.district as string) || '';
        if (!district) quality(issues, 'warning', module, name, 'district', 'Missing district', undefined, rowRef);
        else if (!KNOWN_DISTRICTS.has(district)) quality(issues, 'warning', module, name, 'district', 'Unknown district (check spelling)', district, rowRef);

        const joyKind = module === 'joyland' ? asJoylandKind(rec.joylandKind) : undefined;
        if (module === 'joyland' && !joyKind && !rec.rideName) {
          quality(issues, 'warning', module, name, 'joylandKind', 'Missing Joyland type (Large/Mini)', undefined, rowRef);
        }

        const fac = upsertFacility({
          id: `${module}-${norm(name).replace(/[^a-z0-9]+/g, '-')}-${norm(district).replace(/[^a-z0-9]+/g, '') || 'x'}`,
          type: module,
          name,
          joylandKind: joyKind,
          division: (rec.division as string) || '',
          district,
          tehsil: (rec.tehsil as string) || '',
          location: (rec.location as string) || '',
          contractor: rec.contractor as string | undefined,
          totalRides: rec.totalRides as number | undefined,
          activeRides: rec.activeRides as number | undefined,
          inactiveRides: rec.inactiveRides as number | undefined,
          remarks: rec.remarks as string | undefined,
          lastUpdated: todayISO(),
        });

        // --- Document row? (has doc number or dates or ride) ---
        const docNumber = (rec.docNumber as string) || '';
        const issueDate = rec.issueDate as string | undefined;
        let expiryDate = rec.expiryDate as string | undefined;
        const isDocRow = docNumber || issueDate || expiryDate || (module === 'joyland' && rec.rideName);

        if (isDocRow) {
          if (!docNumber) quality(issues, 'error', module, name, 'docNumber', 'Missing certificate/license/agreement number', undefined, rowRef);
          if (!issueDate) quality(issues, 'warning', module, name, 'issueDate', 'Missing issue/start date', undefined, rowRef);

          // §4 — fitness certificates: expiry = issue + 6 calendar months when missing
          if (!expiryDate && issueDate && module === 'joyland') {
            expiryDate = addCalendarMonths(issueDate, settings.fitnessValidityMonths);
          }
          if (!expiryDate && issueDate && module !== 'joyland') {
            quality(issues, 'warning', module, name, 'expiryDate', 'Missing expiry/end date', undefined, rowRef);
          }

          const docType = module === 'joyland' ? 'fitness_certificate'
            : module === 'food_court' ? 'pfa_license' : 'parking_agreement';

          if (docNumber) {
            const dupOf = seenDocNumbers.get(`${docType}::${norm(docNumber)}`);
            if (dupOf) quality(issues, 'error', module, name, 'docNumber', `Duplicate document number (also on ${dupOf})`, docNumber, rowRef);
            else seenDocNumbers.set(`${docType}::${norm(docNumber)}`, name);
          }

          const daysRemaining = expiryDate ? calcDaysRemaining(expiryDate) : undefined;
          const status = calcStatus(daysRemaining, Boolean(docNumber || issueDate || expiryDate), settings.thresholds);

          documents.push({
            id: qid('doc'),
            facilityId: fac.id,
            facilityName: name,
            facilityType: module,
            docType,
            docNumber,
            rideName: rec.rideName as string | undefined,
            rideId: rec.rideId as string | undefined,
            rideCategory: rec.rideCategory as string | undefined,
            district: fac.district, division: fac.division, tehsil: fac.tehsil,
            issueDate, expiryDate, daysRemaining, status,
            lastInspectionDate: rec.lastInspectionDate as string | undefined,
            renewalDate: rec.renewalDate as string | undefined,
            remarks: rec.remarks as string | undefined,
            lastUpdated: todayISO(),
          });
        }
      }
    }
  }

  // --- §9/§12: facilities whose compliance document is entirely absent → MISSING ---
  const withDoc = new Set(documents.map((d) => d.facilityId));
  for (const fac of facilities.values()) {
    if (fac.type !== 'joyland' && !withDoc.has(fac.id)) {
      documents.push({
        id: qid('doc'), facilityId: fac.id, facilityName: fac.name, facilityType: fac.type,
        docType: fac.type === 'food_court' ? 'pfa_license' : 'parking_agreement',
        docNumber: '', district: fac.district, division: fac.division, tehsil: fac.tehsil,
        status: 'MISSING', remarks: 'No license/agreement data on file', lastUpdated: todayISO(),
      });
      quality(issues, 'error', fac.type, fac.name, 'docNumber',
        fac.type === 'food_court' ? 'Missing PFA license (no license number/date)' : 'No agreement data on file');
    }
  }

  return { facilities: [...facilities.values()], documents, quality: issues, filesProcessed };
}

export function okMeta(files: string[], ms: number): RefreshMeta {
  return { lastRefresh: new Date().toISOString(), status: 'success', message: 'Successful', filesProcessed: files, durationMs: ms };
}
