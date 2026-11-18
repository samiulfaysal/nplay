'use client';

import React, { useEffect, useState } from 'react';
import { X, Play, Film, Sparkles } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tmdbId?: string | number;
  mediaType?: 'movie' | 'tv' | string;
  trailerKey?: string | null;
}

export function TrailerModal({
  isOpen,
  onClose,
  title,
  tmdbId,
  mediaType = 'movie',
  trailerKey: initialKey,
}: TrailerModalProps) {
  const [resolvedKey, setResolvedKey] = useState<string | null>(initialKey || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialKey) {
      setResolvedKey(initialKey);
      return;
    }

    if (tmdbId) {
      setLoading(true);
      const type = mediaType === 'tv' ? 'tv' : 'movie';
      fetch(`/api/videos?type=${type}&id=${tmdbId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.trailerKey) {
            setResolvedKey(data.trailerKey);
          } else {
            setResolvedKey('TcMBFSGVi1c'); // Default fallback
          }
        })
        .catch(() => {
          setResolvedKey('TcMBFSGVi1c');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, initialKey, tmdbId, mediaType]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-lg animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-[#0f111a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#0a0a0f]">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30 shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block -mb-0.5">
                Official YouTube Trailer
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close trailer modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 16:9 Video Player Container */}
        <div className="relative aspect-video w-full bg-black">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
              <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold">Resolving Official Trailer...</span>
            </div>
          ) : resolvedKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${resolvedKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              No trailer video found for this title.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
