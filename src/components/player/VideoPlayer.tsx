'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  RotateCw,
  Server,
  FastForward,
  Check,
  AlertCircle,
  X,
  Info,
  Zap,
  Radio,
  ChevronLeft,
  ChevronRight,
  Subtitles,
  SlidersHorizontal,
} from 'lucide-react';
import { StreamSource, Subtitle } from '@/types/content';
import { EmbedServer } from '@/lib/providerCore';

interface VideoPlayerProps {
  sources: StreamSource[];
  embedServers?: EmbedServer[];
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
  embedServers = [],
  subtitles = [],
  poster,
  fallbackEmbedUrl,
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

  /**
   * Evaluates and selects the highest-quality, best-working server:
   * 1. Playable Direct Native Stream (Ad-free, non-empty HLS/MP4, not .mpd)
   * 2. High-speed Minimal-Ads Cloud Mirrors (VidLink VIP -> VidSrc Clean -> MultiEmbed)
   */
  const findBestWorkingServer = (
    srcs: StreamSource[] = sources,
    embeds: EmbedServer[] = embedServers
  ): { id: string; name: string; isDirect: boolean } => {
    // 1. Check for genuine playable direct sources
    const playableDirect = srcs.find(
      (s) =>
        Boolean(s.url) &&
        s.url.trim().length > 0 &&
        !s.url.includes('.mpd') &&
        (s.type === 'hls' || s.url.includes('.m3u8') || s.url.includes('.mp4'))
    );

    if (playableDirect) {
      return { id: playableDirect.id, name: playableDirect.provider || 'Direct Player', isDirect: true };
    }

    // 2. Real-time verified working embed server (from server-side probe)
    const verifiedEmbed = embeds.find((e) => e.isVerifiedAvailable && e.url);
    if (verifiedEmbed) {
      return { id: verifiedEmbed.id, name: verifiedEmbed.name, isDirect: false };
    }

    // 3. Clean embed priority
    const preferredEmbedIds = ['server-vidsrc-cc', 'server-2embed', 'server-vidlink', 'server-vidsrc-me', 'server-multiembed'];
    for (const pid of preferredEmbedIds) {
      const match = embeds.find((e) => e.id === pid && e.url);
      if (match) {
        return { id: match.id, name: match.name, isDirect: false };
      }
    }

    // 3. Fallback to any minimal-ads/ad-free embed
    const cleanEmbed = embeds.find((e) => e.adStatus !== 'has-ads' && e.url);
    if (cleanEmbed) {
      return { id: cleanEmbed.id, name: cleanEmbed.name, isDirect: false };
    }

    // 4. Fallback to first embed or first source
    if (embeds.length > 0) {
      return { id: embeds[0].id, name: embeds[0].name, isDirect: false };
    }
    return { id: srcs[0]?.id || '', name: srcs[0]?.provider || 'Streaming Server', isDirect: !!srcs[0] };
  };

