import { NextRequest, NextResponse } from 'next/server';

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

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID ausente' }, { status: 400 });
    }

    const { getTenantById } = await import('@/lib/firebase/admin-firestore');
    const tenant = await getTenantById(id);
    if (!tenant) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const raw = tenant as unknown as Record<string, unknown>;
    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: (raw.name as string) ?? '',
        subdomain: (raw.subdomain as string) ?? '',
        whatsapp: (raw.whatsapp as string) ?? '',
        active: raw.active !== false,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Erro ao buscar cliente' }, { status: 500 });
  }
}
