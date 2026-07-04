// src/hooks/useDashboardData.js
import { useMemo } from 'react';
import { useMyEvents } from '../../context/MyEventsContext';
import useBookmarks from '../../hooks/useBookmarks';
import { getEventStatus } from '../../utils/eventUtils';

/* ---------------- Helper Functions ---------------- */

// Check if item is a hackathon
const isHackathon = (item) => {
  const type = String(item?.type || "").toLowerCase();
  const category = String(item?.category || "").toLowerCase();
  const title = String(item?.title || "").toLowerCase();
  return type === "hackathon" || category.includes("hackathon") || title.includes("hackathon");
};

// Transform registration to event format
const transformRegistration = (registration) => {
  const event = registration?.event || registration?.eventSummary;
  if (!event) return null;
  
  return {
    id: registration.id || event.id || Math.random().toString(36).substr(2, 9),
    type: event.type || "Event",
    title: event.title || "Untitled Event",
    date: event.startDate || event.date || new Date().toISOString().split('T')[0],
    location: event.location || event.venue || "Online",
    status: getEventStatus(event) || "Upcoming",
    participationType: registration.participationType || "Registered",
    projectStatus: event.projectStatus || "In Progress",
    lastUpdate: event.updatedAt || event.lastUpdate || new Date().toISOString().split('T')[0],
  };
};

// Calculate event stats
const calculateEventStats = (records) => {
  let stats = {
    eventsTotal: 0, eventsCreated: 0, eventsJoined: 0,
    hackathonsTotal: 0, hackathonsHosted: 0, hackathonsJoined: 0,
    projectsTotal: 0, projectsDone: 0, projectsActive: 0,
  };
  
  const upcomingEvents = [];
  const upcomingHackathons = [];
  const activeProjects = [];

  records.forEach(d => {
    if (!d) return;
    
    switch (d.type) {
      case "Event":
        stats.eventsTotal++;
        if (d.participationType === "Hosted") stats.eventsCreated++;
        if (d.participationType === "Registered") stats.eventsJoined++;
        if (d.status === "Upcoming" || d.status === "upcoming") upcomingEvents.push(d);
        break;
        
      case "Hackathon":
        stats.hackathonsTotal++;
        if (d.participationType === "Hosted") stats.hackathonsHosted++;
        if (d.participationType === "Registered") stats.hackathonsJoined++;
        if (d.status === "Upcoming" || d.status === "upcoming") upcomingHackathons.push(d);
        break;
        
      case "Project":
        stats.projectsTotal++;
        if (d.projectStatus !== "Done" && d.projectStatus !== "done") {
          stats.projectsActive++;
          activeProjects.push(d);
        } else {
          stats.projectsDone++;
        }
        break;
    }
  });

  return { stats, upcomingEvents, upcomingHackathons, activeProjects };
};

// Calculate journey stats
const calculateJourneyStats = (myEvents, bookmarks) => {
  const records = Array.isArray(myEvents) ? myEvents : [];
  const registeredItems = records
    .map((registration) => registration?.event || registration?.eventSummary || null)
    .filter(Boolean);

  const eventRegistrations = registeredItems.filter((item) => !isHackathon(item));
  const hackathonRegistrations = registeredItems.filter(isHackathon);

  const eventsAttended = eventRegistrations.filter((event) => {
    const status = getEventStatus(event);
    return status === "past" || status === "ended";
  }).length;

  const upcomingEvents = registeredItems.filter((event) => {
    const status = getEventStatus(event);
    return status === "upcoming" || status === "live";
  }).length;

  const savedEvents = Array.isArray(bookmarks) ? bookmarks.length : 0;

  return {
    eventsRegistered: eventRegistrations.length,
    eventsAttended,
    hackathonsJoined: hackathonRegistrations.length,
    upcomingEvents,
    savedEvents,
    totalRegistrations: registeredItems.length,
  };
};

/* ---------------- Main Hook ---------------- */

export function useDashboardData(user) {
  const { myEvents, loading: myEventsLoading } = useMyEvents();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");

  // Transform real data into registrations format
  const userRegistrations = useMemo(() => {
    if (!myEvents || myEvents.length === 0) return [];
    return myEvents.map(transformRegistration).filter(Boolean);
  }, [myEvents]);

  // Calculate journey stats
  const journeyStats = useMemo(() => {
    return calculateJourneyStats(myEvents, bookmarks);
  }, [myEvents, bookmarks]);

  // Calculate derived data
  const derivedData = useMemo(() => {
    return calculateEventStats(userRegistrations);
  }, [userRegistrations]);

  return {
    userRegistrations,
    journeyStats,
    derivedData,
    myEvents,
    myEventsLoading,
  };
}