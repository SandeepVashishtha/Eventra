import React, { useState } from 'react';

// Helper function to parse localized date strings using Intl options or explicit ISO/format patterns
export const parseLocalizedDate = (dateString, locale = navigator.language) => {
  if (!dateString) return null;

  // Handle standard ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Handle DD/MM/YYYY or MM/DD/YYYY based on locale or common formats
  const parts = dateString.split(/[/.-]/);
  if (parts.length === 3) {
    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const p3 = parseInt(parts[2], 10);

    // If p1 > 12, it's explicitly DD/MM/YYYY
    if (p1 > 12 && p3 > 1000) {
      return new Date(p3, p2 - 1, p1);
    }

    // Locale heuristic: US defaults to MM/DD/YYYY, most non-US locales default to DD/MM/YYYY
    const isUSLocale = /^en-US/i.test(locale);
    if (isUSLocale) {
      return new Date(p3 > 1000 ? p3 : p1, p3 > 1000 ? p1 - 1 : p2 - 1, p3 > 1000 ? p2 : p3);
    } else {
      // Non-US default: DD/MM/YYYY
      return new Date(p3 > 1000 ? p3 : p1, p3 > 1000 ? p2 - 1 : p1 - 1, p3 > 1000 ? p1 : p2);
    }
  }

  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
};

export const DateRangePicker = ({ startDate, endDate, onChange, locale }) => {
  const activeLocale = locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  const [startInput, setStartInput] = useState(startDate || '');
  const [endInput, setEndInput] = useState(endDate || '');

  const handleStartChange = (e) => {
    const val = e.target.value;
    setStartInput(val);
    const parsedDate = parseLocalizedDate(val, activeLocale);
    if (parsedDate && onChange) {
      onChange({ startDate: parsedDate, endDate: parseLocalizedDate(endInput, activeLocale) });
    }
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    setEndInput(val);
    const parsedDate = parseLocalizedDate(val, activeLocale);
    if (parsedDate && onChange) {
      onChange({ startDate: parseLocalizedDate(startInput, activeLocale), endDate: parsedDate });
    }
  };

  return (
    <div className="date-range-picker flex gap-4 items-center">
      <div>
        <label className="block text-xs text-gray-500">Start Date</label>
        <input
          type="text"
          value={startInput}
          onChange={handleStartChange}
          placeholder={activeLocale.startsWith('en-US') ? 'MM/DD/YYYY' : 'DD/MM/YYYY'}
          className="border rounded p-2"
        />
      </div>
      <span>to</span>
      <div>
        <label className="block text-xs text-gray-500">End Date</label>
        <input
          type="text"
          value={endInput}
          onChange={handleEndChange}
          placeholder={activeLocale.startsWith('en-US') ? 'MM/DD/YYYY' : 'DD/MM/YYYY'}
          className="border rounded p-2"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
