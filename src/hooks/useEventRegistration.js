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
 * - Uses a module-level `Map` lock (`registrationLocks`) and a ref
 *   (`isSubmittingRef`) to guard against duplicate concurrent submissions.
 * - Falls back to an offline queue (`offlineQueue`) when a network/timeout
 *   error is detected, so the registration syncs automatically once
 *   connectivity is restored.
 * - Clears the session-recovery context (`useSessionRecovery`) after a
 *   successful or already-registered response.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormValidation } from "../../hooks/useFormValidation";
import { getEventStatus } from "../../utils/eventUtils";
import { checkRegistrationConflict, suggestAlternativeEvents } from "../../utils/conflictDetection";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useSessionRecovery } from "../../context/SessionRecoveryContext";
import { validate } from "../../validation";
import {
  getCacheAgeLabel,
  getCachedEventDetail,
  saveCachedEventDetail,
} from "../../utils/offlineEventCache";
import { pushToQueue } from "../../utils/offlineQueue";
import { logError } from "../../utils/errorLogger";
import hackathonsData from "../../Pages/Hackathons/hackathonMockData.json";

export const MAX_NOTES_CHARS = 500;

// Registration lock map to prevent concurrent registrations for the same event
const registrationLocks = new Map();

/**
 * Derives a user-facing error message from a failed registration API response.
 *
 * Priority order:
 * 1. HTTP 409 with "already registered" / "duplicate" body  → already-registered copy.
 * 2. HTTP 409 / 423, or body mentioning capacity keywords   → capacity-full copy.
 * 3. Body mentioning "conflict"                             → server-conflict copy.
 * 4. Any other non-empty message from the response body     → returned as-is.
 * 5. Fallback generic copy.
 *
 * @private
 * @param {Object} error - The caught error object, typically from `apiUtils`.
 * @param {number}  [error.status]        - HTTP status code.
 * @param {Object}  [error.data]          - Parsed response body.
 * @param {string}  [error.data.message]  - Message field from the body.
 * @param {string}  [error.data.error]    - Error field from the body.
 * @param {string}  [error.message]       - JS Error message (network errors).
 * @returns {string} A localised, human-readable failure message.
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

/**
 * Manages the complete event-registration flow for a single event page.
 *
 * The hook resolves the target event ID from three sources (in priority order):
 * 1. The `eventIdParam` argument passed directly by the parent component.
 * 2. The `:eventId` URL segment exposed by React Router.
 * 3. The `:id` URL segment (legacy route shape).
 *
 * @param {string|number} [eventIdParam] - Optional event ID supplied directly
 *   by the consuming component. When omitted the hook reads the ID from the
 *   current URL via `useParams()`.
 *
 * @returns {{
 *   event:                  Object|null,
 *   loading:                boolean,
 *   submitting:             boolean,
 *   registered:             boolean,
 *   isEventFull:            boolean,
 *   isPastEvent:            boolean,
 *   formData:               Object,
 *   errors:                 Object,
 *   touched:                Object,
 *   isFormValid:            boolean,
 *   handleChange:           Function,
 *   handleBlur:             Function,
 *   validateAll:            Function,
 *   setValues:              Function,
 *   showConflictModal:      boolean,
 *   conflictData:           { conflicts: Array, suggestions: Array },
 *   handleSubmit:           Function,
 *   handleConflictCancel:   Function,
 *   handleConflictProceed:  Function,
 *   handleSelectAlternative:Function,
 *   myEvents:               Array,
 * }} An object containing event data, form state, and all event handlers
 *   needed to render a registration page.
 *
 * @property {Object|null} event
 *   The loaded event object, or `null` while the initial fetch is in flight.
 *   On API failure the object may contain a `cacheInfo` sub-object
 *   (`{ cachedAt: number, label: string }`) indicating that stale cached
 *   data is being displayed.
 *
 * @property {boolean} loading
 *   `true` while the initial event fetch is in progress; `false` once data
 *   (live, cached, or mock) has been applied.
 *
 * @property {boolean} submitting
 *   `true` between the moment the user confirms submission and the moment
 *   the API call (or offline-queue push) resolves. Use to disable the submit
 *   button and show a loading indicator.
 *
 * @property {boolean} registered
 *   Becomes `true` after a successful registration, a successful waitlist
 *   join, an already-registered 409 response, or a successful offline-queue
 *   push. Use to render a success / confirmation view.
 *
 * @property {boolean} isEventFull
 *   `true` when `event.attendees >= event.maxAttendees`. Submission is still
 *   permitted; the user will be placed on the waitlist automatically.
 *
 * @property {boolean} isPastEvent
 *   `true` when `getEventStatus(event)` returns `"past"` or `"ended"`.
 *   Consumers should disable registration and surface an appropriate message.
 *
 * @property {Object} formData
 *   Controlled form values managed by `useFormValidation`:
 *   - `fullName`       {string} – pre-filled from `user.fullName` when authenticated.
 *   - `email`          {string} – pre-filled from `user.email` when authenticated.
 *   - `phone`          {string}
 *   - `organization`   {string}
 *   - `designation`    {string}
 *   - `additionalInfo` {string} – capped at `MAX_NOTES_CHARS` (500) characters.
 *   - `priority`       {string} – defaults to `"Medium"`.
 *
 * @property {Object} errors
 *   Field-level validation error messages keyed by field name. A key is
 *   present only when the field has a validation error (string value).
 *
 * @property {Object} touched
 *   Boolean flags keyed by field name; `true` once the field has been
 *   blurred. Use to conditionally show inline error messages.
 *
 * @property {boolean} isFormValid
 *   `true` when all required fields (`fullName`, `email`, `phone`) pass
 *   their validation rules and no errors are present.
 *
 * @property {Function} handleChange
 *   `(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void`
 *   Standard controlled-input onChange handler; updates `formData` and
 *   triggers debounced field-level validation (300 ms).
 *
 * @property {Function} handleBlur
 *   `(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void`
 *   Marks a field as touched and runs immediate validation on blur.
 *
 * @property {Function} validateAll
 *   `() => boolean` – Triggers validation for all fields at once and returns
 *   `true` if the form is valid. Called internally by `handleSubmit`.
 *
 * @property {Function} setValues
 *   `(updater: Object | ((prev: Object) => Object)) => void`
 *   Directly sets all form values. Use sparingly (e.g. "reset form").
 *
 * @property {boolean} showConflictModal
 *   `true` when a scheduling conflict with an existing registration has been
 *   detected. Consumers should render a conflict-resolution modal.
 *
 * @property {{ conflicts: Array, suggestions: Array }} conflictData
 *   Populated when `showConflictModal` is `true`.
 *   - `conflicts`   – Array of conflicting event objects from `myEvents`.
 *   - `suggestions` – Alternative events without a schedule clash, fetched
 *     from the live events list. May be empty when the fetch fails.
 *
 * @property {Function} handleSubmit
 *   `(e: React.FormEvent) => Promise<void>` – Main form-submit handler.
 *   Steps performed:
 *   1. Guards against unauthenticated users (redirects to `/login`).
 *   2. Runs `validateAll()`; aborts with a toast on failure.
 *   3. Guards against duplicate in-flight submissions (ref + lock map).
 *   4. Fetches fresh capacity data and informs the user if the event is full.
 *   5. Checks for scheduling conflicts; opens the conflict modal if found.
 *   6. Calls `proceedWithRegistration()`.
 *
 * @property {Function} handleConflictCancel
 *   `() => void` – Closes the conflict modal and cancels registration.
 *   Shows an informational toast.
 *
 * @property {Function} handleConflictProceed
 *   `() => void` – Closes the conflict modal and proceeds with registration
 *   despite the detected conflict. Delegates to `proceedWithRegistration()`.
 *
 * @property {Function} handleSelectAlternative
 *   `(alternativeEvent: Object) => void` – Closes the conflict modal and
 *   navigates the user to the registration page for the chosen alternative
 *   event (`/events/:id/register`).
 *
 * @property {Array} myEvents
 *   The current user's existing registrations, sourced from
 *   `MyEventsContext`. Used internally for conflict detection and exposed for
 *   consumers that need to display the user's schedule alongside the form.
 *
 * @example
 * // Basic usage inside a registration page component
 * import useEventRegistration from "hooks/useEventRegistration";
 * import ConflictModal from "components/ConflictModal";
 *
 * function EventRegistrationPage() {
 *   const {
 *     event,
 *     loading,
 *     submitting,
 *     registered,
 *     isEventFull,
 *     isPastEvent,
 *     formData,
 *     errors,
 *     touched,
 *     isFormValid,
 *     handleChange,
 *     handleBlur,
 *     handleSubmit,
 *     showConflictModal,
 *     conflictData,
 *     handleConflictCancel,
 *     handleConflictProceed,
 *     handleSelectAlternative,
 *   } = useEventRegistration(); // reads eventId from the URL automatically
 *
 *   if (loading) return <Spinner />;
 *   if (!event) return <NotFound />;
 *   if (registered) return <SuccessView isWaitlist={isEventFull} />;
 *
 *   return (
 *     <>
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           name="fullName"
 *           value={formData.fullName}
 *           onChange={handleChange}
 *           onBlur={handleBlur}
 *         />
 *         {touched.fullName && errors.fullName && (
 *           <span>{errors.fullName}</span>
 *         )}
 *
 *         <button type="submit" disabled={submitting || isPastEvent}>
 *           {isEventFull ? "Join Waitlist" : "Register"}
 *         </button>
 *       </form>
 *
 *       {showConflictModal && (
 *         <ConflictModal
 *           conflicts={conflictData.conflicts}
 *           suggestions={conflictData.suggestions}
 *           onCancel={handleConflictCancel}
 *           onProceed={handleConflictProceed}
 *           onSelectAlternative={handleSelectAlternative}
 *         />
 *       )}
 *     </>
 *   );
 * }
 */
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
          additionalInfo: formData.additionalInfo.slice(0, MAX_NOTES_CHARS),
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
          additionalInfo: formData.additionalInfo.slice(0, MAX_NOTES_CHARS),
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
