import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut().catch(() => {});

    const response = NextResponse.json({
      success: true,
      redirect: '/auth',
    });

    // Clear admin session cookie
    response.cookies.set('netfly_admin_session', '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    const response = NextResponse.json({
      success: true,
      redirect: '/auth',
    });
    response.cookies.set('netfly_admin_session', '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
    });
    return response;
  }
}
