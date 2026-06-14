import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from 'lucide-react';
import CertificateDownload from '../CertificateDownload';
import EventCancellationModal from './EventCancellationModal';

const EventHeaderActions = ({
  event, isRegistrationClosed, isOrganizer, showCancelModal, setShowCancelModal,
  handlePrint, isPrinting, handleDuplicateEvent, showExportDropdown, setShowExportDropdown,
  handleExport, exportingRegistrants, setShowShareModal, setEvent
}) => (
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

    <button onClick={() => setShowShareModal(true)} className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition">
      Share Event
    </button>

    {isOrganizer && event.status !== "cancelled" && (
      <button onClick={() => setShowCancelModal(true)} className="inline-flex items-center justify-center rounded-full border border-red-500 px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
        Cancel Event
      </button>
    )}

    {showCancelModal && (
      <EventCancellationModal event={event} onClose={() => setShowCancelModal(false)} onSuccess={(updated) => setEvent({ ...event, ...updated })} />
    )}
    
    <button onClick={handlePrint} disabled={isPrinting} className="print-hide inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800" aria-label="Print or save as PDF">
      {isPrinting ? "Preparing..." : "≡ƒû¿∩╕Å Print / Save as PDF"}
    </button>

    {isOrganizer && (
      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={handleDuplicateEvent} className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800" aria-label="Duplicate event">
          <CalendarPlus size={18} /> Duplicate Event
        </button>
        <div className="relative print-hide">
          <button onClick={() => setShowExportDropdown(!showExportDropdown)} className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 cursor-pointer" aria-label="Export registrant data">
            ≡ƒôÑ Export Registrants
          </button>
          {showExportDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportDropdown(false)} />
              <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg py-1.5 z-20 animate-fadeIn text-left">
                <button onClick={() => handleExport('csv')} disabled={exportingRegistrants} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">Export as CSV</button>
                <button onClick={() => handleExport('json')} disabled={exportingRegistrants} className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50">Export as JSON</button>
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
);

export default EventHeaderActions;
