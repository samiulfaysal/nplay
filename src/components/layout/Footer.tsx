import React from 'react';
import Link from 'next/link';
import { Film, Tv, ShieldCheck, Heart } from 'lucide-react';
import { NetflyIcon } from '@/components/common/NetflyIcon';
import { getAppVersion } from '@/lib/version';

export function Footer() {
  const appVersion = getAppVersion();

  return (
    <footer className="mt-20 border-t border-white/5 bg-[#060709] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Disclaimer */}
          <div className="space-y-3 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <NetflyIcon className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 group-hover:scale-105 transition-transform" size={48} />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white tracking-wider leading-none">
                  NET<span className="text-red-500">FLY</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold mt-0.5">
                  Stream Free Cinema & Shows
                </span>
              </div>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md">
              Netfly is a high-performance free cinema streaming web application. Content metadata is provided by TMDB. This platform does not host copyrighted media files on its servers; all streams are resolved through decentralized third-party provider scrapers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Explore
            </div>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <Link href="/movies" className="hover:text-red-400 transition-colors">
                  Trending Movies
                </Link>
              </li>
              <li>
                <Link href="/tv" className="hover:text-red-400 transition-colors">
                  Popular TV Series
                </Link>
              </li>
              <li>
                <Link href="/anime" className="hover:text-red-400 transition-colors">
                  Anime HD
                </Link>
              </li>
              <li>
                <Link href="/top-imdb" className="hover:text-red-400 transition-colors">
                  Top IMDb Titles
                </Link>
              </li>
              <li>
                <Link
                  href="/genre/action"
                  className="hover:text-red-400 transition-colors"
                >
                  Action & Adventure
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Compliance
            </div>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>
                <Link href="#" className="hover:text-red-400 transition-colors">
                  DMCA Notice
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-red-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-red-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div>© {new Date().getFullYear()} Netfly Cinema. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Live Server Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Server: Live</span>
            </div>

            {/* App Version Badge - Automatically extracted from latest release/git build */}
            <span
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 font-mono text-[11px]"
              title={`Netfly Build v${appVersion}`}
            >
              v{appVersion}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
