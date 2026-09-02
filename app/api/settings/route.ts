import { NextRequest, NextResponse } from 'next/server';
import { getDataset, listExcelFiles, saveSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = getDataset();
  return NextResponse.json({ settings: data.settings, excelFiles: listExcelFiles(), meta: data.meta });
}

export async function POST(req: NextRequest) {
  try {
    const patch = await req.json();
    const data = saveSettings(patch);
    return NextResponse.json({ settings: data.settings, ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Save failed' },
      { status: 500 }
    );
  }
}
