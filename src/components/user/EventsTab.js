import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom"; // 🔥 FIX: Required for Portal
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Search,
  X,
  Ticket,
  Trash2,
  Activity,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyEvents } from "../../context/MyEventsContext";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../common/StatusBadge";
import { safeParseJson } from "../../utils/jsonUtils";
import StyledDropdown from "../StyledDropdown";
import SearchEmptyState from "../common/SearchEmptyState";
import EmptyState from "../common/EmptyState";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";
import LazyImage from "../common/LazyImage";

/* ---------------- Animations ---------------- */
const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: prefersReducedMotion ? 0 : i * 0.06,
      duration: prefersReducedMotion ? 0 : 0.4,
      ease: "easeOut",
    },
  }),
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 },
  },
});

/* ---------------- Event Status ---------------- */
const getEventStatus = (event) => {
  if (!event?.date) return "Unknown";
  const eventDate = new Date(event.date);
  const now = new Date();

  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (eventDate < now) return "Completed";
  if (eventDate.getTime() === now.getTime()) return "Today";
  return "Upcoming";
};

/* ---------------- Event Card ---------------- */
const EventCard = ({
  event,
  index,
  onRemoveRegistration,
  showCancel,
  onViewTicket,
  addToRecentEvents,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isOffline = useOfflineStatus();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const status = getEventStatus(event);

  const shortDate = event?.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";

    const handleCopyLink = async () => {
  try {
    const eventLink = `${window.location.origin}/events/${event.id || event.eventId}`;

    await navigator.clipboard.writeText(eventLink);

    toast.success("Link copied successfully");
  } catch (error) {
    toast.error("Failed to copy link");
  }
};

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl flex flex-col overflow-hidden"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="16/9"
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      )}

      {event?.description && (
        <div className="px-6 py-4">
          <p className="text-sm line-clamp-2">{event.description}</p>
        </div>
      )}

      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <MapPin size={14} /> {event?.location || "—"}
        </div>
        <div>
          <Clock size={14} /> {event?.time || "—"}
        </div>
        <div>
          <Tag size={14} /> {event?.type || "—"}
        </div>
        <div>
          <Calendar size={14} /> {shortDate}
        </div>
      </div>

      <div className="px-6 py-2 flex justify-between">
        <span className="text-xs">
          {showCancel ? "Registered" : "Hosted"}
        </span>
        <StatusBadge status={status} />
      </div>

      {event?.tags?.length > 0 && (
        <div className="px-6 pb-3 flex flex-wrap gap-1.5">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 bg-linear-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        {showCancel ? (
          <>
            <button
              className="group/btn w-full sm:flex-1"
              onClick={() => onRemoveRegistration?.(event?.id, event?.title)}
              disabled={isOffline}
            >
              <Trash2 size={13} /> Cancel
            </button>

            <button
              className="group/btn w-full sm:flex-1"
              onClick={() => onViewTicket?.(event)}
            >
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-650 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
                <Ticket size={13} className="relative" />
                <span className="relative">Ticket</span>
              </div>
            </button>
          </>
        ) : (
          <Link
            to={`/events/${event?.id}`}
            onClick={() => addToRecentEvents?.(event)}
          >
            <Activity size={13} /> Analytics
          </Link>
        )}

        <Link
          to={`/events/${event?.id}`}
          onClick={() => addToRecentEvents?.(event)}
        >
          View
        </Link>
      </div>

      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
        View Event Details
      </span>
    </motion.div>
  );
};

/* ---------------- Waitlist Card ---------------- */
const WaitlistCard = memo(({ event, index, onLeaveWaitlist }) => {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const { user } = useAuth();
  const [queuePos, setQueuePos] = useState(-1);

  useEffect(() => {
    if (!user) return;

    import("../../utils/waitlistUtils")
      .then(({ getQueuePosition }) => {
        setQueuePos(
          getQueuePosition(event.id, user.id || user.email)
        );
      })
      .catch(() => setQueuePos(-1));
  }, [event.id, user]);



 
  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] flex flex-col z-10 overflow-hidden"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="16/9"
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}
<div className="px-6 py-4 flex-1">
  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2 min-h-[56px] leading-snug mb-1">
    {event.title}
  </h4>

  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
    <div className="flex items-center gap-1.5">
      <Calendar size={12} /> {event.date}
    </div>

    <div className="flex items-center gap-1.5">
      <MapPin size={12} /> {event.location}
    </div>
  </div>
</div>

      <div className="px-6 py-3 bg-amber-50/50 dark:bg-amber-950/10 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
          Waitlist Position #{queuePos > 0 ? queuePos : "..."}
        </span>
        <button
          onClick={() => onLeaveWaitlist(event.id)}
          className="text-xs font-bold text-red-650 hover:text-red-750 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer"
        >
          Leave Waitlist
        </button>
      </div>
    </motion.div>
  );
});
WaitlistCard.displayName = "WaitlistCard";

