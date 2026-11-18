'use client';

import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import {
  Tv,
  Radio,
  Play,
  Volume2,
  VolumeX,
  Maximize,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Globe,
  Sparkles,
  ChevronRight,
  RotateCw,
} from 'lucide-react';

interface LiveChannel {
  id: string;
  name: string;
  group: string;
  logo: string;
  streamUrl: string;
  country?: string;
}

export default function LiveTvPage() {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<LiveChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customM3uUrl, setCustomM3uUrl] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial curated Live TV channels
  useEffect(() => {
    async function loadChannels() {
      try {
        const res = await fetch('/api/live-tv/channels');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.channels) && data.channels.length > 0) {
            setChannels(data.channels);
            setFilteredChannels(data.channels);
            setSelectedChannel(data.channels[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load live channels:', err);
      }
    }
    loadChannels();
  }, []);

  // Filter channels by Category and Search
  useEffect(() => {
    let result = channels;
    if (selectedCategory !== 'All') {
      result = result.filter(
        (c) =>
          c.group.toLowerCase() === selectedCategory.toLowerCase() ||
          (c.country && c.country.toLowerCase() === selectedCategory.toLowerCase())
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.group.toLowerCase().includes(q) ||
          (c.country && c.country.toLowerCase().includes(q))
      );
    }
    setFilteredChannels(result);
  }, [selectedCategory, searchQuery, channels]);

  // HLS.js stream attachment on selected channel change
  useEffect(() => {
    if (!selectedChannel || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported() && selectedChannel.streamUrl.includes('.m3u8')) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(selectedChannel.streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay policy fallback: mute and play
          video.muted = true;
          setIsMuted(true);
          video.play().catch(console.error);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              break;
          }
        }
      });
    } else {
      video.src = selectedChannel.streamUrl;
      video.play().catch(console.error);
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [selectedChannel]);

  // Handle custom M3U playlist import
  const handleImportM3u = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customM3uUrl.trim()) return;

    setIsImporting(true);
    setImportNotice(null);

    try {
      const res = await fetch(`/api/live-tv/channels?url=${encodeURIComponent(customM3uUrl.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.channels) && data.channels.length > 0) {
          setChannels(data.channels);
          setFilteredChannels(data.channels);
          setSelectedChannel(data.channels[0]);
          setImportNotice(`Successfully loaded ${data.channels.length} channels from M3U playlist!`);
          setCustomM3uUrl('');
        } else {
          setImportNotice('No valid stream channels found in this M3U playlist.');
        }
      } else {
        setImportNotice('Failed to fetch M3U playlist. Check the URL and try again.');
      }
    } catch {
      setImportNotice('Network error importing playlist.');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const categories = ['All', 'News', 'Sports', 'Movies', 'Documentary', 'Music', 'Bangladesh'];

  return (
    <div className="min-h-screen pb-20 pt-2 sm:pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30">
              <Tv className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider">
              NETFLY <span className="text-red-500">LIVE TV</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              IPTV HLS
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Stream live sports, breaking news, entertainment, and custom M3U playlists with zero buffering.
          </p>
        </div>

        {/* Channel Count Pill */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
            {filteredChannels.length} Channels
          </span>
        </div>
      </div>

      {/* Main Grid: Player Section + Channel Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Left Column: 16:9 HLS Video Player (Sticky on mobile) */}
        <div className="lg:col-span-2 space-y-3">
          <div
            ref={playerContainerRef}
            className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black select-none"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              autoPlay
            />

            {/* Live Indicator Overlay Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="font-black text-[11px] tracking-wider uppercase text-red-400">
                LIVE
              </span>
              <span className="text-gray-400 text-[10px]">|</span>
              <span className="font-bold text-gray-200 truncate max-w-[140px] sm:max-w-xs">
                {selectedChannel?.name || 'Live Broadcast'}
              </span>
            </div>

            {/* Floating Quick Action Overlay */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/10 transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/10 transition-all"
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Channel Details Bar */}
          {selectedChannel && (
            <div className="p-3 sm:p-4 rounded-xl glass-panel border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {selectedChannel.logo ? (
                  <img
                    src={selectedChannel.logo}
                    alt={selectedChannel.name}
                    className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 border border-white/10 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-sm shrink-0">
                    TV
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-white truncate">
                      {selectedChannel.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300">
                      {selectedChannel.group}
                    </span>
                    {selectedChannel.country && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        {selectedChannel.country}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                    HLS Stream • Zero Buffering • 1080p Broadcast
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom M3U Playlist Importer (MovieBox-Tui feature) */}
          <div className="p-3 sm:p-4 rounded-xl glass-panel border border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
              <PlusCircle className="w-4 h-4 text-red-500" />
              <span>Import Custom M3U / IPTV Playlist</span>
            </div>
            <form onSubmit={handleImportM3u} className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/playlist.m3u or .m3u8"
                value={customM3uUrl}
                onChange={(e) => setCustomM3uUrl(e.target.value)}
                className="flex-grow px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={isImporting || !customM3uUrl.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-all flex items-center gap-1.5"
              >
                {isImporting ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Load</span>
              </button>
            </form>
            {importNotice && (
              <p className="text-[11px] text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importNotice}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Search, Categories & Channel Grid */}
        <div className="space-y-3">
          {/* Channel Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels, news, sports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Channel List */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto no-scrollbar pr-1">
            {filteredChannels.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 border border-white/5 rounded-xl">
                No channels found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredChannels.map((channel) => {
                const isSelected = selectedChannel?.id === channel.id;
                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => {
                      setSelectedChannel(channel);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-7 h-7 rounded object-contain bg-black/40 p-0.5 border border-white/10 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-black/40 text-white' : 'bg-red-600/20 text-red-400'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{channel.name}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {channel.group} {channel.country ? `• ${channel.country}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
