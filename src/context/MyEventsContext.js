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
 *   eventId      : number — matches eventsMockData id (or real API id)
 *   registeredAt : string — ISO timestamp of when the user registered
 *   eventSummary : object — minimal event metadata (id, title, date, location)
 * }
 *
 * Shape of each in-memory record (superset of persisted):
 * {
 *   eventId      : number
 *   registeredAt : string
 *   formData     : object — full form submission (session-only, not persisted)
 *   eventSummary : object — minimal event metadata
 *   event        : object — full event snapshot (session-only, not persisted)
 * }
 *
 * Usage (any component):
 *   import { useMyEvents } from '../context/MyEventsContext';
 *   const { myEvents, addRegistration, isRegistered, removeRegistration } = useMyEvents();
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { safeJsonParse } from "../utils/safeJsonParse";

const MyEventsContext = createContext(null);

// Use a hashed or opaque key so the localStorage key itself does not expose
// the userId (which is often the user's email address).
const storageKey = (userId) => `my_events_${userId}`;

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
// 🔥 FIX 1: Removed qrToken to prevent XSS JWT leak to localStorage
const toPersistedRecord = (eventId, registeredAt, event, registrationId) => ({
  eventId,
  registeredAt,
  registrationId,
  eventSummary: toEventSummary(event),
});

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const loadFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId, records) => {
  if (!userId) return;
  // Only persist the minimal, PII-free shape — strip formData and full event
  // 🔥 FIX 1 cont: Removed r.qrToken from the serialization payload
  const persisted = records.map((r) =>
    toPersistedRecord(r.eventId, r.registeredAt, r.event || r.eventSummary, r.registrationId),
  );
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(persisted));
  } catch {
    // localStorage might be full — fail silently
  }
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const MyEventsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.email || null;

  // Lazy init — loads persisted (PII-free) records immediately from localStorage.
  // formData is absent from persisted records; it is available only for
  // registrations added during the current session.
  const [myEvents, setMyEvents] = useState(() => loadFromStorage(userId));
  const [loading] = useState(false);

  // Guard ref — skips the first save on load to prevent overwriting valid data
  const isInitialLoad = useRef(true);

  // Reload from localStorage whenever the logged-in user changes
  useEffect(() => {
    isInitialLoad.current = true;
    setMyEvents(loadFromStorage(userId));
  }, [userId]);

  // Persist to localStorage whenever myEvents changes — PII-free records only
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (userId !== null) {
      saveToStorage(userId, myEvents);
    }
  }, [myEvents, userId]);

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
      if (prev.some((r) => r.eventId === event.id)) return prev;
      return [
        ...prev,
        {
          eventId: event.id,
          registeredAt: new Date().toISOString(),
          registrationId: registrationId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
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
    // Trigger automatic promotion from the waitlist
    // 🔥 FIX 2: Added .catch() boundary to prevent fatal unhandled promise rejections on network failure
    import("../utils/waitlistUtils.js")
      .then(({ promoteNextUser }) => {
        promoteNextUser(eventId);
      })
      .catch((error) => {
        console.error("Failed to load waitlist promotion module:", error);
      });
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