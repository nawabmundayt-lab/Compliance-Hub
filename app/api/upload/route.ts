import { NextRequest, NextResponse } from 'next/server';
import { refreshFromExcel, saveUploadedExcel } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Upload one of the 3 source Excel files → stored in /data/excel → auto-refresh
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided (field "file")' }, { status: 400 });
    }
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      return NextResponse.json({ error: 'Only .xlsx / .xls files are accepted' }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    saveUploadedExcel(file.name, buffer);
    const data = refreshFromExcel({ seedIfEmpty: false });
    return NextResponse.json({ uploaded: file.name, ...data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
