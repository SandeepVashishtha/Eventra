import StatusBadge from "components/common/StatusBadge";
import ReadingProgressBar from "components/common/ReadingProgressBar";
import "./EventDetails.print.css";
import CountdownTimer from "components/common/CountdownTimer";
import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { sanitizeMarkdown, sanitizeHtml } from "utils/sanitizeHtml";
import { isMarkdown, markdownToHtml } from "utils/descriptionMigration";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import useKeyboardShortcuts from "hooks/useKeyboardShortcuts";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  CalendarPlus,
  Link2,
  Check,
  Archive,
  ExternalLink,
  Github,
  Linkedin,
  Users,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";
import { getEventStatus, isEventRegistrationClosed } from "utils/eventUtils";
import { useAuth } from "context/AuthContext";
import useBookmarks from "hooks/useBookmarks";
import { DRAFT_KEY } from "constants/eventDefaults";
import { useMyEvents } from "context/MyEventsContext";
import { logger } from "utils/logger";
import ReminderControls from "components/reminders/ReminderControls";
import EventRecommendations from "components/events/EventRecommendations";
import EventCancellationModal from "components/events/EventCancellationModal";
import SimilarEvents from "components/events/SimilarEvents";
import LiveQABoard from "components/events/LiveQABoard";
import EventRegistrationProgress from "components/common/EventRegistrationProgress";
import SeatsRemaining from "components/common/SeatsRemaining";
import useEventAvailability from "hooks/useEventAvailability";
import LivePollController from "components/admin/LivePollController";
import { EventDetailSkeleton } from "components/common/SkeletonLoaders";
import LazyImage from "components/common/LazyImage";
import { exportToCSV, exportToJSON } from "utils/exportUtils";
import { ROLES } from "config/roles";
import { marked } from "marked";
import ShareModal from "components/common/ShareModal";
import SocialShareButtons from "components/common/SocialShareButtons";
import { RecentlyViewedTracker } from "components/common/RecentlyViewedEvents";
import { apiUtils, API_ENDPOINTS } from "config/api";
import { getLastUpdated } from "utils/LastUpdatedUtils";
import CopyButton from "components/ui/CopyButton";
import AddToCalendar from "components/common/AddToCalendar";
import useClipboard from "hooks/useClipboard";
import { calculateReadTime, formatReadTime } from "utils/readTimeUtils";
import EventSessionNotes from "components/events/EventSessionNotes";
import scheduleService from "services/scheduleService";
import {
  getSessionNotes,
  saveSessionNote,
  deleteSessionNote,
} from "utils/sessionNotesUtils";
import LostAndFoundBoard from "components/events/LostAndFoundBoard";

const formatEventDate = (dateValue) => {
  if (!dateValue) return { short: "TBD", full: "Date TBD", relative: "" };
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return { short: "TBD", full: "Date TBD", relative: "" };

  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relative = "";
  if (diffMs < 0) {
    relative = "Past";
  } else if (diffDays === 0) {
    relative = "Today";
  } else if (diffDays === 1) {
    relative = "Tomorrow";
  } else if (diffDays < 7) {
    relative = `In ${diffDays} days`;
  } else if (diffDays < 30) {
    relative = `In ${Math.round(diffDays / 7)} w`;
  } else {
    relative = `In ${Math.round(diffDays / 30)} m`;
  }

  const short = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const full = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return { short, full, relative, time };
};

const padNumber = (value) => String(value).padStart(2, "0");

/**
 * Prepare description content for rendering
 * Handles both HTML and Markdown content automatically
 * @param {string} description - Event description
 * @returns {string} Sanitized HTML ready for rendering
 */
const prepareDescriptionContent = (description) => {
  if (!description || typeof description !== "string") return "";
  
  const trimmed = description.trim();
  
  // Already HTML content
  if (trimmed.startsWith("<") && (trimmed.includes("<p>") || trimmed.includes("<h2>") || trimmed.includes("<h3>") || trimmed.includes("<ul>") || trimmed.includes("<ol>"))) {
    return sanitizeHtml(description, { profile: "RICH_TEXT" });
  }
  
  // Markdown content - convert to HTML
  if (isMarkdown(description)) {
    return markdownToHtml(description);
  }
  
  // Plain text - wrap in paragraph tags
  return sanitizeHtml(`<p>${description}</p>`, { profile: "RICH_TEXT" });
};

const toCalendarDate = (dateValue) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${padNumber(d.getMonth() + 1)}-${padNumber(d.getDate())}`;
};

const toCalendarTime = (event, eventDate) => {
  if (event?.time) {
    const match = String(event.time).match(/(\d{1,2}):(\d{2})/);
    if (match) return `${padNumber(match[1])}:${match[2]}`;
  }
  const d = eventDate ? new Date(eventDate) : null;
  if (!d || isNaN(d.getTime())) return "00:00";
  return `${padNumber(d.getHours())}:${padNumber(d.getMinutes())}`;
};

const getDurationMinutes = (startValue, endValue) => {
  if (!startValue || !endValue) return 60;
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 60;
  const minutes = Math.round((end - start) / 60000);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 60;
};

const getCalendarLocation = (event) => {
  const loc = event?.location;
  if (!loc) return event?.isVirtual ? "Online" : "";
  if (typeof loc === "string") return loc;
  return loc.name || loc.address || (event?.isVirtual ? "Online" : "");
};

const getReadingTime = (text) => {
  const display = formatReadTime(calculateReadTime(text));
  return display || "0 min read";
};

const isRequestCanceled = (error, signal) =>
  signal?.aborted ||
  error?.name === "AbortError" ||
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED";

const sanitizeProfileUrl = (url) => {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBookmarked } = useBookmarks(user?.id || user?.email || "guest");

  const isOrganizer = user?.roles?.includes(ROLES.ORGANIZER) || user?.roles?.includes(ROLES.ADMIN);

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportingRegistrants, setExportingRegistrants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesError, setAttendeesError] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Issue #11021 — organizer actions (cancel/archive/export) must be gated by
  // event ownership, not role alone. Without this, any ORGANIZER/ADMIN could
  // manage another organization's event by swapping the id in the URL.
  const isEventOwner =
    event?.ownerId != null && user?.id != null && String(event.ownerId) === String(user.id);
  const canManageEvent = isOrganizer && isEventOwner;

  const { isRegistered } = useMyEvents();
  const { copy, isCopied } = useClipboard({ resetMs: 2000 });
  const abortControllerRef = useRef(null);
  const latestRequestIdRef = useRef(0);

  // Personal session notes are scoped per attendee per event. Sessions come
  // from the event schedule (empty when no schedule is published); notes are
  // persisted locally since they are private to each attendee.
  const [eventSessions, setEventSessions] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const userId = user?.id || user?.email || "guest";

  useEffect(() => {
    if (!eventId) return;

    setSessionNotes(getSessionNotes(eventId, userId));

    let active = true;
    (async () => {
      try {
        const response = await scheduleService.getSessions(eventId);
        if (!active) return;
        const data = response.data?.data ?? response.data ?? [];
        setEventSessions(Array.isArray(data) ? data : []);
      } catch {
        if (active) setEventSessions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [eventId, userId]);

  const handleSaveSessionNote = (note) => {
    setSessionNotes(saveSessionNote(eventId, userId, note));
  };

  const handleDeleteSessionNote = (note) => {
    setSessionNotes(deleteSessionNote(eventId, userId, note.id));
  };

  // Live, real-time seat availability for this event. Subscribes to the
  // per-event SSE stream so the backend only broadcasts availability for this
  // event. Safe to call with a null eventId (returns early) before the event
  // details finish loading.
  const { availability: liveAvailability } = useEventAvailability(eventId, {
    enabled: eventId != null,
    scoped: true,
  });
  const copyLink = async () => {
    const success = await copy(window.location.href, "eventLink");
    if (success) toast.success("Event link copied to clipboard!");
    else toast.error("Unable to copy link. Please copy the URL from your browser's address bar.");
  };
  const loadEvent = useCallback(async () => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;
    const isLatestRequest = () =>
      latestRequestIdRef.current === requestId &&
      abortControllerRef.current === controller &&
      !controller.signal.aborted;

    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId), {
        signal: controller.signal,
      });
      if (!isLatestRequest()) return;
      if (res.ok && res.data) {
        const raw = res.data?.data ?? res.data;
        setEvent({ ...raw, status: getEventStatus(raw) });
      } else {
        throw new Error(res.data?.message || `Event not found (${res.status})`);
      }
    } catch (error) {
      if (!isLatestRequest()) return;
      if (isRequestCanceled(error, controller.signal)) return;

      const status = error?.status || error?.response?.status;
      if (status >= 500) {
        setFetchError("Something went wrong on our end. Please try again later.");
      } else if (status === 404) {
        setFetchError("Event not found.");
      } else {
        setFetchError("Could not load event details. Please try again.");
      }
    } finally {
      const shouldFinishLoading = isLatestRequest();
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      if (shouldFinishLoading) {
        setFetchLoading(false);
      }
    }
  }, [eventId, setEvent, setFetchLoading, setFetchError]);

  useEffect(() => {
    loadEvent();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadEvent]);

  useEffect(() => {
    if (!eventId || !user) {
      setAttendees([]);
      return;
    }

    let isActive = true;
    const loadAttendees = async () => {
      setAttendeesLoading(true);
      setAttendeesError(null);

      try {
        const response = await apiUtils.get(API_ENDPOINTS.EVENTS.ATTENDEES(eventId));
        if (!isActive) return;
        const data = response.data?.data || response.data || [];
        setAttendees(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!isActive) return;
        const status = error?.status || error?.response?.status;
        setAttendees([]);
        setAttendeesError(
          status === 403
            ? "Register for this event to view opted-in attendees."
            : "Attendee directory is unavailable right now."
        );
      } finally {
        if (isActive) setAttendeesLoading(false);
      }
    };

    loadAttendees();
    return () => {
      isActive = false;
    };
  }, [eventId, user]);

  const handleArchive = useCallback(async () => {
    if (!eventId || isArchiving) return;
    setIsArchiving(true);
    try {
      const response = await apiUtils.post(API_ENDPOINTS.EVENTS.ARCHIVE(eventId));
      const updated = response.data?.data ?? response.data ?? {};
      setEvent((current) => ({
        ...(current || {}),
        ...updated,
        status: "archived",
      }));
      toast.success("Event archived.");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Could not archive this event. Please try again.";
      toast.error(message);
    } finally {
      setIsArchiving(false);
    }
  }, [eventId, isArchiving]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const createDuplicateDraft = (sourceEvent) => {
    const parseISODate = (dateValue) => {
      if (!dateValue) return "";
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    };

    const formatTime = (dateValue) => {
      if (!dateValue) return "";
      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return "";
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    };

    const startDate = sourceEvent.startDate || sourceEvent.date;
    const endDate = sourceEvent.endDate || sourceEvent.date || sourceEvent.startDate;
    const parsedStartDate = parseISODate(startDate);
    const parsedEndDate = parseISODate(endDate);
    const isMultiDay = parsedStartDate && parsedEndDate && parsedStartDate !== parsedEndDate;

    const locationData = sourceEvent.location || {};

    return {
      title: sourceEvent.title ? `Copy of ${sourceEvent.title}` : "",
      description: sourceEvent.description || "",
      categories: sourceEvent.categories && sourceEvent.categories.length > 0 ? sourceEvent.categories : [],
      category: sourceEvent.category || sourceEvent.categories?.[0] || "",
      isMultiDay,
      date: isMultiDay ? "" : parsedStartDate,
      startDate: isMultiDay ? parsedStartDate : "",
      endDate: isMultiDay ? parsedEndDate : "",
      startTime: formatTime(startDate),
      endTime: formatTime(endDate),
      timezone: sourceEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: {
        name: typeof locationData === "string" ? locationData : locationData.name || "",
        address: typeof locationData === "string" ? "" : locationData.address || "",
        coordinates: {
          latitude:
            typeof locationData === "string" ? "" : (locationData.coordinates?.latitude ?? ""),
          longitude:
            typeof locationData === "string" ? "" : (locationData.coordinates?.longitude ?? ""),
        },
      },
      isVirtual: Boolean(sourceEvent.virtualLink),
      virtualLink: sourceEvent.virtualLink || "",
      capacity: sourceEvent.capacity != null ? sourceEvent.capacity : "",
      isPublic: sourceEvent.isPublic ?? true,
      requiresApproval: sourceEvent.requiresApproval ?? false,
      registrationStart: sourceEvent.registrationStart
        ? parseISODate(sourceEvent.registrationStart)
        : "",
      registrationEnd: sourceEvent.registrationEnd ? parseISODate(sourceEvent.registrationEnd) : "",
      tags: Array.isArray(sourceEvent.tags) ? sourceEvent.tags : [],
      ticketTiers: Array.isArray(sourceEvent.ticketTiers)
        ? sourceEvent.ticketTiers.map((tier) => ({
            name: tier.name || "",
            price: tier.price ?? 0,
            capacity: tier.capacity ?? "",
            description: tier.description || "",
          }))
        : [
            {
              name: "General Admission",
              price: 0,
              capacity: "",
              description: "Standard event access",
            },
          ],
      banner: null,
      bannerPreview: sourceEvent.image || sourceEvent.banner || "",
    };
  };

  const handleDuplicateEvent = async () => {
    if (!event) {
      toast.error("Unable to duplicate this event right now.");
      return;
    }

    try {
      const draft = createDuplicateDraft(event);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      navigate("/create-event", { state: { duplicateDraft: true } });
      toast.success("Duplicate event draft created. Continue editing on the create event page.");
    } catch (error) {
      toast.error("Failed to prepare duplicated event draft.");
      logger.error("Duplicate event preparation failed:", error);
    }
  };

  const handleCopy = async () => {
    const link = `
Check out this event!

Event: ${event.title}
Date: ${new Date(event.date).toLocaleDateString()}
Location: ${event.location}

${window.location.href}
`;
    const success = await copy(link, "eventLink");
    if (success) toast.success("Event link copied to clipboard!");
    else toast.error("Failed to copy link. Please copy the URL from your browser's address bar.");
  };

  useKeyboardShortcuts({
    r: () => {
      if (event && !isEventRegistrationClosed(event)) navigate(`/events/${event.id}/register`);
    },
    c: handleCopy,
    s: () => setShowShareModal(true),
    p: handlePrint,
  });
  if (fetchLoading) return <EventDetailSkeleton />;

  if (fetchError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Event Not Found</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {fetchError || "We could not find the event you were looking for."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={loadEvent}
              className="inline-flex rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/events"
              className="inline-flex rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canSetReminder = isBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event);
  const registrationEnd = event.registrationEnd ? new Date(event.registrationEnd) : null;

  const eventDate = event.date || event.eventDate || event.startDate || null;
  const dateInfo = formatEventDate(eventDate);
  const calendarEvent = {
    id: event.id,
    title: event.title,
    description: event.description,
    date: toCalendarDate(eventDate),
    time: toCalendarTime(event, eventDate),
    durationMinutes: event.durationMinutes || getDurationMinutes(eventDate, event.endDate),
    location: getCalendarLocation(event),
    joiningLink: event.joiningLink || event.virtualLink || window.location.href,
  };

  const hoursLeft = registrationEnd
    ? Math.ceil((registrationEnd - new Date()) / (1000 * 60 * 60))
    : null;

  const showClosingSoon = hoursLeft !== null && hoursLeft > 0 && hoursLeft <= 48;
  const lastUpdated = getLastUpdated(event.updatedAt);

  return (
    <>
      <ReadingProgressBar />
      <RecentlyViewedTracker event={event} />
      <Helmet>
        <title>{event.title} | Eventra</title>

        <meta name="description" content={event.description?.slice(0, 160) || ""} />

        <meta property="og:type" content="website" />

        <meta property="og:title" content={event.title} />

        <meta property="og:description" content={event.description?.slice(0, 160) || ""} />

        <meta property="og:image" content={event.image} />

        <meta property="og:url" content={window.location.href} />

        <meta property="og:site_name" content="Eventra" />

        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:title" content={event.title} />

        <meta name="twitter:description" content={event.description?.slice(0, 160) || ""} />

        <meta name="twitter:image" content={event.image} />

        <meta name="twitter:url" content={window.location.href} />
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
                {event.type}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <h1
                  className="text-4xl sm:text-5xl font-extrabold tracking-tight break-words"
                  title={event.title}
                >
                  {event.title}
                </h1>
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-full transition-colors ${
                    isCopied("eventLink")
                      ? "text-green-600 bg-green-50 dark:bg-green-900/30"
                      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  }`}
                  aria-label={isCopied("eventLink") ? "Link copied!" : "Copy event link"}
                  title={isCopied("eventLink") ? "Copied!" : "Copy link"}
                >
                  {isCopied("eventLink") ? <Check size={28} /> : <Link2 size={28} />}
                </button>
              </div>
              <div
                className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 prose prose-indigo dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: prepareDescriptionContent(event.description),
                }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {showClosingSoon && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Registration closes {hoursLeft <= 24 ? "today" : `in ${hoursLeft} hours`}
                </span>
              )}

              {isRegistrationClosed ? (
                <>...</>
              ) : (
                <Link
                  to={`/events/${event.id}/register`}
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                >
                  Register Now
                </Link>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
              >
                Share Event
              </button>

              {canManageEvent && event.status !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel Event
                </button>
              )}
              {canManageEvent && event.status !== "cancelled" && event.status !== "archived" && (
                <button
                  type="button"
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-500 px-6 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition disabled:opacity-60"
                >
                  <Archive size={16} /> {isArchiving ? "Archiving..." : "Archive Event"}
                </button>
              )}

              {showCancelModal && (
                <EventCancellationModal
                  event={event}
                  onClose={() => setShowCancelModal(false)}
                  onSuccess={(updated) => setEvent({ ...event, ...updated })}
                />
              )}
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="print-hide inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label="Print or save as PDF"
              >
                {isPrinting ? "Preparing..." : "Print / Save as PDF"}
              </button>

              {canManageEvent && (
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={handleDuplicateEvent}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                    aria-label="Duplicate event"
                  >
                    <CalendarPlus size={18} /> Duplicate Event
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/events/${event.id}/registration-management`)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                    aria-label="Manage event registrations"
                  >
                    <ClipboardList size={18} /> Manage Registrations
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                    aria-label="Copy event link"
                  >
                    {isCopied("eventLink") ? "Copied!" : "Copy Link"}
                  </button>
                  <div className="relative print-hide">
                    <button
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      aria-label="Export registrant data"
                    >
                      Export Registrants
                    </button>
                    {showExportDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowExportDropdown(false)}
                        />
                        <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg py-1.5 z-20 animate-fadeIn text-left">
                          <button
                            onClick={async () => {
                              try {
                                setExportingRegistrants(true);
                                let allRegistrants = [];
                                let page = 1;
                                const limit = 500;
                                let hasMore = true;

                                while (hasMore) {
                                  const url = `${API_ENDPOINTS.EVENTS.REGISTRANTS(eventId)}?page=${page}&limit=${limit}`;
                                  const response = await apiUtils.get(url);
                                  const data = response.data?.data || response.data || [];
                                  const totalPages = response.data?.totalPages || 1;

                                  if (Array.isArray(data)) {
                                    allRegistrants = allRegistrants.concat(data);
                                  }

                                  if (page >= totalPages || data.length < limit) {
                                    hasMore = false;
                                  } else {
                                    page++;
                                  }
                                }
                                exportToCSV(allRegistrants, `${event.title}_registrants`);
                              } catch {
                                toast.error("Failed to fetch registrants");
                              } finally {
                                setExportingRegistrants(false);
                                setShowExportDropdown(false);
                              }
                            }}
                            disabled={exportingRegistrants}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            Export as CSV
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                setExportingRegistrants(true);
                                let allRegistrants = [];
                                let page = 1;
                                const limit = 500;
                                let hasMore = true;

                                while (hasMore) {
                                  const url = `${API_ENDPOINTS.EVENTS.REGISTRANTS(eventId)}?page=${page}&limit=${limit}`;
                                  const response = await apiUtils.get(url);
                                  const data = response.data?.data || response.data || [];
                                  const totalPages = response.data?.totalPages || 1;

                                  if (Array.isArray(data)) {
                                    allRegistrants = allRegistrants.concat(data);
                                  }

                                  if (page >= totalPages || data.length < limit) {
                                    hasMore = false;
                                  } else {
                                    page++;
                                  }
                                }
                                exportToJSON(allRegistrants, `${event.title}_registrants`);
                              } catch {
                                toast.error("Failed to fetch registrants");
                              } finally {
                                setExportingRegistrants(false);
                                setShowExportDropdown(false);
                              }
                            }}
                            disabled={exportingRegistrants}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            Export as JSON
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={16} />
                Back to Results
              </button>
            </div>
          </div>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ReminderControls event={event} canSetReminder={canSetReminder} />
          </section>

          {user && isRegistered(event.id) && (
            <EventSessionNotes
              sessions={eventSessions}
              initialNotes={sessionNotes}
              onSave={handleSaveSessionNote}
              onDelete={handleDeleteSessionNote}
            />
          )}

          {/* Live seat availability panel */}
          {event.capacity != null && event.capacity > 0 && (
            <section
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              aria-label="Live seat availability"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-200">
                  Live Seat Availability
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              <div className="mt-4">
                <SeatsRemaining
                  capacity={liveAvailability?.capacity ?? event.capacity}
                  registered={
                    liveAvailability?.registeredCount ??
                    event.registeredCount ??
                    event.attendees?.length ??
                    0
                  }
                  showProgressBar
                />
              </div>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-200">
                Seat counts update in real time as attendees register.
              </p>
            </section>
          )}

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
            {/* Left Column */}
            <div className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
              <LazyImage
                src={event.image}
                alt={event.title}
                width={1200}
                height={384}
                loading="eager"
                useWebP
                className="w-full rounded-3xl object-cover shadow-lg h-96"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-200">Date</p>
                    <p className="font-semibold">
                      {eventDate && !isNaN(new Date(eventDate).getTime())
                        ? new Date(eventDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Date TBA"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-200">Time</p>
                    <p className="font-semibold">{event.time || dateInfo.time || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-200">Location</p>
                    <p className="font-semibold">{event.location || "Online"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-200">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                </div>

                {/* Event Countdown */}
                <div className="sm:col-span-2">
                  <CountdownTimer
                    date={eventDate}
                    time={event.time || dateInfo.time}
                    timezone={event.timezone}
                  />
                </div>
              </div>

              {/* Add to Calendar & Copy Link */}
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-200">
                  Add to Calendar
                </h3>

                <div className="flex flex-col gap-2">
                  <AddToCalendar event={calendarEvent} className="w-full" />
                </div>

                <div className="pt-2">
                  <CopyButton textToCopy={window.location.href} />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-200">
                    Summary
                  </h3>

                  <span className="text-xs text-gray-500 dark:text-gray-200">
                    📖 {getReadingTime(event.description)}
                  </span>
                </div>
                <div
                  className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6 prose prose-indigo dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: prepareDescriptionContent(event.description),
                  }}
                />
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-200">
                      <Users className="h-4 w-4" />
                      Attendees
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Opted-in registered attendees for this event.
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                    {attendees.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {attendeesLoading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-200">Loading attendees...</p>
                  ) : attendeesError ? (
                    <p className="text-sm text-gray-500 dark:text-gray-200">{attendeesError}</p>
                  ) : attendees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-200">
                      No attendees have opted into the directory yet.
                    </p>
                  ) : (
                    attendees.map((attendee) => (
                      <div
                        key={attendee.userId}
                        className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
                      >
                        {(() => {
                          const githubUrl = sanitizeProfileUrl(attendee.githubUrl);
                          const linkedinUrl = sanitizeProfileUrl(attendee.linkedinUrl);
                          return (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {attendee.displayName}
                                </p>
                                {attendee.username && (
                                  <p className="text-xs text-gray-500 dark:text-gray-200">
                                    @{attendee.username}
                                  </p>
                                )}
                                {attendee.profileHeadline && (
                                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    {attendee.profileHeadline}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {githubUrl && (
                                  <a
                                    href={githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                                    aria-label={`${attendee.displayName} GitHub`}
                                  >
                                    <Github className="h-4 w-4" />
                                  </a>
                                )}
                                {linkedinUrl && (
                                  <a
                                    href={linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-blue-700 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-950/30"
                                    aria-label={`${attendee.displayName} LinkedIn`}
                                  >
                                    <Linkedin className="h-4 w-4" />
                                  </a>
                                )}
                                {(githubUrl || linkedinUrl) && (
                                  <ExternalLink
                                    className="mt-2 h-4 w-4 text-gray-400"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <EventRecommendations currentEventId={event.id} currentCategory={event.category || event.categories?.[0]} />
          </div>

          {/* Lost and Found Board — Crowdsourced Lost & Found with image recognition (#11923) */}
          <div className="mt-8">
            <LostAndFoundBoard />
          </div>

          {/* Similar Events — multi-signal recommendation section (#7754)
              Scores candidates by category, shared tags, type, mode, and difficulty
              so the user is surfaced events that genuinely match what they viewed. */}
          <div className="mt-8">
            <SimilarEvents currentEvent={event} />
          </div>
        </div>

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            event={event}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </>
  );
};

export default EventDetails;
