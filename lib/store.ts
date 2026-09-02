// ============================================================
// PSBA Compliance Hub — JSON data store + Excel refresh pipeline
// Layout:
//   data/excel/*.xlsx   ← the 3 source Excel files (imported daily)
//   data/store.json     ← normalized dataset produced by refresh
// ============================================================

import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { normalizeWorkbooks } from './excel';
import {
  buildFoodCourtsSheet, buildJoylandsSheet, buildParkingSheet, buildRidesSheet,
  ExcelSheetDef,
} from './sample-data';
import {
  ComplianceDoc, Dataset, RefreshMeta, Settings,
} from './types';
import { DEFAULT_THRESHOLDS, addCalendarMonths, calcDaysRemaining, calcStatus, todayISO } from './compliance';

const DATA_DIR = path.join(process.cwd(), 'data');
export const EXCEL_DIR = path.join(DATA_DIR, 'excel');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export function defaultSettings(): Settings {
  return {
    thresholds: { ...DEFAULT_THRESHOLDS },
    fitnessValidityMonths: 6,
    autoRefreshHour: 6,
  };
}

interface StoreShape {
  facilities: Dataset['facilities'];
  documents: Dataset['documents'];
  quality: Dataset['quality'];
  meta: RefreshMeta;
  settings: Settings;
}

// ---------- low-level IO ----------
function ensureDirs() {
  fs.mkdirSync(EXCEL_DIR, { recursive: true });
}

function readStore(): StoreShape | null {
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeStore(s: StoreShape) {
  ensureDirs();
  fs.writeFileSync(STORE_FILE, JSON.stringify(s, null, 1));
}

// ---------- demo seed (only when /data/excel is empty) ----------
function writeSheetXlsx(filePath: string, sheets: ExcelSheetDef[]) {
  const wb = XLSX.utils.book_new();
  for (const sh of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([sh.header, ...sh.rows]);
    XLSX.utils.book_append_sheet(wb, ws, sh.sheetName);
  }
  const buf: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  fs.writeFileSync(filePath, buf);
}

function seedDemoExcelIfEmpty(): boolean {
  ensureDirs();
  const hasExcel = fs.readdirSync(EXCEL_DIR).some((f) => /\.(xlsx|xls|csv)$/i.test(f));
  if (hasExcel) return false;

  const joylands = buildJoylandsSheet();
  const rides = buildRidesSheet(joylands);
  writeSheetXlsx(path.join(EXCEL_DIR, 'PSBA_Joylands_Register.xlsx'), [joylands, rides]);
  writeSheetXlsx(path.join(EXCEL_DIR, 'PSBA_FoodCourts_PFA.xlsx'), [buildFoodCourtsSheet()]);
  writeSheetXlsx(path.join(EXCEL_DIR, 'PSBA_Parking_Agreements.xlsx'), [buildParkingSheet()]);
  return true;
}

// ---------- refresh pipeline (§23) ----------
export function refreshFromExcel(opts?: { seedIfEmpty?: boolean }): Dataset {
  const started = Date.now();
  ensureDirs();
  if (opts?.seedIfEmpty !== false) seedDemoExcelIfEmpty();

  const prev = readStore();
  const settings: Settings = prev?.settings ?? defaultSettings();

  const files = fs.readdirSync(EXCEL_DIR)
    .filter((f) => /\.(xlsx|xls)$/i.test(f))
    .map((name) => ({ name, buffer: fs.readFileSync(path.join(EXCEL_DIR, name)) }));

  let result: ReturnType<typeof normalizeWorkbooks>;
  let meta: RefreshMeta;
  try {
    result = normalizeWorkbooks(files, settings);
    meta = {
      lastRefresh: new Date().toISOString(),
      status: 'success',
      message: files.length === 0 ? 'No Excel files found in /data/excel' : 'Successful',
      filesProcessed: result.filesProcessed,
      durationMs: Date.now() - started,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown refresh error';
    meta = { lastRefresh: new Date().toISOString(), status: 'failed', message, filesProcessed: [] };
    result = { facilities: [], documents: [], quality: [{
      id: 'dq-refresh', severity: 'error', module: 'joyland', facilityName: '—',
      field: 'refresh', message,
    }], filesProcessed: [] };
  }

  const store: StoreShape = {
    facilities: result.facilities,
    documents: result.documents,
    quality: result.quality,
    meta,
    settings,
  };
  writeStore(store);
  return store;
}

/** Load dataset; seeds + refreshes on first run */
export function getDataset(): Dataset {
  const s = readStore();
  if (s) return s;
  return refreshFromExcel({ seedIfEmpty: true });
}

// ---------- settings ----------
export function saveSettings(patch: Partial<Settings>): Dataset {
  const s = getDataset();
  const thresholds = { ...s.settings.thresholds, ...(patch.thresholds ?? {}) };
  const settings: Settings = { ...s.settings, ...patch, thresholds };

  // Threshold change → recompute every document status without re-importing
  const documents = s.documents.map((d) => {
    const hasDoc = Boolean(d.docNumber || d.issueDate || d.expiryDate);
    let expiryDate = d.expiryDate;
    if (d.facilityType === 'joyland' && d.issueDate && patch.fitnessValidityMonths) {
      expiryDate = addCalendarMonths(d.issueDate, patch.fitnessValidityMonths);
    }
    const daysRemaining = expiryDate ? calcDaysRemaining(expiryDate) : undefined;
    return { ...d, expiryDate, daysRemaining, status: calcStatus(daysRemaining, hasDoc, thresholds) };
  });

  const next: StoreShape = { ...s, settings, documents };
  writeStore(next);
  return next;
}

// ---------- record updates (§27) ----------
export function updateDocument(
  id: string,
  patch: Partial<Pick<ComplianceDoc,
    'docNumber' | 'issueDate' | 'expiryDate' | 'lastInspectionDate' | 'renewalDate' | 'remarks' | 'rideCategory'>>,
  updatedBy: string
): Dataset {
  const s = getDataset();
  const documents = s.documents.map((d) => {
    if (d.id !== id) return d;
    const merged = { ...d, ...patch, updatedBy, lastUpdated: new Date().toISOString() };
    // fitness certificates: expiry follows issue + N calendar months unless manually overridden
    if (d.docType === 'fitness_certificate' && patch.issueDate && !patch.expiryDate) {
      merged.expiryDate = addCalendarMonths(patch.issueDate, s.settings.fitnessValidityMonths);
    }
    const hasDoc = Boolean(merged.docNumber || merged.issueDate || merged.expiryDate);
    merged.daysRemaining = merged.expiryDate ? calcDaysRemaining(merged.expiryDate) : undefined;
    merged.status = calcStatus(merged.daysRemaining, hasDoc, s.settings.thresholds);
    return merged;
  });
  const next: StoreShape = { ...s, documents };
  writeStore(next);
  return next;
}

export function listExcelFiles(): { name: string; sizeKB: number; modified: string }[] {
  ensureDirs();
  return fs.readdirSync(EXCEL_DIR)
    .filter((f) => /\.(xlsx|xls)$/i.test(f))
    .map((name) => {
      const st = fs.statSync(path.join(EXCEL_DIR, name));
      return { name, sizeKB: Math.round(st.size / 1024), modified: st.mtime.toISOString() };
    });
}

export function saveUploadedExcel(filename: string, buffer: Buffer) {
  ensureDirs();
  const safe = filename.replace(/[^\w.\-]+/g, '_');
  fs.writeFileSync(path.join(EXCEL_DIR, safe), buffer);
}

export { todayISO };
