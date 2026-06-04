import { useState, useEffect, useRef, useMemo, useCallback } from "react";
// Calendar URL helpers — import from the timezone-aware utility instead of
// using the old inline implementations (which were UTC-blind and hardcoded
// a 1-hour event duration — fixed in issue #2015).
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from "../../utils/calendarUrlUtils";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import hackathonsData from "../Hackathons/hackathonMockData.json";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import {
  isCapacityConflictError,
  isEventAtCapacity,
  mergeAvailabilityIntoEvent,
  normalizeEventAvailability,
} from "../../utils/eventAvailabilityUtils.mjs";
import { useFormValidation } from "../../hooks/useFormValidation";
import { getEventStatus } from "../../utils/eventUtils";
import { checkRegistrationConflict, suggestAlternativeEvents } from "../../utils/conflictDetection";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useSessionRecovery } from "../../context/SessionRecoveryContext";
import CalendarView from "../../components/CalendarView";
import EventConflictModal from "../../components/EventConflictModal";
import ConfettiCanvas from "../../components/common/ConfettiCanvas";
import { SkeletonEventCard } from "../../components/common/SkeletonLoaders";
import { logger } from "../../utils/logger";
import { validate } from "../../validation";

const MAX_NOTES_CHARS = 500;

const EventRegistration = () => {
  const { eventId: routeEventId, id: routeId } = useParams();
  const eventId = routeEventId || routeId;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { addRegistration, myEvents } = useMyEvents();
  const { clearSession } = useSessionRecovery();
  const isHackathonPath = location.pathname.startsWith("/register");
  const registrationPath = location.pathname;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(-1);
  const isSubmittingRef = useRef(false);

  // Conflict detection state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState({
    conflicts: [],
    suggestions: [],
  });

  const validationRules = useMemo(() => ({
    fullName: validate.fullName,
    email: validate.email,
    phone: validate.phone,
  }), []);

  const {
    values: formData,
    errors,
    touched,
    isValid: isFormValid,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
  } = useFormValidation(
    {
      fullName: "",
      email: "",
      phone: "",
      organization: "",
      designation: "",
      additionalInfo: "",
      priority: "Medium",
    },
    validationRules,
    { debounceMs: 300 }
  );

  // Load event data from backend API
  useEffect(() => {
    let isCancelled = false;

    const applyLoadedEvent = (nextEvent) => {
      if (!isCancelled) {
        setEvent(nextEvent);
      }
    };

    const prefillAuthenticatedUser = () => {
      if (!isCancelled && isAuthenticated() && user) {
        setValues((prev) => ({
          ...prev,
          fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
          email: user.email || "",
        }));
      }
    };

    const loadEvent = async () => {
      setLoading(true);

      const isHackathonPath = location.pathname.startsWith("/register");
      if (isHackathonPath) {
        const foundMock = hackathonsData.find((item) => String(item.id) === String(eventId));
        if (foundMock) {
          applyLoadedEvent({
            ...foundMock,
            date: foundMock.startDate,
            time: "10:00 AM",
            image:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
            attendees: foundMock.participants,
            maxAttendees: 1500,
            status: foundMock.status,
          });
          if (!isCancelled) setLoading(false);
          prefillAuthenticatedUser();
          return;
        }
      }

      try {
        const response = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));

        if (response.status === 200 && response.data) {
          if (isCancelled) return;

          const fetchedEvent = {
            ...response.data,
            status: getEventStatus(response.data),
          };
          applyLoadedEvent(fetchedEvent);
          saveCachedEventDetail(fetchedEvent);

          prefillAuthenticatedUser();
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to load event details:", error);
        const cached = getCachedEventDetail(eventId);
        if (cached?.event) {
          applyLoadedEvent({
            ...cached.event,
            status: getEventStatus(cached.event),
            cacheInfo: {
              cachedAt: cached.cachedAt,
              label: getCacheAgeLabel(cached.cachedAt),
            },
          });

          toast.warning(`Showing ${getCacheAgeLabel(cached.cachedAt)} event details.`);
          return;
        }

        const foundMock = hackathonsData.find((item) => String(item.id) === String(eventId));
        if (foundMock) {
          applyLoadedEvent({
            ...foundMock,
            date: foundMock.startDate,
            time: "10:00 AM",
            image:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800",
            attendees: foundMock.participants,
            maxAttendees: 1500,
            status: foundMock.status,
          });
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadEvent();
    return () => {
      isCancelled = true;
    };
  }, [eventId, user, isAuthenticated, setValues, location.pathname]);

  const refreshEventAvailability = useCallback(async (id) => {
    try {
      const response = await apiUtils.get(API_ENDPOINTS.EVENTS.AVAILABILITY(id));

      if (response.status === 200 && response.data) {
        const normalized = normalizeEventAvailability(response.data);

        setEvent((prev) =>
          prev ? mergeAvailabilityIntoEvent(prev, response.data) : prev
        );

        return normalized;
      }
    } catch (error) {
      logger.error("Failed to refresh event availability", error);
    }
    return null;
  }, []);

  const checkEventCapacity = useCallback(async (id, currentEvent) => {
    const latestAvailability = await refreshEventAvailability(id);

    if (latestAvailability) {
      return latestAvailability.isFull;
    }

    return isEventAtCapacity(currentEvent);
  }, [refreshEventAvailability]);

  const checkAndHandleConflicts = useCallback(async () => {
    const conflictCheck = checkRegistrationConflict(event, myEvents);
    if (conflictCheck.hasConflict) {
      try {
        const res = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
        const realEvents = res.status === 200 ? res.data : [];
        const suggestions = suggestAlternativeEvents(event, realEvents, myEvents);
        setConflictData({
          conflicts: conflictCheck.conflicts,
          suggestions,
        });
      } catch (err) {
        logger.error("Failed to fetch alternative events", err);
        setConflictData({
          conflicts: conflictCheck.conflicts,
          suggestions: [],
        });
      }
      setShowConflictModal(true);
      return true;
    }
    return false;
  }, [event, myEvents]);

  // Proceed with registration after conflict check or user confirmation
  const proceedWithRegistration = useCallback(async () => {
    if (!isAuthenticated() || !user?.id) {
      toast.error("Please log in to register for events.");
      navigate("/login", {
        state: { from: registrationPath },
      });
      return;
    }

    setShowConflictModal(false);

    registrationLocks.set(eventId, true);
    isSubmittingRef.current = true;
    setSubmitting(true);

    const isEventFull = event ? event.attendees >= event.maxAttendees : false;

    if (isEventFull) {
      try {
        const { joinWaitlist, getQueuePosition } = await import("../../utils/waitlistUtils");
        await joinWaitlist(eventId, user, { ...formData, eventTitle: event?.title || "the event" });
        const pos = getQueuePosition(eventId, user.id);
        setWaitlistPosition(pos);
        setRegistered(true);
        toast.success("Successfully joined waitlist!");
        clearSession();
        return;
      } catch (err) {
        toast.error(err.message || "Failed to join waitlist.");
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

    try {
      const response = await apiUtils.post(
        endpoint,
        {
          ...formData,
          priority: formData.priority,
          eventId: parseInt(eventId),
          userId: user.id,
        },
        token
      );

      const regData = response.data || {};
      const registrationId = regData.registrationId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}`);
      const qrToken = regData.qrToken || "";

      setRegistered(true);
      toast.success("Registration successful!");
      // addRegistration(event, formData)
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
          userId: user.id,
        };

        const success = await pushToQueue(
          {
            actionType: isEventFull ? "JOIN_WAITLIST" : "REGISTER_EVENT",
            endpoint,
            eventId: parseInt(eventId),
            payload,
          },
          user.id
        );

        if (success) {
          setRegistered(true);
          const offlineRegId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-offline-${Date.now()}`;
          addRegistration(event, formData, offlineRegId, "");
          clearSession();
          toast.warning("Network error. Registration queued and will sync when you are online.", {
            autoClose: 4000,
          });
        } else {
          toast.error(
            "Offline registration queue is full. Please reconnect to the internet to register."
          );
        }
        return;
      }

      if (isAlreadyRegistered) {
        setRegistered(true);
        toast.success(isEventFull ? "Successfully joined waitlist!" : "Registration successful!");
        const existingRegId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `reg-existing-${Date.now()}`;
        addRegistration(event, formData, existingRegId, "");
        clearSession();
        toast.info(failureMessage);
        return;
      }

      toast.error(failureMessage);
    } finally {
      registrationLocks.delete(eventId);
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
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
      toast.error("Please log in to register for events.");
      navigate("/login", {
        state: { from: registrationPath },
      });
      return;
    }

    if (!validateAll()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    if (isSubmittingRef.current) {
      toast.error("Registration already in progress. Please wait.");
      return;
    }

    if (registrationLocks.has(eventId)) {
      toast.error("Another registration is in progress for this event. Please wait.");
      return;
    }

    const isFull = await checkEventCapacity(eventId, event);
    if (isFull) {
      const { getGlobalWaitlist } = await import("../../utils/waitlistUtils");
      const records = getGlobalWaitlist();
      const onWaitlist = records.some(
        (r) => r.userId === user.id && r.eventId === parseInt(eventId) && r.status === "waiting"
      );
      if (onWaitlist) {
        toast.error("You are already on the waitlist for this event.");
        return;
      }
    }

    if (await checkAndHandleConflicts()) return;

    proceedWithRegistration();
  }, [isAuthenticated, user, navigate, registrationPath, validateAll, eventId, event, checkEventCapacity, checkAndHandleConflicts, proceedWithRegistration]);

  // Handle conflict modal actions
  const handleConflictCancel = useCallback(() => {
    setShowConflictModal(false);
    toast.info("Registration cancelled due to scheduling conflict.");
  }, []);

  const handleConflictProceed = useCallback(() => {
    proceedWithRegistration();
  }, [proceedWithRegistration]);

  const handleSelectAlternative = useCallback((alternativeEvent) => {
    setShowConflictModal(false);
    navigate(`/events/${alternativeEvent.id}/register`);
    toast.info(`Redirecting to ${alternativeEvent.title}`);
  }, [navigate]);

  const isEventFull = useMemo(() => event ? event.attendees >= event.maxAttendees : false, [event]);
  const isPastEvent = useMemo(() => getEventStatus(event) === "past" || getEventStatus(event) === "ended", [event]);

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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Event Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          The event you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Registration Unavailable
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          This event has already ended.
        </p>
        <Link
          to={isHackathonPath ? `/hackathons/${event.id}` : `/events/${event.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </Link>
      </div>
    );
  }

  if (registered) {
    const googleCalendarUrl = getGoogleCalendarUrl(event);
    const outlookCalendarUrl = getOutlookCalendarUrl(event);
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
              toast.error("Unable to share event. Try copying the link instead.");
            }
          });
      } else {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => {
            toast.success("Event link copied to clipboard!");
          })
          .catch((err) => {
            logger.error("Failed to copy link:", err);
            toast.error("Could not copy link. Please copy manually.");
          });
      }
    };

    return (
      <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 overflow-hidden">
        <ConfettiCanvas />

        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="relative max-w-lg w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-[2.5rem] shadow-2xl p-8 sm:p-10 text-center z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
            className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-500 to-emerald-500 p-0.5 mx-auto mb-6 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-indigo-500 dark:text-indigo-400 stroke-[2.5]" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-linear-to-t from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 mb-2">
            {isEventFull ? "Added to Waitlist!" : "Registration Confirmed!"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            {isEventFull 
              ? `You are in position #${waitlistPosition} of the queue. We will notify you if a spot opens up.`
              : "You're all set! Your registration details have been saved successfully."}
          </p>

          <div className="bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/50 rounded-3xl p-5 mb-8 text-left">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 truncate">
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

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-500" />
                <span>{event.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Add to Calendar
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Google
              </a>
              <a
                href={outlookCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm hover:scale-[1.03] transition-all duration-300"
              >
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                Outlook
              </a>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
              Share Event
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-950 dark:bg-slate-950 dark:hover:bg-black rounded-2xl text-white hover:scale-110 transition-all duration-300 shadow"
                title="Share on Twitter / X"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 inline-flex items-center justify-center bg-[#0077b5] hover:bg-[#006297] rounded-2xl text-white hover:scale-110 transition-all duration-300 shadow"
                title="Share on LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-10 h-10 inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white hover:scale-110 transition-all duration-300 shadow"
                title="Share / Copy Link"
              >
                <svg
                  className="w-4.5 h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>
            </div>
          </div>

          <Link
            to={isHackathonPath ? `/hackathons/${event.id}` : `/events/${event.id}`}
            className="block"
          >
            <button
              type="button"
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg transition-all duration-300"
            >
              Back to Details
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to={isHackathonPath ? "/hackathons" : "/events"}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {isHackathonPath ? "Back to Hackathons" : "Back to Events"}
        </Link>

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
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
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

          <div className="p-8">
            <CalendarView events={myEvents} />

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Register for this Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.fullName && touched.fullName
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && touched.fullName && (
                  <p id="registration-fullName-error" role="alert" className="text-red-500 text-sm mt-1">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.email && touched.email
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && touched.email && (
                  <p id="registration-email-error" role="alert" className="text-red-500 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.phone && touched.phone
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p id="registration-phone-error" role="alert" className="text-red-500 text-sm mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Organization */}
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Organization (Optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Your company or institution"
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Designation (Optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Your job title or role"
                  />
                </div>
              </div>

              {/* Priority */}
              <div>
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Priority (Optional)
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Additional Info */}
              <div>
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Additional Information (Optional)
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  maxLength={MAX_NOTES_CHARS}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder="Any special requirements or questions?"
                />
                <div className="flex justify-end text-xs mt-1 text-gray-400 dark:text-gray-500">
                  <span
                    className={
                      (formData.additionalInfo?.length || 0) >= MAX_NOTES_CHARS - 20
                        ? "text-red-500 font-medium animate-pulse"
                        : ""
                    }
                  >
                    {formData.additionalInfo?.length || 0} / {MAX_NOTES_CHARS} characters
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  aria-label="Submit registration"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEventFull ? "Joining Waitlist..." : "Registering..."}
                    </>
                  ) : isEventFull ? (
                    "Join Waitlist"
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <EventConflictModal
        isOpen={showConflictModal}
        newEvent={event}
        conflictingEvents={conflictData.conflicts}
        suggestedEvents={conflictData.suggestions}
        onCancel={handleConflictCancel}
        onProceed={handleConflictProceed}
        onSelectAlternative={handleSelectAlternative}
        strictMode={false}
      />
    </div>
  );
};

export default EventRegistration;
