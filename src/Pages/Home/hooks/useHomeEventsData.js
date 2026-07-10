import { useEffect, useState } from "react";
import { eventService } from "../../../services/eventService";

const normalizeEvents = (rawEvents = []) =>
  rawEvents.map((e) => ({
    ...e,
    date: e.date || e.eventDate,
    startDate: e.startDate || e.eventDate,
    type: e.type || "conference",
    status: e.status || "upcoming",
    attendees: e.attendees ?? e.registeredCount ?? 0,
    description: e.description || "",
    location: e.location || "",
  }));

export default function useHomeEventsData() {
  const [eventsData, setEventsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    eventService
      .getAllEvents()
      .then((res) => {
        if (cancelled) return;
        const raw = Array.isArray(res.data) ? res.data : res.data?.content ?? [];
        setEventsData(normalizeEvents(raw));
      })
      .catch(() => {
        if (!cancelled) setEventsData([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { eventsData, isLoading };
}
