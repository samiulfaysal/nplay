'use client';

import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Watch Free on Netfly`,
          text: `Check out ${title} streaming in HD on Netfly!`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors border border-white/5 active:scale-95"
        title="Share link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-emerald-400">Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-gray-300" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>

      {copied && (
        <div className="absolute -top-9 right-0 bg-[#0a0a0f] text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
