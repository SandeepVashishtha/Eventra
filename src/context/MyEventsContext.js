/**
 * MyEventsContext.js
 *
 * Stores the list of events a logged-in user has registered to attend.
 * Data is persisted to localStorage under the key `my_events_<userId>` so
 * each user's list survives page refreshes and is isolated per account.
 *
 * Shape of each stored registration:
 * {
 *   eventId        : number   — matches eventsMockData id (or real API id)
 *   registeredAt   : string   — ISO timestamp of when the user registered
 *   formData       : object   — the form data submitted at registration time
 *   event          : object   — a snapshot of the event object at registration time
 * }
 *
 * Usage (any component):
 *   import { useMyEvents } from '../context/MyEventsContext';
 *   const { myEvents, addRegistration, isRegistered, removeRegistration } = useMyEvents();
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MyEventsContext = createContext(null);

// ---------- helpers ----------

const storageKey = (userId) => `my_events_${userId}`;

const loadFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId, data) => {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    // localStorage might be full — fail silently
  }
};

// ---------- provider ----------

export const MyEventsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?.email || null; // use email as fallback id

  const [myEvents, setMyEvents] = useState([]);

  // Load from localStorage whenever the logged-in user changes
  useEffect(() => {
    setMyEvents(loadFromStorage(userId));
  }, [userId]);

  // Persist to localStorage whenever myEvents changes
  useEffect(() => {
    if (userId !== null) {
      saveToStorage(userId, myEvents);
    }
  }, [myEvents, userId]);

  /**
   * addRegistration — call this after a successful event registration.
   * @param {object} event     — the full event object
   * @param {object} formData  — the registration form data
   */
  const addRegistration = useCallback((event, formData = {}) => {
    setMyEvents((prev) => {
      // Avoid duplicate registrations for the same event
      if (prev.some((r) => r.eventId === event.id)) return prev;
      return [
        ...prev,
        {
          eventId: event.id,
          registeredAt: new Date().toISOString(),
          formData,
          event,
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
    [myEvents]
  );

  return (
    <MyEventsContext.Provider
      value={{ myEvents, addRegistration, removeRegistration, isRegistered }}
    >
      {children}
    </MyEventsContext.Provider>
  );
};

export const useMyEvents = () => {
  const ctx = useContext(MyEventsContext);
  if (!ctx) throw new Error('useMyEvents must be used inside <MyEventsProvider>');
  return ctx;
};