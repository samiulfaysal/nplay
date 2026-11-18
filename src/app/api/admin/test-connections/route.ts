import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const result = {
    supabase: { ok: false, latencyMs: 0, message: '' },
    tmdb: { ok: false, latencyMs: 0, message: '' },
    timestamp: new Date().toISOString(),
  };

  // 1. Test Supabase connection
  const sbStart = Date.now();
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    result.supabase.latencyMs = Date.now() - sbStart;
    if (error && error.code !== 'PGRST116') {
      result.supabase.ok = false;
      result.supabase.message = error.message || 'Database error';
    } else {
      result.supabase.ok = true;
      result.supabase.message = `Connected (${result.supabase.latencyMs}ms)`;
    }
  } catch (err: any) {
    result.supabase.latencyMs = Date.now() - sbStart;
    result.supabase.ok = false;
    result.supabase.message = err.message || 'Supabase host unreachable';
  }

  // 2. Test TMDB connection
  const tmdbStart = Date.now();
  const tmdbKey =
    process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY || '';
  const tmdbBase =
    process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';

  try {
    const res = await fetch(
      `${tmdbBase}/movie/top_rated?api_key=${tmdbKey}&page=1`,
      { cache: 'no-store' }
    );
    result.tmdb.latencyMs = Date.now() - tmdbStart;

    if (res.ok) {
      result.tmdb.ok = true;
      result.tmdb.message = `Active & Authorized (${result.tmdb.latencyMs}ms)`;
    } else if (res.status === 401) {
      result.tmdb.ok = false;
      result.tmdb.message = 'Invalid or missing TMDB API Key';
    } else {
      result.tmdb.ok = false;
      result.tmdb.message = `HTTP status ${res.status}`;
    }
  } catch (err: any) {
    result.tmdb.latencyMs = Date.now() - tmdbStart;
    result.tmdb.ok = false;
    result.tmdb.message = err.message || 'Failed to connect to TMDB';
  }

  return NextResponse.json(result);
}
