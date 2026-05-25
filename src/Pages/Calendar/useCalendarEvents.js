import { useCallback, useEffect, useState } from "react";
import mockEvents from "../Events/eventsMockData.json";
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
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.ALL);
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(normalizeEvents(apiEvents));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
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
