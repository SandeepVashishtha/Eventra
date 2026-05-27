import React, {
  useEffect,
  useState,
} from "react";
import DOMPurify from "dompurify";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { Calendar, MapPin, Clock, Tag, Share2, CalendarPlus } from "lucide-react";
import {
  getEventStatus,
  isEventRegistrationClosed,
} from "../../utils/eventUtils";
import { isEventBookmarked } from "../../utils/bookmarkUtils";
import { useMyEvents } from "../../context/MyEventsContext";
import ReminderControls from "../../components/reminders/ReminderControls";
import mockEvents from "./eventsMockData.json";
import CertificateDownload from "../../components/CertificateDownload";
import EventMaterials from "../../components/common/EventMaterials";
import EventRecommendations from "../../components/events/EventRecommendations";
import CopyLinkButton from "../../components/common/CopyLinkButton";
import LazyImage from "../../components/common/LazyImage";
import { useAuth } from "../../context/AuthContext";
import { exportToCSV, exportToJSON } from "../../utils/exportUtils";
import { ROLES } from "../../config/roles";
import { marked } from 'marked';
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";
import {
  downloadICSFile,
  generateGoogleCalendarLink,
  generateOutlookLink,
} from "../../utils/calendarExporter";

const EventDetails = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const isOrganizer = user?.roles?.includes(ROLES.ORGANIZER) || user?.roles?.includes(ROLES.ADMIN);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const mockRegistrants = [
    { id: 1, name: "Aarav Sharma", email: "aarav@example.com", registeredAt: "2025-05-10", status: "Confirmed" },
    { id: 2, name: "Priya Mehta", email: "priya@example.com", registeredAt: "2025-05-11", status: "Confirmed" },
    { id: 3, name: "Rohan Verma", email: "rohan@example.com", registeredAt: "2025-05-12", status: "Pending" },
    { id: 4, name: "Sneha Patel", email: "sneha@example.com", registeredAt: "2025-05-13", status: "Confirmed" },
  ];
  const { isRegistered } = useMyEvents();
  const foundEvent = mockEvents.find((item) => String(item.id) === eventId);
  const event = foundEvent
    ? { ...foundEvent, status: getEventStatus(foundEvent) }
    : null;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event) return;

    const viewedEvents =
      JSON.parse(
        localStorage.getItem("recentlyViewedEvents")
      ) || [];

    const updatedEvents = [
      event,
      ...viewedEvents.filter((item) => item.id !== event.id),
    ].slice(0, 6);

    localStorage.setItem(
      "recentlyViewedEvents",
      JSON.stringify(updatedEvents)
    );
  }, [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white dark:bg-gray-900 shadow-xl p-10 text-center">
          <h1 className="text-5xl font-extrabold mb-4">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We could not find the event you were looking for.
          </p>
          <Link to="/events" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Event link copied!");
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const canSetReminder = isEventBookmarked(event.id) || isRegistered(event.id);
  const isRegistrationClosed = isEventRegistrationClosed(event);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em]">
              {event.type}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
              {event.title}
            </h1>
            <div
              className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300 prose prose-indigo dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(event.description)) }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {isRegistrationClosed ? (
              <>
                <span className="inline-flex items-center justify-center rounded-full bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 shadow-sm cursor-not-allowed dark:bg-gray-800 dark:text-gray-300">
                  Event Ended
                </span>
                {event.status === "past" && (
                  <CertificateDownload
                    eventName={event.title}
                    eventDate={event.date}
                    eventType={event.type}
                  />
                )}
              </>
            ) : (
              <Link
                to={`/events/${event.id}/register`}
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                Register Now
              </Link>
            )}

  {/* Copy Link Button */}
  <CopyLinkButton />

  <button
    onClick={() => window.print()}
    className="print-hide inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
    aria-label="Print or save as PDF"
  >
    🖨️ Print / Save as PDF
  </button>

  {isOrganizer && (
    <div className="relative print-hide">
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        aria-label="Export registrant data"
      >
        📥 Export Registrants
      </button>
      {showExportDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
          <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg py-1.5 z-20 animate-fadeIn text-left">
            <button
              onClick={() => {
                exportToCSV(mockRegistrants, `${event.title}_registrants`);
                setShowExportDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Export as CSV
            </button>
            <button
              onClick={() => {
                exportToJSON(mockRegistrants, `${event.title}_registrants`);
                setShowExportDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  )}

  <Link
    to="/events"
    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
  >
    Back to Events
  </Link>
</div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-start">

          {/* Left - Image and Details */}
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

{event.status === 'past' && (
  <EventMaterials materials={event.materials || [
    {
      "id": 1,
      "title": `${event.title} - Presentation Slides`,
      "type": "ppt",
      "size": "3.2 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    },
    {
      "id": 2,
      "title": `${event.title} - Session Notes`,
      "type": "pdf",
      "size": "1.5 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    },
    {
      "id": 3,
      "title": `${event.title} - Resource Guide`,
      "type": "doc",
      "size": "0.8 MB",
      "url": "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1"
    }
  ]} />
)}
          </div>

          {/* Right - Sidebar */}
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

            {/* ── Share & Add to Calendar ─────────────────────────────── */}
            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                Share & Add to Calendar
              </h3>

              {/* Social Share */}
              <ShareMenu
                shareData={generateEventSharingData({
                  ...event,
                  title: event.title,
                  description: event.description,
                  date: event.date,
                  id: event.id,
                })}
                position="top-left"
              >
                <button
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                  aria-label="Share this event"
                >
                  <Share2 size={15} className="text-indigo-500" />
                  Share Event
                </button>
              </ShareMenu>

              {/* Calendar export buttons */}
              <div className="flex flex-col gap-2">
                {/* Download .ics */}
                <button
                  onClick={() => {
                    downloadICSFile(event);
                    toast.success("Calendar invite downloaded!");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                  aria-label="Download .ics calendar invite"
                >
                  <CalendarPlus size={15} className="text-green-500" />
                  Download .ics Invite
                </button>

                {/* Google Calendar */}
                {generateGoogleCalendarLink(event) && (
                  <a
                    href={generateGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                    aria-label="Add to Google Calendar"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                      <path fill="#4285F4" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z"/>
                      <path fill="#fff" d="M13 7h-2v6l5.25 3.15.75-1.23-4-2.37z"/>
                    </svg>
                    Add to Google Calendar
                  </a>
                )}

                {/* Outlook */}
                {generateOutlookLink(event) && (
                  <a
                    href={generateOutlookLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                    aria-label="Add to Outlook Calendar"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                      <path fill="#0078D4" d="M2 6l10-4 10 4v12l-10 4L2 18z"/>
                      <path fill="#fff" d="M12 4L4 7v10l8 3 8-3V7z"/>
                    </svg>
                    Add to Outlook
                  </a>
                )}
              </div>
            </div>
            {/* ─────────────────────────────────────────────────────────── */}

            <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Summary</h3>
              <div
                className="mt-3 text-gray-700 dark:text-gray-300 text-sm leading-6 prose prose-indigo dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(event.description)) }}
              />
            </div>
          </aside>

        </div>

        {/* PERSONALIZED RECOMMENDATIONS SECTION */}
        <div className="mt-12">
          <EventRecommendations currentEventId={event.id} currentCategory={event.category} />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
