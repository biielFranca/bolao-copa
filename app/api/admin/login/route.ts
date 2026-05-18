import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken, setAdminCookie } from '@/lib/session';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password: string = body.password ?? '';

  if (!process.env.ADMIN_SECRET || password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  }

  const token = await createAdminToken();
  const response = NextResponse.json({ success: true });
  setAdminCookie(response, token);
  return response;
}