  // Unified active server id: automatically defaults to the best working server
  const [activeServerId, setActiveServerId] = useState<string>(() => {
    return findBestWorkingServer(sources, embedServers).id;
  });
  const [autoNext, setAutoNext] = useState(true);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    if (!userInteractedRef.current) {
      const best = findBestWorkingServer(sources, embedServers);
      if (best.id && best.id !== activeServerId) {
        setActiveServerId(best.id);
      }
    }
  }, [sources, embedServers, activeServerId]);

  // Non-blocking toast notification for stream failovers & auto-selection
  const [failoverToast, setFailoverToast] = useState<string | null>(null);
  const failoverToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAutoSelectBest = () => {
    userInteractedRef.current = false;
    const best = findBestWorkingServer(sources, embedServers);
    if (best.id) {
      setActiveServerId(best.id);
      setFailoverToast(`⚡ Auto-selected best working server: ${best.name}`);
      if (failoverToastTimeoutRef.current) clearTimeout(failoverToastTimeoutRef.current);
      failoverToastTimeoutRef.current = setTimeout(() => {
        setFailoverToast(null);
      }, 4500);
    }
  };

  // 8-Second Smart Health Check & Auto-Failover State
  const [showFailoverNotice, setShowFailoverNotice] = useState(false);
  const failoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const allServers = [
    ...sources.map((s) => ({ id: s.id, name: s.provider })),
    ...embedServers.map((e) => ({ id: e.id, name: e.name })),
  ];

  const handleNextServer = () => {
    setShowFailoverNotice(false);
    const currentIdx = allServers.findIndex((s) => s.id === activeServerId);
    const nextIdx = (currentIdx + 1) % allServers.length;
    const nextServer = allServers[nextIdx];
    if (nextServer) {
      userInteractedRef.current = true;
      setActiveServerId(nextServer.id);
    }
  };

  const handleStreamFailover = (reason?: string) => {
    console.warn('[VideoPlayer] Stream failover triggered:', reason);
    const best = findBestWorkingServer([], embedServers);
    if (best.id) {
      setActiveServerId(best.id);
      setFailoverToast(`Direct stream unavailable (${reason || 'media error'}) — auto-switched to ${best.name}...`);
    }

    if (failoverToastTimeoutRef.current) clearTimeout(failoverToastTimeoutRef.current);
    failoverToastTimeoutRef.current = setTimeout(() => {
      setFailoverToast(null);
    }, 4500);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoEl = e.currentTarget;
    const err = videoEl.error;
    console.warn('[VideoPlayer] Video element caught playback error:', err?.code, err?.message);
    handleStreamFailover(err?.message || 'Unsupported media codec or format');
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolution picker state (MovieBox-Tui resolution picker: 4K, 1080p, 720p, 480p, Auto)
  const [selectedResolution, setSelectedResolution] = useState<string>('Auto');
  const [showResPicker, setShowResPicker] = useState<boolean>(false);

  // Subtitle track state (MovieBox-Tui subtitle track selector)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('en');
  const [showSubPicker, setShowSubPicker] = useState<boolean>(false);

  // BDIX reachability detection
  const [bdixStatus, setBdixStatus] = useState<{ checked: boolean; reachable: boolean }>({
    checked: false,
    reachable: false,
  });

  // Mobile interactive tooltip tap state
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/providers/bdix-check')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setBdixStatus({ checked: true, reachable: !!data.reachable });
        }
      })
      .catch(() => {
        setBdixStatus({ checked: true, reachable: false });
      });
  }, []);

  const handleResolutionSelect = (res: string) => {
    setSelectedResolution(res);
    setShowResPicker(false);

    if (res !== 'Auto') {
      const matchSrc = sources.find((s) =>
        s.quality.toLowerCase().includes(res.toLowerCase().replace(/[^a-z0-9]/g, ''))
      );
      if (matchSrc) {
        userInteractedRef.current = true;
        setActiveServerId(matchSrc.id);
      }
    }
  };

  const handleSubtitleChange = (lang: string) => {
    setSelectedSubtitle(lang);
    setShowSubPicker(false);
    const video = videoRef.current;
    if (video && video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (lang === 'off') {
          track.mode = 'disabled';
        } else if (track.language === lang || (lang === 'en' && track.language.startsWith('en'))) {
          track.mode = 'showing';
        } else {
          track.mode = 'disabled';
        }
      }
    }
  };

  const activeDirectSource = sources.find((s) => s.id === activeServerId) || null;
  const activeEmbedServer = embedServers.find((s) => s.id === activeServerId) || null;

  const isDirectActive = !!activeDirectSource;
  const isDirectPlayable =
    isDirectActive &&
    !!activeDirectSource?.url &&
    (activeDirectSource.type === 'hls' ||
      activeDirectSource.url.includes('.m3u8') ||
      activeDirectSource.url.includes('.mp4')) &&
    !activeDirectSource.url.includes('.mpd');

  const activeServerName =
    activeDirectSource?.provider || activeEmbedServer?.name || 'Streaming Server';

  const activeEmbedUrl =
    activeEmbedServer?.url || fallbackEmbedUrl || embedServers[0]?.url || '';

  // 6-Second Smart Health Check & Auto-Failover
  useEffect(() => {
    setShowFailoverNotice(false);
    if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);

    failoverTimerRef.current = setTimeout(() => {
      setShowFailoverNotice(true);

      // If user hasn't manually selected and embed is taking >6s without video, auto-test next server!
      if (!userInteractedRef.current && !isDirectPlayable && allServers.length > 1) {
        const currentIdx = allServers.findIndex((s) => s.id === activeServerId);
        const nextServer = allServers[(currentIdx + 1) % allServers.length];
        if (nextServer && nextServer.id !== activeServerId) {
          console.log('[VideoPlayer] Auto-advancing from non-playing server to:', nextServer.name);
          setActiveServerId(nextServer.id);
          setFailoverToast(`⚡ Stream taking long on current server — testing ${nextServer.name}...`);
          if (failoverToastTimeoutRef.current) clearTimeout(failoverToastTimeoutRef.current);
          failoverToastTimeoutRef.current = setTimeout(() => {
            setFailoverToast(null);
          }, 4000);
        }
      }
    }, 6000);

    return () => {
      if (failoverTimerRef.current) clearTimeout(failoverTimerRef.current);
    };
  }, [activeServerId, activeEmbedUrl, isDirectPlayable, allServers]);

  // Server Slider state and scrolling handlers
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

  useEffect(() => {
    if (serverSliderRef.current) {
      serverSliderRef.current.scrollLeft = 0;
    }
    checkSliderScroll();
    window.addEventListener('resize', checkSliderScroll);
    return () => window.removeEventListener('resize', checkSliderScroll);
  }, [embedServers, sources]);

  // Multi-Layer Anti-Redirect Guard: Neutralizes popup takeovers, top location hijacking, and unauthorized unloads
  useEffect(() => {
    // 1. Override parent window.open to trap popup attacks
    const originalOpen = window.open;
    window.open = function (url?: string | URL, target?: string, features?: string) {
      console.warn('[Netfly Shield] Prevented external redirect attempt:', url);
      return null;
    };

    // 2. Prevent unauthorized unload/top-navigation attempts from iframes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    // 3. Prevent loss of window focus to popup windows & pull focus back to Netfly
    const handleBlur = () => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        setTimeout(() => {
          window.focus();
        }, 30);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focusout', handleBlur);

    return () => {
      window.open = originalOpen;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Auto-next episode when video playback finishes
  const handleEnded = () => {
    setIsPlaying(false);
    if (isTv && autoNext && onNextEpisode) {
      onNextEpisode();
    }
  };

  // Initialize HLS / Direct playback
  useEffect(() => {
    if (!isDirectPlayable || !activeDirectSource) return;

    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const streamUrl = activeDirectSource.url || '';
    const isHls =
      activeDirectSource.type === 'hls' ||
      streamUrl.includes('.m3u8');

    // Clean up previous video source
    video.removeAttribute('src');
    video.load();

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Stream ready
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.warn('[HLS] Stream error encountered:', data.type, data.details);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                hls?.destroy();
                handleStreamFailover(data.details || 'HLS stream failure');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        handleStreamFailover('HLS not supported in this browser');
      }
    } else {
      video.src = streamUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isDirectPlayable, activeDirectSource]);

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

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);
    if (onProgress) {
      onProgress(Math.floor(curr), Math.floor(dur));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3.5">
      {/* 1. Main Player Screen (Edge-to-edge on mobile, sticky top-14 while scrolling) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="sticky top-14 z-30 md:static aspect-video rounded-none sm:rounded-2xl overflow-hidden bg-black border-y sm:border border-white/10 shadow-2xl shadow-black group select-none -mx-4 sm:mx-0 w-[calc(100%+2rem)] sm:w-full"
      >
        {/* Instant Failover Toast Notification */}
        {failoverToast && (
          <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl bg-gray-950/95 backdrop-blur-md border border-cyan-500/40 text-xs text-cyan-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
              <span className="font-semibold truncate">{failoverToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setFailoverToast(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
              aria-label="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 8-Second Smart Health Check & Auto-Failover Notification Banner */}
        {showFailoverNotice && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-xl bg-black/90 backdrop-blur-md border border-amber-500/40 text-xs text-amber-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="truncate">
                Stream taking longer to load on <strong>{activeServerName}</strong>?
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleNextServer}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Try Next Server</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFailoverNotice(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {!isDirectPlayable && activeEmbedUrl ? (
          <div className="relative w-full h-full">
            <iframe
              key={activeEmbedUrl}
              src={activeEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              referrerPolicy="no-referrer"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              title={`${title} player`}
            />


          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              poster={poster}
              onError={handleVideoError}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
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

            {/* Centered Play Button when paused */}
            {!isPlaying && (
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
                    {activeDirectSource?.quality?.toUpperCase() || '1080P'}
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
          </>
        )}
      </div>

      {/* 2. Sleek Streaming Server Selector Bar */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#11131c]/95 via-[#0c0d14]/98 to-[#07080d]/99 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-3 sm:p-4 space-y-3">
        {/* Subtle Crimson Ambient Highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent pointer-events-none" />

        {/* Top Header Row: Server Info & Quick Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          {/* Left: Server Status & Verified Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 shadow-inner">
              <Server className="w-4 h-4" />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-xs sm:text-sm tracking-tight">Streaming Servers</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active: {activeServerName}
                </span>
                <button
                  type="button"
                  onClick={handleAutoSelectBest}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all active:scale-95 shadow-sm"
                  title="Auto-detect and switch to the best working server"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Auto Best Server</span>
                </button>

              </div>

            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap sm:flex-nowrap">
            {/* BDIX Local Mirror Active Indicator */}
            {bdixStatus.checked && bdixStatus.reachable && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs shrink-0"
                title="BDIX Peering Active: 100Mbps high-speed unmetered local Bangladesh streaming"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>BDIX (100Mbps)</span>
              </div>
            )}

            {/* Resolution Picker */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowResPicker(!showResPicker);
                  setShowSubPicker(false);
                }}
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
                      onClick={() => handleResolutionSelect(res)}
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

            {/* Subtitle Track Selector */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowSubPicker(!showSubPicker);
                  setShowResPicker(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all shrink-0 active:scale-95"
                title="Subtitle Language"
              >
                <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">CC:</span>
                <span className="uppercase text-[11px] font-mono">{selectedSubtitle}</span>
              </button>
              {showSubPicker && (
                <div className="absolute top-full right-0 mt-1.5 w-44 p-1.5 rounded-xl bg-black/95 backdrop-blur-md border border-white/15 shadow-2xl z-50 flex flex-col gap-1 max-h-56 overflow-y-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => handleSubtitleChange('off')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedSubtitle === 'off'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>Subtitles Off</span>
                    {selectedSubtitle === 'off' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  {subtitles.map((sub) => (
                    <button
                      key={sub.language}
                      type="button"
                      onClick={() => handleSubtitleChange(sub.language)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedSubtitle === sub.language
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{sub.label}</span>
                      {selectedSubtitle === sub.language && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Next Server Trigger */}
            <button
              type="button"
              onClick={handleNextServer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-red-600/20 border border-white/10 hover:border-red-500/40 text-xs text-gray-300 hover:text-white font-semibold transition-all shrink-0 active:scale-95"
              title="Stream slow or black screen? Switch to next available server"
            >
              <RotateCw className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Try Next Server</span>
              <span className="sm:hidden">Next</span>
            </button>

            {/* Auto-Next Episode Toggle (For TV Series) */}
            {isTv && (
              <button
                type="button"
                onClick={() => setAutoNext(!autoNext)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                  autoNext
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/[0.05] border-white/5 text-gray-400'
                }`}
                title="Automatically advance to the next episode when current episode ends"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Auto-Next: {autoNext ? 'ON' : 'OFF'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Server Carousel Row: Inline Navigation Arrows + Smooth Slider (Zero Text Overlap) */}
        <div className="flex items-center gap-2">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollServerSlider('left')}
            disabled={!canScrollLeft}
            className={`hidden sm:flex p-2 rounded-xl transition-all shrink-0 items-center justify-center ${
              canScrollLeft
                ? 'bg-white/[0.08] hover:bg-red-600 text-white border border-white/10 shadow-md active:scale-95'
                : 'bg-white/[0.02] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-30'
            }`}
            title="Slide left to previous servers"
            aria-label="Slide left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontal Server Pills Slider Container */}
          <div
            ref={serverSliderRef}
            onScroll={checkSliderScroll}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 w-full"
          >
            {/* Direct Streams: MovieBox Core, 4KHDHub, Dramachi, etc. */}
            {sources.map((src) => {
              const isActive = activeServerId === src.id;
              const tooltip = src.tooltip || 'Direct high-speed HLS stream with zero ads and instant playback';
              return (
                <div key={src.id} className="relative group/pill shrink-0">
                  <button
                    onClick={(e) => {
                      userInteractedRef.current = true;
                      setActiveServerId(src.id);
                      setActiveTooltipId(activeTooltipId === src.id ? null : src.id);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                      if (!src.url) {
                        const best = findBestWorkingServer([], embedServers);
                        if (best.id) {
                          setActiveServerId(best.id);
                          setFailoverToast(
                            `${src.provider || 'MovieBox Pro'} direct stream unavailable for this title — auto-routed to ${best.name}`
                          );
                        } else {
                          setFailoverToast(
                            `${src.provider || 'MovieBox Pro'}: Playing via cloud stream`
                          );
                        }
                        if (failoverToastTimeoutRef.current) clearTimeout(failoverToastTimeoutRef.current);
                        failoverToastTimeoutRef.current = setTimeout(() => {
                          setFailoverToast(null);
                        }, 4500);
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/50'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 border border-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                    <span className="tracking-tight">{src.provider || 'Direct Source'}</span>

                    {/* Quality Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 text-gray-300 border border-white/10">
                      {src.quality || '4K / 1080p'}
                    </span>

                    {/* Ad-Free Pro Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {src.badgeLabel || 'AD-FREE PRO'}
                    </span>
                  </button>

                  {/* Interactive Tooltip Balloon (Desktop Hover + Mobile Tap) */}
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

            {/* Multi-Cloud Embed Servers: Server 2 (VidLink VIP), Server 3 (VidSrc Clean), Server 4 (MultiEmbed Direct), etc. */}
            {embedServers.map((server) => {
              const isActive = activeServerId === server.id;
              const adStatus = server.adStatus || 'minimal-ads';
              const tooltip = server.tooltip || 'Multi-cloud streaming mirror';
              return (
                <div key={server.id} className="relative group/pill shrink-0">
                  <button
                    onClick={(e) => {
                      userInteractedRef.current = true;
                      setActiveServerId(server.id);
                      setActiveTooltipId(activeTooltipId === server.id ? null : server.id);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all shrink-0 active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-red-400/50'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] text-gray-300 border border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <Radio className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-amber-400'}`} />
                    <span className="tracking-tight">{server.name}</span>

                    {/* Quality Badge */}
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 text-gray-300 border border-white/10">
                      {server.quality || '1080p HD'}
                    </span>

                    {/* Ad Status Badge */}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                        adStatus === 'ad-free'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : adStatus === 'minimal-ads'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {server.badgeLabel || (adStatus === 'ad-free' ? 'Ad-Free' : adStatus === 'minimal-ads' ? 'Minimal Ads' : 'Ads')}
                    </span>
                  </button>

                  {/* Interactive Tooltip Balloon (Desktop Hover + Mobile Tap) */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${
                      activeTooltipId === server.id ? 'flex' : 'hidden'
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

          {/* Right Arrow Button (Inline, Never Overlaps Pills) */}
          <button
            type="button"
            onClick={() => scrollServerSlider('right')}
            disabled={!canScrollRight}
            className={`hidden sm:flex p-2 rounded-xl transition-all shrink-0 items-center justify-center ${
              canScrollRight
                ? 'bg-white/[0.08] hover:bg-red-600 text-white border border-white/10 shadow-md active:scale-95'
                : 'bg-white/[0.02] text-gray-700 border border-white/[0.03] cursor-not-allowed opacity-30'
            }`}
            title="Slide right to more servers"
            aria-label="Slide right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
