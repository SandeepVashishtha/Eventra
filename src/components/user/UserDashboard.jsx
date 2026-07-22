import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from 'hooks/useReducedMotion';
import { getSmartDateLabel } from "utils/relativeTime";
import {
  Calendar, Trophy, FolderOpen, Users, Settings,
  Clock, Zap, Activity, Bell, ChevronRight,
  LogOut, User, Plus, Search, X, CheckCircle2,
  ChevronLeft, List
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ErrorBoundary from "../common/ErrorBoundary";
import { useAuth } from "context/AuthContext";
import { useMyEvents } from "context/MyEventsContext";
import useBookmarks from "hooks/useBookmarks";
import { getEventStatus } from "utils/eventUtils";
import StatusBadge from "../common/StatusBadge";
import { requestNotificationPermission, disableNotifications } from "utils/NotificationManager";
import { readNotificationPreferences } from "utils/notificationPreferences";
import EventsTab from "./EventsTab";
import HackathonsTab from "./HackathonsTab";
import ProjectsTab from "./ProjectsTab";
import RegistrationsTab from "./RegistrationsTab";
import AnalyticsTab from "./AnalyticsTab";
import {
  DashboardListCardSkeleton,
  DashboardProfileSkeleton,
  DashboardQuickActionSkeleton,
  DashboardSectionTitleSkeleton,
  DashboardStatCardSkeleton,
} from "../common/SkeletonLoaders";
import useDashboardFilters from "hooks/useDashboardFilters";
import { parseEventDateTime } from "utils/calendarExport";
import "./UserDashboard.css";
import EventTicket from "./EventTicket";
import EmptyState from "../common/EmptyState";
import DashboardEmptyState from "./DashboardEmptyState";
import OfflineIndicator from "../common/OfflineIndicator";
import RecentlyViewedEvents from "../common/RecentlyViewedEvents";

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: prefersReducedMotion ? 0 : i * 0.07, duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }
  })
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 } }
});

const RecentlyViewedWrapper = ({ prefersReducedMotion }) => (
  <motion.section custom={1.5} variants={fadeUp(prefersReducedMotion)}>
    <RecentlyViewedEvents />
  </motion.section>
);

// Γ¥î REMOVED: MOCK_DATA - No longer needed

const QUICK_ACTIONS = [
  { label: "Events", icon: <Calendar size={22} />, to: "/events", color: "#6366f1" },
  { label: "Hackathons", icon: <Trophy size={22} />, to: "/hackathons", color: "#ec4899" },
  { label: "Projects", icon: <FolderOpen size={22} />, to: "/projects", color: "#8b5cf6" },
  { label: "Profile", icon: <User size={22} />, to: "/dashboard/profile", color: "#10b981" },
  { label: "Settings", icon: <Settings size={22} />, to: "/settings", color: "#f59e0b" },
];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameMonth = (date, monthDate) =>
  date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();

const formatMonthLabel = (date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

const formatDayLabel = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
};

const buildMonthDays = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const getRegistrationEvent = (registration) =>
  registration?.event || registration?.eventSummary || registration || null;

const getCalendarDateTime = (event) => {
  const dateValue = event?.startDate || event?.date;
  if (!dateValue) return null;

  const parsed = parseEventDateTime(String(dateValue), String(event?.startTime || event?.time || ""));
  if (Number.isNaN(parsed.getTime()) || parsed.getTime() === 0) return null;

  return parsed;
};

