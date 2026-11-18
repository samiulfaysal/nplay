import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type');

    const supabase = await createServerSupabaseClient();
    let dbQuery: any = supabase
      .from('custom_streams' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      dbQuery = dbQuery.eq('media_type', type);
    }

    if (query) {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ streams: [], error: error.message }, { status: 200 });
    }

    return NextResponse.json({ streams: data || [] });
  } catch (error: any) {
    return NextResponse.json({ streams: [], error: error.message }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tmdb_id,
      title,
      media_type,
      season,
      episode,
      stream_url,
      stream_type,
      quality,
      provider_name,
      poster_path,
      backdrop_path,
      overview,
      rating,
    } = body;

    if (!tmdb_id || !title || !stream_url) {
      return NextResponse.json(
        { error: 'Missing required fields: TMDB ID, Title, and Stream URL' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const newRecord: any = {
      tmdb_id: String(tmdb_id),
      title,
      media_type: media_type === 'tv' ? 'tv' : 'movie',
      season: media_type === 'tv' ? Number(season) || 1 : null,
      episode: media_type === 'tv' ? Number(episode) || 1 : null,
      stream_url,
      stream_type: stream_type || 'hls',
      quality: quality || '1080p',
      provider_name: provider_name || 'Admin Custom Stream',
      poster_path: poster_path || null,
      backdrop_path: backdrop_path || null,
      overview: overview || null,
      rating: rating ? Number(rating) : 8.0,
      updated_at: new Date().toISOString(),
    };

    const { data, error }: any = await supabase
      .from('custom_streams' as any)
      .insert([newRecord] as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stream: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing stream ID' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { error }: any = await supabase
      .from('custom_streams' as any)
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
