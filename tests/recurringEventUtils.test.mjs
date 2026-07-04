/**
 * recurringEventUtils.test.mjs
 * Test suite for recurring event utilities
 * Uses Node's built-in test runner
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  validateRecurrenceRule,
  isValidISODate,
  generateRecurrenceInstances,
  toRFC5545String,
  parseRFC5545String,
  detectSeriesConflicts,
  estimateInstanceCount,
  cloneRecurrenceRule,
  sanitizeRecurrenceRule
} from '../src/utils/recurringEventUtils.js';

// Helper to check if value is in array
const contains = (arr, val) => arr.includes(val);

// Helper to check if value is NOT in array
const notContains = (arr, val) => !arr.includes(val);

test('validateRecurrenceRule - should validate a valid daily recurrence rule', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 10
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validateRecurrenceRule - should reject invalid frequency', () => {
  const rule = {
    freq: 'INVALID',
    dtstart: '2024-01-01'
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, false);
  assert(result.errors.length > 0);
});

test('validateRecurrenceRule - should reject missing dtstart', () => {
  const rule = {
    freq: 'DAILY',
    count: 10
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, false);
});

test('validateRecurrenceRule - should warn when neither dtend nor count is specified', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01'
  };
  const result = validateRecurrenceRule(rule);
  assert(result.warnings.length > 0);
});

test('validateRecurrenceRule - should validate byweekday values', () => {
  const rule = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    byweekday: ['MO', 'WE', 'FR'],
    count: 10
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, true);
});

test('validateRecurrenceRule - should reject invalid weekday values', () => {
  const rule = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    byweekday: ['XX', 'YY']
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, false);
});

test('isValidISODate - should accept valid ISO dates', () => {
  assert.strictEqual(isValidISODate('2024-01-15'), true);
  assert.strictEqual(isValidISODate('2024-01-15T10:30:00'), true);
  assert.strictEqual(isValidISODate('2024-01-15T10:30:00Z'), true);
});

test('isValidISODate - should reject invalid dates', () => {
  assert.strictEqual(isValidISODate('01-15-2024'), false);
  assert.strictEqual(isValidISODate('2024/01/15'), false);
  assert.strictEqual(isValidISODate('invalid'), false);
  assert.strictEqual(isValidISODate(null), false);
});

test('generateRecurrenceInstances - should generate daily instances', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 5
  };
  const instances = generateRecurrenceInstances(rule);
  assert.strictEqual(instances.length, 5);
  assert.strictEqual(instances[0], '2024-01-01');
  assert.strictEqual(instances[4], '2024-01-05');
});

test('generateRecurrenceInstances - should generate weekly instances', () => {
  const rule = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    byweekday: ['MO'],
    count: 4
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('generateRecurrenceInstances - should respect interval', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    interval: 2,
    count: 3
  };
  const instances = generateRecurrenceInstances(rule);
  assert(contains(instances, '2024-01-01'));
  assert(contains(instances, '2024-01-03'));
});

test('generateRecurrenceInstances - should respect exception dates', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 5,
    exdates: ['2024-01-03']
  };
  const instances = generateRecurrenceInstances(rule);
  assert(notContains(instances, '2024-01-03'));
});

test('generateRecurrenceInstances - should handle maxInstances option', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 100
  };
  const instances = generateRecurrenceInstances(rule, { maxInstances: 10 });
  assert(instances.length <= 10);
});

test('toRFC5545String - should convert to RFC 5545 format', () => {
  const rule = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    interval: 2,
    byweekday: ['MO', 'WE', 'FR'],
    count: 10
  };
  const rruleStr = toRFC5545String(rule);
  assert(rruleStr.includes('RRULE:'));
  assert(rruleStr.includes('FREQ=WEEKLY'));
  assert(rruleStr.includes('INTERVAL=2'));
});

test('parseRFC5545String - should parse RFC 5545 format', () => {
  const rruleStr = 'RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5';
  const rule = parseRFC5545String(rruleStr);
  assert.strictEqual(rule.freq, 'DAILY');
  assert.strictEqual(rule.interval, 1);
  assert.strictEqual(rule.count, 5);
});

test('detectSeriesConflicts - should detect time overlaps', () => {
  const instances = [
    { id: 'inst1', date: '2024-01-15' },
    { id: 'inst2', date: '2024-01-22' }
  ];
  const existingEvents = [
    {
      id: 'evt1',
      title: 'Existing Event',
      startDate: '2024-01-15',
      endDate: '2024-01-15'
    }
  ];
  const conflicts = detectSeriesConflicts(instances, existingEvents);
  assert(conflicts.length > 0);
  assert.strictEqual(conflicts[0].conflictType, 'TIME_OVERLAP');
});

test('detectSeriesConflicts - should not detect conflicts for non-overlapping events', () => {
  const instances = [
    { id: 'inst1', date: '2024-01-15' }
  ];
  const existingEvents = [
    {
      id: 'evt1',
      title: 'Existing Event',
      startDate: '2024-01-20',
      endDate: '2024-01-20'
    }
  ];
  const conflicts = detectSeriesConflicts(instances, existingEvents);
  assert.strictEqual(conflicts.length, 0);
});

test('estimateInstanceCount - should estimate instances from count', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 30
  };
  assert.strictEqual(estimateInstanceCount(rule), 30);
});

test('estimateInstanceCount - should estimate instances from date range', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    dtend: '2024-01-31'
  };
  const estimate = estimateInstanceCount(rule);
  assert(estimate > 0);
});

test('estimateInstanceCount - should return 0 for null rule', () => {
  assert.strictEqual(estimateInstanceCount(null), 0);
});

test('cloneRecurrenceRule - should create a deep copy of a rule', () => {
  const original = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    byweekday: ['MO', 'WE', 'FR']
  };
  const cloned = cloneRecurrenceRule(original);
  
  assert.deepStrictEqual(cloned, original);
  assert.notStrictEqual(cloned, original);
  assert.notStrictEqual(cloned.byweekday, original.byweekday);
});

test('sanitizeRecurrenceRule - should sanitize and normalize a rule', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    interval: -1 // Invalid
  };
  const sanitized = sanitizeRecurrenceRule(rule);
  assert.strictEqual(sanitized.interval, 1); // Corrected
});

test('sanitizeRecurrenceRule - should set default values', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01'
  };
  const sanitized = sanitizeRecurrenceRule(rule);
  assert.strictEqual(sanitized.interval, 1);
  assert.strictEqual(sanitized.tzid, 'UTC');
  assert(Array.isArray(sanitized.exdates));
});

test('generateRecurrenceInstances - should handle leap years correctly', () => {
  const rule = {
    freq: 'YEARLY',
    dtstart: '2024-02-29', // Leap year
    count: 2
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('generateRecurrenceInstances - should handle monthly recurrence on month boundaries', () => {
  const rule = {
    freq: 'MONTHLY',
    dtstart: '2024-01-31',
    bymonthday: [31],
    count: 3
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('validateRecurrenceRule - should handle timezone information', () => {
  const rule = {
    freq: 'DAILY',
    dtstart: '2024-01-01',
    count: 5,
    tzid: 'America/New_York'
  };
  const result = validateRecurrenceRule(rule);
  assert.strictEqual(result.isValid, true);
});

test('generateRecurrenceInstances - should generate monthly instances', () => {
  const rule = {
    freq: 'MONTHLY',
    dtstart: '2024-01-15',
    bymonthday: [15],
    count: 3
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('generateRecurrenceInstances - should handle multiple bymonthdays', () => {
  const rule = {
    freq: 'MONTHLY',
    dtstart: '2024-01-01',
    bymonthday: [1, 15],
    count: 6
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('generateRecurrenceInstances - should generate yearly instances', () => {
  const rule = {
    freq: 'YEARLY',
    dtstart: '2024-06-15',
    bymonth: [6],
    bymonthday: [15],
    count: 3
  };
  const instances = generateRecurrenceInstances(rule);
  assert(instances.length > 0);
});

test('generateRecurrenceInstances - should handle null input gracefully', () => {
  const instances = generateRecurrenceInstances(null);
  assert.deepStrictEqual(instances, []);
});

test('validateRecurrenceRule - should handle malformed rules gracefully', () => {
  const result = validateRecurrenceRule({});
  assert.strictEqual(result.isValid, false);
  assert(result.errors.length > 0);
});
