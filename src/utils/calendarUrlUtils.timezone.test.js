// calendarUrlUtils.timezone.test.js
/**
 * @fileoverview Timezone and Daylight Saving Time (DST) validation tests for calendarUrlUtils.
 *
 * This test suite validates that:
 * 1. The calendar URL generation utilities properly handle different target timezones (non-UTC).
 * 2. Timezone conversion correctly translates local event times to UTC based on regional rules.
 * 3. Daylight Saving Time (DST) shifts are properly resolved depending on the event date
 *    (e.g., standard time vs. daylight/summer time in both Northern and Southern hemispheres).
 * 4. ESM import paths are strictly resolved with the correct '.js' extension.
 */

import { describe, test, expect } from "vitest";
import { 
  getGoogleCalendarUrl, 
  getOutlookCalendarUrl, 
  getYahooCalendarUrl, 
  generateIcsFileBlobUrl 
} from "./calendarUrlUtils.js";

/**
 * Helper factory function to construct standard mock event objects.
 *
 * @param {object} overrides - Field values to override the default event template.
 * @returns {object} A populated event object.
 */
const mkEvent = (overrides = {}) => ({
  id: 101,
  title: 'Global Sync Workshop',
  date: '2026-07-01',
  time: '10:00 AM', // Local time in standard or daylight time depending on the zone
  location: 'Virtual Room A',
  description: 'Interactive session discussing distributed architecture and ESM migration.',
  durationMinutes: 60,
  ...overrides,
});

describe('getGoogleCalendarUrl — Non-UTC Timezone Conversion (Asia/Kolkata)', () => {
  test('10:00 AM IST (UTC+5:30) on July 1st -> Should start at 04:30:00 UTC and end at 05:30:00 UTC', () => {
    const event = mkEvent({
      date: '2026-07-01',
      time: '10:00 AM', // 10:00 IST -> 10:00 - 5:30 = 04:30 UTC
      durationMinutes: 60
    });
    const url = getGoogleCalendarUrl(event, 'Asia/Kolkata');
    const match = url.match(/dates=([^&]+)/);
    expect(match).not.toBeNull();
    
    const dates = decodeURIComponent(match[1]);
    const [start, end] = dates.split('/');
    
    // start format: YYYYMMDDTHHmmssZ
    const startDate = start.slice(0, 8);
    const startTime = start.slice(9, 15); // HHmmss
    
    expect(startDate).toBe('20260701');
    expect(startTime).toBe('043000'); // 10:00 AM minus 5.5 hours = 04:30 AM UTC
    
    // end format: YYYYMMDDTHHmmssZ
    const endDate = end.slice(0, 8);
    const endTime = end.slice(9, 15);
    
    expect(endDate).toBe('20260701');
    expect(endTime).toBe('053000'); // 11:00 AM minus 5.5 hours = 05:30 AM UTC
  });
});

describe('getGoogleCalendarUrl — DST Handling in USA (America/New_York)', () => {
  // America/New_York is:
  // - EDT (UTC-4) in July (Daylight Saving Time)
  // - EST (UTC-5) in December (Standard Time)

  test('10:00 AM EDT (Summer/July) -> Should start at 14:00:00 UTC (UTC-4)', () => {
    const event = mkEvent({
      date: '2026-07-01',
      time: '10:00 AM', // 10:00 EDT -> 10:00 + 4:00 = 14:00 UTC
      durationMinutes: 90
    });
    
    const url = getGoogleCalendarUrl(event, 'America/New_York');
    const match = url.match(/dates=([^&]+)/);
    expect(match).not.toBeNull();
    
    const dates = decodeURIComponent(match[1]);
    const [start, end] = dates.split('/');
    
    const startTime = start.slice(9, 15);
    const endTime = end.slice(9, 15);
    
    expect(startTime).toBe('140000'); // 10:00 AM + 4 hours EDT offset = 14:00:00 UTC
    expect(endTime).toBe('153000');   // 11:30 AM + 4 hours EDT offset = 15:30:00 UTC
  });

  test('10:00 AM EST (Winter/December) -> Should start at 15:00:00 UTC (UTC-5)', () => {
    const event = mkEvent({
      date: '2026-12-01',
      time: '10:00 AM', // 10:00 EST -> 10:00 + 5:00 = 15:00 UTC
      durationMinutes: 120
    });
    
    const url = getGoogleCalendarUrl(event, 'America/New_York');
    const match = url.match(/dates=([^&]+)/);
    expect(match).not.toBeNull();
    
    const dates = decodeURIComponent(match[1]);
    const [start, end] = dates.split('/');
    
    const startTime = start.slice(9, 15);
    const endTime = end.slice(9, 15);
    
    expect(startTime).toBe('150000'); // 10:00 AM + 5 hours EST offset = 15:00:00 UTC
    expect(endTime).toBe('170000');   // 12:00 PM + 5 hours EST offset = 17:00:00 UTC
  });
});

