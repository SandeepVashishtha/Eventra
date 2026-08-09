import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { apiUtils } from "../config/api";

/**
 * Hook to fetch only published events (respects draft visibility rules)
 * - Unauthenticated users: only PUBLISHED events
 * - Authenticated users: PUBLISHED + their own DRAFT events
 * - Admin users: all events
 */
export function usePublicEvents(options = {}) {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(options.initialPage || 1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [page, token]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      // Add user context header for backend to filter appropriately
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await apiUtils.get(
        `/api/events?page=${page}&limit=${options.limit || 20}&status=PUBLISHED`,
        { headers }
      );

      const newEvents = response.data?.events || response.data || [];

      if (page === 1) {
        setEvents(newEvents);
      } else {
        setEvents((prev) => [...prev, ...newEvents]);
      }

      // Check if there are more pages
      setHasMore(newEvents.length >= (options.limit || 20));
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  return {
    events,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    refetch: () => {
      setPage(1);
      fetchEvents();
    },
  };
}

/**
 * Hook to fetch events visible to current user
 * - If authenticated: includes their draft events
 * - If not authenticated: only published events
 */
export function useUserVisibleEvents(userId) {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetchUserEvents();
  }, [userId, token]);

  const fetchUserEvents = async () => {
    setLoading(true);
    try {
      const endpoint = user?.id === userId ? "/api/user/events" : `/api/events?organiser=${userId}`;

      const response = await apiUtils.get(endpoint);
      setEvents(response.data?.events || response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch: fetchUserEvents };
}

/**
 * Hook to safely get single event (respects visibility rules)
 */
export function useEventDetail(eventId) {
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
  }, [eventId, token]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await apiUtils.get(`/api/events/${eventId}`);
      setEvent(response.data);
    } catch (err) {
      // 404 for draft events user can't view
      if (err.response?.status === 404) {
        setError("Event not found or access denied");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { event, loading, error, refetch: fetchEvent };
}
