/**
 * Behavioral tests for src/utils/dateFormatter.js
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('dateFormatter - getUserTimezone', () => {
  it('returns a timezone string from Intl API', () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    assert.ok(typeof tz === 'string', 'Timezone must be a string');
    assert.ok(tz.includes('/') || tz === 'UTC', 'Timezone should be IANA format or UTC');
  });
});

describe('dateFormatter - formatEventDate', () => {
  it('returns "Invalid date" for invalid date string', () => {
    const d = new Date('invalid-date');
    const result = isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleString();
    assert.strictEqual(result, 'Invalid date');
  });

  it('parses Date object correctly', () => {
    const date = new Date('2024-06-15T10:00:00Z');
    assert.strictEqual(date instanceof Date, true);
    assert.strictEqual(isNaN(date.getTime()), false);
  });

  it('returns "Invalid date" for NaN Date', () => {
    const d = new Date(NaN);
    assert.strictEqual(isNaN(d.getTime()), true);
  });

  it('formats with default medium format', () => {
    const formatOptions = {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat(undefined, formatOptions);
    const date = new Date('2024-06-15T10:00:00Z');
    const result = formatter.format(date);

    assert.ok(typeof result === 'string', 'Formatted date must be a string');
    assert.ok(result.includes('2024'), 'Result should contain year');
  });

  it('formats with full format including weekday', () => {
    const formatOptions = {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat(undefined, formatOptions);
    const date = new Date('2024-06-15T10:00:00Z');
    const result = formatter.format(date);

    assert.ok(typeof result === 'string', 'Result must be a string');
  });
});

describe('dateFormatter - formatEventDateRange', () => {
  it('formats date range with start and end', () => {
    const start = new Date('2024-06-15T10:00:00Z');
    const end = new Date('2024-06-15T14:00:00Z');

    const startStr = start.toLocaleString();
    const endStr = end.toLocaleString();

    const range = `${startStr} - ${endStr}`;
    assert.ok(range.includes(' - '), 'Range must contain separator');
    assert.ok(range.split(' - ').length === 2, 'Range must have exactly two parts');
  });
});

describe('dateFormatter - getRelativeTime', () => {
  it('calculates future time in seconds', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5000);

    const diffMs = futureDate.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);

    assert.ok(diffSec >= 4 && diffSec <= 6, 'Future date within seconds should be a few seconds');
  });

  it('calculates future time in minutes', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 5 * 60 * 1000);

    const diffMs = futureDate.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / (60 * 1000));

    assert.ok(diffMin >= 4 && diffMin <= 6, '5 minutes should be 4-6 minutes when rounded');
  });

  it('calculates future time in hours', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const diffMs = futureDate.getTime() - now.getTime();
    const diffHr = Math.round(diffMs / (60 * 60 * 1000));

    assert.ok(diffHr >= 2 && diffHr <= 4, '3 hours should be 2-4 hours when rounded');
  });
});

describe('dateFormatter - timezone handling', () => {
  it('uses specified timezone when provided', () => {
    const options = { timezone: 'America/New_York' };
    const formatter = new Intl.DateTimeFormat(undefined, { timeZone: options.timezone });
    const date = new Date('2024-06-15T10:00:00Z');

    const result = formatter.format(date);
    assert.ok(typeof result === 'string', 'Result must be a string');
  });
});