import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getDataset } from '@/lib/store';
import { fmtDate } from '@/lib/compliance';
import { MODULE_LABEL } from '@/lib/types';

export const dynamic = 'force-dynamic';

// §28 — Export: expired/near-expiry per module, full registers, district summary, master report
export async function GET(req: NextRequest) {
  const data = getDataset();
  const { searchParams } = new URL(req.url);
  const dataset = searchParams.get('dataset') ?? 'master';
  const format = searchParams.get('format') ?? 'xlsx';

  let header: string[] = [];
  let rows: (string | number | undefined)[][] = [];
  let name = dataset;

  const docRow = (d: (typeof data.documents)[number]) => [
    d.facilityName, MODULE_LABEL[d.facilityType], d.district, d.division,
    d.rideName ?? '', d.docNumber, fmtDate(d.issueDate), fmtDate(d.expiryDate),
    d.daysRemaining ?? '', d.status, fmtDate(d.renewalDate), d.remarks ?? '',
  ];
  const DOC_HEADER = ['Facility', 'Facility Type', 'District', 'Division', 'Ride', 'Document No', 'Issue Date', 'Expiry Date', 'Days Remaining', 'Status', 'Renewal Date', 'Remarks'];

  switch (dataset) {
    case 'expired-certificates':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'fitness_certificate' && d.status === 'EXPIRED').map(docRow);
      break;
    case 'near-expiry-certificates':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'fitness_certificate' && ['CRITICAL', 'NEAR_EXPIRY'].includes(d.status)).map(docRow);
      break;
    case 'expired-pfa':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'pfa_license' && d.status === 'EXPIRED').map(docRow);
      break;
    case 'near-expiry-pfa':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'pfa_license' && ['CRITICAL', 'NEAR_EXPIRY'].includes(d.status)).map(docRow);
      break;
    case 'expired-agreements':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'parking_agreement' && d.status === 'EXPIRED').map(docRow);
      break;
    case 'near-expiry-agreements':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'parking_agreement' && ['CRITICAL', 'NEAR_EXPIRY'].includes(d.status)).map(docRow);
      break;
    case 'joyland-register':
      header = ['Joyland ID', 'Joyland Name', 'Type', 'Division', 'District', 'Tehsil', 'Address', 'Total Rides', 'Active Rides', 'Inactive Rides', 'Valid Certs', 'Near Expiry', 'Expired', 'Remarks'];
      rows = data.facilities.filter((f) => f.type === 'joyland').map((f) => {
        const docs = data.documents.filter((d) => d.facilityId === f.id);
        return [f.id, f.name, f.joylandKind, f.division, f.district, f.tehsil, f.location, f.totalRides, f.activeRides, f.inactiveRides,
          docs.filter((d) => d.status === 'VALID').length,
          docs.filter((d) => ['CRITICAL', 'NEAR_EXPIRY'].includes(d.status)).length,
          docs.filter((d) => d.status === 'EXPIRED').length, f.remarks];
      });
      break;
    case 'foodcourt-register':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'pfa_license').map(docRow);
      break;
    case 'parking-register':
      header = DOC_HEADER;
      rows = data.documents.filter((d) => d.docType === 'parking_agreement').map(docRow);
      break;
    case 'district-summary': {
      header = ['District', 'Large Joylands', 'Mini Joylands', 'Total Joylands', 'Rides', 'Expired Certs', 'Near Expiry Certs', 'Food Courts', 'Expired PFA', 'Near Expiry PFA', 'Parking Stands', 'Expired Agreements', 'Near Expiry Agreements', 'Overall Compliance %'];
      const districts = [...new Set(data.facilities.map((f) => f.district))].sort();
      rows = districts.map((dist) => {
        const facs = data.facilities.filter((f) => f.district === dist);
        const docs = data.documents.filter((d) => d.district === dist);
        const near = (s: string) => ['CRITICAL', 'NEAR_EXPIRY'].includes(s);
        const valid = docs.filter((d) => d.status === 'VALID').length;
        const actionables = docs.filter((d) => d.docNumber).length;
        return [
          dist,
          facs.filter((f) => f.type === 'joyland' && f.joylandKind === 'Large').length,
          facs.filter((f) => f.type === 'joyland' && f.joylandKind === 'Mini').length,
          facs.filter((f) => f.type === 'joyland').length,
          facs.filter((f) => f.type === 'joyland').reduce((a, f) => a + (f.totalRides ?? 0), 0),
          docs.filter((d) => d.docType === 'fitness_certificate' && d.status === 'EXPIRED').length,
          docs.filter((d) => d.docType === 'fitness_certificate' && near(d.status)).length,
          facs.filter((f) => f.type === 'food_court').length,
          docs.filter((d) => d.docType === 'pfa_license' && d.status === 'EXPIRED').length,
          docs.filter((d) => d.docType === 'pfa_license' && near(d.status)).length,
          facs.filter((f) => f.type === 'parking_stand').length,
          docs.filter((d) => d.docType === 'parking_agreement' && d.status === 'EXPIRED').length,
          docs.filter((d) => d.docType === 'parking_agreement' && near(d.status)).length,
          actionables ? Math.round((valid / actionables) * 100) : 0,
        ];
      });
      break;
    }
    case 'master':
    default: {
      name = 'master-compliance-report';
      header = DOC_HEADER;
      const order = { EXPIRED: 0, CRITICAL: 1, NEAR_EXPIRY: 2, UPCOMING: 3, MISSING: 4, VALID: 5 } as const;
      rows = [...data.documents]
        .sort((a, b) => order[a.status] - order[b.status] || (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999))
        .map(docRow);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, 'Report');

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="PSBA_${name}_${stamp}.csv"`,
      },
    });
  }
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="PSBA_${name}_${stamp}.xlsx"`,
    },
  });
}