describe('getOutlookCalendarUrl — Non-UTC Timezone Conversion (Europe/London)', () => {
  // Europe/London is:
  // - BST (UTC+1) in July (Daylight Saving Time)
  // - GMT (UTC+0) in December (Standard Time)

  test('02:00 PM BST (Summer/July) -> Should output startdt at 13:00:00 UTC (UTC+1)', () => {
    const event = mkEvent({
      date: '2026-07-15',
      time: '02:00 PM', // 14:00 BST -> 13:00 UTC
      durationMinutes: 60
    });
    
    const url = getOutlookCalendarUrl(event, 'Europe/London');
    const startMatch = url.match(/startdt=([^&]+)/);
    const endMatch = url.match(/enddt=([^&]+)/);
    
    expect(startMatch).not.toBeNull();
    expect(endMatch).not.toBeNull();
    
    const startdt = decodeURIComponent(startMatch[1]);
    const enddt = decodeURIComponent(endMatch[1]);
    
    // Outlook uses "YYYY-MM-DDTHH:mm:ss" UTC representation
    expect(startdt).toBe('2026-07-15T13:00:00'); // 14:00 BST - 1 hr = 13:00:00 UTC
    expect(enddt).toBe('2026-07-15T14:00:00');   // 15:00 BST - 1 hr = 14:00:00 UTC
  });

  test('02:00 PM GMT (Winter/December) -> Should output startdt at 14:00:00 UTC (UTC+0)', () => {
    const event = mkEvent({
      date: '2026-12-15',
      time: '02:00 PM', // 14:00 GMT -> 14:00 UTC
      durationMinutes: 60
    });
    
    const url = getOutlookCalendarUrl(event, 'Europe/London');
    const startMatch = url.match(/startdt=([^&]+)/);
    const endMatch = url.match(/enddt=([^&]+)/);
    
    expect(startMatch).not.toBeNull();
    expect(endMatch).not.toBeNull();
    
    const startdt = decodeURIComponent(startMatch[1]);
    const enddt = decodeURIComponent(endMatch[1]);
    
    expect(startdt).toBe('2026-12-15T14:00:00'); // 14:00 GMT = 14:00:00 UTC
    expect(enddt).toBe('2026-12-15T15:00:00');   // 15:00 GMT = 15:00:00 UTC
  });
});

describe('getYahooCalendarUrl — Non-UTC Timezone Conversion (Pacific/Auckland)', () => {
  // Pacific/Auckland is in the Southern Hemisphere:
  // - NZDT (UTC+13) in December (Southern Summer / DST)
  // - NZST (UTC+12) in July (Southern Winter / Standard Time)

  test('09:00 AM NZDT (Summer/December) -> Should start at 20:00:00 UTC previous day (UTC+13)', () => {
    const event = mkEvent({
      date: '2026-12-10',
      time: '09:00 AM', // 09:00 NZDT -> 09:00 - 13 hours = 20:00 UTC on 2026-12-09
      durationMinutes: 120
    });
    
    const url = getYahooCalendarUrl(event, 'Pacific/Auckland');
    const stMatch = url.match(/ST=([^&]+)/);
    const etMatch = url.match(/ET=([^&]+)/);
    
    expect(stMatch).not.toBeNull();
    expect(etMatch).not.toBeNull();
    
    const st = decodeURIComponent(stMatch[1]);
    const et = decodeURIComponent(etMatch[1]);
    
    expect(st).toBe('20261209T200000Z'); // 2026-12-10 09:00 minus 13 hours is 2026-12-09 20:00:00
    expect(et).toBe('20261209T220000Z'); // 2026-12-10 11:00 minus 13 hours is 2026-12-09 22:00:00
  });

  test('09:00 AM NZST (Winter/July) -> Should start at 21:00:00 UTC previous day (UTC+12)', () => {
    const event = mkEvent({
      date: '2026-07-10',
      time: '09:00 AM', // 09:00 NZST -> 09:00 - 12 hours = 21:00 UTC on 2026-07-09
      durationMinutes: 120
    });
    
    const url = getYahooCalendarUrl(event, 'Pacific/Auckland');
    const stMatch = url.match(/ST=([^&]+)/);
    const etMatch = url.match(/ET=([^&]+)/);
    
    expect(stMatch).not.toBeNull();
    expect(etMatch).not.toBeNull();
    
    const st = decodeURIComponent(stMatch[1]);
    const et = decodeURIComponent(etMatch[1]);
    
    expect(st).toBe('20260709T210000Z'); // 2026-07-10 09:00 minus 12 hours is 2026-07-09 21:00:00
    expect(et).toBe('20260709T230000Z'); // 2026-07-10 11:00 minus 12 hours is 2026-07-09 23:00:00
  });
});
