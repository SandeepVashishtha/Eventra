import "./EventDetails.print.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { sanitizeMarkdown } from "../../utils/sanitizeHtml";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Tag, Share2, CalendarPlus, Link2 } from "lucide-react";
import { getEventStatus, isEventRegistrationClosed } from "../../utils/eventUtils";
import { isEventBookmarked } from "../../utils/bookmarkUtils";
import { DRAFT_KEY } from "../../constants/eventDefaults";
import { useMyEvents } from "../../context/MyEventsContext";
import { logger } from "../../utils/logger";
import ReminderControls from "../../components/reminders/ReminderControls";
import CertificateDownload from "../../components/CertificateDownload";
import EventMaterials from "../../components/common/EventMaterials";
import EventRecommendations from "../../components/events/EventRecommendations";
import { EventDetailSkeleton } from "../../components/common/SkeletonLoaders";
import LazyImage from "../../components/common/LazyImage";
import { useAuth } from "../../context/AuthContext";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import { ROLES } from "../../config/roles";
import { marked } from "marked";
import ShareMenu from "../../components/common/ShareMenu";
import ShareModal from "../../components/common/ShareModal";
import { generateEventSharingData } from "../../utils/shareUtils";
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from "../../utils/calendarExporter";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { apiUtils, API_ENDPOINTS } from "../../config/api";
import mockEvents from "./eventsMockData.json";

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();

  const isOrganizer = user?.roles?.includes(ROLES.ORGANIZER) || user?.roles?.includes(ROLES.ADMIN);

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportingRegistrants, setExportingRegistrants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [event, setEvent] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const { isRegistered } = useMyEvents();

  const latestRequestIdRef = useRef(0);

  const loadEvent = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    const isLatestRequest = () => latestRequestIdRef.current === requestId;

    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
      if (!isLatestRequest()) return;
      if (res.ok && res.data) {
        const raw = res.data?.data ?? res.data;
        setEvent({ ...raw, status: getEventStatus(raw) });
      } else {
        throw new Error(res.data?.message || `Event not found (${res.status})`);
      }
    } catch {
      if (!isLatestRequest()) return;
      // Fall back to bundled mock data when the API is unreachable
      const fallback = mockEvents.find((item) => String(item.id) === eventId);
      if (fallback) {
        setEvent({ ...fallback, status: getEventStatus(fallback) });
      } else {
        setFetchError("Event not found.");
      }
    } finally {
      if (isLatestRequest()) {
        setFetchLoading(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  // Safely handle localStorage cache updates via hook
  useEffect(() => {
    if (!event) return;
    addRecentlyViewed(event);
  }, [event, addRecentlyViewed]);

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
    const link = window.location.href;
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
      toast.success("Link copied!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

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

  const canSetReminder = isEventBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event);

  return (
    <>
      <Helmet>
        <title>{event.title} | Eventra</title>
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description.slice(0, 160)} />
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
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{event.title}</h1>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                  aria-label="Copy event link"
                  title="Copy link"
                >
                  <Link2 size={28} />
                </button>
              </div>
              <div
                className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 prose prose-indigo dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(event.description, marked.parse) }}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {isRegistrationClosed ? (
                <>
                  <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 shadow-sm cursor-not-allowed dark:bg-gray-800 dark:text-gray-300">
                    Event Ended
                  </span>
                  {event.status === "past" && (
                    <CertificateDownload eventName={event.title} eventDate={event.date} eventType={event.type} />
                  )}
                </>
              ) : (
                <Link to={`/events/${event.id}/register`} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition">
                  Register Now
                </Link>
              )}

              <button
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition"
              >
                Share Event
              </button>

              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="print-hide inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label="Print or save as PDF"
              >
                {isPrinting ? "Preparing..." : "≡ƒû¿∩╕Å Print / Save as PDF"}
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
                      ≡ƒôÑ Export Registrants
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
                              } catch (error) {
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
                              } catch (error) {
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

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">
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
                    <p className="font-semibold">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                    <p className="font-semibold">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-semibold">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                  <Tag className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-semibold capitalize">{event.status}</p>
                  </div>
                </div>
              </div>

              {event.status === "past" && <EventMaterials materials={event.materials || []} />}
            </div>

            {/* Right Column */}
            <aside className="space-y-6 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-900">
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <ReminderControls event={event} canSetReminder={canSetReminder} />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Event Details</h2>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <p><span className="font-semibold">Attendees:</span> {event.attendees}/{event.maxAttendees}</p>
                  <p><span className="font-semibold">Type:</span> {event.type}</p>
                  <p><span className="font-semibold">Tags:</span> {event.tags.join(", ")}</p>
                </div>
              </div>

              {/* Share & Add to Calendar */}
              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800 space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Share & Add to Calendar</h3>
                <ShareMenu shareData={generateEventSharingData({ ...event, title: event.title, description: event.description, date: event.date, id: event.id })} position="top-left">
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200" aria-label="Share this event">
                    <Share2 size={15} className="text-indigo-500" /> Share Event
                  </button>
                </ShareMenu>

                <div className="flex flex-col gap-2">
                  <button onClick={() => { downloadICSFile(event); toast.success("Calendar invite downloaded!"); }} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200" aria-label="Download .ics calendar invite">
                    <CalendarPlus size={15} className="text-green-500" /> Download .ics Invite
                  </button>
                  {generateGoogleCalendarLink(event) && (
                    <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200" aria-label="Add to Google Calendar">
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
                        <path fill="#fff" d="M13 7h-2v6l5.25 3.15.75-1.23-4-2.37z"/>
                      </svg> Add to Google Calendar
                    </a>
                  )}
                  {generateOutlookLink(event) && (
                    <a href={generateOutlookLink(event)} target="_blank" rel="noopener noreferrer" className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200" aria-label="Add to Outlook Calendar">
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path fill="#0078D4" d="M2 6l10-4 10 4v12l-10 4L2 18z"/>
                        <path fill="#fff" d="M12 4L4 7v10l8 3 8-3V7z"/>
                      </svg> Add to Outlook
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Summary</h3>
                <div
                  className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6 prose prose-indigo dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(event.description, marked.parse) }}
                />
              </div>
            </aside>
          </div>

          <div className="mt-12">
            <EventRecommendations currentEventId={event.id} currentCategory={event.category} />
          </div>
        </div>

        {showShareModal && (
          <ShareModal event={event} onClose={() => setShowShareModal(false)} />
        )}
      </div>
    </>
  );
};

export default EventDetails;
