import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso livre às rotas de autenticação e assets
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/apple-touch-icon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Redirecionar página raiz para login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Para rotas do dashboard, verificar autenticação via cookie
  // (O Firebase Auth normalmente usa cookies ou será verificado no cliente)
  if (pathname.startsWith('/dashboard')) {
    // Permitir acesso - a autenticação será verificada no cliente pelo useAuth
    // Se preferir verificação no servidor, precisará integrar Firebase Admin SDK
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
