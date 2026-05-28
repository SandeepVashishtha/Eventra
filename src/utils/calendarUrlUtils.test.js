/**
 * Tests for calendarUrlUtils.js
 *
 * Covers the two critical bugs fixed in issue #2015:
 *  1. Timezone-blindness — event local times were treated as UTC.
 *  2. Hardcoded 1-hour end time — event.durationMinutes was ignored.
 *
 * These tests use a fixed, well-known event in UTC so the expected
 * URL values are deterministic regardless of the test runner's locale.
 */

import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from './calendarUrlUtils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal event object for testing.
 *
 * @param {object} overrides - Field overrides
 * @returns {object}
 */
const mkEvent = (overrides = {}) => ({
  id: 1,
  title: 'Test Workshop',
  date: '2026-06-15',
  time: '10:00 AM',
  location: 'Online',
  description: 'A test workshop.',
  durationMinutes: 60,
  ...overrides,
});

// ---------------------------------------------------------------------------
// 1. getGoogleCalendarUrl — basic structure
// ---------------------------------------------------------------------------
describe('getGoogleCalendarUrl — structure', () => {
  test('returns a non-empty string', () => {
    const url = getGoogleCalendarUrl(mkEvent());
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  test('returns empty string when event is null', () => {
    expect(getGoogleCalendarUrl(null)).toBe('');
  });

  test('contains Google Calendar render endpoint', () => {
    const url = getGoogleCalendarUrl(mkEvent());
    expect(url).toContain('calendar.google.com/calendar/render');
  });

  test('contains encoded event title', () => {
    const event = mkEvent({ title: 'AI & ML Summit' });
    const url = getGoogleCalendarUrl(event);
    expect(url).toContain(encodeURIComponent('AI & ML Summit'));
  });

  test('contains dates parameter', () => {
    const url = getGoogleCalendarUrl(mkEvent());
    expect(url).toContain('dates=');
  });

  test('dates parameter contains start/end separated by slash', () => {
    const url = getGoogleCalendarUrl(mkEvent());
    const match = url.match(/dates=([^&]+)/);
    expect(match).not.toBeNull();
    const dates = decodeURIComponent(match[1]);
    expect(dates).toContain('/');
    const [start, end] = dates.split('/');
    expect(start.endsWith('Z')).toBe(true);
    expect(end.endsWith('Z')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Duration — end time respects event.durationMinutes
// ---------------------------------------------------------------------------
describe('getGoogleCalendarUrl — duration', () => {
  /**
   * Parse start and end UTC timestamps from the `dates=` query parameter.
   * Returns { startMs, endMs, durationMs } in milliseconds.
   */
  const parseDates = (url) => {
    const match = url.match(/dates=([^&]+)/);
    if (!match) return null;
    const [startStr, endStr] = decodeURIComponent(match[1]).split('/');
    // Compact format: "YYYYMMDDTHHmmssZ"
    const toMs = (s) => {
      const iso = `${s.substring(0, 4)}-${s.substring(4, 6)}-${s.substring(6, 8)}T${s.substring(9, 11)}:${s.substring(11, 13)}:${s.substring(13, 15)}Z`;
      return new Date(iso).getTime();
    };
    const startMs = toMs(startStr);
    const endMs   = toMs(endStr);
    return { startMs, endMs, durationMs: endMs - startMs };
  };

  test('1-hour event → end is exactly 60 minutes after start', () => {
    const url = getGoogleCalendarUrl(mkEvent({ durationMinutes: 60 }), 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(60 * 60 * 1000);
  });

  test('3-hour workshop → end is exactly 180 minutes after start', () => {
    const url = getGoogleCalendarUrl(mkEvent({ durationMinutes: 180 }), 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(180 * 60 * 1000);
  });

  test('90-minute event → end is exactly 90 minutes after start', () => {
    const url = getGoogleCalendarUrl(mkEvent({ durationMinutes: 90 }), 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(90 * 60 * 1000);
  });

  test('missing durationMinutes falls back to 60 minutes', () => {
    const event = mkEvent();
    delete event.durationMinutes;
    const url = getGoogleCalendarUrl(event, 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(60 * 60 * 1000);
  });

  test('durationMinutes: 0 falls back to 60 minutes', () => {
    const url = getGoogleCalendarUrl(mkEvent({ durationMinutes: 0 }), 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(60 * 60 * 1000);
  });
});

// ---------------------------------------------------------------------------
// 3. Timezone correctness
// ---------------------------------------------------------------------------
describe('getGoogleCalendarUrl — timezone correctness', () => {
  /**
   * Extract the start UTC epoch ms from the URL's dates= parameter.
   */
  const parseStartMs = (url) => {
    const match = url.match(/dates=([^&]+)/);
    if (!match) return null;
    const startStr = decodeURIComponent(match[1]).split('/')[0];
    const iso = `${startStr.substring(0, 4)}-${startStr.substring(4, 6)}-${startStr.substring(6, 8)}T${startStr.substring(9, 11)}:${startStr.substring(11, 13)}:${startStr.substring(13, 15)}Z`;
    return new Date(iso).getTime();
  };

  test('10:00 AM UTC event → start at 10:00 AM UTC in the URL', () => {
    const event = mkEvent({ date: '2026-06-15', time: '10:00 AM' });
    const url = getGoogleCalendarUrl(event, 'UTC');
    const startMs = parseStartMs(url);
    const startDate = new Date(startMs);
    expect(startDate.getUTCHours()).toBe(10);
    expect(startDate.getUTCMinutes()).toBe(0);
  });

  test('2:30 PM UTC event → start at 14:30 UTC in the URL', () => {
    const event = mkEvent({ date: '2026-06-15', time: '2:30 PM' });
    const url = getGoogleCalendarUrl(event, 'UTC');
    const startMs = parseStartMs(url);
    const startDate = new Date(startMs);
    expect(startDate.getUTCHours()).toBe(14);
    expect(startDate.getUTCMinutes()).toBe(30);
  });

  test('12:00 AM UTC event → start at 00:00 UTC (not 12:00)', () => {
    const event = mkEvent({ date: '2026-06-15', time: '12:00 AM' });
    const url = getGoogleCalendarUrl(event, 'UTC');
    const startMs = parseStartMs(url);
    const startDate = new Date(startMs);
    expect(startDate.getUTCHours()).toBe(0);
    expect(startDate.getUTCMinutes()).toBe(0);
  });

  test('12:00 PM UTC event → start at 12:00 UTC (noon)', () => {
    const event = mkEvent({ date: '2026-06-15', time: '12:00 PM' });
    const url = getGoogleCalendarUrl(event, 'UTC');
    const startMs = parseStartMs(url);
    const startDate = new Date(startMs);
    expect(startDate.getUTCHours()).toBe(12);
    expect(startDate.getUTCMinutes()).toBe(0);
  });

  test('11:00 PM UTC event → start at 23:00 UTC (not 35:00 overflow)', () => {
    const event = mkEvent({ date: '2026-06-15', time: '11:00 PM' });
    const url = getGoogleCalendarUrl(event, 'UTC');
    const startMs = parseStartMs(url);
    const startDate = new Date(startMs);
    expect(startDate.getUTCHours()).toBe(23);
    expect(startDate.getUTCMinutes()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. getOutlookCalendarUrl — basic structure and duration
// ---------------------------------------------------------------------------
describe('getOutlookCalendarUrl — structure', () => {
  test('returns a non-empty string', () => {
    const url = getOutlookCalendarUrl(mkEvent());
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
  });

  test('returns empty string when event is null', () => {
    expect(getOutlookCalendarUrl(null)).toBe('');
  });

  test('contains Outlook Live endpoint', () => {
    const url = getOutlookCalendarUrl(mkEvent());
    expect(url).toContain('outlook.live.com');
  });

  test('contains startdt and enddt parameters', () => {
    const url = getOutlookCalendarUrl(mkEvent());
    expect(url).toContain('startdt=');
    expect(url).toContain('enddt=');
  });

  test('startdt format is ISO-like (YYYY-MM-DDTHH:mm:ss)', () => {
    const url = getOutlookCalendarUrl(mkEvent(), 'UTC');
    const match = url.match(/startdt=([^&]+)/);
    expect(match).not.toBeNull();
    const startdt = decodeURIComponent(match[1]);
    // Must match YYYY-MM-DDTHH:mm:ss
    expect(startdt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });
});

describe('getOutlookCalendarUrl — duration', () => {
  const parseDates = (url) => {
    const startMatch = url.match(/startdt=([^&]+)/);
    const endMatch   = url.match(/enddt=([^&]+)/);
    if (!startMatch || !endMatch) return null;

    // ISO format without Z — treat as UTC
    const toMs = (s) => new Date(decodeURIComponent(s) + 'Z').getTime();
    const startMs = toMs(startMatch[1]);
    const endMs   = toMs(endMatch[1]);
    return { startMs, endMs, durationMs: endMs - startMs };
  };

  test('3-hour event → enddt is 180 minutes after startdt', () => {
    const url = getOutlookCalendarUrl(mkEvent({ durationMinutes: 180 }), 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(180 * 60 * 1000);
  });

  test('missing durationMinutes → enddt is 60 minutes after startdt', () => {
    const event = mkEvent();
    delete event.durationMinutes;
    const url = getOutlookCalendarUrl(event, 'UTC');
    const { durationMs } = parseDates(url);
    expect(durationMs).toBe(60 * 60 * 1000);
  });
});

// ---------------------------------------------------------------------------
// 5. Edge cases
// ---------------------------------------------------------------------------
describe('calendarUrlUtils — edge cases', () => {
  test('event with missing date returns a fallback URL string (not empty)', () => {
    const event = mkEvent({ date: undefined, time: '10:00 AM' });
    const url = getGoogleCalendarUrl(event);
    expect(typeof url).toBe('string');
    // Should at least contain the title
    expect(url).toContain(encodeURIComponent(event.title));
  });

  test('special characters in title/location are URL-encoded', () => {
    const event = mkEvent({ title: 'C++ & Rust: Zero-Cost Abstractions', location: 'Hall A/B' });
    const gUrl = getGoogleCalendarUrl(event, 'UTC');
    const oUrl = getOutlookCalendarUrl(event, 'UTC');
    expect(gUrl).not.toContain('C++ &');
    expect(oUrl).not.toContain('C++ &');
  });
});
