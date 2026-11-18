import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://usggjclegutpayjjbogj.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_0w0Fa68-Yb605iNhIJHmJw_bjStevvt';

export const createClient = () =>
  createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!
  );
