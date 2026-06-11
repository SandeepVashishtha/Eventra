import { createRateLimiter } from "../../utils/rateLimiter";
/**
 * @file useEventRegistration.js
 * @module hooks/useEventRegistration
 *
 * @description
 * Custom React hook that encapsulates the full event-registration lifecycle.
 *
 * Responsibilities:
 * - Fetches event details from the backend API, with a three-tier fallback:
 *     1. Live API response (saved to offline cache on success).
 *     2. Offline cache (`offlineEventCache`) when the network request fails.
 *     3. Bundled mock data (`hackathonMockData.json`) for hackathon paths
 *        (`/register/*`) or as a last resort.
 * - Pre-fills `fullName` and `email` from the authenticated user's profile.
 * - Validates the registration form via `useFormValidation` (300 ms debounce).
 * - Detects scheduling conflicts against the user's existing registrations
 *   and opens a conflict-resolution modal when one is found.
 * - Checks live event capacity immediately before submission and routes the
 *   request to the waitlist endpoint when the event is full.
 * - Uses a shared module-level `Map` lock (`registrationLocks` from
 *   `utils/registrationLocks`) and a ref
 *   (`isSubmittingRef`) to guard against duplicate concurrent submissions.
 * - Falls back to an offline queue (`offlineQueue`) when a network/timeout
 *   error is detected, so the registration syncs automatically once
 *   connectivity is restored.
 * - Clears the session-recovery context (`useSessionRecovery`) after a
 *   successful or already-registered response.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormValidation } from "../../hooks/useFormValidation";
import { getEventStatus } from "../../utils/eventUtils";
import { checkRegistrationConflict, suggestAlternativeEvents } from "../../utils/conflictDetection";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
// Removed unused API_ENDPOINTS import
import { eventService } from "../../services/eventService";
import { useSessionRecovery } from "../../context/SessionRecoveryContext";
import { validate } from "../../validation";
import {
  getCacheAgeLabel,
  getCachedEventDetail,
  saveCachedEventDetail,
} from "../../utils/offlineEventCache";
import { pushToQueue } from "../../utils/offlineQueue";
import { logError } from "../../utils/errorLogger";
import { logAbuseAttempt } from "../../utils/abuseLogger";
import hackathonsData from "../../Pages/Hackathons/hackathonMockData.json";
import registrationLocks from "../../utils/registrationLocks";

export const MAX_NOTES_CHARS = 500;

// Registration lock map to prevent concurrent registrations for the same event
// const registrationLocks = new Map();
// registrationLimiterRef initialized at hook scope with 3 tokens, 0.3/sec refill

/**
 * Derives a user-facing error message from a failed registration API response.
 */
const getRegistrationFailureMessage = (error) => {
  const message = error?.data?.message || error?.data?.error || error?.message || "";
  const normalizedMessage = message.toLowerCase();

  if (error?.status === 409 && /already registered|duplicate/.test(normalizedMessage)) {
    return "You are already registered for this event.";
  }

  if (
    error?.status === 409 ||
    error?.status === 423 ||
    /capacity|full|sold out|max(?:imum)? capacity/.test(normalizedMessage)
  ) {
    return "This event has reached maximum capacity. Please choose another event.";
  }

  if (/conflict/.test(normalizedMessage)) {
    return "Registration could not be completed because the server reported a conflict.";
  }

  return message || "Registration failed. Please try again.";
};