/* ---------------- Main Component ---------------- */
const EventsTab = ({ hostedEvents = [], onViewTicket }) => {
  const prefersReducedMotion = useReducedMotion();
  const staggerVariants = stagger(prefersReducedMotion);

  const { myEvents, removeRegistration } = useMyEvents();
  const { user } = useAuth();
  const [waitlistEvents, setWaitlistEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  useEffect(() => {
    setIsLoading(true);
    if (user) {
      import("../../utils/waitlistUtils.js").then(({ getGlobalWaitlist }) => {
        const records = getGlobalWaitlist();
        const userId = user.id || user.email;
        const userWaitlists = records.filter(r => r.userId === userId && r.status === 'waiting');
        
        import("../../Pages/Events/eventsMockData.json").then(({ default: mockEvents }) => {
          const resolved = userWaitlists.map(w => {
            const foundEvent = mockEvents.find(e => e.id === w.eventId);
            if (foundEvent) {
              return {
                ...foundEvent,
                waitlistJoinedAt: w.joinedAt,
                isWaitlist: true,
              };
            }
            return {
              id: w.eventId,
              title: `Event #${w.eventId}`,
              date: "",
              time: "",
              location: "Details unavailable",
              type: "event",
              isWaitlist: true,
            };
          });
          setWaitlistEvents(resolved);
          setIsLoading(false);
      }).catch(() => {
  setWaitlistEvents([]);
  setIsLoading(false);
});
     }).catch(() => {
  setWaitlistEvents([]);
  setIsLoading(false);
});
    } else {
      setWaitlistEvents([]);
    }
  }, [user, waitlistUpdated]);

  const {
    searchTerm: searchQuery,
    debouncedTerm,
    setSearchTerm: setSearchQuery,
    isDebouncing,
  } = useDebouncedSearch("", 300);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("soonest");
  const [cancelTarget, setCancelTarget] = useState(null);

  const [recentSearches, setRecentSearches] = useState([]);

  const registeredEvents = useMemo(
    () =>
      myEvents.map((r) => ({
        ...r.event,
        registeredAt: r.registeredAt,
        eventId: r.eventId,
      })),
    [myEvents]
  );

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("recentEvents") || "[]"
    );
    setRecentEvents(stored);
    const saved = safeParseJson(localStorage.getItem("recentSearches"), []);
    setRecentSearches(saved);
  }, []);

  const addToRecentEvents = (event) => {
    const existing = JSON.parse(
      localStorage.getItem("recentEvents") || "[]"
    );

    const filtered = existing.filter((e) => e.id !== event.id);
    const updated = [event, ...filtered].slice(0, 6);

    localStorage.setItem(
      "recentEvents",
      JSON.stringify(updated)
    );
    setRecentEvents(updated);
  };

const normalizedSearch = debouncedTerm.trim().toLowerCase();


  const filteredEvents = useMemo(() => {
    const pool = [...registeredEvents, ...hostedEvents];
    const result = pool.filter((event) => {
      const searchTarget = `${event?.title || ""} ${event?.location || ""} ${event?.description || ""} ${(event?.tags || []).join(" ")}`.toLowerCase();
      const matchSearch = !debouncedTerm || searchTarget.includes(normalizedSearch);
      const status = getEventStatus(event);
      const matchStatus = filterStatus === "All" || status === filterStatus;
      const typeLabel = event?.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : "";
      const matchType = filterType === "All" || typeLabel === filterType;
      return matchSearch && matchStatus && matchType;
    });

    result.sort((a, b) => {
      if (sortBy === "soonest") {
        const da = a.date ? new Date(a.date) : new Date(0);
        const db = b.date ? new Date(b.date) : new Date(0);
        return da - db;
      }
      if (sortBy === "registered") {
        const da = a.registeredAt ? new Date(a.registeredAt) : new Date(0);
        const db = b.registeredAt ? new Date(b.registeredAt) : new Date(0);
        return db - da;
      }
      if (sortBy === "name") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return result;
  }, [registeredEvents, hostedEvents, debouncedTerm, filterStatus, filterType, sortBy]);

  useEffect(() => {
    if (debouncedTerm && debouncedTerm.trim().length > 1) {
      let saved = [];
      try {
        const raw = localStorage.getItem("recentSearches");
        saved = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(saved)) saved = [];
      } catch (e) {
        saved = [];
      }
      
      const updatedHistory = [
        debouncedTerm.trim(),
        ...saved.filter((term) => term.toLowerCase() !== debouncedTerm.trim().toLowerCase())
      ].slice(0, 5);

      localStorage.setItem("recentSearches", JSON.stringify(updatedHistory));
      setRecentSearches(updatedHistory);
    }
  }, [debouncedTerm]);

  const filteredRegisteredEvents = filteredEvents.filter((event) => event.registeredAt);
  const filteredHostedEvents = filteredEvents.filter((event) => !event.registeredAt);

  const registeredCount = registeredEvents.length;
  const hostedCount = hostedEvents.length;
  const upcomingCount = [...registeredEvents, ...hostedEvents].filter((event) => getEventStatus(event) === "Upcoming").length;
  const completedCount = [...registeredEvents, ...hostedEvents].filter((event) => getEventStatus(event) === "Completed").length;

  const toggleSection = (section) => {
  setCollapsedSections((prev) => ({
    ...prev,
    [section]: !prev[section],
  }));
};

const togglePinnedEvent = (event) => {
  const exists = pinnedEvents.some(
    (item) => item.id === event.id
  );

  if (exists) {
    setPinnedEvents((prev) =>
      prev.filter((item) => item.id !== event.id)
    );

    toast.info("Event unpinned");
  } else {
    setPinnedEvents((prev) => [
      event,
      ...prev,
    ]);

    toast.success("Event pinned");
  }
};
  const handleCancelClick = (id, title) => setCancelTarget({ id, title });
  const handleCancelDismiss = () => setCancelTarget(null);
  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;
    removeRegistration(cancelTarget.id);
    setCancelTarget(null);
  }, [cancelTarget, removeRegistration]);

  const saveCurrentPreset = () => {
  const preset = {
    id: Date.now(),
    searchQuery,
    filterStatus,
    filterType,
    sortBy,
  };

  const updated = [
    preset,
    ...recentPresets.filter(
      (p) =>
        !(
          p.searchQuery === preset.searchQuery &&
          p.filterStatus === preset.filterStatus &&
          p.filterType === preset.filterType &&
          p.sortBy === preset.sortBy
        )
    ),
  ].slice(0, 5);

  setRecentPresets(updated);

  localStorage.setItem(
    "recentEventPresets",
    JSON.stringify(updated)
  );

  toast.success("Filter preset saved");
};

