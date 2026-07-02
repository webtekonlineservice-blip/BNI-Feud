import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// POST /api/admin/members — create or update a member
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, role, company, fun_facts, display_order } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const memberData = {
      name,
      role,
      company: company || '',
      fun_facts: fun_facts || '',
      display_order: display_order || 0,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      // Update existing member
      await adminDb.collection('members').doc(id).update(memberData);
      return NextResponse.json({ ok: true, id, message: 'Member updated' });
    } else {
      // Create new member
      const docRef = await adminDb.collection('members').add({
        ...memberData,
        created_at: new Date().toISOString(),
      });
      return NextResponse.json({ ok: true, id: docRef.id, message: 'Member created' });
    }
  } catch (error: any) {
    console.error('Error saving member:', error);
    return NextResponse.json({ error: error.message || 'Failed to save member' }, { status: 500 });
  }
}

// DELETE /api/admin/members — remove a member
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member id is required' }, { status: 400 });
    }

    await adminDb.collection('members').doc(id).delete();
    return NextResponse.json({ ok: true, message: 'Member deleted' });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete member' }, { status: 500 });
  }
}
