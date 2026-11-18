import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { WatchHistoryItem } from '@/types/history';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ history: [], authenticated: false });
    }

    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false })
      .limit(30);

    if (error) {
      console.warn('[API watch-history] Supabase select error:', error.message);
      return NextResponse.json({ history: [], authenticated: true });
    }

    const items: WatchHistoryItem[] = (data || []).map((row: any) => {
      const isTv = row.content_type === 'tv';
      const key = isTv
        ? `tv_${row.content_id}_s${row.season_number || 1}_e${row.episode_number || 1}`
        : `movie_${row.content_id}`;

      const progressSeconds = row.progress_seconds || 0;
      const durationSeconds = row.duration_seconds || 7200;
      const progressPercentage =
        durationSeconds > 0
          ? Math.min(100, Math.round((progressSeconds / durationSeconds) * 100))
          : 0;

      return {
        id: key,
        contentId: row.content_id,
        contentType: row.content_type,
        title: row.title,
        poster_path: row.poster_path,
        seasonNumber: row.season_number,
        episodeNumber: row.episode_number,
        progressPercentage,
        progressSeconds,
        durationSeconds,
        lastWatchedAt: row.last_watched_at,
      };
    });

    return NextResponse.json({ history: items, authenticated: true });
  } catch (err: any) {
    console.warn('[API watch-history GET] Failed:', err);
    return NextResponse.json({ history: [], authenticated: false });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: WatchHistoryItem = body.item;

    if (!item || !item.contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest mode: API acknowledges, client handles localStorage
      return NextResponse.json({ success: true, guest: true });
    }

    const duration = item.durationSeconds || 7200;
    const progressSec =
      item.progressSeconds ||
      Math.round((item.progressPercentage / 100) * duration);

    const { error } = await (supabase as any).from('watch_history').upsert(
      {
        user_id: user.id,
        content_id: String(item.contentId),
        content_type: item.contentType,
        title: item.title,
        poster_path: item.poster_path,
        season_number: item.seasonNumber || null,
        episode_number: item.episodeNumber || null,
        progress_seconds: progressSec,
        duration_seconds: duration,
        completed: item.progressPercentage >= 90,
        last_watched_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,content_id,season_number,episode_number',
      }
    );

    if (error) {
      console.warn('[API watch-history POST] Supabase upsert error:', error.message);
    }

    return NextResponse.json({ success: true, authenticated: true });
  } catch (err: any) {
    console.warn('[API watch-history POST] Exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn('[API watch-history DELETE] Exception:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
