// src/hooks/useWhatsNew.js
import { useState, useEffect, useCallback } from "react";
import { whatsNewEntries, getLatestVersion } from "../data/whatsNewEntries";

const STORAGE_KEY = "eventra_whats_new_last_seen_version";

/**
 * Tracks whether the user has seen the latest "What's New" release.
 * Returns:
 *  - hasUnread: true if the user hasn't viewed the latest version yet
 *  - markAsRead: call this when the dropdown/page is opened, to clear the badge
 *  - entries: the full list of release notes
 *  - latestVersion: the current latest version string
 */
export function useWhatsNew() {
  const latestVersion = getLatestVersion();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    try {
      const lastSeen = localStorage.getItem(STORAGE_KEY);
      setHasUnread(lastSeen !== latestVersion);
    } catch (err) {
      setHasUnread(false);
    }
  }, [latestVersion]);

  const markAsRead = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, latestVersion);
      setHasUnread(false);
    } catch (err) {
      // ignore storage errors silently
    }
  }, [latestVersion]);

  return {
    entries: whatsNewEntries,
    latestVersion,
    hasUnread,
    markAsRead,
  };
}