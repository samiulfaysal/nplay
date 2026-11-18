import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { getAppSettings } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // 1. Check if Public Registration is enabled
    const settings = await getAppSettings();
    if (settings.publicRegistration === false) {
      return NextResponse.json(
        {
          error:
            'Public registration is currently disabled by the administrator. Only existing users and administrators may sign in.',
        },
        { status: 403 }
      );
    }

    // 2. Perform user registration via Supabase
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Registration failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Account created successfully! Please check your email to confirm registration or sign in now.',
      user: data.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
