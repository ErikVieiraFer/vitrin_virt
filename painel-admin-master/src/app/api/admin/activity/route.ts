import { NextRequest, NextResponse } from 'next/server';
import type { ActivityLogView } from '@/types/activity-log';

export const dynamic = 'force-dynamic';

function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

export async function GET(request: NextRequest) {
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

    const { getActivityLogs } = await import('@/lib/firebase/admin-firestore');
    const logs = await getActivityLogs();

    // Serializa Timestamp -> ISO para o cliente.
    const view: ActivityLogView[] = logs.map((l) => ({
      id: l.id,
      type: l.type,
      tenantName: l.tenant_name ?? null,
      description: l.description,
      createdAt: l.created_at?.toDate
        ? l.created_at.toDate().toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ logs: view });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 });
  }
}
