// ============================================================
// PSBA Compliance Hub — Demo dataset generator
// Produces realistic Punjab-wide sample rows shaped exactly like
// the real Excel registers. Used ONLY to seed the 3 Excel files
// when /data/excel is empty — the app itself never hard-codes
// totals (requirement §24).
// ============================================================

// Deterministic PRNG so every fresh seed is identical
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260902);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const ri = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));

interface Region { division: string; district: string; tehsils: string[] }

export const PUNJAB_REGIONS: Region[] = [
  { division: 'Lahore', district: 'Lahore', tehsils: ['Lahore City', 'Lahore Cantt', 'Shalimar', 'Raiwind', 'Model Town'] },
  { division: 'Lahore', district: 'Kasur', tehsils: ['Kasur', 'Kot Radha Kishan', 'Chunian'] },
  { division: 'Lahore', district: 'Sheikhupura', tehsils: ['Sheikhupura', 'Ferozewala', 'Sharaqpur'] },
  { division: 'Lahore', district: 'Nankana Sahib', tehsils: ['Nankana Sahib', 'Sangla Hill'] },
  { division: 'Gujranwala', district: 'Gujranwala', tehsils: ['Gujranwala City', 'Gujranwala Saddar', 'Kamoke', 'Nowshera Virkan'] },
  { division: 'Gujranwala', district: 'Sialkot', tehsils: ['Sialkot', 'Daska', 'Pasrur', 'Sambrial'] },
  { division: 'Gujranwala', district: 'Gujrat', tehsils: ['Gujrat', 'Kharian', 'Sarai Alamgir'] },
  { division: 'Faisalabad', district: 'Faisalabad', tehsils: ['Faisalabad City', 'Faisalabad Saddar', 'Jaranwala', 'Samundri', 'Tandlianwala'] },
  { division: 'Faisalabad', district: 'Jhang', tehsils: ['Jhang', 'Shorkot', 'Athara Hazari'] },
  { division: 'Faisalabad', district: 'Toba Tek Singh', tehsils: ['Toba Tek Singh', 'Gojra', 'Kamalia'] },
  { division: 'Multan', district: 'Multan', tehsils: ['Multan City', 'Multan Saddar', 'Shujabad', 'Jalalpur Pirwala'] },
  { division: 'Multan', district: 'Khanewal', tehsils: ['Khanewal', 'Mian Channu', 'Kabirwala'] },
  { division: 'Multan', district: 'Vehari', tehsils: ['Vehari', 'Burewala', 'Mailsi'] },
  { division: 'Rawalpindi', district: 'Rawalpindi', tehsils: ['Rawalpindi', 'Gujar Khan', 'Taxila', 'Murree', 'Kotli Sattian'] },
  { division: 'Rawalpindi', district: 'Attock', tehsils: ['Attock', 'Fateh Jang', 'Pindi Gheb'] },
  { division: 'Rawalpindi', district: 'Chakwal', tehsils: ['Chakwal', 'Talagang', 'Kallar Kahar'] },
  { division: 'Bahawalpur', district: 'Bahawalpur', tehsils: ['Bahawalpur City', 'Bahawalpur Saddar', 'Ahmadpur East', 'Hasilpur'] },
  { division: 'Bahawalpur', district: 'Rahim Yar Khan', tehsils: ['Rahim Yar Khan', 'Sadiqabad', 'Khanpur', 'Liaquatpur'] },
  { division: 'Bahawalpur', district: 'Bahawalnagar', tehsils: ['Bahawalnagar', 'Chishtian', 'Haroonabad'] },
  { division: 'Sargodha', district: 'Sargodha', tehsils: ['Sargodha', 'Bhalwal', 'Kot Momin', 'Silanwali'] },
  { division: 'Sargodha', district: 'Khushab', tehsils: ['Khushab', 'Noorpur Thal', 'Quaidabad'] },
  { division: 'Sahiwal', district: 'Sahiwal', tehsils: ['Sahiwal', 'Chichawatni'] },
  { division: 'Sahiwal', district: 'Okara', tehsils: ['Okara', 'Depalpur', 'Renala Khurd'] },
  { division: 'Sahiwal', district: 'Pakpattan', tehsils: ['Pakpattan', 'Arifwala'] },
  { division: 'Dera Ghazi Khan', district: 'Dera Ghazi Khan', tehsils: ['Dera Ghazi Khan', 'Kot Chutta', 'Taunsa'] },
  { division: 'Dera Ghazi Khan', district: 'Muzaffargarh', tehsils: ['Muzaffargarh', 'Kot Addu', 'Alipur', 'Jatoi'] },
];

