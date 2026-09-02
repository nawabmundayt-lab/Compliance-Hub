import { NextRequest, NextResponse } from 'next/server';
import { updateDocument } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Update a compliance record (§27) — status/days recalculated automatically
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updatedBy, ...patch } = body ?? {};
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing record id' }, { status: 400 });
    }
    const data = updateDocument(id, patch, updatedBy || 'Dashboard User');
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Update failed' },
      { status: 500 }
    );
  }
}
