/**
 * MyEventsContext.js
 *
 * Stores the list of events a logged-in user has registered to attend.
 * Data is persisted to localStorage under the key `my_events_<userId>` so
 * each user's list survives page refreshes and is isolated per account.
 *
 * PII handling
 * ─────────────
 * Registration form data can contain personally identifiable information
 * (name, email, phone, dietary requirements, accessibility needs, etc.).
 * Only a minimal, non-PII summary is persisted to localStorage.
 * The full formData is kept in React state for the current session but
 * is never written to disk, so it cannot be extracted by XSS or local
 * device access after the tab closes.
 *
 * Shape of each persisted record:
 * {
 *   eventId      : number  — matches eventsMockData id (or real API id)
 *   registeredAt : string  — ISO timestamp of when the user registered
 *   eventSummary : object  — minimal event metadata (id, title, date, location)
 * }
 *
 * Shape of each in-memory record (superset of persisted):
 * {
 *   eventId      : number
 *   registeredAt : string
 *   formData     : object  — full form submission (session-only, not persisted)
 *   eventSummary : object  — minimal event metadata
 *   event        : object  — full event snapshot (session-only, not persisted)
 * }
 *
 * Usage (any component):
 *   import { useMyEvents } from '../context/MyEventsContext';
 *   const { myEvents, addRegistration, isRegistered, removeRegistration } = useMyEvents();
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

import { saveToOfflineCache, getFromOfflineCache, removeFromOfflineCache } from "../utils/indexedDB";
import { getOrMigrateKey } from "../utils/storageKeyManager";
import { safeJsonParse } from "../utils/safeJsonParse";

const MyEventsContext = createContext(null);

export const reconcileRegistrations = (listA, listB) => {
  const merged = new Map();
  const processList = (list) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || typeof item.eventId === "undefined") continue;
      const existing = merged.get(item.eventId);
      if (!existing) {
        merged.set(item.eventId, item);
      } else {
        const timeExisting = new Date(existing.registeredAt || 0).getTime();
        const timeNew = new Date(item.registeredAt || 0).getTime();
        if (timeNew > timeExisting) {
          merged.set(item.eventId, item);
        }
      }
    }
  };
  processList(listA);
  processList(listB);
  return Array.from(merged.values());
};

// Use a hashed or opaque key so the localStorage key itself does not expose
// the userId (which is often the user's email address).
const storageKey = (userId) => {
  const legacyKey = `my_events_${userId}`;
  return getOrMigrateKey("my_events", userId, legacyKey);
};

// ---------------------------------------------------------------------------
// Minimal event summary — only non-PII fields needed to show the registered
// events list in the UI. The full event object is kept in session state only.
// ---------------------------------------------------------------------------
const toEventSummary = (event) => ({
  id: event?.id,
  title: event?.title ?? "",
  date: event?.date ?? "",
  location: event?.location ?? "",
  type: event?.type ?? event?.category ?? "",
  image: event?.image ?? event?.imageUrl ?? "",
  status: event?.status ?? "",
});

// ---------------------------------------------------------------------------
// Persisted record shape — strips all PII before writing to localStorage.
// formData and the full event object are intentionally excluded.
// ---------------------------------------------------------------------------
const toPersistedRecord = (eventId, registeredAt, event, registrationId, qrToken) => ({
  eventId,
  registeredAt,
  registrationId,
  qrToken,
  eventSummary: toEventSummary(event),
});

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

export const loadFromIDB = async (userId) => {
  if (!userId) return [];
  const key = storageKey(userId);
  const legacyKey = `my_events_${userId}`;
  // 1. Get current IndexedDB data for both key and legacyKey
  let idbData = await getFromOfflineCache(key, null);
  let hasLegacyIDB = false;

  if (idbData === null) {
    // If no primary data, check legacy IDB
    if (key !== legacyKey) {
      const legacyVal = await getFromOfflineCache(legacyKey, null);
      if (legacyVal !== null) {
        idbData = Array.isArray(legacyVal) ? legacyVal : [];
        hasLegacyIDB = true;
      } else {
        idbData = [];
      }
    } else {
      idbData = [];
    }
  } else if (!Array.isArray(idbData)) {
    idbData = [];
  }

  // 2. Fetch localStorage data under both key and legacyKey to be reconciled
  let lsData = [];
  let foundKeyInLS = null;

  try {
    const rawNew = localStorage.getItem(key);
    if (rawNew) {
      lsData = safeJsonParse(rawNew, []);
      foundKeyInLS = key;
    } else if (key !== legacyKey) {
      const rawLegacy = localStorage.getItem(legacyKey);
      if (rawLegacy) {
        lsData = safeJsonParse(rawLegacy, []);
        foundKeyInLS = legacyKey;
      }
    }
  } catch {
    // ignore
  }

  // 3. Reconcile IndexedDB and localStorage
  const reconciled = reconcileRegistrations(idbData, lsData);

  // 4. Save the reconciled results back to IndexedDB (key)
  if (lsData.length > 0 || hasLegacyIDB || key !== legacyKey) {
    await saveToOfflineCache(key, reconciled);
  }

  // 5. Clean up old/legacy storages
  if (foundKeyInLS) {
    try {
      localStorage.removeItem(foundKeyInLS);
    } catch {
      // ignore
    }
  }
  if (hasLegacyIDB) {
    await removeFromOfflineCache(legacyKey);
  }

  return reconciled;
};

const saveToIDB = async (userId, records) => {
  if (!userId) return;
  // Only persist the minimal, PII-free shape — strip formData and full event
  const persisted = records.map((r) =>
    toPersistedRecord(r.eventId, r.registeredAt, r.event || r.eventSummary, r.registrationId, r.qrToken),
  );
  await saveToOfflineCache(storageKey(userId), persisted);
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const MyEventsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.email || null;

  // Async init — loads persisted records from IndexedDB
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Guard ref — skips the first save on load to prevent overwriting valid data
  const isInitialLoad = useRef(true);

  // Reload from IndexedDB whenever the logged-in user changes
  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setMyEvents([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    loadFromIDB(userId).then(data => {
      if (mounted) {
        setMyEvents(data);
        setLoading(false);
        // Important: allow saves *after* initial load resolves
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 50);
      }
    });

    return () => { mounted = false; };
  }, [userId]);

  // Persist to IndexedDB whenever myEvents changes — PII-free records only
  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }
    if (userId !== null && !loading) {
      saveToIDB(userId, myEvents);
    }
  }, [myEvents, userId, loading]);

  /**
   * addRegistration — call this after a successful event registration.
   *
   * @param {object} event    — the full event object (kept in session state only)
   * @param {object} formData — the registration form data (kept in session state only)
   * @param {string} registrationId — the unique registration identifier
   * @param {string} qrToken — the signed JWT ticket token
   */
  const addRegistration = useCallback((event, formData = {}, registrationId = null, qrToken = null) => {
    setMyEvents((prev) => {
      const alreadyExists = prev.some(
        (r) =>
          r.eventId === event.id ||
        (registrationId && r.registrationId && r.registrationId === registrationId)
      );

      if (alreadyExists) return prev;
      return [
        ...prev,
        {
          eventId: event.id,
          registeredAt: new Date().toISOString(),
          registrationId: registrationId || null,
          qrToken: qrToken || "",
          // formData and event are kept in memory for this session so the
          // success screen can display them, but they are NOT written to
          // localStorage (saveToStorage strips them via toPersistedRecord).
          formData,
          event,
          eventSummary: toEventSummary(event),
        },
      ];
    });
  }, []);

  /**
   * removeRegistration — remove a registration by eventId.
   */
  const removeRegistration = useCallback((eventId) => {
    setMyEvents((prev) => prev.filter((r) => r.eventId !== eventId));
  }, []);

  /**
   * isRegistered — returns true if the user is already registered for eventId.
   */
  const isRegistered = useCallback(
    (eventId) => myEvents.some((r) => r.eventId === eventId),
    [myEvents],
  );

  // Waitlist Operations
  const [waitlistUpdated, setWaitlistUpdated] = useState(0);
  const triggerWaitlistUpdate = useCallback(() => {
    setWaitlistUpdated((prev) => prev + 1);
  }, []);

  return (
    <MyEventsContext.Provider
      value={{
        myEvents,
        addRegistration,
        removeRegistration,
        isRegistered,
        loading,
        waitlistUpdated,
        triggerWaitlistUpdate,
      }}
    >
      {children}
    </MyEventsContext.Provider>
  );
};

export const useMyEvents = () => {
  const ctx = useContext(MyEventsContext);
  if (!ctx) throw new Error("useMyEvents must be used inside <MyEventsProvider>");
  return ctx;
};
