import { NextResponse } from 'next/server';
import { getDataset } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(getDataset());
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load dataset' },
      { status: 500 }
    );
  }
}
