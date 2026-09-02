import { NextResponse } from 'next/server';
import { refreshFromExcel } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Manual / scheduled refresh — re-imports every Excel file in /data/excel
export async function POST() {
  try {
    const data = refreshFromExcel({ seedIfEmpty: true });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Refresh failed' },
      { status: 500 }
    );
  }
}

// Allow GET so OS schedulers (cron / Task Scheduler) can hit the URL directly
export async function GET() {
  return POST();
}
