import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://usggjclegutpayjjbogj.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_0w0Fa68-Yb605iNhIJHmJw_bjStevvt';

export function createClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
): ReturnType<typeof createServerClient<Database>>;
export function createClient(): Promise<ReturnType<typeof createServerClient<Database>>>;
export function createClient(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
): any {
  if (cookieStore) {
    return createServerClient<Database>(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    });
  }

  return cookies().then((store) =>
    createServerClient<Database>(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              store.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    })
  );
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}
