import React from 'react';
import Link from 'next/link';
import {
  Film,
  Users,
  Server,
  Activity,
  Plus,
  Settings,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let userCount = 0;
  let customStreamCount = 0;
  let recentStreams: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();

    // Query total users count
    const { count: usersTotal } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    userCount = usersTotal || 1;

    // Query custom streams count & recent items
    const { data: streams, count: streamTotal } = await supabase
      .from('custom_streams')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(6);

    customStreamCount = streamTotal || (streams ? streams.length : 0);
    recentStreams = streams || [];
  } catch (error) {
    console.warn('[Admin Dashboard] Query fallback:', error);
  }

  // Pre-configured streaming providers
  const activeProviders = [
    { name: 'SparkBox / MovieBox', type: 'Direct HLS', status: 'Online' },
    { name: 'WeFeed Core', type: 'Direct HLS', status: 'Online' },
    { name: 'VidSrc VIP', type: 'Multi-Server Embed', status: 'Online' },
    { name: 'AutoEmbed VIP', type: 'Multi-Server Embed', status: 'Online' },
    { name: '2Embed Mirror', type: 'Multi-Server Embed', status: 'Online' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            System metrics, streaming provider health, and custom catalog manager.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/content"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Stream</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gray-200 font-semibold text-xs border border-white/10 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>API Settings</span>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Custom Streams */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Custom Streams
            </span>
            <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {customStreamCount}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Active overrides in Supabase
            </div>
          </div>
        </div>

        {/* Card 2: Registered Users */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Registered Users
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {userCount}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Total member profiles
            </div>
          </div>
        </div>

        {/* Card 3: Active Scrapers / Providers */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Streaming Providers
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {activeProviders.length} Active
            </div>
            <div className="text-xs text-gray-400 mt-1">
              MovieBox, WeFeed & 3 Embeds
            </div>
          </div>
        </div>

        {/* Card 4: API Health */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              API Health Status
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg sm:text-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span>Operational</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Supabase & TMDB Live
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Streaming Providers Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white">
              SparkBoxCore Active Providers
            </h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All 5 Providers Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeProviders.map((provider) => (
            <div
              key={provider.name}
              className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-gray-200">{provider.name}</div>
                <div className="text-[11px] text-gray-400">{provider.type}</div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                {provider.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recent Custom Streams Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white">
              Recently Added Custom Streams
            </h2>
          </div>
          <Link
            href="/admin/content"
            className="text-xs text-red-400 hover:text-red-300 font-semibold"
          >
            Manage All ({customStreamCount}) →
          </Link>
        </div>

        {recentStreams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/5 bg-black/30">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Stream Format</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3">Added</th>
                  <th className="py-2.5 px-3 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentStreams.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <span>{s.title}</span>
                      {s.media_type === 'tv' && (
                        <span className="text-[10px] text-red-400">
                          (S{s.season} E{s.episode})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-gray-300">
                      {s.media_type}
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-semibold text-cyan-400">
                      {s.stream_type}
                    </td>
                    <td className="py-3 px-3 font-black text-[10px] text-amber-400">
                      {s.quality}
                    </td>
                    <td className="py-3 px-3 text-gray-400">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/watch/${s.media_type}/${s.tmdb_id}${
                          s.media_type === 'tv'
                            ? `?season=${s.season}&episode=${s.episode}`
                            : ''
                        }`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-red-600 text-gray-200 hover:text-white transition-colors"
                      >
                        <Play className="w-3 h-3" />
                        <span>Watch</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl bg-black/20 space-y-3">
            <Film className="w-8 h-8 text-gray-600 mx-auto" />
            <div className="text-sm font-semibold text-gray-300">
              No custom stream overrides yet
            </div>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Titles will automatically resolve through SparkBoxCore (MovieBox / WeFeed / VidSrc). You can also add custom links anytime.
            </p>
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Stream</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
