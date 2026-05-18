import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger /palpites — requer sessão de participante
  if (pathname.startsWith('/palpites')) {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // /admin — não redireciona; a página exibe login quando não autenticado
  return NextResponse.next();
}

export const config = {
  matcher: ['/palpites/:path*', '/admin/:path*'],
};
