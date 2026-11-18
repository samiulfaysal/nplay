import { WatchHistoryItem } from '@/types/history';

const STORAGE_KEY = 'netfly_watch_history';
export const HISTORY_UPDATED_EVENT = 'netfly_history_updated';

export function getStoredHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[WatchHistory] Failed to read from localStorage:', err);
    return [];
  }
}

export function saveToStoredHistory(item: WatchHistoryItem): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredHistory();
    // Unique key: composite id
    const existingIndex = current.findIndex(
      (h) => h.id === item.id || (h.contentId === item.contentId && h.seasonNumber === item.seasonNumber && h.episodeNumber === item.episodeNumber)
    );

    const updatedItem: WatchHistoryItem = {
      ...item,
      lastWatchedAt: new Date().toISOString(),
    };

    let updatedList: WatchHistoryItem[];
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...updatedItem,
      };
      // Move to front
      const [moved] = updatedList.splice(existingIndex, 1);
      updatedList.unshift(moved);
    } else {
      updatedList = [updatedItem, ...current];
    }

    // Keep top 30 most recent
    const trimmed = updatedList.slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));

    // Async sync with Supabase in background
    fetch('/api/user/watch-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: updatedItem }),
    }).catch(() => {});

    return trimmed;
  } catch (err) {
    console.warn('[WatchHistory] Failed to save to localStorage:', err);
    return getStoredHistory();
  }
}

export function removeFromStoredHistory(id: string): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredHistory();
    const filtered = current.filter((h) => h.id !== id && h.contentId !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));

    // Background delete on server
    const target = current.find((h) => h.id === id);
    const contentId = target ? target.contentId : id;
    fetch(`/api/user/watch-history?contentId=${encodeURIComponent(contentId)}`, {
      method: 'DELETE',
    }).catch(() => {});

    return filtered;
  } catch (err) {
    console.warn('[WatchHistory] Failed to remove from localStorage:', err);
    return getStoredHistory();
  }
}
