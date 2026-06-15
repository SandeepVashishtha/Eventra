import "./EventDetails.print.css";
import { fetchRegistrantsForExport } from "../../utils/registrantUtils";
import { createDuplicateDraft } from "../../utils/eventDraftUtils";
import EventHeaderActions from "../../components/events/EventHeaderActions";
import EventShareSidebar from "../../components/events/EventShareSidebar";
import EventDetailsGrid from "../../components/events/EventDetailsGrid";
import EventInfoSection from "../../components/events/EventInfoSection";
import EventAgenda from "../../components/events/EventAgenda";
import CountdownTimer from "../../components/common/CountdownTimer";
import { useEffect, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { sanitizeMarkdown } from "../../utils/sanitizeHtml";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import { Calendar, MapPin, Clock, Tag, CalendarPlus, Link2, Check } from "lucide-react";
import { getEventStatus, isEventRegistrationClosed } from "../../utils/eventUtils";
import { isEventBookmarked } from "../../utils/bookmarkUtils";
import { DRAFT_KEY } from "../../constants/eventDefaults";
import { useMyEvents } from "../../context/MyEventsContext";
import { logger } from "../../utils/logger";
import ReminderControls from "../../components/reminders/ReminderControls";
import CertificateDownload from "../../components/CertificateDownload";
import EventRecommendations from "../../components/events/EventRecommendations";
import EventCancellationModal from "../../components/events/EventCancellationModal";
import SimilarEvents from "../../components/events/SimilarEvents";
import { EventDetailSkeleton } from "../../components/common/SkeletonLoaders";
import LazyImage from "../../components/common/LazyImage";
import { useAuth } from "../../context/AuthContext";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import { ROLES } from "../../config/roles";
import { marked } from "marked";
import ShareModal from "../../components/common/ShareModal";
import SocialShareButtons from "../../components/common/SocialShareButtons";
// import { generateEventSharingData } from "../../utils/shareUtils";
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from "../../utils/calendarExporter";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { apiUtils, API_ENDPOINTS } from "../../config/api";
import mockEvents from "./eventsMockData.json";
import CopyButton from '../../components/ui/CopyButton';

const isRequestCanceled = (error, signal) =>
  signal?.aborted ||
  error?.name === "AbortError" ||
  error?.name === "CanceledError" ||
  error?.code === "ERR_CANCELED";
const getOgDescription = (event) => {
  if (!event) return "";
  if (!event.description) return "";
  return event.description.slice(0, 160);
};

const renderAgenda = (sessions) => {
  if (sessions && sessions.length > 0) {
    return <EventAgenda sessions={sessions} />;
  }
  return <EventAgenda sessions={[]} />;
};

const TitleSection = ({ event, handleCopy, linkCopied }) => {
  const btnClass = linkCopied
    ? "text-green-600 bg-green-50 dark:bg-green-900/30"
    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30";
  const btnAria = linkCopied ? "Link copied!" : "Copy event link";
  const btnTitle = linkCopied ? "Copied!" : "Copy link";

  return (
    <div>
      <p className="inline-flex rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
        {event.type}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight wrap-break-word" title={event.title}>
          {event.title}
        </h1>
        <button onClick={handleCopy} className={`p-2 rounded-full transition-colors ${btnClass}`} aria-label={btnAria} title={btnTitle}>
          {linkCopied ? <Check size={28} /> : <Link2 size={28} />}
        </button>
      </div>
      <div
        className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 prose prose-indigo dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(event.description, marked.parse) }}
      />
    </div>
  );
};

// Moved these pure functions outside the component to reduce cyclomatic complexity
const checkLatest = ({ reqId, ctrl, latestReqRef, abortRef }) => {
  if (latestReqRef.current !== reqId) return false;
  if (abortRef.current !== ctrl) return false;
  if (ctrl.signal.aborted) return false;
  return true;
};

const handleResData = (res) => {
  if (!res.data) return null;
  if (res.data.data) return res.data.data;
  return res.data;
};

const processSuccess = ({ res, setEvent }) => {
  if (!res.ok) return false;
  const raw = handleResData(res);
  if (!raw) return false;
  setEvent({ ...raw, status: getEventStatus(raw) });
  return true;
};

const processErrorFallback = ({ error, eventId, setEvent, setFetchError }) => {
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
};

const handleCatchError = ({ error, reqId, ctrl, latestRef, abortRef, eventId, setEvent, setFetchError }) => {
  if (!checkLatest({ reqId, ctrl, latestReqRef: latestRef, abortRef })) return;
  if (isRequestCanceled(error, ctrl.signal)) return;
  processErrorFallback({ error, eventId, setEvent, setFetchError });
};

const finishLoading = ({ reqId, ctrl, latestRef, abortRef, setFetchLoading }) => {
  const shouldFinish = checkLatest({ reqId, ctrl, latestReqRef: latestRef, abortRef });
  if (abortRef.current === ctrl) {
    abortRef.current = null;
  }
  if (shouldFinish) {
    setFetchLoading(false);
  }
};