const JOYLAND_NAMES = [
  'Gulshan Joyland', 'Sohny Dharti Joyland', 'Model Town Joyland', 'Jilani Joyland',
  'Kashmir Joyland', 'Iqbal Joyland', 'Lalazar Joyland', 'Shalimar Joyland',
  'Race Course Joyland', 'Fortress Joyland', 'Canal View Joyland', 'Jinnah Joyland',
  'Ayub Joyland', 'Satellite Joyland', 'Gulberg Joyland', 'Ravi Joyland',
  'Chenab Joyland', 'Doaba Joyland', 'Sandral Joyland', 'Hilal Joyland',
  'People Colony Joyland', 'Qila Joyland', 'Gilgit Joyland', 'Mehran Joyland',
];

const RIDE_NAMES = [
  'Ferris Wheel', 'Dragon Coaster', 'Dodgem Cars', 'Pirate Ship', 'Carousel',
  'Mini Train', 'Bumper Boats', 'Swing Tower', 'Frog Hopper', 'Magic Cups',
  'Kiddie Planes', 'Haunted House Ride', 'Water Slide', 'Trampoline Dome',
  'Flying Chair', 'Octopus Ride', 'Baby Ferris Wheel', 'Electric Go-Karts',
];

const RIDE_CATEGORIES = ['Thrill', 'Family', 'Kids', 'Water', 'Mechanical'];

const FOODCOURT_NAMES = [
  'Sahulat Food Court', 'Anarkali Food Court', 'Liberty Food Court', 'Fortress Food Street',
  'Gawalmandi Food Court', 'Khan Baba Food Court', 'Shahi Food Court', 'Ravi Food Court',
  'Bundu Khan Food Court', 'Chenab Food Court', 'Salt Range Food Court', 'Do Darya Food Court',
  'Melody Food Park', 'Zamzama Food Court', 'Cantt Food Court', 'Rail Bazar Food Court',
  'Ghanta Ghar Food Court', 'Qasim Food Court', 'Kacheri Food Court', 'Civic Centre Food Court',
];

const PARKING_NAMES = [
  'Jail Road Parking Stand', 'Mall Road Parking Stand', 'Circular Road Parking Stand',
  'Station Road Parking Stand', 'Boharwala Parking Stand', 'Kutchery Chowk Parking',
  'Ghanta Ghar Parking Stand', 'Qila Chowk Parking Stand', 'Dhobi Ghat Parking Stand',
  'Lorry Adda Parking Stand', 'Bus Stand Parking', 'Grain Market Parking Stand',
  'Sabzi Mandi Parking Stand', 'General Bus Stand Parking', 'College Road Parking Stand',
  'Hospital Chowk Parking Stand', 'Nishat Chowk Parking Stand', 'Raheem Chowk Parking',
];

const CONTRACTORS = [
  'M/s Al-Rehman Contractors', 'M/s Haq Nawaz & Sons', 'M/s Punjab Parking Services',
  'M/s Bhatti Brothers', 'M/s Shaheen Parking Co.', 'M/s City Facilities Ltd.',
  'M/s Noor Contractors', 'M/s Ittefaq Parking Services',
];

const REMARKS_POOL = [
  '', '', '', '', 'Renewal application submitted', 'Inspection scheduled',
  'Documents under verification', 'Follow-up visit due', 'Renewal fee deposited',
];

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Random date within `minDaysAgo`..`maxDaysAhead` relative to today */
function dateAround(minDays: number, maxDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + ri(minDays, maxDays));
  return toISO(d);
}

// Export row builders — headers intentionally use "real register" spellings
// (mixed variants) so the column-mapping layer is genuinely exercised.

export interface ExcelSheetDef { sheetName: string; header: string[]; rows: (string | number)[][] }

/** Sheet 1a: Joylands register (facility summary) */
export function buildJoylandsSheet(): ExcelSheetDef {
  const header = ['Joyland ID', 'Joyland Name', 'Joyland Type', 'Division', 'District', 'Tehsil', 'Address', 'Total Rides', 'Active Rides', 'Inactive Rides', 'Remarks'];
  const rows: (string | number)[][] = [];
  let n = 0;
  for (let i = 0; i < 42; i++) {
    const region = pick(PUNJAB_REGIONS);
    const kind = rnd() < 0.43 ? 'Large' : 'Mini';
    const total = kind === 'Large' ? ri(8, 18) : ri(2, 7);
    const active = Math.max(1, total - ri(0, 2));
    const name = `${pick(JOYLAND_NAMES)} ${region.district}`;
    rows.push([
      `JL-${String(++n).padStart(3, '0')}`, name, kind, region.division, region.district,
      pick(region.tehsils), `${pick(['Main Bazaar Rd', 'Circular Rd', 'Park Ave', 'City Center', 'Canal Rd'])}, ${region.district}`,
      total, active, total - active, pick(REMARKS_POOL),
    ]);
  }
  return { sheetName: 'Joylands', header, rows };
}

