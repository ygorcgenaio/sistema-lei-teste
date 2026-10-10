import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('lei_session');
  const { pathname } = request.nextUrl;

  // Se tentar acessar páginas protegidas sem estar logado, redireciona para /login
  if (!session && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se já estiver logado e tentar ir para /login, redireciona para o Dashboard /
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configura quais rotas serão vigiadas pelo middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};