const useEventDetailsLogic = (eventId) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { isRegistered } = useMyEvents();

  const isOrganizer = user?.roles?.includes(ROLES.ORGANIZER) || user?.roles?.includes(ROLES.ADMIN);

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportingRegistrants, setExportingRegistrants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [event, setEvent] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const latestRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  const loadEvent = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = ++latestRequestIdRef.current;
    
    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId), { signal: controller.signal });
      if (!checkLatest({ reqId: requestId, ctrl: controller, latestReqRef: latestRequestIdRef, abortRef: abortControllerRef })) return;
      
      const success = processSuccess({ res, setEvent });
      if (!success) {
        const msg = res.data && res.data.message ? res.data.message : `Event not found (${res.status})`;
        throw new Error(msg);
      }
    } catch (error) {
      handleCatchError({
        error, reqId: requestId, ctrl: controller, latestRef: latestRequestIdRef,
        abortRef: abortControllerRef, eventId, setEvent, setFetchError
      });
    } finally {
      finishLoading({
        reqId: requestId, ctrl: controller, latestRef: latestRequestIdRef,
        abortRef: abortControllerRef, setFetchLoading
      });
    }
  }, [eventId, setEvent, setFetchLoading, setFetchError]);

  useEffect(() => {
    loadEvent();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadEvent]);

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

  const handleExport = async (format) => {
    try {
      setExportingRegistrants(true);
      const allRegistrants = await fetchRegistrantsForExport(eventId);
      if (format === 'csv') {
        exportToCSV(allRegistrants, `${event.title}_registrants`);
      } else {
        exportToJSON(allRegistrants, `${event.title}_registrants`);
      }
    } catch (error) {
      toast.error("Failed to fetch registrants");
    } finally {
      setExportingRegistrants(false);
      setShowExportDropdown(false);
    }
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
      toast.success("Event link copied to clipboard!");   
      setLinkCopied(true);                                
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
       toast.error("Failed to copy link. Please copy the URL from your browser's address bar.");
    }
  };

  useKeyboardShortcuts({
    r: () => { if (event && !isEventRegistrationClosed(event)) navigate(`/events/${event.id}/register`); },
    c: handleCopy,
    s: () => setShowShareModal(true),
    p: handlePrint,
  });

  return {
    event, setEvent,
    fetchLoading, fetchError, loadEvent,
    isOrganizer, isRegistered,
    showExportDropdown, setShowExportDropdown,
    exportingRegistrants,
    showShareModal, setShowShareModal,
    isPrinting, handlePrint,
    showCancelModal, setShowCancelModal,
    linkCopied, handleCopy,
    handleExport, handleDuplicateEvent
  };
};

const EventErrorState = ({ fetchError, loadEvent }) => (
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

const EventSummary = ({ description }) => (
  <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Summary</h3>
    <div
      className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6 prose prose-indigo dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: sanitizeMarkdown(description, marked.parse) }}
    />
  </div>
);

const EventMainGrid = ({ event }) => (
  <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">
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
      <EventDetailsGrid event={event} />
      <EventInfoSection event={event} />
      <EventShareSidebar event={event} />
      <EventSummary description={event.description} />
      {renderAgenda(event.sessions)}
    </div>
  </div>
);

const EventDetails = () => {
  const { eventId } = useParams();
  
  const {
    event, setEvent,
    fetchLoading, fetchError, loadEvent,
    isOrganizer, isRegistered,
    showExportDropdown, setShowExportDropdown,
    exportingRegistrants,
    showShareModal, setShowShareModal,
    isPrinting, handlePrint,
    showCancelModal, setShowCancelModal,
    linkCopied, handleCopy,
    handleExport, handleDuplicateEvent
  } = useEventDetailsLogic(eventId);

  if (fetchLoading) return <EventDetailSkeleton />;

  if (fetchError || !event) {
    return <EventErrorState fetchError={fetchError} loadEvent={loadEvent} />;
  }

  const canSetReminder = isEventBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event);

  return (
    <>
      <Helmet>
        <title>{event.title} | Eventra</title>
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={getOgDescription(event)} />
        <meta property="og:image" content={event.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <TitleSection event={event} handleCopy={handleCopy} linkCopied={linkCopied} />

            <EventHeaderActions
              event={event}
              isRegistrationClosed={isRegistrationClosed}
              isOrganizer={isOrganizer}
              showCancelModal={showCancelModal}
              setShowCancelModal={setShowCancelModal}
              handlePrint={handlePrint}
              isPrinting={isPrinting}
              handleDuplicateEvent={handleDuplicateEvent}
              showExportDropdown={showExportDropdown}
              setShowExportDropdown={setShowExportDropdown}
              handleExport={handleExport}
              exportingRegistrants={exportingRegistrants}
              setShowShareModal={setShowShareModal}
              setEvent={setEvent}
            />
          </div>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <ReminderControls event={event} canSetReminder={canSetReminder} />
          </section>

          <EventMainGrid event={event} />

          <div className="mt-12">
            <EventRecommendations currentEventId={event.id} currentCategory={event.category} />
          </div>

          <div className="mt-4">
            <SimilarEvents currentEvent={event} />
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
