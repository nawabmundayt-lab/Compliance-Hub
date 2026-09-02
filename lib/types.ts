// ============================================================
// PSBA Compliance Hub — Domain model
// ============================================================

export type FacilityType = 'joyland' | 'food_court' | 'parking_stand';

export type DocType = 'fitness_certificate' | 'pfa_license' | 'parking_agreement';

export type ComplianceStatus =
  | 'VALID'
  | 'UPCOMING'
  | 'NEAR_EXPIRY'
  | 'CRITICAL'
  | 'EXPIRED'
  | 'MISSING';

export type JoylandKind = 'Large' | 'Mini';

export interface Facility {
  id: string;
  type: FacilityType;
  name: string;
  joylandKind?: JoylandKind; // joylands only
  division: string;
  district: string;
  tehsil: string;
  location: string; // address / location
  contractor?: string; // parking stands
  totalRides?: number;
  activeRides?: number;
  inactiveRides?: number;
  remarks?: string;
  lastUpdated: string; // ISO
}

export interface ComplianceDoc {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: FacilityType;
  docType: DocType;
  docNumber: string;
  // ride context (fitness certificates)
  rideName?: string;
  rideId?: string;
  rideCategory?: string;
  district: string;
  division: string;
  tehsil: string;
  issueDate?: string; // ISO yyyy-mm-dd
  expiryDate?: string; // ISO yyyy-mm-dd
  daysRemaining?: number;
  status: ComplianceStatus;
  lastInspectionDate?: string;
  renewalDate?: string;
  remarks?: string;
  updatedBy?: string;
  lastUpdated: string;
}

export interface Thresholds {
  criticalDays: number; // default 7
  nearExpiryDays: number; // default 30
  upcomingDays: number; // default 60
}

export interface ColumnMappingEntry {
  logicalField: string;
  synonyms: string[];
}

export interface FileSlot {
  key: 'joylands' | 'foodcourts' | 'parking';
  label: string;
  foundFile?: string;
}

export interface Settings {
  thresholds: Thresholds;
  fitnessValidityMonths: number; // default 6 calendar months
  autoRefreshHour: number; // 0-23, informational for scheduler
}

export interface DataQualityIssue {
  id: string;
  severity: 'error' | 'warning';
  module: FacilityType;
  facilityName: string;
  field: string;
  message: string;
  value?: string;
  rowRef?: string;
}

export interface RefreshMeta {
  lastRefresh: string | null;
  status: 'success' | 'failed' | 'never';
  message: string;
  filesProcessed: string[];
  durationMs?: number;
}

export interface Dataset {
  facilities: Facility[];
  documents: ComplianceDoc[];
  quality: DataQualityIssue[];
  meta: RefreshMeta;
  settings: Settings;
}

export const DOC_LABEL: Record<DocType, string> = {
  fitness_certificate: 'Ride Fitness Certificate',
  pfa_license: 'PFA License',
  parking_agreement: 'Agreement',
};

export const MODULE_LABEL: Record<FacilityType, string> = {
  joyland: 'Joyland',
  food_court: 'Food Court',
  parking_stand: 'Parking Stand',
};

export const STATUS_ORDER: ComplianceStatus[] = [
  'EXPIRED',
  'CRITICAL',
  'NEAR_EXPIRY',
  'UPCOMING',
  'MISSING',
  'VALID',
];
