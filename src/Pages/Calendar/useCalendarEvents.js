import { useCallback, useEffect, useState } from "react";
import mockEventsRaw from "../Events/eventsMockData.js";
const mockEvents = Array.isArray(mockEventsRaw) ? mockEventsRaw : (mockEventsRaw.events || mockEventsRaw.data || Object.values(mockEventsRaw)[0] || []);;
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { getEventStatus } from "../../utils/eventUtils";

const normalizeEvents = (events = []) =>
  events.map((event) => ({
    ...event,
    status: getEventStatus(event),
  }));

const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(normalizeEvents(apiEvents));
    } catch (error) {
      if (import.meta.env.NODE_ENV === "development") {
        console.warn("Failed to fetch events. Falling back to mock data.", error);
        setLoadError(error?.message || "Failed to load events.");
        setEvents(normalizeEvents(mockEvents));
      } else {
        setEvents([]);
        setLoadError(error?.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    loadError,
    refresh: fetchEvents,
  };
};

export default useCalendarEvents;
