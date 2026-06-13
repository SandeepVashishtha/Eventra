import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
// Calendar URL helpers — import from the timezone-aware utility instead of
// using the old inline implementations (which were UTC-blind and hardcoded
// a 1-hour event duration — fixed in issue #2015).
import { getGoogleCalendarUrl, getOutlookCalendarUrl, getYahooCalendarUrl, generateIcsFileBlobUrl, getWebcalSubscriptionUrl } from "../../utils/calendarUrlUtils";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import hackathonsData from "../Hackathons/hackathonMockData.json";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
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
import { toast } from "react-toastify";
import StatusBadge from "../common/StatusBadge";
import { safeParseJson } from "../../utils/jsonUtils";
import StyledDropdown from "../StyledDropdown";
import SearchEmptyState from "../common/SearchEmptyState";
import EmptyState from "../common/EmptyState";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";
import LazyImage from "../common/LazyImage";

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



const EventCard = ({ event, index, onRemoveRegistration, showCancel, onViewTicket, onViewRecent }) => {
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
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] flex flex-col z-10 hover:z-50 overflow-hidden"
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
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent group-hover:from-black/50transition-all duration-500 hover:scale-[1.02]" />
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

      <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 bg-linear-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        {showCancel ? (
          <>
            <button
             className="group/btn w-full sm:flex-1"
              onClick={() => onRemoveRegistration?.(event?.id, event?.title)}
              disabled={isOffline}
              title={isOffline ? "Action unavailable offline" : "Cancel registration"}
              aria-disabled={isOffline}
              style={isOffline ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 hover:from-slate-900 hover:via-slate-800 hover:to-indigo-900 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
                <Trash2 size={13} className="relative" />
                <span className="relative">Cancel</span>
              </div>
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
            onClick={() => onViewRecent?.(event)}
          >
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
              <Activity size={13} className="relative" />
              <span className="relative">Analytics</span>
            </div>
          </Link>
        )}
        <Link 
          to={`/events/${event?.id}`}
          onClick={() => onViewRecent?.(event)}
        >
          <div className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 w-full">
            <span>{showCancel ? "View Details" : "Open Event"}</span>
          </div>
        </Link>
      </div>

      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
        View Event Details
      </span>
    </motion.div>
  );
};

