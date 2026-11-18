'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Film,
  Tv,
  Flame,
  Star,
  Layers,
  Globe2,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Sparkles,
  ShieldCheck,
  Bookmark,
  SlidersHorizontal,
  Radio,
} from 'lucide-react';
import { TMDB_IMAGE_SIZES } from '@/lib/tmdb';
import { NetflyIcon } from '@/components/common/NetflyIcon';

const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'South Korea',
  'Japan',
  'France',
  'Canada',
  'Spain',
  'Germany',
  'Turkey',
  'India',
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moviesOpen, setMoviesOpen] = useState(false);
  const [tvOpen, setTvOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  // Instant Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Authentication & Admin status
  const [authStatus, setAuthStatus] = useState<{
    isAuthenticated: boolean;
    isAdmin: boolean;
    email?: string;
  } | null>(null);

  useEffect(() => {
    // 1. Quick client-side cookie check for instant render
    if (typeof document !== 'undefined') {
      const hasAdminCookie = document.cookie.includes('netfly_admin_session=authenticated_admin');
      if (hasAdminCookie) {
        setAuthStatus({ isAuthenticated: true, isAdmin: true });
      }
    }

    // 2. Fetch authoritative status
    let isMounted = true;
    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setAuthStatus({
            isAuthenticated: !!data.isAuthenticated,
            isAdmin: !!data.isAdmin,
            email: data.user?.email || undefined,
          });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movies', icon: Film },
    { label: 'TV-Series', href: '/tv', icon: Tv },
    { label: 'Anime', href: '/anime', icon: Sparkles },
    { label: 'Top IMDb', href: '/top-imdb', icon: Star },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3 sm:py-3.5">
        {/* Brand Logo - Netfly Inspired */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 py-0.5">
          <div className="relative group-hover:scale-105 transition-transform">
            <NetflyIcon
              className="w-7 h-7 sm:w-8 sm:h-8 shrink-0"
              size={48}
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white leading-none">
              NET<span className="text-red-500">FLY</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold mt-0.5 hidden sm:block whitespace-nowrap">
              Stream Free Cinema & Shows
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          {/* 1. Home Link */}
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              pathname === '/'
                ? 'text-white bg-white/10 shadow-inner'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          {/* 2. Movies Dropdown (Featured, Popular, Top Rated, Upcoming) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setMoviesOpen(!moviesOpen);
                setTvOpen(false);
                setGenreOpen(false);
                setCountryOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                pathname.startsWith('/movies')
                  ? 'text-white bg-white/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-4 h-4 text-red-500 shrink-0" />
              <span className="whitespace-nowrap">Movies</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  moviesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {moviesOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-48 p-2 rounded-2xl glass-panel shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseLeave={() => setMoviesOpen(false)}
              >
                <Link
                  href="/movies"
                  onClick={() => setMoviesOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Featured Movies
                </Link>
                <Link
                  href="/movies?sort=popular"
                  onClick={() => setMoviesOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Most Popular
                </Link>
                <Link
                  href="/movies?sort=top_rated"
                  onClick={() => setMoviesOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Top Rated
                </Link>
                <Link
                  href="/movies?sort=upcoming"
                  onClick={() => setMoviesOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Upcoming Releases
                </Link>
              </div>
            )}
          </div>

          {/* 3. TV-Series Dropdown (Popular, Airing Today, Top Rated) */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setTvOpen(!tvOpen);
                setMoviesOpen(false);
                setGenreOpen(false);
                setCountryOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                pathname.startsWith('/tv')
                  ? 'text-white bg-white/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="whitespace-nowrap">TV-Series</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  tvOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {tvOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-48 p-2 rounded-2xl glass-panel shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseLeave={() => setTvOpen(false)}
              >
                <Link
                  href="/tv"
                  onClick={() => setTvOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Popular Series
                </Link>
                <Link
                  href="/tv?sort=airing_today"
                  onClick={() => setTvOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Airing Today
                </Link>
                <Link
                  href="/tv?sort=top_rated"
                  onClick={() => setTvOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                >
                  Top Rated Series
                </Link>
              </div>
            )}
          </div>

          {/* 4. Anime Link */}
          <Link
            href="/anime"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              pathname === '/anime'
                ? 'text-white bg-white/10 shadow-inner'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Anime</span>
          </Link>

          {/* 5. Genres Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setGenreOpen(!genreOpen);
                setCountryOpen(false);
                setMoviesOpen(false);
                setTvOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
            >
              <Layers className="w-4 h-4 text-red-500 shrink-0" />
              <span className="whitespace-nowrap">Genres</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  genreOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {genreOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-60 p-3 rounded-2xl glass-panel shadow-2xl grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseLeave={() => setGenreOpen(false)}
              >
                {GENRES.map((g) => (
                  <Link
                    key={g}
                    href={`/genre/${g.toLowerCase()}`}
                    onClick={() => setGenreOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-red-600/20 hover:text-red-400 transition-colors"
                  >
                    {g}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 6. Country Filter Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setCountryOpen(!countryOpen);
                setGenreOpen(false);
                setMoviesOpen(false);
                setTvOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap shrink-0"
            >
              <Globe2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">Country</span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  countryOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {countryOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-52 p-2.5 rounded-2xl glass-panel shadow-2xl flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50"
                onMouseLeave={() => setCountryOpen(false)}
              >
                {COUNTRIES.map((country) => (
                  <Link
                    key={country}
                    href={`/browse?country=${encodeURIComponent(country.toLowerCase())}`}
                    onClick={() => setCountryOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {country}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 7. Explore Catalog Link */}
          <Link
            href="/browse"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              pathname === '/browse'
                ? 'text-white bg-white/10 shadow-inner'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="whitespace-nowrap">Explore</span>
          </Link>

          {/* 8. Live TV Link */}
          <Link
            href="/live-tv"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              pathname === '/live-tv'
                ? 'text-white bg-red-600/20 text-red-400 border border-red-500/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <span className="whitespace-nowrap">Live TV</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white shrink-0">
              HD
            </span>
          </Link>
        </nav>

        {/* Live Search Bar & Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div ref={searchContainerRef} className="relative hidden md:block w-36 sm:w-44 lg:w-48 xl:w-64 shrink">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchDropdown(true);
                }}
                placeholder="Search movies, TV shows..."
                className="w-full bg-[#11141f] text-sm text-gray-200 placeholder-gray-500 rounded-full pl-10 pr-4 py-2 border border-white/10 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-inner"
              />
            </form>

            {/* Instant Search Dropdown Popover */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel shadow-2xl overflow-hidden border border-white/10 z-50 divide-y divide-white/5 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-400">
                    Searching titles...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-black/40">
                      Search Results
                    </div>
                    {searchResults.slice(0, 6).map((item) => {
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
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center gap-3 p-2.5 hover:bg-white/10 transition-colors group"
                        >
                          <div className="relative w-10 h-14 rounded-md overflow-hidden bg-gray-800 shrink-0">
                            <Image
                              src={poster}
                              alt={title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col flex-grow min-w-0">
                            <span className="text-xs font-bold text-gray-200 group-hover:text-red-400 truncate">
                              {title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
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
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="block p-2.5 text-center text-xs font-bold text-red-400 hover:text-red-300 bg-black/40 hover:bg-red-600/20 transition-colors"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </Link>
                  </>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400">
                    No titles found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Watchlist Quick Nav */}
          <Link
            href="/watchlist"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 text-xs font-semibold transition-all shrink-0 active:scale-95"
            title="My Watchlist"
          >
            <Bookmark className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="whitespace-nowrap hidden xl:inline">Watchlist</span>
          </Link>

          {/* Desktop User Auth / Admin Button */}
          {authStatus?.isAdmin ? (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/10 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 group"
              title="Administrator Console"
            >
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="whitespace-nowrap">Admin Console</span>
            </Link>
          ) : authStatus?.isAuthenticated ? (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-gray-200 text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0"
              title="My Account"
            >
              <User className="w-4 h-4 text-red-500 shrink-0" />
              <span className="whitespace-nowrap truncate max-w-[120px]">
                {authStatus.email?.split('@')[0] || 'My Account'}
              </span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Sign In</span>
            </Link>
          )}

          {/* Mobile Right Controls (< 768px): Search Icon + Hamburger Drawer Toggle */}
          <div className="flex md:hidden items-center gap-1.5">
            <Link
              href="/search"
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Open navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-red-500" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer (Genres, Country, Top IMDb, Admin/Sign-In) */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-3 pb-8 mt-2 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV, anime..."
              className="w-full bg-[#11141f] text-sm text-gray-200 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-red-500"
            />
          </form>

          {/* Primary Mobile Navigation Links */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              Movies
            </Link>
            <Link
              href="/tv"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              TV-Series
            </Link>
            <Link
              href="/anime"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              Anime HD
            </Link>
            <Link
              href="/top-imdb"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white"
            >
              Top IMDb
            </Link>
            <Link
              href="/browse"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600/10 text-purple-300 border border-purple-500/20 hover:bg-purple-600/20"
            >
              Explore Filters
            </Link>
            <Link
              href="/live-tv"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-600/20 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live TV HD
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-black text-[9px]">
                IPTV
              </span>
            </Link>
            <Link
              href="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-red-600/10 text-red-300 border border-red-500/20 hover:bg-red-600/20"
            >
              My Watchlist
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30"
            >
              Admin Panel
            </Link>
          </div>

          {/* Account / Admin Pill */}
          {authStatus?.isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
              <span className="whitespace-nowrap">Admin Console ({authStatus.email || 'Admin'})</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 whitespace-nowrap shrink-0"
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">
                {authStatus?.isAuthenticated ? 'My Account' : 'Sign In / Register'}
              </span>
            </Link>
          )}

          {/* Popular Genres */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Explore Genres
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <Link
                  key={g}
                  href={`/genre/${g.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-red-600/30 hover:text-red-400 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Countries */}
          <div className="pt-2 border-t border-white/5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Browse by Country
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <Link
                  key={c}
                  href={`/country/${encodeURIComponent(c.toLowerCase())}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