/** Sheet 1b: Rides + fitness certificates (one row per ride) */
export function buildRidesSheet(joylands: ExcelSheetDef): ExcelSheetDef {
  const header = ['Joyland Name', 'Joyland Type', 'District', 'Ride Name', 'Ride ID', 'Ride Category', 'Certificate Number', 'Certificate Issue Date', 'Certificate Expiry Date', 'Last Inspection Date', 'Renewal Date', 'Remarks'];
  const rows: (string | number)[][] = [];
  let rideSeq = 0;
  for (const j of joylands.rows) {
    const [, jname, jkind, , district, , , totalRides] = j as [string, string, string, string, string, string, string, number];
    for (let k = 0; k < (totalRides || 3); k++) {
      const issue = dateAround(-185, -5); // issued within last ~6 months
      const d = new Date(issue);
      const exp = new Date(d.getFullYear(), d.getMonth() + 6, Math.min(d.getDate(), 28));
      // a few certificates intentionally stale / expired / near expiry
      const tweak = rnd();
      let expiry = toISO(exp);
      if (tweak < 0.10) expiry = dateAround(-90, -1);          // expired
      else if (tweak < 0.18) expiry = dateAround(0, 7);        // critical
      else if (tweak < 0.30) expiry = dateAround(8, 30);       // near expiry
      else if (tweak < 0.40) expiry = dateAround(31, 60);      // upcoming
      const insp = dateAround(-60, -1);
      rows.push([
        jname, jkind, district, pick(RIDE_NAMES), `R-${String(++rideSeq).padStart(4, '0')}`,
        pick(RIDE_CATEGORIES), `FC/${new Date().getFullYear()}/${String(rideSeq).padStart(4, '0')}`,
        issue, expiry, insp, insp, pick(REMARKS_POOL),
      ]);
    }
  }
  return { sheetName: 'Rides', header, rows };
}

/** Sheet 2: Food courts + PFA licenses */
export function buildFoodCourtsSheet(): ExcelSheetDef {
  const header = ['Food Court ID', 'Food Court Name', 'Division', 'District', 'Tehsil', 'Location', 'PFA License Number', 'Issue Date', 'Expiry Date', 'Last Inspection Date', 'Renewal Date', 'Remarks'];
  const rows: (string | number)[][] = [];
  for (let i = 0; i < 28; i++) {
    const region = pick(PUNJAB_REGIONS);
    const name = `${pick(FOODCOURT_NAMES)} ${region.district}`;
    const tweak = rnd();
    let issue = dateAround(-360, -30), expiry: string;
    if (tweak < 0.12) { expiry = dateAround(-120, -1); }          // expired
    else if (tweak < 0.18) { expiry = dateAround(0, 7); }         // critical
    else if (tweak < 0.30) { expiry = dateAround(8, 30); }        // near
    else if (tweak < 0.42) { expiry = dateAround(31, 60); }       // upcoming
    else { expiry = dateAround(61, 300); }                        // valid
    const hasLicense = rnd() > 0.08; // ~8% missing license
    rows.push([
      `FC-${String(i + 1).padStart(3, '0')}`, name, region.division, region.district, pick(region.tehsils),
      `${pick(['Main Bazaar', 'Mall Rd', 'Civil Lines', 'Cantt Area', 'Stadium Rd'])}, ${region.district}`,
      hasLicense ? `PFA/${ri(10000, 99999)}/2025` : '',
      hasLicense ? issue : '', hasLicense ? expiry : '',
      dateAround(-90, -1), '', pick(REMARKS_POOL),
    ]);
  }
  return { sheetName: 'FoodCourts', header, rows };
}

/** Sheet 3: Parking stands + agreements */
export function buildParkingSheet(): ExcelSheetDef {
  const header = ['Parking Stand ID', 'Parking Stand Name', 'Division', 'District', 'Tehsil', 'Location', 'Contractor / Agreement Holder', 'Agreement Number', 'Agreement Start Date', 'Agreement End Date', 'Remarks'];
  const rows: (string | number)[][] = [];
  for (let i = 0; i < 32; i++) {
    const region = pick(PUNJAB_REGIONS);
    const name = `${pick(PARKING_NAMES)} ${region.district}`;
    const tweak = rnd();
    let start = dateAround(-400, -60), end: string;
    if (tweak < 0.10) { end = dateAround(-200, -1); }
    else if (tweak < 0.16) { end = dateAround(0, 7); }
    else if (tweak < 0.28) { end = dateAround(8, 30); }
    else if (tweak < 0.40) { end = dateAround(31, 60); }
    else { end = dateAround(61, 365); }
    const hasAgreement = rnd() > 0.06; // ~6% no agreement data
    rows.push([
      `PS-${String(i + 1).padStart(3, '0')}`, name, region.division, region.district, pick(region.tehsils),
      `${pick(['Main Chowk', 'Old City', 'Bazaar Area', 'Terminal Rd'])}, ${region.district}`,
      hasAgreement ? pick(CONTRACTORS) : '', hasAgreement ? `AGR/${region.district.slice(0, 3).toUpperCase()}/${ri(100, 999)}/${2023 + (i % 3)}` : '',
      hasAgreement ? start : '', hasAgreement ? end : '', pick(REMARKS_POOL),
    ]);
  }
  return { sheetName: 'ParkingStands', header, rows };
}
