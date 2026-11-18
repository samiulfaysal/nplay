'use client';

import React from 'react';
import Link from 'next/link';
import { POPULAR_PROVIDERS, WatchProviderMeta } from '@/lib/tmdb';
import { Tv, Sparkles } from 'lucide-react';

interface ProviderBarProps {
  activeProviderId?: number | string;
  onSelectProvider?: (providerId: number) => void;
}

export function ProviderBar({ activeProviderId, onSelectProvider }: ProviderBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-200">
            Browse by Network & Provider
          </h3>
        </div>
        <span className="text-[11px] text-gray-400 hidden sm:inline">
          Official Streaming Catalogs
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin select-none">
        {POPULAR_PROVIDERS.map((provider) => {
          const isActive = String(provider.id) === String(activeProviderId);

          if (onSelectProvider) {
            return (
              <button
                key={provider.id}
                onClick={() => onSelectProvider(provider.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-black transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 scale-105'
                    : 'bg-[#11141f] border-white/10 text-gray-300 hover:text-white hover:border-red-500/40 hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{provider.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-widest text-gray-300 font-bold">
                  {provider.badge}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={provider.id}
              href={`/provider/${provider.id}?name=${encodeURIComponent(provider.name)}`}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-black transition-all shrink-0 ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30'
                  : 'bg-[#11141f] border-white/10 text-gray-300 hover:text-white hover:border-red-500/40 hover:bg-white/5 hover:scale-105'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{provider.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-widest text-gray-300 font-bold">
                {provider.badge}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
