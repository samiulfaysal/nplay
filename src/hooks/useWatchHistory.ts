'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchHistoryItem } from '@/types/history';
import {
  getStoredHistory,
  saveToStoredHistory,
  removeFromStoredHistory,
  HISTORY_UPDATED_EVENT,
} from '@/lib/watchHistory';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from local storage and sync with server
  const loadHistory = useCallback(() => {
    const local = getStoredHistory();
    setHistory(local);
  }, []);

  useEffect(() => {
    loadHistory();

    // Fetch from Supabase for logged-in users and merge
    fetch('/api/user/watch-history')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && Array.isArray(data.history) && data.history.length > 0) {
          const local = getStoredHistory();
          // Merge unique by composite id
          const map = new Map<string, WatchHistoryItem>();
          // Put server items first
          data.history.forEach((item: WatchHistoryItem) => map.set(item.id, item));
          // Put local items (if newer, overwrite)
          local.forEach((item: WatchHistoryItem) => {
            const existing = map.get(item.id);
            if (!existing || new Date(item.lastWatchedAt) > new Date(existing.lastWatchedAt)) {
              map.set(item.id, item);
            }
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime()
          );
          localStorage.setItem('netfly_watch_history', JSON.stringify(merged));
          setHistory(merged);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const handleUpdate = () => {
      loadHistory();
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadHistory]);

  const saveProgress = useCallback((item: WatchHistoryItem) => {
    const updated = saveToStoredHistory(item);
    setHistory(updated);
  }, []);

  const removeItem = useCallback((id: string) => {
    const updated = removeFromStoredHistory(id);
    setHistory(updated);
  }, []);

  const clearHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('netfly_watch_history');
      window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));
      setHistory([]);
    }
  }, []);

  return {
    history,
    loading,
    saveProgress,
    removeFromHistory: removeItem,
    clearHistory,
  };
}
