import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@netfly.tv').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'Admin@123456').trim();
    const inputEmail = email.trim().toLowerCase();

    // Check if master admin credentials
    const isMasterAdmin =
      (inputEmail === adminEmail || inputEmail === 'admin') &&
      password === adminPassword;

    if (isMasterAdmin) {
      // Create response with admin session cookie
      const response = NextResponse.json({
        success: true,
        isAdmin: true,
        redirect: '/admin',
        message: 'Welcome back, Administrator!',
      });

      // Set admin session cookie (7 days)
      response.cookies.set('netfly_admin_session', 'authenticated_admin', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });

      // Attempt Supabase sign-in asynchronously in background (non-blocking)
      try {
        const supabase = await createServerSupabaseClient();
        await supabase.auth.signInWithPassword({
          email: adminEmail,
          password,
        });
      } catch {
        // Non-blocking if Supabase auth user does not exist yet
      }

      return response;
    }

    // Regular Supabase user authentication
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isUserAdmin =
      Boolean(data?.user?.email) &&
      data.user.email?.toLowerCase() === adminEmail;

    const response = NextResponse.json({
      success: true,
      isAdmin: isUserAdmin,
      redirect: isUserAdmin ? '/admin' : '/',
      message: 'Signed in successfully!',
    });

    if (isUserAdmin) {
      response.cookies.set('netfly_admin_session', 'authenticated_admin', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during sign in.' },
      { status: 500 }
    );
  }
}
