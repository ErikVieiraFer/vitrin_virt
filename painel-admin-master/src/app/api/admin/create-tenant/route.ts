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
    const { name, subdomain, email, password, whatsapp, primaryColor, secondaryColor, font } = body;

    if (!name || !subdomain || !email || !password) {
      return NextResponse.json(
        { error: 'Preencha nome, subdomínio, e-mail e senha.' },
        { status: 400 }
      );
    }

    const { isSubdomainAvailable, createTenant } = await import('@/lib/firebase/admin-firestore');
    const { adminAuth } = await import('@/lib/firebase/admin-config');

    if (!(await isSubdomainAvailable(subdomain))) {
      return NextResponse.json({ error: 'Esse subdomínio já está em uso.' }, { status: 400 });
    }

    // Cria o usuário Auth do dono do tenant.
    let ownerUid: string;
    try {
      const userRecord = await adminAuth.createUser({ email, password, displayName: name });
      ownerUid = userRecord.uid;
    } catch (e) {
      const code = (e as { code?: string }).code;
      const msg =
        code === 'auth/email-already-exists'
          ? 'Esse e-mail já está cadastrado.'
          : 'Não foi possível criar o usuário do cliente.';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const id = await createTenant({
      name,
      subdomain,
      email,
      whatsapp: whatsapp ?? '',
      ownerUid,
      themeSettings: {
        primaryColor: primaryColor ?? '#3b82f6',
        secondaryColor: secondaryColor ?? '#8b5cf6',
        fontFamily: font ?? 'Inter',
      },
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
