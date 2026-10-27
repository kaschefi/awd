import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  state,
  STORAGE_KEY_BOOKMARKS,
  saveBookmarksToStorage,
} from '../state.js';

export interface BookmarkContextValue {
  bookmarks: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => void;
}

export const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);

export interface BookmarkProviderProps {
  children: React.ReactNode;
  initialBookmarks?: string[];
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({
  children,
  initialBookmarks,
}) => {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (initialBookmarks) return initialBookmarks;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as string[];
      }
      return state.bookmarks || [];
    } catch {
      return state.bookmarks || [];
    }
  });

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((bId) => bId !== id) : [...prev, id];
      // Keep legacy state and persistent storage in sync
      state.bookmarks = next;
      saveBookmarksToStorage();
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.includes(id),
    [bookmarks]
  );

  const value = useMemo<BookmarkContextValue>(
    () => ({
      bookmarks,
      isBookmarked,
      toggleBookmark,
    }),
    [bookmarks, isBookmarked, toggleBookmark]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};

export const useBookmarks = (): BookmarkContextValue => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
