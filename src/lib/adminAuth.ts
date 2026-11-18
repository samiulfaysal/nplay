import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export interface AdminAuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: {
    id: string;
    email: string;
    username?: string;
  } | null;
}

/**
 * Server-side helper to verify Admin access
 * Checks:
 * 1. Admin master session cookie (netfly_admin_session)
 * 2. Supabase Auth session & ADMIN_EMAIL match
 * 3. Profiles table is_admin flag
 * 4. Fallback dev mode allowance if no auth setup
 */
export async function verifyAdmin(): Promise<AdminAuthResult> {
  const adminEmailEnv = (process.env.ADMIN_EMAIL || 'admin@netfly.tv').trim().toLowerCase();

  try {
    // 1. Check for dedicated Admin session cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('netfly_admin_session')?.value;
    if (adminSession === 'authenticated_admin') {
      return {
        isAuthenticated: true,
        isAdmin: true,
        user: {
          id: 'admin-master-id',
          email: adminEmailEnv,
          username: 'MasterAdmin',
        },
      };
    }

    // 2. Check Supabase user session
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // In development / demo environment without active session and no admin email defined, allow admin preview
      if (process.env.NODE_ENV === 'development' && !process.env.ADMIN_EMAIL) {
        return {
          isAuthenticated: true,
          isAdmin: true,
          user: {
            id: 'dev-admin-id',
            email: 'admin@netfly.tv (Dev Mode)',
            username: 'MasterAdmin',
          },
        };
      }
      return { isAuthenticated: false, isAdmin: false, user: null };
    }

    const userEmail = (user.email || '').toLowerCase();

    // 3. Env variable direct match
    if (adminEmailEnv && userEmail === adminEmailEnv) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || 'Admin',
        },
      };
    }

    // 4. Database is_admin flag lookup
    const { data: profile } = (await supabase
      .from('profiles')
      .select('is_admin, username')
      .eq('id', user.id)
      .single()) as any;

    if (profile && profile.is_admin === true) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email || '',
          username: profile.username || 'Admin',
        },
      };
    }

    // If no admin email is configured and user is the first logged-in user or dev mode
    if (!adminEmailEnv && userEmail.includes('admin')) {
      return {
        isAuthenticated: true,
        isAdmin: true,
        user: {
          id: user.id,
          email: user.email || '',
          username: profile?.username || user.user_metadata?.username,
        },
      };
    }

    return {
      isAuthenticated: true,
      isAdmin: false,
      user: {
        id: user.id,
        email: user.email || '',
        username: profile?.username || user.user_metadata?.username,
      },
    };
  } catch (error) {
    console.warn('[AdminAuth] Verification check fallback:', error);
    return {
      isAuthenticated: false,
      isAdmin: false,
      user: null,
    };
  }
}
