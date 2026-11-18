'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Film,
  Search,
  Tv,
  Bookmark,
  User,
  X,
  Star,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  // Debounced search inside mobile modal
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.warn('Mobile search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const navItems = [
    { label: 'Home', href: '/', icon: Home, isAction: false },
    { label: 'Movies', href: '/movies', icon: Film, isAction: false },
    { label: 'Search', href: '#search', icon: Search, isAction: true },
    { label: 'TV-Series', href: '/tv', icon: Tv, isAction: false },
    { label: 'My List', href: '/watchlist', icon: Bookmark, isAction: false },
  ];

  return (
    <>
      {/* 1. Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-white/10 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      >
        <div className="grid grid-cols-5 items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isAction && (
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            );

            if (item.isAction) {
              return (
                <button
                  key={item.label}
                  onClick={() => setSearchOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 w-full h-full text-gray-400 hover:text-white transition-colors active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30">
                    <Search className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight text-gray-300">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all active:scale-95 ${
                  isActive
                    ? 'text-red-500 font-bold'
                    : 'text-gray-400 hover:text-gray-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500 shadow-lg shadow-red-500" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 2. Full-Screen Instant Search Overlay Modal (Thumb-Friendly) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0f]/98 backdrop-blur-2xl flex flex-col animate-in fade-in duration-200 pb-safe">
          {/* Search Header Bar */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, anime..."
                className="w-full bg-[#161822] text-sm text-gray-100 placeholder-gray-500 rounded-full pl-10 pr-4 py-3 border border-white/15 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-inner"
              />
            </form>

            <button
              onClick={() => setSearchOpen(false)}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions / Trending Tags when empty */}
          {!query.trim() && (
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <Flame className="w-4 h-4 text-red-500" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Dune: Part Two',
                  'Deadpool & Wolverine',
                  'The Penguin',
                  'Fallout',
                  'Attack on Titan',
                  'Terrifier 3',
                  'Spirited Away',
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-600/20 hover:text-red-400 text-xs font-medium text-gray-300 border border-white/5 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Browse by Category
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/movies"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 flex items-center justify-between"
                  >
                    <span>All Movies</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                  <Link
                    href="/tv"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 flex items-center justify-between"
                  >
                    <span>TV Series</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                  <Link
                    href="/anime"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 flex items-center justify-between"
                  >
                    <span>Anime Series</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                  <Link
                    href="/top-imdb"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 flex items-center justify-between"
                  >
                    <span>Top IMDb Rated</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                  <Link
                    href="/live-tv"
                    onClick={() => setSearchOpen(false)}
                    className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between col-span-2"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live TV & IPTV Streams
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Search Results List */}
          {query.trim() && (
            <div className="flex-grow overflow-y-auto divide-y divide-white/5 p-2">
              {loading ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Searching titles...
                </div>
              ) : results.length > 0 ? (
                <>
                  {results.slice(0, 10).map((item) => {
                    const type = item.media_type || (item.name ? 'tv' : 'movie');
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                    const poster = item.poster_path
                      ? `${TMDB_IMAGE_SIZES.poster.small}${item.poster_path}`
                      : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=150&q=80';

                    return (
                      <Link
                        key={`${type}-${item.id}`}
                        href={`/watch/${type}/${item.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors"
                      >
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                          <Image
                            src={poster}
                            alt={title}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col flex-grow min-w-0">
                          <span className="text-sm font-bold text-gray-100 truncate">
                            {title}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="px-1.5 py-0.2 rounded bg-red-600/80 text-white font-black text-[9px] uppercase">
                              {type === 'tv' ? 'TV' : 'Movie'}
                            </span>
                            <span>{year || '2024'}</span>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{item.vote_average?.toFixed(1) || '7.5'}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  <div className="p-4">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white text-center shadow-lg shadow-red-600/30"
                    >
                      View all results for &quot;{query}&quot; →
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">
                  No titles found matching &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
