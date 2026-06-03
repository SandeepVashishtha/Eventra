/**
 * useCalendarSync.js
 *
 * Logic for managing two-way synchronization between Eventra and
 * external calendar providers (Google, Outlook).
 */

import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useCalendarSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: "google", name: "Google Calendar", connected: true, lastSynced: "2 hours ago" },
    { id: "outlook", name: "Outlook / Office 365", connected: false, lastSynced: null },
  ]);

  const toggleSync = useCallback(async (accountId) => {
    setIsSyncing(true);
    // Simulate OAuth / API interaction
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId
          ? { ...acc, connected: !acc.connected, lastSynced: !acc.connected ? "Just now" : null }
          : acc
      )
    );

    setIsSyncing(false);
    toast.success(`Successfully updated ${accountId} sync settings!`);
  }, []);

  const manualSyncAll = useCallback(async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
    toast.success("All calendars are up to date!");
  }, []);

  return {
    isSyncing,
    connectedAccounts,
    toggleSync,
    manualSyncAll,
  };
};
