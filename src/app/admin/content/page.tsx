'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Film,
  Tv,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Star,
  Clock,
} from 'lucide-react';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';

export default function AdminContentPage() {
  // Search TMDB Quick-Import state
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState<any[]>([]);
  const [searchingTmdb, setSearchingTmdb] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);

  // Custom Stream Input form state
  const [streamUrl, setStreamUrl] = useState('');
  const [streamType, setStreamType] = useState<'hls' | 'mp4' | 'embed'>('hls');
  const [quality, setQuality] = useState<'1080p' | '720p' | '4k' | '480p'>('1080p');
  const [providerName, setProviderName] = useState('Custom Direct Stream');
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [savingStream, setSavingStream] = useState(false);

  // Custom Stream Library state
  const [libraryStreams, setLibraryStreams] = useState<any[]>([]);
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [librarySearch, setLibrarySearch] = useState('');
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch Library
  const fetchLibrary = async () => {
    try {
      const res = await fetch(
        `/api/admin/content?type=${libraryFilter}&q=${encodeURIComponent(librarySearch)}`
      );
      if (res.ok) {
        const data = await res.json();
        setLibraryStreams(data.streams || []);
      }
    } catch (err) {
      console.warn('Error loading library:', err);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, [libraryFilter, librarySearch]);

  // Debounced TMDB search
  useEffect(() => {
    if (!tmdbSearchQuery.trim()) {
      setTmdbSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingTmdb(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(tmdbSearchQuery.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setTmdbSearchResults(data.results || []);
        }
      } catch (err) {
        console.warn('TMDB search error:', err);
      } finally {
        setSearchingTmdb(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [tmdbSearchQuery]);

  // Select item from TMDB search
  const handleSelectTmdbItem = (item: any) => {
    setSelectedMedia(item);
    setTmdbSearchResults([]);
    setTmdbSearchQuery(item.title || item.name);
  };

  // Submit custom stream
  const handleAddStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia) {
      setNotification({
        type: 'error',
        text: 'Please select a movie or TV show using the TMDB search first.',
      });
      return;
    }

    if (!streamUrl.trim()) {
      setNotification({
        type: 'error',
        text: 'Please provide a valid stream or embed URL.',
      });
      return;
    }

    setSavingStream(true);
    setNotification(null);

    const isTv =
      selectedMedia.media_type === 'tv' || Boolean(selectedMedia.name && !selectedMedia.title);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: selectedMedia.id,
          title: selectedMedia.title || selectedMedia.name,
          media_type: isTv ? 'tv' : 'movie',
          season: isTv ? Number(season) : null,
          episode: isTv ? Number(episode) : null,
          stream_url: streamUrl.trim(),
          stream_type: streamType,
          quality,
          provider_name: providerName || 'Custom Direct',
          poster_path: selectedMedia.poster_path,
          backdrop_path: selectedMedia.backdrop_path,
          overview: selectedMedia.overview,
          rating: selectedMedia.vote_average,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          text: `Successfully attached custom stream for "${selectedMedia.title || selectedMedia.name}"!`,
        });
        setStreamUrl('');
        fetchLibrary();
      } else {
        throw new Error(data.error || 'Failed to save custom stream.');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: err.message || 'Error saving custom stream.',
      });
    } finally {
      setSavingStream(false);
    }
  };

  // Delete custom stream
  const handleDeleteStream = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete custom stream for "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotification({
          type: 'success',
          text: `Deleted custom stream for "${title}".`,
        });
        fetchLibrary();
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        text: 'Failed to delete custom stream.',
      });
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
            Content & Stream Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Quick-import titles from TMDB and deploy custom direct HLS, MP4, or VIP embed streams.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border border-red-500/30 text-red-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Quick Import & Attach Stream Card */}
      <div className="p-6 rounded-2xl glass-panel space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            TMDB Quick-Import & Stream Linker
          </h2>
        </div>

        {/* Search TMDB Input */}
        <div className="relative">
          <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
            Step 1: Search Movie or TV Show on TMDB
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={tmdbSearchQuery}
              onChange={(e) => setTmdbSearchQuery(e.target.value)}
              placeholder="Type title or TMDB ID (e.g. Deadpool & Wolverine, Arcane, 533535)..."
              className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          {/* TMDB Search Dropdown */}
          {tmdbSearchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel shadow-2xl overflow-hidden border border-white/10 z-50 divide-y divide-white/5 max-h-72 overflow-y-auto">
              {tmdbSearchResults.slice(0, 6).map((item) => {
                const title = item.title || item.name;
                const isTv = item.media_type === 'tv' || Boolean(item.name && !item.title);
                const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                const poster = item.poster_path
                  ? `${TMDB_IMAGE_SIZES.poster.small}${item.poster_path}`
                  : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80';

                return (
                  <button
                    key={`${item.media_type}-${item.id}`}
                    type="button"
                    onClick={() => handleSelectTmdbItem(item)}
                    className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors"
                  >
                    <div className="relative w-8 h-12 rounded bg-gray-800 shrink-0 overflow-hidden">
                      <Image src={poster} alt={title} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{title}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-red-600/80 text-white font-black uppercase">
                          {isTv ? 'TV' : 'Movie'}
                        </span>
                        <span>{year}</span>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{item.vote_average?.toFixed(1) || '8.0'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Movie Preview & Form */}
        {selectedMedia && (
          <form onSubmit={handleAddStream} className="space-y-5 animate-in fade-in duration-200">
            {/* Auto-Filled Metadata Card */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 bg-gray-800 border border-white/10">
                <Image
                  src={
                    selectedMedia.poster_path
                      ? `${TMDB_IMAGE_SIZES.poster.small}${selectedMedia.poster_path}`
                      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={selectedMedia.title || selectedMedia.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5 flex-grow text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[10px] uppercase">
                    TMDB ID: {selectedMedia.id}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold text-[10px] uppercase">
                    {selectedMedia.media_type === 'tv' ? 'TV Series' : 'Movie'}
                  </span>
                </div>
                <div className="text-sm font-black text-white">
                  {selectedMedia.title || selectedMedia.name}
                </div>
                <p className="text-gray-400 line-clamp-2">
                  {selectedMedia.overview}
                </p>
              </div>
            </div>

            {/* TV Season / Episode Inputs if TV show */}
            {(selectedMedia.media_type === 'tv' ||
              Boolean(selectedMedia.name && !selectedMedia.title)) && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Season Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={season}
                    onChange={(e) => setSeason(Number(e.target.value))}
                    className="w-full bg-[#11141f] text-xs text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-300 block mb-1">
                    Episode Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={episode}
                    onChange={(e) => setEpisode(Number(e.target.value))}
                    className="w-full bg-[#11141f] text-xs text-white rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            )}

            {/* Stream URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Step 2: Playable Video / Embed Stream URL (.m3u8, .mp4, or embed)
              </label>
              <input
                type="url"
                required
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://example.com/stream/manifest.m3u8 or https://vidsrc.to/embed/..."
                className="w-full bg-[#11141f] text-xs sm:text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Stream Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Format
                </label>
                <select
                  value={streamType}
                  onChange={(e) => setStreamType(e.target.value as any)}
                  className="w-full bg-[#11141f] text-xs text-gray-200 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-red-500"
                >
                  <option value="hls">HLS (.m3u8 master playlist)</option>
                  <option value="mp4">MP4 (Direct video file)</option>
                  <option value="embed">Embed (Iframe mirror URL)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Quality Tier
                </label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value as any)}
                  className="w-full bg-[#11141f] text-xs text-gray-200 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-red-500"
                >
                  <option value="1080p">1080p Full HD</option>
                  <option value="4k">4K Ultra HD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Provider Label
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. VIP Server"
                  className="w-full bg-[#11141f] text-xs text-gray-200 rounded-xl px-3 py-2.5 border border-white/10 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={savingStream}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              {savingStream ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{savingStream ? 'Saving...' : 'Deploy Custom Stream'}</span>
            </button>
          </form>
        )}
      </div>

      {/* 2. Custom Streams Library */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white">
              Custom Stream Library ({libraryStreams.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter pills */}
            <div className="flex items-center bg-[#11141f] p-1 rounded-xl border border-white/10 text-xs">
              {(['all', 'movie', 'tv'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLibraryFilter(t)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                    libraryFilter === t
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Filter input */}
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Filter by title..."
              className="bg-[#11141f] text-xs text-gray-200 placeholder-gray-500 rounded-xl px-3 py-1.5 border border-white/10 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Library Table */}
        {loadingLibrary ? (
          <div className="text-center py-12 text-xs text-gray-400">
            Loading library streams...
          </div>
        ) : libraryStreams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/5 bg-black/30">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3">Provider</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {libraryStreams.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <span>{s.title}</span>
                      {s.media_type === 'tv' && (
                        <span className="text-[10px] text-red-400 font-bold">
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
                    <td className="py-3 px-3 text-gray-400">{s.provider_name}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/watch/${s.media_type}/${s.tmdb_id}${
                            s.media_type === 'tv'
                              ? `?season=${s.season}&episode=${s.episode}`
                              : ''
                          }`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-gray-200 hover:text-white transition-colors"
                          title="Watch preview"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteStream(s.id, s.title)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600/30 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Delete stream override"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 rounded-xl bg-black/20 text-xs text-gray-400">
            No custom stream overrides found matching your filter. Use the Quick-Import tool above to add custom links.
          </div>
        )}
      </div>
    </div>
  );
}
