import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormValidation } from "@hooks/useFormValidation";
import { getEventStatus } from "../utils/eventUtils";
import { checkRegistrationConflict, suggestAlternativeEvents } from "../utils/conflictDetection";
import { useAuth } from "@context/AuthContext";
import { useMyEvents } from "@context/MyEventsContext";
import { API_ENDPOINTS, apiUtils } from "../config/api";
import { useSessionRecovery } from "@context/SessionRecoveryContext";
import { validate } from "../validation";
import {
  getCacheAgeLabel,
  getCachedEventDetail,
  saveCachedEventDetail,

} from "../../utils/offlineEventCache";
import { pushToQueue } from "../../utils/offlineQueue";
import { logger } from "../../utils/logger";
import { logError } from "../../utils/errorLogger";
import hackathonsData from "../../Pages/Hackathons/hackathonMockData.json";


const MAX_NOTES_CHARS = 500;

// Registration lock map to prevent concurrent registrations for the same event
const registrationLocks = new Map();

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
  const isHackathonPath = location.pathname.startsWith("/register");
  const registrationPath = location.pathname;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
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
    isFormValid,
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
  }, [eventId, user, isAuthenticated, setValues, location.pathname]);

  const checkEventCapacity = useCallback(async (id, currentEvent) => {
    try {
      const freshRes = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(id));
      if (freshRes.status === 200) {
        const freshEvent = freshRes.data;
        return freshEvent.attendees >= freshEvent.maxAttendees;
      }
    } catch {
      return currentEvent.attendees >= currentEvent.maxAttendees;
    }
    return false;
  }, []);

  const checkAndHandleConflicts = useCallback(async () => {
    if (!event) return false;
    
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
    const endpoint = isEventFull
      ? `/api/events/${eventId}/waitlist`
      : API_ENDPOINTS.EVENTS?.REGISTER
        ? API_ENDPOINTS.EVENTS.REGISTER(eventId)
        : `/api/events/${eventId}/register`;

    try {
      await apiUtils.post(
        endpoint,
        {
          ...formData,
          priority: formData.priority,
          eventId: parseInt(eventId),
          userId: user.id,
        },
        token
      );

      setRegistered(true);
      toast.success("Registration successful!");
      addRegistration(event, formData);
      clearSession();
    } catch (error) {
      const failureMessage = getRegistrationFailureMessage(error);
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
  }, [eventId, event, formData, isAuthenticated, user, token, navigate, registrationPath, addRegistration, clearSession]);

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
    handleChange,
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