export default function UserDashboard() {
  const prefersReducedMotion = useReducedMotion();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleView, setScheduleView] = useState("list");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => formatDateKey(new Date()));
  const [pushEnabled, setPushEnabled] = useState(() => readNotificationPreferences().push);

  // Γ£à Get real user data from contexts
  const { myEvents, loading: myEventsLoading } = useMyEvents();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");

  // Γ£à Transform real data into registrations format
  const userRegistrations = useMemo(() => {
    if (!myEvents || myEvents.length === 0) return [];

    return myEvents
      .map(registration => {
        // Extract event data from registration
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
      })
      .filter(Boolean);
  }, [myEvents]);

  // Γ£à Calculate journey stats from real data
  const journeyStats = useMemo(() => {
    const records = Array.isArray(myEvents) ? myEvents : [];
    const registeredItems = records
      .map((registration) => registration?.event || registration?.eventSummary || null)
      .filter(Boolean);

    const isHackathon = (item) => {
      const type = String(item?.type || "").toLowerCase();
      const category = String(item?.category || "").toLowerCase();
      const title = String(item?.title || "").toLowerCase();
      return type === "hackathon" || category.includes("hackathon") || title.includes("hackathon");
    };

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
  }, [myEvents, bookmarks]);

  // Γ£à Calculate derived data from real user registrations
  const derivedData = useMemo(() => {
    const records = userRegistrations;

    let eventsTotal = 0;
    let eventsCreated = 0;
    let eventsJoined = 0;
    let hackathonsTotal = 0;
    let hackathonsHosted = 0;
    let hackathonsJoined = 0;
    let projectsTotal = 0;
    let projectsDone = 0;
    let projectsActive = 0;
    const upcomingEvents = [];
    const upcomingHackathons = [];
    const activeProjects = [];

    for (const d of records) {
      if (d && d.type === "Event") {
        eventsTotal++;
        if (d.participationType === "Hosted") eventsCreated++;
        if (d.participationType === "Registered") eventsJoined++;
        if (d.status === "Upcoming" || d.status === "upcoming") upcomingEvents.push(d);
      } else if (d && d.type === "Hackathon") {
        hackathonsTotal++;
        if (d.participationType === "Hosted") hackathonsHosted++;
        if (d.participationType === "Registered") hackathonsJoined++;
        if (d.status === "Upcoming" || d.status === "upcoming") upcomingHackathons.push(d);
      } else if (d && d.type === "Project") {
        projectsTotal++;
        if (d.projectStatus !== "Done" && d.projectStatus !== "done") {
          projectsActive++;
          activeProjects.push(d);
        } else {
          projectsDone++;
        }
      }
    }

    return {
      stats: {
        eventsTotal, eventsCreated, eventsJoined,
        hackathonsTotal, hackathonsHosted, hackathonsJoined,
        projectsTotal, projectsDone, projectsActive,
      },
      upcomingEvents,
      upcomingHackathons,
      activeProjects,
    };
  }, [userRegistrations]);

  // Γ£à Use real data for filters
  const dashboardFilters = useDashboardFilters(userRegistrations, { debounceMs: 300 });

  const registeredCalendarEvents = useMemo(() => {
    const records = Array.isArray(myEvents) ? myEvents : [];

    return records
      .map((registration) => {
        const event = getRegistrationEvent(registration);
        const dateTime = getCalendarDateTime(event);
        if (!event || !dateTime) return null;

        return {
          id: registration?.id || event.id || `${event.title}-${formatDateKey(dateTime)}`,
          title: event.title || "Untitled Event",
          date: dateTime,
          dateKey: formatDateKey(dateTime),
          time: event.startTime || event.time || "",
          location: event.location || event.venue || "Online",
          type: event.type || "Event",
          status: getEventStatus(event) || "Upcoming",
          participationType: registration?.participationType || "Registered",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);
  }, [myEvents]);

  const calendarDays = useMemo(() => buildMonthDays(calendarMonth), [calendarMonth]);

  const calendarEventsByDate = useMemo(() => {
    return registeredCalendarEvents.reduce((grouped, event) => {
      const events = grouped.get(event.dateKey) || [];
      events.push(event);
      grouped.set(event.dateKey, events);
      return grouped;
    }, new Map());
  }, [registeredCalendarEvents]);

  const selectedDayEvents = calendarEventsByDate.get(selectedCalendarDate) || [];

  const goToPreviousMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const selectCalendarDay = (date) => {
    setSelectedCalendarDate(formatDateKey(date));
  };

  const togglePushNotifications = async () => {
    if (pushEnabled) {
      disableNotifications();
      setPushEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      setPushEnabled(granted);
    }
  };

  const firstName = user?.firstName || user?.username || "there";

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    if (myEventsLoading) {
      setLoading(true);
      return;
    }

    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, [myEventsLoading]);

  const { upcomingEvents, upcomingHackathons, activeProjects } = derivedData;

  const notifications = [
    { id: 1, text: "React Conference 2025 registration opens soon", time: "2h ago", unread: true },
    { id: 2, text: "Global AI Hackathon team registration open", time: "1d ago", unread: true },
    { id: 3, text: "Student Gradesheet App updated by collaborator", time: "2d ago", unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="ud-root">
      <OfflineIndicator />
      {/* Sidebar */}
      <aside className="ud-sidebar">
        <div className="ud-sidebar-brand">
          <div className="ud-brand-dot" />
          <span>Eventra</span>
        </div>

        <nav className="ud-nav">
          {[
            { id: "overview", icon: <Activity size={18} />, label: "Overview" },
            { id: "events", icon: <Calendar size={18} />, label: "Events" },
            { id: "hackathons", icon: <Trophy size={18} />, label: "Hackathons" },
            { id: "projects", icon: <FolderOpen size={18} />, label: "Projects" },
            { id: "registrations", icon: <Users size={18} />, label: "Registrations" },
            { id: "analytics", icon: <Activity size={18} />, label: "Analytics" },
          ].map(item => (
            <button
              key={item.id}
              className={`ud-nav-item ${activeTab === item.id ? "ud-nav-active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="ud-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
          <Link to="/dashboard/achievements" className="ud-nav-item">
            <Trophy size={18} />
            <span>Achievements</span>
          </Link>
          <Link to="/dashboard/quests" className="ud-nav-item">
            <Zap size={18} />
            <span>Quest Center</span>
          </Link>
        </nav>

        <div className="ud-sidebar-bottom">
          <Link to="/dashboard/profile" className="ud-nav-item" id="sidebar-profile-link">
            <User size={18} /><span>Profile</span>
          </Link>
          <button className="ud-nav-item ud-nav-logout" onClick={() => { logout(); navigate("/"); }}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ud-main">
        <header className="ud-topbar">
          {loading ? (
            <DashboardProfileSkeleton />
          ) : (
            <div>
              <p className="ud-greeting">{greeting},</p>
              <h1 className="ud-username">{firstName} ≡ƒæï</h1>
            </div>
          )}

          <div className="ud-topbar-right">
            <div className="ud-search-wrap">
              <Search size={15} className="ud-search-icon" />
              <input className="ud-search" placeholder="SearchΓÇª" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button className="ud-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search query"><X size={13} /></button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <button className="ud-icon-btn" onClick={() => setNotifOpen(o => !o)} aria-label="Notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span className="ud-notif-dot">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="ud-notif-panel"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                  >
                    <div className="ud-notif-header flex items-center justify-between">
                      <span>Notifications</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <span className="text-gray-500">Push</span>
                          <input
                            type="checkbox"
                            checked={pushEnabled}
                            onChange={togglePushNotifications}
                            className="w-3 h-3 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                        <button onClick={() => setNotifOpen(false)} aria-label="Close notification panel"><X size={14} /></button>
                      </div>
                    </div>
                    {notifications.map(n => (
                      <div key={n.id} className={`ud-notif-item ${n.unread ? "ud-notif-unread" : ""}`}>
                        <p className="ud-notif-text">{n.text}</p>
                        <p className="ud-notif-time">{n.time}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Γ£à FIX: Single AnimatePresence wrapping all tab content correctly */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" variants={stagger(prefersReducedMotion)} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="ud-content">
              {loading ? (
                <>
                  <div className="ud-stats-grid">
                    {[...Array(5)].map((_, i) => (
                      <DashboardStatCardSkeleton key={i} />
                    ))}
                  </div>

                  <section>
                    <DashboardSectionTitleSkeleton />
                    <div className="ud-quick-grid">
                      {[...Array(6)].map((_, i) => (
                        <DashboardQuickActionSkeleton key={i} />
                      ))}
                    </div>
                  </section>

                  <div className="ud-three-col">
                    {[...Array(3)].map((_, i) => (
                      <DashboardListCardSkeleton key={i} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Γ£à FIX: Show empty state if no registrations */}
                  {journeyStats.totalRegistrations === 0 && journeyStats.savedEvents === 0 ? (
                    <DashboardEmptyState />
                  ) : (
                  <>
                  <motion.section className="ud-journey-header" custom={0} variants={fadeUp(prefersReducedMotion)}>
                    <div>
                      <p className="ud-journey-label">My Event Journey</p>
                      <p className="ud-journey-description">A centralized view of your event participation, attendance, saved events, hackathons joined, and upcoming schedule.</p>
                    </div>
                  </motion.section>

                  <motion.div variants={stagger(prefersReducedMotion)} className="ud-stats-grid">
                    {[
                      { label: "Events Registered", value: journeyStats.eventsRegistered, sub: `${Math.max(journeyStats.eventsRegistered - journeyStats.eventsAttended, 0)} upcoming / registered`, icon: <Calendar size={20} />, accent: "#6366f1" },
                      { label: "Events Attended", value: journeyStats.eventsAttended, sub: "Completed event participation", icon: <CheckCircle2 size={20} />, accent: "#10b981" },
                      { label: "Hackathons Joined", value: journeyStats.hackathonsJoined, sub: "Hackathon registrations", icon: <Trophy size={20} />, accent: "#ec4899" },
                      { label: "Saved Events", value: journeyStats.savedEvents, sub: "Events bookmarked to review", icon: <FolderOpen size={20} />, accent: "#f59e0b" },
                      { label: "Upcoming Events", value: journeyStats.upcomingEvents, sub: "Next events on your schedule", icon: <Clock size={20} />, accent: "#0ea5e9" },
                    ].map((s, i) => (
                      <motion.div key={s.label} custom={i} variants={fadeUp(prefersReducedMotion)} className="ud-stat-card backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                        <div className="ud-stat-icon" style={{ background: s.accent + "18", color: s.accent }}>{s.icon}</div>
                        <div className="ud-stat-info">
                          <p className="ud-stat-label">{s.label}</p>
                          <p className="ud-stat-value">{s.value}</p>
                          <p className="ud-stat-sub">{s.sub}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.section custom={1} variants={fadeUp(prefersReducedMotion)}>
                    <h2 className="ud-section-title"><Zap size={17} /> Quick Actions</h2>
                    <div className="ud-quick-grid">
                      {QUICK_ACTIONS.map(a => (
                        <Link key={a.label} to={a.to} className="ud-quick-card backdrop-blur-md bg-white/10 border border-white/20" style={{ "--qa-color": a.color }}>
                          <span className="ud-quick-icon" style={{ color: a.color, background: a.color + "18" }}>{a.icon}</span>
                          <span className="ud-quick-label">{a.label}</span>
                          <ChevronRight size={14} className="ud-quick-arrow" />
                        </Link>
                      ))}
                      <Link to="/create-event" className="ud-quick-card ud-quick-new backdrop-blur-md bg-white/10 border border-indigo-500/30" style={{ "--qa-color": "#6366f1" }}>
                        <span className="ud-quick-icon" style={{ color: "#6366f1", background: "#6366f118" }}><Plus size={22} /></span>
                        <span className="ud-quick-label">New Event</span>
                        <ChevronRight size={14} className="ud-quick-arrow" />
                      </Link>
                    </div>
                  </motion.section>

                  <RecentlyViewedWrapper prefersReducedMotion={prefersReducedMotion} />

                  <div className="ud-three-col">
                    {/* Upcoming Events */}
                    <motion.section custom={2} variants={fadeUp(prefersReducedMotion)} className="ud-card ud-schedule-card backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                      <div className="ud-card-head ud-schedule-head">
                        <span className="ud-card-icon" style={{ background: "#6366f118", color: "#6366f1" }}><Clock size={16} /></span>
                        <h3>Upcoming Events</h3>
                        <div className="ud-schedule-actions">
                          <div className="ud-view-toggle" aria-label="Schedule view mode">
                            <button
                              type="button"
                              className={`ud-view-toggle-btn ${scheduleView === "list" ? "ud-view-toggle-active" : ""}`}
                              onClick={() => setScheduleView("list")}
                              aria-pressed={scheduleView === "list"}
                            >
                              <List size={14} />
                              <span>List</span>
                            </button>
                            <button
                              type="button"
                              className={`ud-view-toggle-btn ${scheduleView === "calendar" ? "ud-view-toggle-active" : ""}`}
                              onClick={() => setScheduleView("calendar")}
                              aria-pressed={scheduleView === "calendar"}
                            >
                              <Calendar size={14} />
                              <span>Calendar</span>
                            </button>
                          </div>
                          <Link to="/events" className="ud-card-link">See all <ChevronRight size={13} /></Link>
                        </div>
                      </div>

                      {scheduleView === "calendar" ? (
                        registeredCalendarEvents.length === 0 ? (
                          <EmptyState
                            compact={true}
                            icon={<Calendar size={32} className="text-indigo-500" />}
                            title="No Registered Events"
                            message="Register for an event to see it on your monthly calendar."
                            onBrowseAll={() => navigate("/events")}
                          />
                        ) : (
                          <div className="ud-calendar-wrap">
                            <div className="ud-calendar-toolbar">
                              <button type="button" className="ud-calendar-nav-btn" onClick={goToPreviousMonth} aria-label="Previous month">
                                <ChevronLeft size={15} />
                              </button>
                              <p className="ud-calendar-month">{formatMonthLabel(calendarMonth)}</p>
                              <button type="button" className="ud-calendar-nav-btn" onClick={goToNextMonth} aria-label="Next month">
                                <ChevronRight size={15} />
                              </button>
                            </div>

                            <div className="ud-calendar-grid" role="grid" aria-label={`${formatMonthLabel(calendarMonth)} registered events`}>
                              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="ud-calendar-weekday">{day}</div>
                              ))}
                              {calendarDays.map((date) => {
                                const dateKey = formatDateKey(date);
                                const dayEvents = calendarEventsByDate.get(dateKey) || [];
                                const isSelected = dateKey === selectedCalendarDate;
                                const inCurrentMonth = isSameMonth(date, calendarMonth);
                                const isToday = dateKey === formatDateKey(new Date());

                                return (
                                  <button
                                    key={dateKey}
                                    type="button"
                                    className={`ud-calendar-day ${inCurrentMonth ? "" : "ud-calendar-day-muted"} ${isSelected ? "ud-calendar-day-selected" : ""} ${isToday ? "ud-calendar-day-today" : ""}`}
                                    onClick={() => selectCalendarDay(date)}
                                    aria-label={`${date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}, ${dayEvents.length} registered event${dayEvents.length === 1 ? "" : "s"}`}
                                    aria-pressed={isSelected}
                                  >
                                    <span className="ud-calendar-day-number">{date.getDate()}</span>
                                    <span className="ud-calendar-event-stack">
                                      {dayEvents.slice(0, 2).map((event) => (
                                        <span key={event.id} className="ud-calendar-event-chip" title={event.title}>
                                          {event.title}
                                        </span>
                                      ))}
                                      {dayEvents.length > 2 && (
                                        <span className="ud-calendar-more">+{dayEvents.length - 2}</span>
                                      )}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>

                            <div className="ud-calendar-details" aria-live="polite">
                              <h4>{formatDayLabel(selectedCalendarDate)}</h4>
                              {selectedDayEvents.length === 0 ? (
                                <p className="ud-calendar-details-empty">No registered events on this day.</p>
                              ) : (
                                selectedDayEvents.map((event) => (
                                  <div key={event.id} className="ud-calendar-detail-item">
                                    <div className="min-w-0 flex-1">
                                      <p className="ud-list-title" title={event.title}>{event.title}</p>
                                      <p className="ud-list-meta">
                                        <Clock size={12} /> {event.time || "Time TBA"}
                                        <span>&middot;</span>
                                        {event.location}
                                      </p>
                                    </div>
                                    <StatusBadge status={event.participationType} />
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        upcomingEvents.length === 0 ? (
                          <EmptyState
                            compact={true}
                            icon={<Calendar size={32} className="text-indigo-500" />}
                            title="No Upcoming Events"
                            message="You haven't registered or joined any events yet. Check out the Events tab to find one!"
                            onBrowseAll={() => navigate("/events")}
                          />
                        ) : (
                          upcomingEvents.map(ev => (
                            <div key={ev.id} className="ud-list-item">
                              <div className="min-w-0 flex-1">
                                <p className="ud-list-title" title={ev.title}>{ev.title}</p>
                                <p className="ud-list-meta"><Calendar size={12} /> {getSmartDateLabel(ev.date)}</p>
                              </div>
                              <StatusBadge status={ev.participationType} />
                            </div>
                          ))
                        )
                      )}
                    </motion.section>

                    {/* Upcoming Hackathons */}
                    <motion.section custom={3} variants={fadeUp(prefersReducedMotion)} className="ud-card backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                      <div className="ud-card-head">
                        <span className="ud-card-icon" style={{ background: "#ec489918", color: "#ec4899" }} />
                        <h3>Upcoming Hackathons</h3>
                        <Link to="/hackathons" className="ud-card-link">See all <ChevronRight size={14} /></Link>
                      </div>
                      {upcomingHackathons.length === 0 ? (
                        <EmptyState
                          compact={true}
                          icon={<Trophy size={32} className="text-pink-500" />}
                          title="No Active Hackathons"
                          message="There are currently no upcoming hackathons in your schedule."
                          onBrowseAll={() => navigate("/hackathons")}
                        />
                      ) : (
                        upcomingHackathons.map(h => (
                          <div key={h.id} className="ud-list-item">
                            <div className="min-w-0 flex-1">
                              <p className="ud-list-title" title={h.title}>{h.title}</p>
                              <p className="ud-list-meta"><Calendar size={12} /> {getSmartDateLabel(h.date)}</p>
                            </div>
                            <StatusBadge status={h.participationType} />
                          </div>
                        ))
                      )}
                    </motion.section>

                    {/* Active Projects */}
                    <motion.section custom={4} variants={fadeUp(prefersReducedMotion)} className="ud-card backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                      <div className="ud-card-head">
                        <span className="ud-card-icon" style={{ background: "#8b5cf618", color: "#8b5cf6" }} />
                        <h3>Active Projects</h3>
                        <Link to="/projects" className="ud-card-link">See all <ChevronRight size={14} /></Link>
                      </div>
                      {activeProjects.length === 0 ? (
                        <EmptyState
                          compact={true}
                          icon={<FolderOpen size={32} className="text-purple-500" />}
                          title="No Active Projects"
                          message="All your tracked development projects are currently completed or inactive."
                          onBrowseAll={() => navigate("/projects")}
                        />
                      ) : (
                        activeProjects.map(p => (
                          <div key={p.id} className="ud-list-item">
                            <div className="min-w-0 flex-1">
                              <p className="ud-list-title" title={p.title}>{p.title}</p>
                              <p className="ud-list-meta">Updated: {p.lastUpdate}</p>
                            </div>
                            <StatusBadge status={p.projectStatus} />
                          </div>
                        ))
                      )}
                    </motion.section>
                  </div>
                  </>
                  )} {/* end hasData ternary */}
                </>
              )}
            </motion.div>
          )}

          {/* Events tab - Γ£à Using real data */}
          {activeTab === "events" && (
            <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <EventsTab
                  hostedEvents={userRegistrations.filter(d => d.type === "Event" && d.participationType === "Hosted")}
                  onViewTicket={setSelectedTicketEvent}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Hackathons tab - Γ£à Using real data */}
          {activeTab === "hackathons" && (
            <motion.div key="hackathons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <HackathonsTab
                  hackathons={userRegistrations.filter(d => d.type === "Hackathon")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Projects tab - Γ£à Using real data */}
          {activeTab === "projects" && (
            <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <ProjectsTab
                  projects={userRegistrations.filter(d => d.type === "Project")}
                  loading={loading}
                  fadeUp={fadeUp(prefersReducedMotion)}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Registrations tab - Γ£à Using real data */}
          {activeTab === "registrations" && (
            <motion.div key="registrations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <RegistrationsTab
                  filteredData={dashboardFilters.filteredData}
                  loading={loading}
                  searchTerm={dashboardFilters.searchTerm}
                  setSearchTerm={dashboardFilters.setSearchTerm}
                  isDebouncing={dashboardFilters.isDebouncing}
                  selectedTypes={dashboardFilters.selectedTypes}
                  toggleType={dashboardFilters.toggleType}
                  selectedStatuses={dashboardFilters.selectedStatuses}
                  toggleStatus={dashboardFilters.toggleStatus}
                  activeFilterCount={dashboardFilters.activeFilterCount}
                  clearAll={dashboardFilters.clearAll}
                  ticketType={dashboardFilters.ticketType}
                  setTicketType={dashboardFilters.setTicketType}
                  sortBy={dashboardFilters.sortBy}
                  setSortBy={dashboardFilters.setSortBy}
                  setSelectedTicketEvent={setSelectedTicketEvent}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {/* Analytics tab */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorBoundary level="feature">
                <AnalyticsTab loading={loading} />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="ud-footer">
          <div className="ud-footer-divider" />
          <div className="ud-footer-content">
            <p className="ud-footer-copyright">
              ┬⌐ {new Date().getFullYear()} Eventra. All rights reserved.
            </p>
            <div className="ud-footer-links">
              <Link to="/helpcenter" className="ud-footer-link">Help Center</Link>
              <Link to="/feedback" className="ud-footer-link">Feedback</Link>
              <Link to="/privacy" className="ud-footer-link">Privacy Policy</Link>
              <Link to="/terms" className="ud-footer-link">Terms of Service</Link>
            </div>
          </div>
        </footer>

        {/* Ticket Preview Modal */}
        {selectedTicketEvent && (
          <EventTicket
            event={selectedTicketEvent}
            user={user}
            onClose={() => setSelectedTicketEvent(null)}
          />
        )}
      </main>
    </div>
  );
}
