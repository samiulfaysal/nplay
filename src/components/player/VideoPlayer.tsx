'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCw,
  Server,
  Zap,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Check,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { StreamSource, Subtitle } from '@/types/content';

interface VideoPlayerProps {
  sources: StreamSource[];
  embedServers?: any[];
  subtitles?: Subtitle[];
  poster?: string;
  fallbackEmbedUrl?: string;
  title: string;
  releaseYear?: string;
  imdbId?: string;
  isTv?: boolean;
  currentEpisode?: number;
  totalEpisodes?: number;
  onNextEpisode?: () => void;
  onProgress?: (progressSeconds: number, durationSeconds: number) => void;
}

export function VideoPlayer({
  sources = [],
  subtitles = [],
  poster,
  title,
  releaseYear,
  imdbId,
  isTv = false,
  currentEpisode,
  totalEpisodes,
  onNextEpisode,
  onProgress,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default to first available Pro source (e.g. MovieBox Pro)
  const [activeServerId, setActiveServerId] = useState<string>(() => {
    return sources[0]?.id || '';
  });

  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedResolution, setSelectedResolution] = useState<string>('Auto');
  const [showResPicker, setShowResPicker] = useState<boolean>(false);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  const dashPlayerRef = useRef<any>(null);
  const hlsPlayerRef = useRef<Hls | null>(null);
  const userInteractedRef = useRef(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const activeSource = sources.find((s) => s.id === activeServerId) || sources[0] || null;
  const activeServerName = activeSource?.provider || 'MovieBox Pro';

  // Handle URL resolution (if source is an on-demand resolve endpoint)
  useEffect(() => {
    if (!activeSource) return;

    setResolveError(null);
    const rawUrl = activeSource.url || '';

    if (rawUrl.startsWith('/api/stream/resolve')) {
      setIsResolving(true);
      fetch(rawUrl)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setIsResolving(false);
          const first = data?.sources?.[0];
          if (first?.url) {
            setResolvedUrl(first.url);
          } else {
            setResolveError('Direct stream is currently fetching from upstream CDN...');
          }
        })
        .catch(() => {
          setIsResolving(false);
          setResolveError('Connection timeout to upstream stream provider');
        });
    } else {
      setIsResolving(false);
      setResolvedUrl(rawUrl);
    }
  }, [activeServerId, activeSource]);

  // Video playback engine (Supports MPEG-DASH via dashjs, HLS via hls.js, MP4 via HTML5)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Cleanup previous players
    if (dashPlayerRef.current) {
      dashPlayerRef.current.destroy();
      dashPlayerRef.current = null;
    }
    if (hlsPlayerRef.current) {
      hlsPlayerRef.current.destroy();
      hlsPlayerRef.current = null;
    }

    video.removeAttribute('src');
    video.load();

    if (!resolvedUrl) return;

    const isDash = resolvedUrl.includes('.mpd') || activeSource?.type === 'dash';
    const isHls = resolvedUrl.includes('.m3u8') || activeSource?.type === 'hls';

    if (isDash) {
      // MPEG-DASH via dash.js
      import('dashjs')
        .then((dashjsModule: any) => {
          const dashjs = dashjsModule.default || dashjsModule;
          const player = dashjs.MediaPlayer().create();
          player.initialize(video, resolvedUrl, false);
          player.updateSettings({
            streaming: {
              buffer: {
                fastSwitchEnabled: true,
              },
            },
          });
          dashPlayerRef.current = player;
        })
        .catch((err) => {
          console.error('[VideoPlayer] dashjs load error:', err);
        });
    } else if (isHls) {
      // HLS via hls.js
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(resolvedUrl);
        hls.attachMedia(video);
        hlsPlayerRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = resolvedUrl;
      }
    } else {
      // Standard Direct MP4 / WebM
      video.src = resolvedUrl;
    }

    return () => {
      if (dashPlayerRef.current) {
        dashPlayerRef.current.destroy();
        dashPlayerRef.current = null;
      }
      if (hlsPlayerRef.current) {
        hlsPlayerRef.current.destroy();
        hlsPlayerRef.current = null;
      }
    };
  }, [resolvedUrl, activeSource]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);
    if (onProgress && dur > 0) {
      onProgress(curr, dur);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleNextServer = () => {
    const currentIdx = sources.findIndex((s) => s.id === activeServerId);
    const nextIdx = (currentIdx + 1) % sources.length;
    const nextServer = sources[nextIdx];
    if (nextServer) {
      setActiveServerId(nextServer.id);
      showToast(`⚡ Switched to server: ${nextServer.provider}`);
    }
  };

  // Server Slider horizontal scrolling
  const serverSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkSliderScroll = () => {
    if (!serverSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = serverSliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scrollServerSlider = (direction: 'left' | 'right') => {
    if (!serverSliderRef.current) return;
    const scrollAmount = 280;
    serverSliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkSliderScroll, 320);
  };

  return (
    <div className="space-y-3">
      {/* 1. Main Cinema Native Video Player Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl group select-none"
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Loading / Resolving Overlay */}
        {(isResolving || (!resolvedUrl && !resolveError)) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-30 space-y-3">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <div className="text-sm font-bold text-white tracking-wide">
              Connecting to {activeServerName}...
            </div>
            <p className="text-xs text-gray-400">
              100% Ad-Free Direct Native Stream • Zero Popups
            </p>
          </div>
        )}

        {/* Error / Buffering Banner with Retry */}
        {resolveError && !resolvedUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-30 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-white font-bold text-sm">
                Stream unavailable on {activeServerName}
              </h3>
              <p className="text-xs text-gray-400">
                {resolveError}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextServer}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Switch to Next Server</span>
              </button>
            </div>
          </div>
        )}

        {/* Native HTML5 Video Player */}
        <video
          ref={videoRef}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            if (isTv && onNextEpisode) onNextEpisode();
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
          playsInline
        >
          {subtitles.map((sub) => (
            <track
              key={sub.language}
              kind="subtitles"
              src={sub.url}
              srcLang={sub.language}
              label={sub.label}
              default={sub.default}
            />
          ))}
        </video>

        {/* Big Centered Play Button when Paused */}
        {!isPlaying && resolvedUrl && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1" />
          </button>
        )}

        {/* Custom Cinema Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Slider */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-600 mb-3"
          />

          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="hover:text-red-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="hover:text-red-400 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-gray-300 font-medium text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-white/10 text-[11px] font-bold text-gray-300">
                {activeSource?.quality || '1080P'}
              </span>

              <button
                onClick={toggleFullscreen}
                className="hover:text-red-400 transition-colors"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sleek Streaming Server Selector Bar - 100% Pro Direct Servers */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#11131c]/95 via-[#0c0d14]/98 to-[#07080d]/99 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-3 sm:p-4 space-y-3">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-sm tracking-tight">
                  Pro Direct Servers
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active: {activeServerName}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Resolution Picker */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowResPicker(!showResPicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all shrink-0 active:scale-95"
                title="Streaming Resolution"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedResolution}</span>
              </button>
              {showResPicker && (
                <div className="absolute top-full right-0 mt-1.5 w-36 p-1.5 rounded-xl bg-black/95 backdrop-blur-md border border-white/15 shadow-2xl z-50 flex flex-col gap-1">
                  {['Auto', '4K UHD', '1080p HD', '720p', '480p'].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => {
                        setSelectedResolution(res);
                        setShowResPicker(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedResolution === res
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span>{res}</span>
                      {selectedResolution === res && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Server Selection Pills Container (Only the 6 Pro Servers) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollServerSlider('left')}
            disabled={!canScrollLeft}
            className={`hidden sm:flex p-2 rounded-xl transition-all shrink-0 items-center justify-center ${
              canScrollLeft
                ? 'bg-white/[0.08] hover:bg-red-600 text-white border border-white/10 shadow-md active:scale-95'
                : 'bg-white/[0.02] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-30'
            }`}
            title="Slide left"
            aria-label="Slide left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={serverSliderRef}
            onScroll={checkSliderScroll}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 w-full"
          >
            {sources.map((src) => {
              const isActive = activeServerId === src.id;
              const tooltip = src.tooltip || 'Direct high-speed stream with zero ads and instant playback';
              return (
                <div key={src.id} className="relative group/pill shrink-0">
                  <button
                    onClick={(e) => {
                      userInteractedRef.current = true;
                      setActiveServerId(src.id);
                      setActiveTooltipId(activeTooltipId === src.id ? null : src.id);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/50'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span className="tracking-tight">{src.provider}</span>

                    {/* Quality Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 text-gray-300 border border-white/10">
                      {src.quality || '1080p'}
                    </span>

                    {/* Ad-Free Pro Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      AD-FREE PRO
                    </span>
                  </button>

                  {/* Tooltip */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${
                      activeTooltipId === src.id ? 'flex' : 'hidden'
                    } group-hover/pill:flex flex-col items-center pointer-events-none z-50 animate-in fade-in duration-150`}
                  >
                    <div className="px-2.5 py-1.5 rounded-lg bg-gray-950 text-gray-200 text-[10px] leading-tight shadow-2xl border border-white/10 whitespace-normal w-52 text-center font-medium">
                      {tooltip}
                    </div>
                    <div className="w-2 h-2 bg-gray-950 border-r border-b border-white/10 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollServerSlider('right')}
            disabled={!canScrollRight}
            className={`hidden sm:flex p-2 rounded-xl transition-all shrink-0 items-center justify-center ${
              canScrollRight
                ? 'bg-white/[0.08] hover:bg-red-600 text-white border border-white/10 shadow-md active:scale-95'
                : 'bg-white/[0.02] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-30'
            }`}
            title="Slide right"
            aria-label="Slide right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
