import { useEffect, useState } from "react";
import { eventService } from "../../../services/eventService";
import { fetchHackathons } from "../../../services/hackathonService";
import { projectService } from "../../../services/projectService";

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
  const [hackathonsData, setHackathonsData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      eventService.getAllEvents(),
      fetchHackathons(),
      projectService.getAllProjects(),
    ]).then(([eventsRes, hackathonsRes, projectsRes]) => {
      if (cancelled) return;

      // Handle Events
      if (eventsRes.status === "fulfilled") {
        const rawEvents = Array.isArray(eventsRes.value.data)
          ? eventsRes.value.data
          : eventsRes.value.data?.content ?? [];
        setEventsData(normalizeEvents(rawEvents));
      }

      // Handle Hackathons
      if (hackathonsRes.status === "fulfilled") {
        setHackathonsData(hackathonsRes.value || []);
      }

      // Handle Projects
      if (projectsRes.status === "fulfilled") {
        const rawProjects = Array.isArray(projectsRes.value.data)
          ? projectsRes.value.data
          : [];
        setProjectsData(rawProjects);
      }

      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { eventsData, hackathonsData, projectsData, isLoading };
}
