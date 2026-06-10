import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from '../../utils/calendarUrlUtils';

const generateICalContent = (event) => {
  const formatICalDate = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const dt = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
    return dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  const start = formatICalDate(event.date, event.time);
  const durationMs = (event.durationMinutes || 60) * 60 * 1000;
  const endDate = new Date(new Date(`${event.date}T${event.time || '00:00'}:00`).getTime() + durationMs);
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
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

const downloadIcal = (event) => {
  const content = generateICalContent(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(event.title || 'event').replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function AddToCalendar({ event, className = '' }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState('');

  if (!event) return null;

  const handleGoogle = () => {
    window.open(getGoogleCalendarUrl(event), '_blank', 'noopener,noreferrer');
    setAdded('Google Calendar');
    setTimeout(() => setOpen(false), 800);
  };

  const handleOutlook = () => {
    window.open(getOutlookCalendarUrl(event), '_blank', 'noopener,noreferrer');
    setAdded('Outlook');
    setTimeout(() => setOpen(false), 800);
  };

  const handleIcal = () => {
    downloadIcal(event);
    setAdded('iCal');
    setTimeout(() => setOpen(false), 800);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
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
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
            Google Calendar
          </button>
          <button onClick={handleOutlook} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800">
            <img src="https://outlook.live.com/favicon.ico" alt="" className="w-4 h-4" />
            Outlook Calendar
          </button>
          <button onClick={handleIcal} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-t border-gray-100 dark:border-gray-800">
            <Calendar className="w-4 h-4 text-gray-400" />
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