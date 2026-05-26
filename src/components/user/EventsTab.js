import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Search,
  X,
  Ticket,
  Trash2,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useMyEvents } from "../../context/MyEventsContext";
import StatusBadge from "../common/StatusBadge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

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

const EmptyState = () => (
  <motion.div
    className="my-events-empty"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
  >
    <div className="my-events-empty-icon">
      <Ticket size={40} />
    </div>
    <h3 className="my-events-empty-title">No events yet</h3>
    <p className="my-events-empty-sub">
      You have not registered for or hosted any events yet. Explore upcoming events to get started.
    </p>
    <Link
      to="/events"
      className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:scale-105 hover:bg-blue-200 dark:hover:bg-blue-800 my-events-empty-cta"
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
  </motion.div>
);

const EventCard = ({ event, index, onRemoveRegistration, showCancel }) => {
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
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full opacity-20 group-hover:animate-pulse" />
        <div className="absolute top-1/2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 group-hover:animate-bounce" />
        <div className="absolute bottom-4 right-1/4 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 group-hover:animate-ping" />
      </div>

      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50 transition-all duration-500" />
        </div>
      )}

      {event?.description && (
        <div className="px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/50 bg-gradient-to-r from-transparent to-indigo-50/30 dark:to-indigo-950/30">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>
      )}

      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm bg-gradient-to-br from-gray-50/50 to-indigo-50/30 dark:from-gray-800/50 dark:to-indigo-950/30">
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex-shrink-0">
            <MapPin size={14} className="text-pink-500" />
          </div>
          <span className="truncate font-medium">{event?.location || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Clock size={14} className="text-blue-500" />
          </div>
          <span className="font-medium">{event?.time || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
            <Tag size={14} className="text-green-500" />
          </div>
          <span className="font-medium capitalize">{event?.type || "—"}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all duration-300">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
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

      <div className="px-6 py-4 flex gap-3 bg-gradient-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        {showCancel ? (
          <button
            className="group/btn flex-1"
            onClick={() => onRemoveRegistration?.(event?.id, event?.title)}
          >
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-900 text-white px-5 py-2.5 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-900 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
              <Trash2 size={13} className="relative" />
              <span className="relative">Cancel</span>
            </div>
          </button>
        ) : (
          <div className="flex-1" />
        )}
        <Link to={`/events/${event?.id}`} className="group/btn flex-1">
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full">
            <span>{showCancel ? "View Details" : "Open Event"}</span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

const EventsTab = ({ hostedEvents = [] }) => {
  const { myEvents, removeRegistration } = useMyEvents();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortBy, setSortBy] = useState("soonest");
  const [cancelTarget, setCancelTarget] = useState(null);

  const registeredEvents = useMemo(
    () =>
      myEvents.map((registration) => ({
        ...registration.event,
        registeredAt: registration.registeredAt,
        eventId: registration.eventId,
      })),
    [myEvents]
  );

  const availableTypes = useMemo(() => {
    const types = [...new Set([...registeredEvents, ...hostedEvents].map((event) => event?.type).filter(Boolean))];
    return types.map((type) => type.charAt(0).toUpperCase() + type.slice(1));
  }, [registeredEvents, hostedEvents]);

  const filteredEvents = useMemo(() => {
    const pool = [...registeredEvents, ...hostedEvents];
    const result = pool.filter((event) => {
      const searchTarget = `${event?.title || ""} ${event?.location || ""} ${event?.description || ""} ${(event?.tags || []).join(" ")}`.toLowerCase();
      const matchSearch = !searchQuery || searchTarget.includes(searchQuery.toLowerCase());
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
  }, [registeredEvents, hostedEvents, searchQuery, filterStatus, filterType, sortBy]);

  const filteredRegisteredEvents = filteredEvents.filter((event) => event.registeredAt);
  const filteredHostedEvents = filteredEvents.filter((event) => !event.registeredAt);

  const registeredCount = registeredEvents.length;
  const hostedCount = hostedEvents.length;
  const upcomingCount = [...registeredEvents, ...hostedEvents].filter((event) => getEventStatus(event) === "Upcoming").length;
  const completedCount = [...registeredEvents, ...hostedEvents].filter((event) => getEventStatus(event) === "Completed").length;

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
        <motion.div className="my-events-summary" variants={stagger} initial="hidden" animate="visible">
          {[
            { label: "Registered", value: registeredCount, color: "#6366f1" },
            { label: "Hosted", value: hostedCount, color: "#ec4899" },
            { label: "Upcoming", value: upcomingCount, color: "#10b981" },
            { label: "Completed", value: completedCount, color: "#94a3b8" },
          ].map((pill) => (
            <motion.div
              key={pill.label}
              className="my-events-pill"
              variants={fadeUp}
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
          </div>

          <div className="my-events-filter-wrap">
            <Filter size={13} className="my-events-filter-icon" />
            <select
              className="ud-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {["All", "Upcoming", "Today", "Completed"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>

          {availableTypes.length > 1 && (
            <div className="my-events-filter-wrap">
              <select
                className="ud-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {["All", ...availableTypes].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div className="my-events-filter-wrap">
            <ArrowUpDown size={13} className="my-events-filter-icon" />
            <select
              className="ud-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="soonest">Soonest First</option>
              <option value="registered">Registration Date</option>
              <option value="name">Event Name</option>
            </select>
          </div>
        </div>
      )}

      {registeredCount + hostedCount === 0 ? (
        <EmptyState />
      ) : filteredEvents.length === 0 ? (
        <motion.div
          className="my-events-no-results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p>No events match your search / filter.</p>
          <button
            className="my-events-clear-filters"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
              setFilterType("All");
              setSortBy("soonest");
            }}
          >
            Clear filters
          </button>
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
              <motion.div className="ud-items-grid" variants={stagger} initial="hidden" animate="visible">
                {filteredRegisteredEvents.map((event, index) => (
                  <EventCard
                    key={event.eventId || event.id}
                    event={event}
                    index={index}
                    onRemoveRegistration={handleCancelClick}
                    showCancel
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
              <motion.div className="ud-items-grid" variants={stagger} initial="hidden" animate="visible">
                {filteredHostedEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    showCancel={false}
                  />
                ))}
              </motion.div>
            </section>
          )}
        </>
      )}

      <AnimatePresence>
        {cancelTarget && (
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventsTab;
