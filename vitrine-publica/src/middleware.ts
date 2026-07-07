import { NextRequest, NextResponse } from 'next/server';

const DOMINIO_RAIZ = process.env.NEXT_PUBLIC_DOMINIO_RAIZ ?? 'vitrinevirtual.com.br';

/**
 * Reescreve subdomínio -> rota do tenant:
 *   barbearia-demo.vitrinevirtual.com.br/  ->  /barbearia-demo
 * Em localhost (sem subdomínio) o acesso é direto por caminho: /barbearia-demo
 */
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0];

  if (
    hostname === DOMINIO_RAIZ ||
    hostname === `www.${DOMINIO_RAIZ}` ||
    hostname === 'localhost' ||
    hostname.endsWith('.vercel.app') ||
    /^[\d.]+$/.test(hostname)
  ) {
    return NextResponse.next();
  }

  if (hostname.endsWith(`.${DOMINIO_RAIZ}`)) {
    const slug = hostname.slice(0, -(DOMINIO_RAIZ.length + 1));
    const url = req.nextUrl.clone();
    // Links de gestão (/a/token) funcionam em qualquer host
    if (!url.pathname.startsWith('/a/')) {
      url.pathname = `/${slug}${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|.*\\..*).*)'],
};
