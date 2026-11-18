'use client';

import React, { useState } from 'react';
import { Bookmark, Check, Share2 } from 'lucide-react';
import { Movie } from '@/types/content';

interface WatchActionsProps {
  movie: Movie;
}

export function WatchActions({ movie }: WatchActionsProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    try {
      const saved = JSON.parse(localStorage.getItem('netfly_watchlist') || '[]');
      if (!bookmarked) {
        if (!saved.some((item: any) => String(item.id) === String(movie.id))) {
          saved.push({ id: movie.id, title: movie.title, poster_path: movie.poster_path });
          localStorage.setItem('netfly_watchlist', JSON.stringify(saved));
        }
      } else {
        const filtered = saved.filter((item: any) => String(item.id) !== String(movie.id));
        localStorage.setItem('netfly_watchlist', JSON.stringify(filtered));
      }
    } catch {
      // ignore localStorage error in private browsing
    }
  };

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleBookmark}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
          bookmarked
            ? 'bg-red-600 text-white shadow-md'
            : 'bg-white/10 hover:bg-white/20 text-gray-200'
        }`}
        title="Add to Watchlist"
      >
        {bookmarked ? <Check className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4" />}
        <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Bookmark'}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors"
        title="Share link"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
      </button>
    </div>
  );
}