const WaitlistCard = memo(({ event, index, onLeaveWaitlist }) => {
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
// Fix #8507: Replace arbitrary 1500 ms timer with data-driven loading.
// The previous timer could leave users staring at a spinner for 1.5 seconds
// even when data was already available, and would never recover after an error.
useEffect(() => {
  // myEvents is sourced from MyEventsContext — once the context has initialised
  // (array present, even if empty) we are ready to render.
  setLoading(false);
}, [myEvents]);


useEffect(() => {
  const storedRecent = JSON.parse(
    localStorage.getItem("recentEvents") || "[]"
  );

    // FIX (TOCTOU): Re-check capacity immediately before the POST so the
    // endpoint decision is based on fresh server data, not on the stale
    // React state snapshotted when handleSubmit ran. This collapses the
    // check-then-act window to the minimum possible latency (one request).
    // refreshEventAvailability also calls setEvent with the latest data, so
    // the local event state is updated as a side-effect.
    let isFreshlyFull = false;
    try {
      const latestAvailability = await refreshEventAvailability(eventId);
      isFreshlyFull = latestAvailability != null
        ? latestAvailability.isFull
        : (event ? event.attendees >= event.maxAttendees : false);
    } catch {
      // If the availability refresh itself fails, fall back to local state
      // rather than blocking registration entirely.
      isFreshlyFull = event ? event.attendees >= event.maxAttendees : false;
    }

    if (isFreshlyFull) {
      try {
        const { joinWaitlist, getQueuePosition } = await import("../../utils/waitlistUtils");
        await joinWaitlist(eventId, user, { ...formData, eventTitle: event?.title || "the event" });
        const pos = getQueuePosition(eventId, user.id);
        setWaitlistPosition(pos);
        setRegistered(true);
        toast.success(t("eventRegistration.toastWaitlistSuccess"));
        clearSession();
        return;
      } catch (err) {
        toast.error(err.message || t("eventRegistration.toastRegistrationError"));
        return;
      } finally {
        registrationLocks.delete(eventId);
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
    }

    const endpoint = API_ENDPOINTS.EVENTS?.REGISTER
        ? API_ENDPOINTS.EVENTS.REGISTER(eventId)
        : `/api/events/${eventId}/register`;

        // FIX (offline queue dedup): Generate a stable idempotency key once per
        // submission attempt. It travels with the payload to the backend (which
        // should honour it for duplicate detection) and is also passed to
        // pushToQueue so the queue can deduplicate by eventId+userId before
        // writing to IndexedDB / localStorage.
        const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const response = await apiUtils.post(
        endpoint,
        {
          ...formData,
          priority: formData.priority,
          eventId: parseInt(eventId),
          idempotencyKey,
        },
        token
      );

      const regData = response.data || {};
      const registrationId = regData.registrationId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}`);
      const qrToken = regData.qrToken || "";

      setRegistered(true);
      toast.success(t("eventRegistration.toastRegistrationSuccess"));
      addRegistration(event, formData, registrationId, qrToken);
      clearSession();
    } catch (error) {
      const failureMessage = getRegistrationFailureMessage(error);

      if (isCapacityConflictError(error)) {
        await refreshEventAvailability(eventId);
      }

      const isOfflineFailure = error?.isNetworkError || error?.isTimeout;
      const isAlreadyRegistered = failureMessage === "You are already registered for this event.";

      if (isOfflineFailure) {
        const payload = {
          ...formData,
          eventId: parseInt(eventId),
          // Carry the idempotency key into the queued payload so that when
          // the queue replays, the backend rejects any true duplicate.
          idempotencyKey,
        };

        const success = await pushToQueue(
          {
            actionType: isFreshlyFull ? "JOIN_WAITLIST" : "REGISTER_EVENT",
            endpoint,
            eventId: parseInt(eventId),
            // FIX (offline queue dedup): Pass at the item level so pushToQueue
            // can skip enqueueing if an identical eventId+userId+actionType
            // entry already exists in the queue.
            idempotencyKey,
            payload,
          },
          user.id
        );

        if (success) {
          setRegistered(true);
          const offlineRegId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-offline-${Date.now()}`;
          addRegistration(event, formData, offlineRegId, "");
          clearSession();
          toast.warning(t("eventRegistration.toastNetworkQueued"), {
            autoClose: 4000,
          });
        } else {
          toast.error(
            t("eventRegistration.toastOfflineQueueFull")
          );
        }
        return;
      }

      if (isAlreadyRegistered) {
        setRegistered(true);
        toast.success(isFreshlyFull ? t("eventRegistration.toastWaitlistSuccess") : t("eventRegistration.toastRegistrationSuccess"));
        const existingRegId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-existing-${Date.now()}`;
        // Do not pass the current form values — the server rejected this
        // submission as a duplicate, so formData is unconfirmed. Storing it
        // would overwrite the locally-cached registration with values that
        // may differ from the authoritative server record.
        addRegistration(event, {}, existingRegId, "");
        clearSession();
        toast.info(failureMessage);
        return;
      }

      toast.error(failureMessage);
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    eventId,
    event,
    formData,
    isAuthenticated,
    user,
    token,
    navigate,
    registrationPath,
    addRegistration,
    clearSession,
    refreshEventAvailability,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!isAuthenticated() || !user?.id) {
      toast.error(t("eventRegistration.toastLoginRequired"));
      navigate("/login", {
        state: { from: registrationPath },
      });
      return;
    }

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

  const handleConflictProceed = useCallback(() => {
    if (isSubmittingRef.current) {
      return;
    }
    if (registrationLocks.has(eventId)) {
      return;
    }
    isSubmittingRef.current = true;
    registrationLocks.set(eventId, true);
    proceedWithRegistration();
  }, [eventId, proceedWithRegistration]);

  const handleSelectAlternative = useCallback((alternativeEvent) => {
    setShowConflictModal(false);
    navigate(`/events/${alternativeEvent.id}/register`);
    toast.info(t("eventRegistration.toastRedirectingTo", { title: alternativeEvent.title }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const isEventFull = event ? event.attendees >= event.maxAttendees : false;
  const status = getEventStatus(event);
  // const isPastEvent = status === "past" || status === "ended";
  const isCancelledEvent = status === "cancelled";
  const isRegistrationBlocked = isEventRegistrationClosed(event);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-12 px-4">
        <SkeletonEventCard />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("eventRegistration.notFoundTitle")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {t("eventRegistration.notFoundDescription")}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("eventRegistration.notFoundBackToEvents")}
        </Link>
      </div>
    );
  }

  if (isRegistrationBlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t("eventRegistration.pastEventTitle")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {isCancelledEvent
            ? "This event has been cancelled."
            : t("eventRegistration.pastEventDescription")}
        </p>
        <Link
          to={isHackathonPath ? `/hackathons/${event.id}` : `/events/${event.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("eventRegistration.pastEventBackToDetails")}
        </Link>
      </div>
    );
  }


  // Show skeleton while joining the waitlist specifically
  if (submitting && isEventFull) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 gap-4">
        <WaitlistSkeleton />
        <WaitlistPositionSkeleton />
        <p className="sr-only" role="status" aria-live="polite">
          Joining the waitlist, please wait…
        </p>
      </div>
    );
  }

  if (registered) {
    const googleCalendarUrl = getGoogleCalendarUrl(event);
    const outlookCalendarUrl = getOutlookCalendarUrl(event);
    const yahooCalendarUrl = getYahooCalendarUrl(event);
    const webcalUrl = event.id ? getWebcalSubscriptionUrl(event.id) : generateIcsFileBlobUrl(event);
    const shareText = `I'm attending ${event.title} on Eventra! Join me there!`;
    const shareUrl = `${window.location.origin}/events/${event.id}`;

    const handleNativeShare = () => {
      if (navigator.share) {
        navigator
          .share({
            title: event.title,
            text: shareText,
            url: shareUrl,
          })
          .catch((err) => {
            if (err.name !== "AbortError") {
              toast.error(t("eventRegistration.toastShareError"));
            }
          });
      } else {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            toast.success(t("eventRegistration.toastLinkCopied"));
          })
          .catch((err) => {
            logger.error("Failed to copy link:", err);
            toast.error(t("eventRegistration.toastCopyLinkError"));
          });
      }
    };

  const filtered = existing.filter((e) => e.id !== event.id);

  const updated = [{ id: event.id, title: event.title || event.name, date: event.date }, ...filtered].slice(0, 6);

  localStorage.setItem("recentEvents", JSON.stringify(updated));

          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/50 rounded-3xl p-5 mb-8 text-left">
            <h3 title={event.title} className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 line-clamp-2 wrap-break-word min-w-0">
              {event.title}
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>



          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              {t("eventRegistration.successAddToCalendar")}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-30 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                {t("eventRegistration.successCalendarGoogle")}
              </a>
              <a
                href={outlookCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-30 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                {t("eventRegistration.successCalendarOutlook")}
              </a>
              <a
                href={yahooCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-30 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                Yahoo
              </a>
              <a
                href={webcalUrl || '#'}
                {...(event.id
                  ? {}
                  : { download: event.title ? `${event.title}.ics` : 'event.ics' }
                )}
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-4v-4h-2l4-4 4 4h-2v4z" />
                </svg>
                Apple / ICS
              </a>
            </div>
          </div>

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
          className="relative inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-blue-100 dark:bg-blue-900 text-black dark:text-white font-bold shadow-sm overflow-hidden group transform transition-all duration-300 hover:-translate-y-1 hover:bg-blue-200 dark:hover:bg-blue-800"
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

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="relative h-64 overflow-hidden">
            <img
              loading="lazy"
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 title={event.title} className="text-3xl font-bold mb-2 wrap-break-word">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
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
<button
  onClick={() => handleCopyEventLink(event?.id)}
  aria-label="Copy event link"
  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
>
  <Copy size={16} />
  Copy Link
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