import { WatchlistItem } from '@/types/watchlist';

const STORAGE_KEY = 'netfly_watchlist';
export const WATCHLIST_UPDATED_EVENT = 'netfly_watchlist_updated';

export function getStoredWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[Watchlist] Failed to read from localStorage:', err);
    return [];
  }
}

export function isInStoredWatchlist(contentId: string | number): boolean {
  const current = getStoredWatchlist();
  const idStr = String(contentId);
  return current.some((item) => String(item.contentId) === idStr);
}

export function addToStoredWatchlist(item: WatchlistItem): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredWatchlist();
    const idStr = String(item.contentId);
    if (current.some((x) => String(x.contentId) === idStr)) {
      return current;
    }

    const newItem: WatchlistItem = {
      ...item,
      contentId: idStr,
      added_at: new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));

    // Sync to Supabase in background
    fetch('/api/user/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItem }),
    }).catch(() => {});

    return updated;
  } catch (err) {
    console.warn('[Watchlist] Failed to add item:', err);
    return getStoredWatchlist();
  }
}

export function removeFromStoredWatchlist(contentId: string | number): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredWatchlist();
    const idStr = String(contentId);
    const updated = current.filter((x) => String(x.contentId) !== idStr);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(WATCHLIST_UPDATED_EVENT));

    // Background delete in Supabase
    fetch(`/api/user/watchlist?contentId=${encodeURIComponent(idStr)}`, {
      method: 'DELETE',
    }).catch(() => {});

    return updated;
  } catch (err) {
    console.warn('[Watchlist] Failed to remove item:', err);
    return getStoredWatchlist();
  }
}
