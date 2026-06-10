import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom"; // 🔥 FIX: Required for Portal
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from '../../hooks/useReducedMotion';
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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyEvents } from "../../context/MyEventsContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import StatusBadge from "../common/StatusBadge";
import { safeParseJson } from "../../utils/jsonUtils";
import StyledDropdown from "../StyledDropdown";
import SearchEmptyState from "../common/SearchEmptyState";
import EmptyState from "../common/EmptyState";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";
import LazyImage from "../common/LazyImage";
import { SEARCH_ROUTES } from "../../constants/routes";
import { SEARCH_ROUTES } from "../Hero";

const SEARCH_ROUTES = {
  events: "/events",
  hackathons: "/hackathons",
  projects: "/projects",
  networking: "/networking"
};

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: prefersReducedMotion ? 0 : i * 0.06, duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' },
  }),
});

const stagger = (prefersReducedMotion) => ({
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 } },
});

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

const EventCard = ({ event, index, onRemoveRegistration, showCancel, onViewTicket }) => {
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

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-500 flex flex-col z-10 hover:z-50 overflow-hidden"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-linear-to-br from-gray-500 to-gray-700 rounded-full opacity-20 group-hover:animate-pulse" />
        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-linear-to-br from-pink-400 to-red-500 rounded-full opacity-20 group-hover:animate-bounce" />
        <div className="absolute bottom-4 right-1/4 w-6 h-6 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:animate-ping" />
      </div>

      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="16/9"
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500" />
        </div>
      )}

      {event?.description && (
        <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/50 bg-linear-to-r from-transparent to-indigo-50/30 dark:to-indigo-950/30">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      )}

      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm bg-linear-to-br from-gray-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/30">
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg shrink-0">
            <MapPin size={14} className="text-pink-500" />
          </div>
          <span className="truncate font-medium">{event?.location || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
            <Clock size={14} className="text-blue-500" />
          </div>
          <span className="font-medium">{event?.time || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg shrink-0">
            <Tag size={14} className="text-green-500" />
          </div>
          <span className="font-medium capitalize">{event?.type || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg shrink-0">
            <Calendar size={14} className="text-indigo-500" />
          </div>
          <span className="font-medium">{shortDate}</span>
        </div>
      </div>

      <div className="px-6 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Clock size={11} /> {showCancel ? "Registered" : "Hosted"} {event?.registeredAt ? new Date(event.registeredAt).toLocaleDateString() : ""}
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

      <div className="px-6 py-4 flex gap-3 bg-linear-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        {showCancel ? (
          <>
            <button
              className="group/btn flex-1"
              onClick={() => onRemoveRegistration?.(event?.id, event?.title)}
              disabled={isOffline}
              title={isOffline ? "Action unavailable offline" : "Cancel registration"}
              aria-disabled={isOffline}
              style={isOffline ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-900 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
                <Trash2 size={13} className="relative" />
                <span className="relative">Cancel</span>
              </div>
            </button>
            <button
              className="group/btn flex-1"
              onClick={() => onViewTicket?.(event)}
            >
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-650 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
                <Ticket size={13} className="relative" />
                <span className="relative">Ticket</span>
              </div>
            </button>
          </>
        ) : (
          <Link 
          to={`/events/${event?.id}`}
             onClick={() => addToRecentEvents(event)}
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
              <Activity size={13} className="relative" />
              <span className="relative">Analytics</span>
            </div>
          </Link>
        )}
        <Link 
          to={`/events/${event?.id}`}
            onClick={() => addToRecentEvents(event)}
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full">
            <span>{showCancel ? "View Details" : "Open Event"}</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

const WaitlistCard = ({ event, index, onLeaveWaitlist }) => {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const { user } = useAuth();
  const [queuePos, setQueuePos] = useState(-1);

  useEffect(() => {
    if (user) {
      import("../../utils/waitlistUtils").then(({ getQueuePosition }) => {
        setQueuePos(getQueuePosition(event.id, user.id || user.email));
      }).catch(() => setQueuePos(-1));
    }
  }, [event.id, user]);


  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl backdrop-blur-sm transition-all duration-500 flex flex-col z-10 overflow-hidden"
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
        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate mb-1">{event.title}</h4>
        <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><Calendar size={12} /> {event.date}</div>
          <div className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</div>
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
};

const EventsTab = ({ hostedEvents = [], onViewTicket }) => {
  const prefersReducedMotion = useReducedMotion();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const staggerVariants = stagger(prefersReducedMotion);
  const { myEvents, removeRegistration, waitlistUpdated, triggerWaitlistUpdate } = useMyEvents();
  const { user } = useAuth();
  const [waitlistEvents, setWaitlistEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  useEffect(() => {
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
        }).catch(() => setWaitlistEvents([]));
      }).catch(() => setWaitlistEvents([]));
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
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const [recentSearches, setRecentSearches] = useState([]);

  const registeredEvents = useMemo(
    () =>
      myEvents.map((registration) => ({
        ...registration.event,
        registeredAt: registration.registeredAt,
        eventId: registration.eventId,
      })),
    [myEvents]
  );

  useEffect(() => {
    const saved = safeParseJson(localStorage.getItem("recentSearches"), []);
    setRecentSearches(saved);
  }, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false);
  }, 1500);

  return () => clearTimeout(timer);
}, []);