const applyPreset = (preset) => {
  setSearchQuery(preset.searchQuery);
  setFilterStatus(preset.filterStatus);
  setFilterType(preset.filterType);
  setSortBy(preset.sortBy);

  toast.success("Preset applied");
};

  return (
    <motion.div className="ud-content">
      <div className="ud-tab-header">
        <h2>
          <Calendar /> Events
        </h2>
      </div>
      {registeredCount + hostedCount > 0 && (
        <motion.div className="my-events-summary" variants={staggerVariants} initial="hidden" animate="visible">
          {[
            { label: "Registered", value: registeredCount, color: "#6366f1" },
            { label: "Hosted", value: hostedCount, color: "#ec4899" },
            { label: "Upcoming", value: upcomingCount, color: "#10b981" },
            { label: "Completed", value: completedCount, color: "#94a3b8" },
          ].map((pill) => (
            <motion.div
              key={pill.label}
              className="my-events-pill"
              variants={fadeUpVariants}
              style={{ "--pill-color": pill.color }}
            >
              <span className="my-events-pill-value">{pill.value}</span>
              <span className="my-events-pill-label">{pill.label}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {registeredCount + hostedCount === 0 ? (
        <EmptyState
          title="No events yet"
          description="You have not registered for or hosted any events yet. Explore upcoming events to get started."
          icon={Ticket}
          actionLabel="Explore Events"
          actionPath="/events"
        />
      ) : (
        <div className="my-events-container">
          <div className="my-events-toolbar">
            <div className="ud-search-wrap my-events-search">
              <Search size={14} className="ud-search-icon" />
              <input
                className="ud-search focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                placeholder="Search your events…"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                }}
              />
              {searchQuery && (
                <button className="ud-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search query">
                  <X size={13} />
                </button>
              )}
              {isDebouncing && (
                <span
                  className="ud-search-spinner"
                  aria-label="Searching…"
                  style={{
                    position: "absolute",
                    right: searchQuery ? 32 : 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 14,
                    height: 14,
                    border: "2px solid #6366f1",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              )}
            </div>
            
            {recentSearches.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem("recentSearches");
                  setRecentSearches([]);
                }}
                className="text-sm text-red-500 hover:underline mt-2"
              >
                Clear History
              </button>
            )}

            <StyledDropdown
            aria-label="Event filter dropdown"
              label=""
              value={filterStatus === "All" ? "" : filterStatus}
              placeholder="All Statuses"
              options={["Upcoming", "Today", "Completed"]}
              onChange={(val) => setFilterStatus(val || "All")}
            />

            {availableTypes.length > 1 && (
              <StyledDropdown
                label=""
                value={filterType === "All" ? "" : filterType}
                placeholder="All Types"
                options={availableTypes}
                onChange={(val) => setFilterType(val || "All")}
              />
            )}

            <StyledDropdown
              label=""
              value={
                sortBy === "soonest"
                  ? "Soonest First"
                  : sortBy === "registered"
                  ? "Registration Date"
                  : "Event Name"
              }
              placeholder="Sort by"
              options={["Soonest First", "Registration Date", "Event Name"]}
              onChange={(val) => {
                if (val === "Soonest First" || !val) setSortBy("soonest");
                else if (val === "Registration Date") setSortBy("registered");
                else if (val === "Event Name") setSortBy("name");
              }}
            />
          </div>

          {/* Recent Events */}
          {recentEvents.length > 0 && (
            <section>
              <h2>Recently Viewed</h2>
              {recentEvents.map((item) => (
                <div key={item.id}>
                  <h3>{item.title}</h3>
                  <Link to={`/events/${item.id}`}>View</Link>
                </div>
              ))}
            </section>
          )}

          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full mt-4"
            >
              <SearchEmptyState
                query={searchQuery}
                itemLabel="events"
                browseLabel="Browse Events"
                browsePath="/events"
                onClear={() => {
                  setSearchQuery("");
                  setFilterStatus("All");
                  setFilterType("All");
                  setSortBy("soonest");
                  removeFromStorage("eventSearchQuery");
                  removeFromStorage("eventFilterStatus");
                  removeFromStorage("eventFilterType");
                  removeFromStorage("eventSortBy");
                }}
              />
            </motion.div>
          ) : (
            <>
              {filteredRegisteredEvents.length > 0 && (
                <section className="space-y-4">
                  <div className="ud-tab-header">
                    <h3 className="ud-page-title bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent font-extrabold">
                      <Ticket size={18} /> Registered Events
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {filteredRegisteredEvents.length} event{filteredRegisteredEvents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <motion.div className="ud-items-grid" variants={staggerVariants} initial="hidden" animate="visible">
                    {filteredRegisteredEvents.map((event, index) => (
                      <EventCard
                        key={event.eventId || event.id}
                        event={event}
                        index={index}
                        onRemoveRegistration={handleCancelClick}
                        showCancel
                        onViewTicket={onViewTicket}
                        onViewRecent={addToRecentEvents}
                      />
                    ))}
                  </motion.div>
                </section>
              )}

              {filteredHostedEvents.length > 0 && (
                <section className="space-y-4">
                  <div className="ud-tab-header">
                    <h3 className="ud-page-title">
                      <Calendar size={18} /> Hosted Events
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {filteredHostedEvents.length} event{filteredHostedEvents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <motion.div className="ud-items-grid" variants={staggerVariants} initial="hidden" animate="visible">
                    {filteredHostedEvents.map((event, index) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        index={index}
                        showCancel={false}
                        onViewRecent={addToRecentEvents}
                      />
                    ))}
                  </motion.div>
                </section>
              )}

              {waitlistEvents.length > 0 && (
                <section className="space-y-4 mt-6">
                  <div className="ud-tab-header">
                    <h3 className="ud-page-title flex items-center gap-2">
                      <Clock size={18} className="text-amber-500" /> Waitlisted Events
                    </h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {waitlistEvents.length} event{waitlistEvents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <motion.div className="ud-items-grid" variants={staggerVariants} initial="hidden" animate="visible">
                    {waitlistEvents.map((event, index) => (
                      <WaitlistCard
                        key={event.id}
                        event={event}
                        index={index}
                        onLeaveWaitlist={async (id) => {
                          if (window.confirm(`Are you sure you want to leave the waitlist for "${event.title}"?`)) {
                            try {
                              const { leaveWaitlist } = await import("../../utils/waitlistUtils.js");
                              await leaveWaitlist(id, user.id || user.email);
                              toast.success("Left the waitlist successfully.");
                              triggerWaitlistUpdate();
                            } catch (err) {
                              toast.error(err.message || "Failed to leave waitlist.");
                            }
                          }
                        }}
                      />
                    ))}
                  </motion.div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* Cancel Modal (FIXED PORTAL LOCATION) */}
      <AnimatePresence>
        {cancelTarget &&
          ReactDOM.createPortal(
            <div
              className="backdrop"
              onClick={() => setCancelTarget(null)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <h3>Cancel?</h3>
                <button onClick={handleCancelConfirm}>
                  Yes
                </button>
<button
  onClick={() => handleCopyEventLink(event?.id)}
  aria-label="Copy event link"
  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
>
  <Copy size={16} />
  Copy Link
</button>

              </div>
            </div>,
            document.body
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventsTab;