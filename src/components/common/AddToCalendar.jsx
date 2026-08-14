import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import {
    generateIcsFileBlobUrl,
    getGoogleCalendarUrl,
    getOutlookCalendarUrl,
    getYahooCalendarUrl,
    getWebcalSubscriptionUrl
} from "utils/calendarUrlUtils";
const to24HourTime = (timeStr) => {
  if (!timeStr) return '00:00';
  const match = String(timeStr).match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])?/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3] ? match[3].toUpperCase() : '';
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

const generateICalContent = (event, reminderMinutes = 30) => {
  const rawReminder =
    typeof reminderMinutes === "number"
      ? reminderMinutes
      : parseInt(reminderMinutes, 10);
  // Only emit a VALARM for a finite, positive, integer minute value; anything
  // else (negative, NaN, fractional, non-numeric) would produce a malformed
  // iCalendar TRIGGER such as -PT-15M or -PTNaNM. Invalid values disable the
  // reminder instead of emitting broken syntax.
  const validatedReminderMinutes =
    Number.isFinite(rawReminder) && rawReminder > 0 && Number.isInteger(rawReminder)
      ? rawReminder
      : 0;

  const formatICalDate = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const dt = new Date(`${dateStr}T${to24HourTime(timeStr)}:00`);
    return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  const start = formatICalDate(event.date, event.time);
  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  const endDate = new Date(new Date(`${event.date}T${to24HourTime(event.time)}:00`).getTime() + durationMs);
  const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventra//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title || 'Event'}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || ''}`,
    `URL:${event.joiningLink || window.location.href}`,
    `UID:${event.id || Date.now()}@eventra`,
    ...(validatedReminderMinutes > 0
      ? [
          'BEGIN:VALARM',
          `TRIGGER:-PT${validatedReminderMinutes}M`,
          'ACTION:DISPLAY',
          'DESCRIPTION:Reminder',
          'END:VALARM',
        ]
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

const toSafeFilename = (value) =>
  (value || 'event')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'event';

const downloadIcal = (event, reminderMinutes) => {
  const url = generateIcsFileBlobUrl(event, undefined, reminderMinutes);
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
const [added, setAdded] = useState("");
const [reminder, setReminder] = useState("30");
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
  const handleYahoo = () => {
    window.open(
        getYahooCalendarUrl(event),
        "_blank",
        "noopener,noreferrer"
    );

    setAdded("Yahoo Calendar");

    timeoutRef.current = setTimeout(() => {
        setOpen(false);
    }, 800);
};

  const handleIcal = () => {
    if (downloadIcal(event, reminder)) {
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
            <span className="text-xs font-medium text-gray-500 dark:text-gray-200">Choose calendar</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
  onClick={handleGoogle}
  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
>
  <img
    src="https://www.google.com/favicon.ico"
    alt=""
    className="w-4 h-4"
    loading="lazy"
  />
  Google Calendar
</button>

<button
  onClick={handleOutlook}
  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800"
>
  <img
    src="https://outlook.live.com/favicon.ico"
    alt=""
    className="w-4 h-4"
    loading="lazy"
  />
  Outlook Calendar
</button>

<div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
  <label className="block text-xs font-medium text-gray-500 dark:text-gray-200 mb-2">
    Reminder Time
  </label>

  <select
    value={reminder}
    onChange={(e) => setReminder(e.target.value)}
    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
  >
    <option value="10">10 minutes before</option>
    <option value="30">30 minutes before</option>
    <option value="60">1 hour before</option>
  </select>
</div>

<button
  onClick={handleIcal}
  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800"
>
  <Calendar className="w-4 h-4 text-gray-400" />
  Export to Apple Calendar (.ics)
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