useEffect(() => {
  const storedRecent = JSON.parse(
    localStorage.getItem("recentEvents") || "[]"
  );

  setRecentEvents(storedRecent);
}, []);



  const availableTypes = useMemo(() => {
    const types = [...new Set([...registeredEvents, ...hostedEvents].map((event) => event?.type).filter(Boolean))];
    return types.map((type) => type.charAt(0).toUpperCase() + type.slice(1));
  }, [registeredEvents, hostedEvents]);
const filteredEvents = useMemo(() => {
    const pool = [...registeredEvents, ...hostedEvents];
    const result = pool.filter((event) => {
      const searchTarget = `${event?.title || ""} ${event?.location || ""} ${event?.description || ""} ${(event?.tags || []).join(" ")}`.toLowerCase();
      const matchSearch = !debouncedTerm || searchTarget.includes(debouncedTerm.toLowerCase());
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

const addToRecentEvents = (event) => {
  const existing =
    JSON.parse(localStorage.getItem("recentEvents")) || [];

  const filtered = existing.filter((e) => e.id !== event.id);

  const updated = [event, ...filtered].slice(0, 6);

  localStorage.setItem("recentEvents", JSON.stringify(updated));

  setRecentEvents(updated);
};



  const handleCancelClick = (id, title) => setCancelTarget({ id, title });
  const handleCancelDismiss = () => setCancelTarget(null);
  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    removeRegistration(cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <motion.div
      key="events"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ud-content"
    >
      <div className="ud-tab-header">
        <h2 className="ud-page-title">
          <Calendar size={20} /> Events
        </h2>
        <Link
          to="/events"
          className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          <span className="relative z-10 flex items-center">
            Explore Events
            <svg
              className="ml-3 w-5 h-5 text-black dark:text-white transition-transform duration-300 group-hover:translate-x-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </Link>
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

      {registeredCount + hostedCount > 0 && (
        <div className="my-events-toolbar">
          <div className="ud-search-wrap my-events-search">
            <Search size={14} className="ud-search-icon" />
            <input
              className="ud-search"
              placeholder="Search your events…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      )}



      {recentEvents.length > 0 && (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Recently Viewed
      </h2>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2">
      {recentEvents.map((item) => (
        <div
          key={item.id}
          className="min-w-[260px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-4"
        >
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
            {item.title || item.name}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {item.date || "Upcoming Event"}
          </p>

          <Link
            to={`/events/${item.id}`}
            className="inline-flex items-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium transition"
          >
            View Event
          </Link>
        </div>
      ))}
    </div>
  </section>
)}

      {registeredCount + hostedCount === 0 ? (
        <EmptyState
          title="No events yet"
          description="You have not registered for or hosted any events yet. Explore upcoming events to get started."
          icon={Ticket}
          actionLabel="Explore Events"
          actionPath="/events"
        />
      ) : filteredEvents.length === 0 ? (
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
            }}
          />
        </motion.div>
      ) : (
        <>
          {filteredRegisteredEvents.length > 0 && (
            <section className="space-y-4">
              <div className="ud-tab-header">
                <h3 className="ud-page-title">
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
                  />
                ))}
              </motion.div>
            </section>
          )}

        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-3" />

        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700 mb-2" />

        <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 mb-6" />

        <div className="flex gap-3">
          <div className="h-10 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 flex-1 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    ))}
  </div>
) : registeredCount + hostedCount === 0 ? (
  <EmptyState />
) : filteredEvents.length === 0 ? (
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
      }}
    />
  </motion.div>
) : (
  <>
      {/* 🔥 FIX 1: Portaled the modal out of the Framer Motion stacking context trap */}
      <AnimatePresence>
        {cancelTarget && ReactDOM.createPortal(
          <motion.div
            className="my-events-dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancelDismiss}
          >
            <motion.div
              className="my-events-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="my-events-dialog-title">Cancel Registration?</h3>
              <p className="my-events-dialog-body">
                Remove <strong>{cancelTarget.title}</strong> from your registrations?
              </p>
              <div className="my-events-dialog-actions">
                <button className="my-events-dialog-cancel" onClick={handleCancelDismiss}>
                  Keep it
                </button>
                <button className="my-events-dialog-confirm" onClick={handleCancelConfirm}>
                  Yes, remove
                </button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventsTab;