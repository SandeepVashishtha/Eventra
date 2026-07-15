import StatusBadge from "../../components/common/StatusBadge";
import ReadingProgressBar from "../../components/common/ReadingProgressBar";
import "./EventDetails.print.css";
import CountdownTimer from "../../components/common/CountdownTimer";
import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { sanitizeMarkdown } from "../../utils/sanitizeHtml";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";
import { getEventStatus, isEventRegistrationClosed } from "../../utils/eventUtils";
import { useAuth } from "../../context/AuthContext";
import useBookmarks from "../../hooks/useBookmarks";
import { DRAFT_KEY } from "../../constants/eventDefaults";
import { useMyEvents } from "../../context/MyEventsContext";
import { logger } from "../../utils/logger";
import ReminderControls from "../../components/reminders/ReminderControls";
import EventRecommendations from "../../components/events/EventRecommendations";
import EventCancellationModal from "../../components/events/EventCancellationModal";
import SimilarEvents from "../../components/events/SimilarEvents";
import LiveQABoard from "../../components/events/LiveQABoard";
import EventRegistrationProgress from "../../components/common/EventRegistrationProgress";
import LivePollController from "../../components/admin/LivePollController";
import { EventDetailSkeleton } from "../../components/common/SkeletonLoaders";
import LazyImage from "../../components/common/LazyImage";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import { ROLES } from "../../config/roles";
import { marked } from "marked";
import ShareModal from "../../components/common/ShareModal";
import SocialShareButtons from "../../components/common/SocialShareButtons";
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from "../../utils/calendarExporter";
import { RecentlyViewedTracker } from "../../components/common/RecentlyViewedEvents";
import { apiUtils, API_ENDPOINTS } from "../../config/api";
import { getLastUpdated } from "../../utils/LastUpdatedUtils";
import mockEvents from "./eventsMockData.json";
import CopyButton from '../../components/ui/CopyButton';
const formatEventDate = (dateValue) => {
  if (!dateValue) return { short: "TBD", full: "Date TBD", relative: "" };
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return { short: "TBD", full: "Date TBD", relative: "" };

  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

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

const isRequestCanceled = (error, signal) =>
  signal?.aborted ||
  error?.name === "AbortError" ||
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED";

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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { isRegistered } = useMyEvents();
  const [linkCopied, setLinkCopied] = useState(false);
  const latestRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

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

      const fallback = mockEvents.find((item) => String(item.id) === eventId);
      if (fallback) {
        setEvent({ ...fallback, status: getEventStatus(fallback) });
      } else {
        const status = error?.status || error?.response?.status;
        if (status >= 500) {
          setFetchError("Something went wrong on our end. Please try again later.");
        } else if (status === 404) {
          setFetchError("Event not found.");
        } else {
          setFetchError("Could not load event details. Please try again.");
        }
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
      category: sourceEvent.category || "",
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
            typeof locationData === "string"
              ? ""
              : locationData.coordinates?.latitude ?? "",
          longitude:
            typeof locationData === "string"
              ? ""
              : locationData.coordinates?.longitude ?? "",
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
      registrationEnd: sourceEvent.registrationEnd
        ? parseISODate(sourceEvent.registrationEnd)
        : "",
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
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } finally {
          textArea.remove();
        }
      }
      toast.success("Event link copied to clipboard!");
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link. Please copy the URL from your browser's address bar.");
    }
  };

  useKeyboardShortcuts({
    r: () => { if (event && !isEventRegistrationClosed(event)) navigate(`/events/${event.id}/register`); },
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
            <Link to="/events" className="inline-flex rounded-full border border-gray-300 px-6 py-3 font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition">
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canSetReminder = isBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event);
  const registrationEnd = event.registrationEnd
  ? new Date(event.registrationEnd)
  : null;
  const eventDate = event.date || event.eventDate || event.startDate || null;
  const dateInfo = formatEventDate(eventDate);

const hoursLeft = registrationEnd
  ? Math.ceil((registrationEnd - new Date()) / (1000 * 60 * 60))
  : null;

const showClosingSoon =
  hoursLeft !== null &&
  hoursLeft > 0 &&
  hoursLeft <= 48;
const lastUpdated = getLastUpdated(event.updatedAt);  

  return (
  <>
    <ReadingProgressBar />
    <RecentlyViewedTracker event={event} />
      <Helmet>
        <title>{event.title} | Eventra</title>
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description?.slice(0, 160) || ""} />
        <meta property="og:image" content={event.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
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
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight break-words" title={event.title}>{event.title}</h1>
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-full transition-colors ${linkCopied
                    ? "text-green-600 bg-green-50 dark:bg-green-900/30"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                    }`}
                  aria-label={linkCopied ? "Link copied!" : "Copy event link"}
                  title={linkCopied ? "Copied!" : "Copy link"}
                >
                  {linkCopied ? <Check size={28} /> : <Link2 size={28} />}
                </button>
              </div>
              <div
                className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 prose prose-indigo dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(event.description, marked.parse) }}
              />
            </div>

           <div className="flex flex-wrap gap-3">

  {showClosingSoon && (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      Registration closes {hoursLeft <= 24 ? "today" : `in ${hoursLeft} hours`}
    </span>
  )}

  {isRegistrationClosed ? (
    <>
      ...
    </>
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

              {isOrganizer && event.status !== "cancelled" && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  Cancel Event
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

              {isOrganizer && (
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={handleDuplicateEvent}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                    aria-label="Duplicate event"
                  >
                    <CalendarPlus size={18} /> Duplicate Event
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
                        <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
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
                              } catch  {
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

              <Link to="/events" className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">
                Back to Events
              </Link>
            </div>
          </div>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ReminderControls event={event} canSetReminder={canSetReminder} />
          </section>

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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold">{event.time || dateInfo.time || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{event.location || "Online"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={event.status} />
                      </div>
                      </div>
                </div>

                {/* Event Countdown */}
                <div className="sm:col-span-2">
                  <CountdownTimer date={eventDate} time={event.time || dateInfo.time} timezone={event.timezone} />
                </div>
              </div>

              {/* Add to Calendar & Copy Link */}
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Add to Calendar</h3>
                
                <div className="flex flex-col gap-2">
                  <button onClick={() => { downloadICSFile(event); toast.success("Calendar invite downloaded!"); }} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200" aria-label="Download .ics calendar invite">
                    <CalendarPlus size={15} className="text-green-500" /> Download .ics Invite
                  </button>
                  {generateGoogleCalendarLink(event) && (
                    <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200" aria-label="Add to Google Calendar">
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z" />
                        <path fill="#fff" d="M13 7h-2v6l5.25 3.15.75-1.23-4-2.37z" />
                      </svg> Add to Google Calendar
                    </a>
                  )}
                  {generateOutlookLink(event) && (
                    <a href={generateOutlookLink(event)} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200" aria-label="Add to Outlook Calendar">
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path fill="#0078D4" d="M2 6l10-4 10 4v12l-10 4L2 18z" />
                        <path fill="#fff" d="M12 4L4 7v10l8 3 8-3V7z" />
                      </svg> Add to Outlook
                    </a>
                  )}
                </div>

                <div className="pt-2">
                  <CopyButton textToCopy={window.location.href} />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Summary</h3>
                <div
                  className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6 prose prose-indigo dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(event.description, marked.parse) }}
                />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <EventRecommendations currentEventId={event.id} currentCategory={event.category} />
          </div>

          {/* Similar Events — multi-signal recommendation section (#7754)
              Scores candidates by category, shared tags, type, mode, and difficulty
              so the user is surfaced events that genuinely match what they viewed. */}
          <div className="mt-4">
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
