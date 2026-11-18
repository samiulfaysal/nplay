'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem } from '@/types/watchlist';
import {
  getStoredWatchlist,
  addToStoredWatchlist,
  removeFromStoredWatchlist,
  isInStoredWatchlist,
  WATCHLIST_UPDATED_EVENT,
} from '@/lib/watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLocal = useCallback(() => {
    setWatchlist(getStoredWatchlist());
  }, []);

  useEffect(() => {
    loadLocal();

    // Fetch from Supabase for logged-in user and merge
    fetch('/api/user/watchlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && Array.isArray(data.watchlist)) {
          const local = getStoredWatchlist();
          const map = new Map<string, WatchlistItem>();
          // Put server items
          data.watchlist.forEach((w: WatchlistItem) => map.set(String(w.contentId), w));
          // Put local items
          local.forEach((w: WatchlistItem) => map.set(String(w.contentId), w));

          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
          );
          localStorage.setItem('netfly_watchlist', JSON.stringify(merged));
          setWatchlist(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const handleUpdate = () => {
      loadLocal();
    };

    window.addEventListener(WATCHLIST_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(WATCHLIST_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadLocal]);

  const isInWatchlist = useCallback(
    (contentId: string | number) => {
      const idStr = String(contentId);
      return watchlist.some((w) => String(w.contentId) === idStr);
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (item: WatchlistItem) => {
      const idStr = String(item.contentId);
      const exists = watchlist.some((w) => String(w.contentId) === idStr);
      if (exists) {
        const updated = removeFromStoredWatchlist(idStr);
        setWatchlist(updated);
        return false; // Removed
      } else {
        const updated = addToStoredWatchlist(item);
        setWatchlist(updated);
        return true; // Added
      }
    },
    [watchlist]
  );

  const removeFromWatchlist = useCallback((contentId: string | number) => {
    const updated = removeFromStoredWatchlist(contentId);
    setWatchlist(updated);
  }, []);

  return {
    watchlist,
    loading,
    isInWatchlist,
    toggleWatchlist,
    removeFromWatchlist,
  };
}
