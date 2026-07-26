import { useCallback, useEffect, useState } from "react";

import { eventService } from "services/eventService";
import { normalizeEvent } from "utils/eventUtils";

const normalizeEvents = (events = []) => events.map(normalizeEvent);

const useCalendarEvents = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await eventService.getAllEvents();
      const apiEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(normalizeEvents(apiEvents));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch events. Falling back to mock data.", error);
        setLoadError(error?.message || "Failed to load events.");
        import("../Events/eventsMockData.json").then(({ default: mockEvents }) => {
          setEvents(normalizeEvents(mockEvents));
        });
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