const useEventRegistration = (eventIdParam) => {
  const { eventId: routeEventId, id: routeId } = useParams();
  const eventId = eventIdParam || routeEventId || routeId;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { addRegistration, myEvents } = useMyEvents();
  const { clearSession } = useSessionRecovery();
  const registrationPath = location.pathname;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const isSubmittingRef = useRef(false);
  const registrationLimiterRef = useRef(createRateLimiter({ maxTokens: 3, refillRate: 0.3 }));

  // Conflict detection state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictData, setConflictData] = useState({
    conflicts: [],
    suggestions: [],
  });

  // React Compiler automatically memoizes these, no need for useMemo
  const isEventFull = event ? event.attendees >= event.maxAttendees : false;
  const isPastEvent = event ? (getEventStatus(event) === "past" || getEventStatus(event) === "ended") : false;

  const validationRules = {
    fullName: validate.fullName,
    email: validate.email,
    phone: validate.phone,
  };

  const {
    values: formData,
    errors,
    touched,
    isFormValid,
    handleChange: handleFormChange,
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

  const handleRegistrationChange = useCallback((event) => {
    if (event.target.name !== "additionalInfo") {
      handleFormChange(event);
      return;
    }

    handleFormChange({
      ...event,
      target: {
        ...event.target,
        value: event.target.value.slice(0, MAX_NOTES_CHARS),
      },
    });
  }, [handleFormChange]);

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
        const response = await eventService.getEventDetails(eventId);

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
        logError(error, null, { hook: "useEventRegistration", action: "loadEvent", eventId });
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
    // Fixed: Changed user?.id to user to satisfy react-hooks/exhaustive-deps
  }, [eventId, user, isAuthenticated, setValues, location.pathname]);

  const checkEventCapacity = useCallback(async (id, currentEvent) => {
    try {
      const freshRes = await eventService.getEventDetails(id);
      if (freshRes.status === 200) {
        const freshEvent = freshRes.data;
        const capacity = freshEvent.maxAttendees ?? 0;
        const attendees = freshEvent.attendees ?? 0;
        return attendees >= capacity;
      }
      const capacity = currentEvent?.maxAttendees ?? 0;
      const attendees = currentEvent?.attendees ?? 0;
      return attendees >= capacity;
    } catch (error) {
      console.error("[checkEventCapacity] Failed to check capacity:", error);
      const capacity = currentEvent?.maxAttendees ?? 0;
      const attendees = currentEvent?.attendees ?? 0;
      return attendees >= capacity;
    }
  }, []);

  const checkAndHandleConflicts = useCallback(async () => {
    if (!event) return false;

    const conflictCheck = checkRegistrationConflict(event, myEvents);
    if (conflictCheck.hasConflict) {
      try {
        const res = await eventService.getAllEvents();
        const realEvents = res.status === 200 ? res.data : [];
        const suggestions = suggestAlternativeEvents(event, realEvents, myEvents);
        setConflictData({
          conflicts: conflictCheck.conflicts,
          suggestions,
        });
      } catch (err) {
        logError(err, null, { hook: "useEventRegistration", action: "fetchAlternatives" });
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
    if (!registrationLimiterRef.current.tryConsume()) {
      const retryMs = registrationLimiterRef.current.getRetryAfterMs();

      logAbuseAttempt("event-registration-rate-limit", {
        eventId,
        userId: user?.id,
      });

      toast.error(
        `Too many registration attempts. Please wait ${Math.ceil(
          retryMs / 1000
        )} seconds and try again.`
      );

      return;
    }
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

    const payload = {
      ...formData,
      additionalInfo: formData.additionalInfo.slice(0, MAX_NOTES_CHARS),
      priority: formData.priority,
      eventId: parseInt(eventId),
    };

    try {
      if (event && event.attendees >= event.maxAttendees) {
        await eventService.waitlistForEvent(eventId, payload);
      } else {
        await eventService.registerForEvent(eventId, payload);
      }

      setRegistered(true);
      toast.success("Registration successful!");
      addRegistration(event, formData);
      clearSession();
    } catch (error) {
      const failureMessage = getRegistrationFailureMessage(error);
      const isOfflineFailure = error?.isNetworkError || error?.isTimeout;
      const isAlreadyRegistered = failureMessage === "You are already registered for this event.";

      if (isOfflineFailure) {
        const queuePayload = {
          ...formData,
          additionalInfo: formData.additionalInfo.slice(0, MAX_NOTES_CHARS),
          eventId: parseInt(eventId),
        };

        const success = await pushToQueue(
          {
            actionType: isEventFull ? "JOIN_WAITLIST" : "REGISTER_EVENT",
            // Fixed: Removed undefined 'endpoint' variable which would cause a crash
            eventId: parseInt(eventId),
            payload: queuePayload,
          },
          user.id
        );

        if (success) {
          setRegistered(true);
          addRegistration(event, formData);
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
        addRegistration(event, formData);
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
    // Fixed: Added isEventFull to dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, event, formData, isAuthenticated, user, token, navigate, registrationPath, addRegistration, clearSession, isEventFull]);

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
      toast.info("This event is full. You will be added to the waitlist.");
    }

      if (await checkAndHandleConflicts()) return;

    await proceedWithRegistration();
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

  return {
    event,
    loading,
    submitting,
    registered,
    isEventFull,
    isPastEvent,
    formData,
    errors,
    touched,
    isFormValid,
    handleChange: handleRegistrationChange,
    handleBlur,
    validateAll,
    setValues,
    showConflictModal,
    conflictData,
    handleSubmit,
    handleConflictCancel,
    handleConflictProceed,
    handleSelectAlternative,
    myEvents,
  };
};

export default useEventRegistration;