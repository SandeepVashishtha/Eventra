import React from 'react';
import { CalendarPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import CopyButton from '../ui/CopyButton';
import SocialShareButtons from '../common/SocialShareButtons';
import { downloadICSFile, generateGoogleCalendarLink, generateOutlookLink } from '../../utils/calendarExporter';

const EventShareSidebar = ({ event }) => (
  <div className="rounded-3xl bg-slate-50 p-5 dark:bg-gray-800 space-y-4">
    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Share & Add to Calendar</h3>
    <SocialShareButtons event={event} layout="grid" />
    <div className="mt-4">
      <CopyButton textToCopy={window.location.href} />
    </div>

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
  </div>
);

export default EventShareSidebar;
