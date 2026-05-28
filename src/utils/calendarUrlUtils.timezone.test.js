// calendarUrlUtils.timezone.test.js
/**
 * Tests for timezone handling in calendarUrlUtils when a non-UTC timezone is provided.
 */
import { getGoogleCalendarUrl } from './calendarUrlUtils';

const mkEvent = (overrides = {}) => ({
  id: 1,
  title: 'IST Workshop',
  date: '2026-07-01',
  time: '10:00 AM', // Local time in IST (UTC+5:30)
  location: 'Online',
  description: 'Workshop in IST timezone',
  durationMinutes: 60,
  ...overrides,
});

describe('getGoogleCalendarUrl — non-UTC timezone conversion', () => {
  test('10:00 AM IST → start at 04:30 UTC in URL', () => {
    const event = mkEvent();
    const url = getGoogleCalendarUrl(event, 'Asia/Kolkata');
    const match = url.match(/dates=([^&]+)/);
    expect(match).not.toBeNull();
    const dates = decodeURIComponent(match[1]);
    const [start, end] = dates.split('/');
    // start format: YYYYMMDDTHHmmssZ, we extract HHmmss
    const startTime = start.slice(9, 15); // HHmmss
    // Expect 04:30:00 => "043000"
    expect(startTime).toBe('043000');
    // End should be 05:30:00 => "053000"
    const endTime = end.slice(9, 15);
    expect(endTime).toBe('053000');
  });
});

export const isDstActive = (date) => {
  return date.getTimezoneOffset() < Math.max(
    new Date(date.getFullYear(), 0, 1).getTimezoneOffset(),
    new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  );
};
