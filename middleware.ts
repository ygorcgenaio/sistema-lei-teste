import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, lerTokenSessao } from '@/lib/auth/session';

// Rotas que não exigem sessão. O /api/health é usado pelo healthcheck do Docker.
const ROTAS_PUBLICAS = ['/login', '/api/health'];

// Primeira barreira: confere só a ASSINATURA do cookie (rápido, sem banco de dados).
// Quem decide de verdade é o servidor, que consulta o banco em cada página e ação
// (veja lib/auth/guard.ts). Nunca confie apenas no middleware.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ROTAS_PUBLICAS.includes(pathname)) {
    return NextResponse.next();
  }

  const usuarioId = await lerTokenSessao(request.cookies.get(SESSION_COOKIE)?.value);

  if (usuarioId) {
    return NextResponse.next();
  }

  // APIs respondem 401; páginas redirecionam para o login.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ erro: 'Não autenticado.' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
