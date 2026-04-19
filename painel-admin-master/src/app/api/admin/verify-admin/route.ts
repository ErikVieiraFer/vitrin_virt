import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(email.trim().toLowerCase());

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
