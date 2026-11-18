import React from 'react';
import { notFound } from 'next/navigation';
import { getContentByProvider, POPULAR_PROVIDERS, DEMO_MOVIES } from '@/lib/tmdb';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { ProviderBar } from '@/components/movies/ProviderBar';
import { Tv, Sparkles } from 'lucide-react';

export const revalidate = 3600;

interface ProviderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function ProviderPage({ params, searchParams }: ProviderPageProps) {
  const { id } = await params;
  const { name: nameQuery } = await searchParams;

  const providerMeta = POPULAR_PROVIDERS.find((p) => String(p.id) === String(id));
  const providerName = nameQuery || providerMeta?.name || 'Streaming Network';

  const content = await getContentByProvider(id, 1).catch(() => DEMO_MOVIES);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="space-y-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500">
            <Tv className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest text-red-500 font-black">
            Watch Provider Catalog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide">
          {providerName}
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl">
          Stream the most popular titles, award-winning originals, and exclusive releases available on {providerName} in full HD quality.
        </p>
      </div>

      {/* Other Providers Switcher Bar */}
      <ProviderBar activeProviderId={id} />

      {/* Content Grid */}
      <MovieGrid
        title={`Popular on ${providerName}`}
        subtitle={`Top streaming movies and series from the ${providerName} collection`}
        movies={content}
        showFilterTabs={true}
        layout="grid"
      />
    </div>
  );
}
