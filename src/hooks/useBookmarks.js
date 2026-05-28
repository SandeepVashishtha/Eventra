import { useState, useEffect } from 'react';

const useBookmarks = (userId = 'guest') => {
  const storageKey = `bookmarks_${userId}`;

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  }, [bookmarks, storageKey]);

  const toggleBookmark = (event) => {
    setBookmarks((prev) =>
      prev.find((e) => e.id === event.id)
        ? prev.filter((e) => e.id !== event.id)
        : [...prev, { ...event, savedAt: Date.now() }]
    );
  };

  const isBookmarked = (id) => bookmarks.some((e) => e.id === id);

  return { bookmarks, toggleBookmark, isBookmarked };
};

export default useBookmarks;
export const getBookmarkLimit = () => 100;
