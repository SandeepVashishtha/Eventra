import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
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

      <div className="px-6 py-4 flex gap-3">
        {showCancel ? (
          <>
            <button
              onClick={() =>
                onRemoveRegistration?.(event?.id, event?.title)
              }
              disabled={isOffline}
            >
              <Trash2 size={13} /> Cancel
            </button>

            <button onClick={() => onViewTicket?.(event)}>
              <Ticket size={13} /> Ticket
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
    </motion.div>
  );
};

/* ---------------- Waitlist Card ---------------- */
const WaitlistCard = ({ event }) => {
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
    <div className="p-4 rounded-xl border">
      <h4>{event.title}</h4>
      <p>Position #{queuePos > 0 ? queuePos : "..."}</p>
    </div>
  );
};

/* ---------------- Main Component ---------------- */
const EventsTab = ({ hostedEvents = [], onViewTicket }) => {
  const prefersReducedMotion = useReducedMotion();
  const staggerVariants = stagger(prefersReducedMotion);

  const { myEvents, removeRegistration } = useMyEvents();
  const { user } = useAuth();

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
  const [recentEvents, setRecentEvents] = useState([]);

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

  const filteredEvents = useMemo(() => {
    const pool = [...registeredEvents, ...hostedEvents];

    return pool.filter((event) => {
      const text =
        `${event?.title} ${event?.location} ${event?.description}`.toLowerCase();

      return !debouncedTerm ||
        text.includes(debouncedTerm.toLowerCase());
    });
  }, [registeredEvents, hostedEvents, debouncedTerm]);

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    removeRegistration(cancelTarget.id);
    setCancelTarget(null);
  };

  return (
    <motion.div className="ud-content">
      <div className="ud-tab-header">
        <h2>
          <Calendar /> Events
        </h2>
      </div>

      {/* Search Empty State FIXED OUTSIDE PROPS */}
      <SearchEmptyState
        query={searchQuery}
        itemLabel="events"
        browseLabel="Browse Events"
        browsePath="/events"
        onClear={() => setSearchQuery("")}
      />

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
              </div>
            </div>,
            document.body
          )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EventsTab;