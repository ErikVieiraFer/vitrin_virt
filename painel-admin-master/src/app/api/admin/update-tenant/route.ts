import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { verifyAdminToken } = await import('@/lib/firebase/admin-auth');
    let admin;
    try {
      admin = await verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }
    if (!admin.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, whatsapp, active } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID do cliente ausente.' }, { status: 400 });
    }

    const { updateTenant, updateTenantStatus } = await import('@/lib/firebase/admin-firestore');

    await updateTenant(id, { name, whatsapp });
    if (typeof active === 'boolean') {
      await updateTenantStatus(id, active);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}
