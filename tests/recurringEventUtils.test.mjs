/**
 * recurringEventUtils.test.mjs
 * Test suite for recurring event utilities
 */

import { describe, it, expect } from 'vitest';
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

describe('Recurring Event Utilities', () => {
  describe('validateRecurrenceRule', () => {
    it('should validate a valid daily recurrence rule', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 10
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid frequency', () => {
      const rule = {
        freq: 'INVALID',
        dtstart: '2024-01-01'
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject missing dtstart', () => {
      const rule = {
        freq: 'DAILY',
        count: 10
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(false);
    });

    it('should warn when neither dtend nor count is specified', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01'
      };
      const result = validateRecurrenceRule(rule);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate byweekday values', () => {
      const rule = {
        freq: 'WEEKLY',
        dtstart: '2024-01-01',
        byweekday: ['MO', 'WE', 'FR'],
        count: 10
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid weekday values', () => {
      const rule = {
        freq: 'WEEKLY',
        dtstart: '2024-01-01',
        byweekday: ['XX', 'YY']
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(false);
    });
  });

  describe('isValidISODate', () => {
    it('should accept valid ISO dates', () => {
      expect(isValidISODate('2024-01-15')).toBe(true);
      expect(isValidISODate('2024-01-15T10:30:00')).toBe(true);
      expect(isValidISODate('2024-01-15T10:30:00Z')).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidISODate('01-15-2024')).toBe(false);
      expect(isValidISODate('2024/01/15')).toBe(false);
      expect(isValidISODate('invalid')).toBe(false);
      expect(isValidISODate(null)).toBe(false);
    });
  });

  describe('generateRecurrenceInstances', () => {
    it('should generate daily instances', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 5
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances).toHaveLength(5);
      expect(instances[0]).toBe('2024-01-01');
      expect(instances[4]).toBe('2024-01-05');
    });

    it('should generate weekly instances', () => {
      const rule = {
        freq: 'WEEKLY',
        dtstart: '2024-01-01',
        byweekday: ['MO'],
        count: 4
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });

    it('should respect interval', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        interval: 2,
        count: 3
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances).toContain('2024-01-01');
      expect(instances).toContain('2024-01-03');
    });

    it('should respect exception dates', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 5,
        exdates: ['2024-01-03']
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances).not.toContain('2024-01-03');
    });

    it('should handle maxInstances option', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 100
      };
      const instances = generateRecurrenceInstances(rule, { maxInstances: 10 });
      expect(instances.length).toBeLessThanOrEqual(10);
    });
  });

  describe('RFC 5545 Conversion', () => {
    it('should convert to RFC 5545 format', () => {
      const rule = {
        freq: 'WEEKLY',
        dtstart: '2024-01-01',
        interval: 2,
        byweekday: ['MO', 'WE', 'FR'],
        count: 10
      };
      const rruleStr = toRFC5545String(rule);
      expect(rruleStr).toContain('RRULE:');
      expect(rruleStr).toContain('FREQ=WEEKLY');
      expect(rruleStr).toContain('INTERVAL=2');
    });

    it('should parse RFC 5545 format', () => {
      const rruleStr = 'RRULE:FREQ=DAILY;INTERVAL=1;COUNT=5';
      const rule = parseRFC5545String(rruleStr);
      expect(rule.freq).toBe('DAILY');
      expect(rule.interval).toBe(1);
      expect(rule.count).toBe(5);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect time overlaps', () => {
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
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].conflictType).toBe('TIME_OVERLAP');
    });

    it('should not detect conflicts for non-overlapping events', () => {
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
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Instance Estimation', () => {
    it('should estimate instances from count', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 30
      };
      expect(estimateInstanceCount(rule)).toBe(30);
    });

    it('should estimate instances from date range', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        dtend: '2024-01-31'
      };
      const estimate = estimateInstanceCount(rule);
      expect(estimate).toBeGreaterThan(0);
    });

    it('should return 0 for null rule', () => {
      expect(estimateInstanceCount(null)).toBe(0);
    });
  });

  describe('Rule Cloning', () => {
    it('should create a deep copy of a rule', () => {
      const original = {
        freq: 'WEEKLY',
        dtstart: '2024-01-01',
        byweekday: ['MO', 'WE', 'FR']
      };
      const cloned = cloneRecurrenceRule(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.byweekday).not.toBe(original.byweekday);
    });
  });

  describe('Rule Sanitization', () => {
    it('should sanitize and normalize a rule', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        interval: -1 // Invalid
      };
      const sanitized = sanitizeRecurrenceRule(rule);
      expect(sanitized.interval).toBe(1); // Corrected
    });

    it('should set default values', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01'
      };
      const sanitized = sanitizeRecurrenceRule(rule);
      expect(sanitized.interval).toBe(1);
      expect(sanitized.tzid).toBe('UTC');
      expect(Array.isArray(sanitized.exdates)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle leap years correctly', () => {
      const rule = {
        freq: 'YEARLY',
        dtstart: '2024-02-29', // Leap year
        count: 2
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });

    it('should handle monthly recurrence on month boundaries', () => {
      const rule = {
        freq: 'MONTHLY',
        dtstart: '2024-01-31',
        bymonthday: [31],
        count: 3
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });

    it('should handle timezone information', () => {
      const rule = {
        freq: 'DAILY',
        dtstart: '2024-01-01',
        count: 5,
        tzid: 'America/New_York'
      };
      const result = validateRecurrenceRule(rule);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Monthly Recurrence', () => {
    it('should generate monthly instances', () => {
      const rule = {
        freq: 'MONTHLY',
        dtstart: '2024-01-15',
        bymonthday: [15],
        count: 3
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });

    it('should handle multiple bymonthdays', () => {
      const rule = {
        freq: 'MONTHLY',
        dtstart: '2024-01-01',
        bymonthday: [1, 15],
        count: 6
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });
  });

  describe('Yearly Recurrence', () => {
    it('should generate yearly instances', () => {
      const rule = {
        freq: 'YEARLY',
        dtstart: '2024-06-15',
        bymonth: [6],
        bymonthday: [15],
        count: 3
      };
      const instances = generateRecurrenceInstances(rule);
      expect(instances.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle null input gracefully', () => {
      const instances = generateRecurrenceInstances(null);
      expect(instances).toEqual([]);
    });

    it('should handle malformed rules gracefully', () => {
      const result = validateRecurrenceRule({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
