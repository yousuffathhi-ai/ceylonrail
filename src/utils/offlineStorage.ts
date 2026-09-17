import { SavedJourney } from '../types';

const BOOKMARKS_KEY = 'ceylon_rail_bookmarks_v1';
const RECENT_SEARCHES_KEY = 'ceylon_rail_recent_searches_v1';
const DELAY_SIMULATION_KEY = 'ceylon_rail_delay_simulation_v1';

export interface RecentSearchItem {
  id: string;
  from: string;
  to: string;
  date: string;
  timestamp: number;
}

export function getBookmarks(): SavedJourney[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(journey: Omit<SavedJourney, 'id' | 'saved_at'>): boolean {
  try {
    const bookmarks = getBookmarks();
    const existingIndex = bookmarks.findIndex(
      (b) => b.train_id === journey.train_id && b.from_station === journey.from_station && b.to_station === journey.to_station
    );

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return false; // removed
    } else {
      const newBookmark: SavedJourney = {
        ...journey,
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        saved_at: Date.now(),
      };
      bookmarks.unshift(newBookmark);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      return true; // added
    }
  } catch {
    return false;
  }
}

export function isBookmarked(trainId: string, fromStation?: string, toStation?: string): boolean {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some((b) => {
      if (fromStation && toStation) {
        return b.train_id === trainId && b.from_station === fromStation && b.to_station === toStation;
      }
      return b.train_id === trainId;
    });
  } catch {
    return false;
  }
}

export function getRecentSearches(): RecentSearchItem[] {
  try {
    const data = localStorage.getItem(RECENT_SEARCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(from: string, to: string, date: string): void {
  try {
    const items = getRecentSearches().filter(
      (s) => !(s.from.toLowerCase() === from.toLowerCase() && s.to.toLowerCase() === to.toLowerCase())
    );
    items.unshift({
      id: `search_${Date.now()}`,
      from,
      to,
      date,
      timestamp: Date.now(),
    });
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 8)));
  } catch {
    // Ignore storage errors
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
}

export type DelayState = 'ON_TIME' | 'MINOR_DELAY' | 'MIST_ALERT';

export function getSimulatedDelayState(): DelayState {
  try {
    return (localStorage.getItem(DELAY_SIMULATION_KEY) as DelayState) || 'ON_TIME';
  } catch {
    return 'ON_TIME';
  }
}

export function setSimulatedDelayState(state: DelayState): void {
  try {
    localStorage.setItem(DELAY_SIMULATION_KEY, state);
  } catch {
    // Ignore
  }
}
