import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink, X } from 'lucide-react';
import { generateIcsFileBlobUrl, getGoogleCalendarUrl, getOutlookCalendarUrl } from 'utils/calendarUrlUtils';

const toSafeFilename = (value) =>
  (value || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event';

const downloadIcal = (event) => {
  const url = generateIcsFileBlobUrl(event);
  if (!url) return false;

  const a = document.createElement('a');
  a.href = url;
  a.download = `${toSafeFilename(event.title)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 200);
  return true;
};

export default function AddToCalendar({ event, className = '', iconOnly = false }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState('');
  const timeoutRef = useRef(null);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  if (!event) return null;

  const handleGoogle = () => {
    const url = getGoogleCalendarUrl(event);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setAdded('Google Calendar');
    timeoutRef.current = setTimeout(() => setOpen(false), 800);
  };

  const handleOutlook = () => {
    const url = getOutlookCalendarUrl(event);
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
    setAdded('Outlook');
    timeoutRef.current = setTimeout(() => setOpen(false), 800);
  };

  const handleIcal = () => {
    if (downloadIcal(event)) {
      setAdded('iCal file');
      timeoutRef.current = setTimeout(() => setOpen(false), 800);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={iconOnly
          ? "rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm hover:border-indigo-200 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-indigo-500 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
          : "flex w-full items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"}
        aria-haspopup="true"
        aria-expanded={open}
        title="Add to Calendar"
      >
        <Calendar className={iconOnly ? "w-3.5 h-3.5 text-gray-600 dark:text-gray-300" : "w-4 h-4"} />
        {!iconOnly && (
          <>
            Add to Calendar
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Choose calendar</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button onClick={handleGoogle} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <ExternalLink className="w-4 h-4 text-blue-500" />
            Google Calendar
          </button>
          <button onClick={handleOutlook} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800">
            <ExternalLink className="w-4 h-4 text-sky-600" />
            Outlook Calendar
          </button>
          <button onClick={handleIcal} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800">
            <Download className="w-4 h-4 text-gray-400" />
            Download iCal (.ics)
          </button>
          {added && (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-800">
              <p className="text-xs text-green-600 dark:text-green-400">Opening {added}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
