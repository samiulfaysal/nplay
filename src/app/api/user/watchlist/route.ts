import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { WatchlistItem } from '@/types/watchlist';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ watchlist: [], authenticated: false });
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[API watchlist GET] Supabase error:', error.message);
      return NextResponse.json({ watchlist: [], authenticated: true });
    }

    const items: WatchlistItem[] = (data || []).map((row: any) => ({
      contentId: row.content_id,
      contentType: row.content_type,
      title: row.title,
      poster_path: row.poster_path,
      rating: row.rating ? Number(row.rating) : undefined,
      release_year: row.release_year || undefined,
      added_at: row.created_at,
    }));

    return NextResponse.json({ watchlist: items, authenticated: true });
  } catch (err: any) {
    console.warn('[API watchlist GET] Exception:', err);
    return NextResponse.json({ watchlist: [], authenticated: false });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const item: WatchlistItem = body.item;

    if (!item || !item.contentId) {
      return NextResponse.json({ error: 'Missing contentId' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Guest mode: acknowledge, client updates localStorage
      return NextResponse.json({ success: true, guest: true });
    }

    const { error } = await (supabase as any).from('watchlist').upsert(
      {
        user_id: user.id,
        content_id: String(item.contentId),
        content_type: item.contentType,
        title: item.title,
        poster_path: item.poster_path,
        rating: item.rating || null,
        release_year: item.release_year || null,
        created_at: item.added_at || new Date().toISOString(),
      },
      {
        onConflict: 'user_id,content_id',
      }
    );

    if (error) {
      console.warn('[API watchlist POST] Supabase upsert error:', error.message);
    }

    return NextResponse.json({ success: true, authenticated: true });
  } catch (err: any) {
    console.warn('[API watchlist POST] Exception:', err);
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
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.warn('[API watchlist DELETE] Exception:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
