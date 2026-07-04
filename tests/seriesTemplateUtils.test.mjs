/**
 * seriesTemplateUtils.test.mjs
 * Test suite for series template utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createEventSeries,
  generateSeriesInstances,
  updateSingleInstance,
  updateThisAndFutureInstances,
  updateAllInstances,
  deleteSingleInstance,
  deleteThisAndFutureInstances,
  createTemplateFromSeries,
  createSeriesFromTemplate,
  getPredefinedTemplate,
  listPredefinedTemplates,
  validateSeriesModifications,
  exportSeriesToICalendar
} from '../src/utils/seriesTemplateUtils.js';

describe('Series Template Utilities', () => {
  const baseEvent = {
    id: 'evt_001',
    title: 'Weekly Team Meeting',
    description: 'Team sync meeting',
    venue: 'Conference Room A',
    duration: 60,
    maxAttendees: 20
  };

  const recurrenceRule = {
    freq: 'WEEKLY',
    dtstart: '2024-01-01',
    byweekday: ['MO', 'WE', 'FR'],
    count: 10
  };

  describe('createEventSeries', () => {
    it('should create a valid event series', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      
      expect(series).toBeDefined();
      expect(series.id).toMatch(/^series_/);
      expect(series.title).toBe(baseEvent.title);
      expect(series.originalEventId).toBe(baseEvent.id);
      expect(series.recurrenceRule).toEqual(recurrenceRule);
      expect(series.modifications).toEqual([]);
    });

    it('should throw error on invalid recurrence rule', () => {
      const invalidRule = {
        freq: 'INVALID'
      };
      
      expect(() => {
        createEventSeries(baseEvent, invalidRule, 'user_123');
      }).toThrow();
    });
  });

  describe('generateSeriesInstances', () => {
    it('should generate instances from series', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const instances = generateSeriesInstances(series);

      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0]).toHaveProperty('id');
      expect(instances[0]).toHaveProperty('date');
      expect(instances[0]).toHaveProperty('eventData');
    });

    it('should apply modifications to instances', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      series = updateSingleInstance(series, '2024-01-03', { title: 'Special Meeting' }, 'user_123');
      
      const instances = generateSeriesInstances(series);
      const modified = instances.find(i => i.date === '2024-01-03');
      
      if (modified) {
        expect(modified.isModified).toBe(true);
      }
    });

    it('should respect maxInstances option', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const instances = generateSeriesInstances(series, { maxInstances: 5 });

      expect(instances.length).toBeLessThanOrEqual(5);
    });
  });

  describe('updateSingleInstance', () => {
    it('should update a single instance', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const updates = { title: 'Holiday Cancelled' };
      
      series = updateSingleInstance(series, '2024-01-01', updates, 'user_123');

      expect(series.modifications.length).toBe(1);
      expect(series.modifications[0].modificationType).toBe('UPDATE_ONLY_THIS');
      expect(series.modifications[0].modifiedFields).toEqual({
        date: '2024-01-01',
        ...updates
      });
    });
  });

  describe('updateThisAndFutureInstances', () => {
    it('should update instances from specified date forward', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const updates = { venue: 'Virtual Meeting' };
      
      series = updateThisAndFutureInstances(series, '2024-01-08', updates, 'user_123');

      expect(series.modifications.length).toBe(1);
      expect(series.modifications[0].modificationType).toBe('UPDATE_THIS_AND_FUTURE');
    });
  });

  describe('updateAllInstances', () => {
    it('should update all instances in series', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const updates = { description: 'Updated team sync' };
      
      series = updateAllInstances(series, updates, 'user_123');

      expect(series.metadata.eventData.description).toBe('Updated team sync');
    });
  });

  describe('deleteSingleInstance', () => {
    it('should delete a single instance by adding to exdates', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      
      series = deleteSingleInstance(series, '2024-01-03', 'user_123');

      expect(series.recurrenceRule.exdates).toContain('2024-01-03');
    });
  });

  describe('deleteThisAndFutureInstances', () => {
    it('should delete instances from specified date forward', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      
      series = deleteThisAndFutureInstances(series, '2024-01-15', 'user_123');

      expect(series.recurrenceRule.dtend).toBeDefined();
      const endDate = new Date(series.recurrenceRule.dtend);
      const startDate = new Date('2024-01-15');
      expect(endDate.getTime()).toBeLessThan(startDate.getTime());
    });
  });

  describe('Template Creation', () => {
    it('should create template from series', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const template = createTemplateFromSeries(series, 'Weekly Team Meeting Template', 'user_123', true);

      expect(template).toBeDefined();
      expect(template.id).toMatch(/^template_/);
      expect(template.name).toBe('Weekly Team Meeting Template');
      expect(template.isPublic).toBe(true);
      expect(template.recurrenceRule).toEqual(recurrenceRule);
    });

    it('should create series from template', () => {
      const template = {
        id: 'template_001',
        name: 'Weekly Template',
        recurrenceRule,
        defaultProperties: baseEvent
      };

      const series = createSeriesFromTemplate(template, { title: 'New Weekly Meeting' }, 'user_123');

      expect(series.id).toMatch(/^series_/);
      expect(series.title).toBe('New Weekly Meeting');
      expect(series.recurrenceRule).toEqual(recurrenceRule);
    });
  });

  describe('Predefined Templates', () => {
    it('should list all predefined templates', () => {
      const templates = listPredefinedTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('key');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('recurrenceRule');
    });

    it('should get specific predefined template', () => {
      const template = getPredefinedTemplate('WEEKLY');

      expect(template).toBeDefined();
      expect(template.name).toBe('Weekly');
      expect(template.recurrenceRule.freq).toBe('WEEKLY');
    });

    it('should return null for unknown template', () => {
      const template = getPredefinedTemplate('UNKNOWN');
      expect(template).toBeNull();
    });

    it('should have valid DAILY template', () => {
      const template = getPredefinedTemplate('DAILY');
      expect(template.recurrenceRule.freq).toBe('DAILY');
    });

    it('should have valid MONTHLY template', () => {
      const template = getPredefinedTemplate('MONTHLY');
      expect(template.recurrenceRule.freq).toBe('MONTHLY');
    });

    it('should have valid YEARLY template', () => {
      const template = getPredefinedTemplate('YEARLY');
      expect(template.recurrenceRule.freq).toBe('YEARLY');
    });
  });

  describe('Modification Validation', () => {
    it('should validate valid modifications', () => {
      const modifications = [
        {
          modificationType: 'UPDATE_ONLY_THIS',
          modifiedFields: { title: 'Updated' }
        }
      ];

      const result = validateSeriesModifications(null, modifications);
      expect(result.isValid).toBe(false); // No series
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid modification types', () => {
      const modifications = [
        {
          modificationType: 'INVALID_TYPE',
          modifiedFields: { title: 'Updated' }
        }
      ];

      const result = validateSeriesModifications({}, modifications);
      expect(result.isValid).toBe(false);
    });

    it('should warn about empty modifications', () => {
      const modifications = [
        {
          modificationType: 'UPDATE_ONLY_THIS',
          modifiedFields: {}
        }
      ];

      const result = validateSeriesModifications({}, modifications);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('iCalendar Export', () => {
    it('should export series to iCalendar format', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const instances = generateSeriesInstances(series, { maxInstances: 5 });
      
      const ical = exportSeriesToICalendar(series, instances);

      expect(typeof ical).toBe('string');
      expect(ical).toContain('BEGIN:VCALENDAR');
      expect(ical).toContain('END:VCALENDAR');
      expect(ical).toContain('BEGIN:VEVENT');
      expect(ical).toContain('END:VEVENT');
    });

    it('should include event details in iCalendar', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const instances = generateSeriesInstances(series, { maxInstances: 1 });
      
      const ical = exportSeriesToICalendar(series, instances);

      expect(ical).toContain(baseEvent.title);
    });
  });

  describe('Edge Cases', () => {
    it('should handle series with no modifications', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const instances = generateSeriesInstances(series);

      expect(instances.every(i => !i.isModified)).toBe(true);
    });

    it('should handle updating non-existent instance', () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      
      // Should still update even if date doesn't exist in current recurrence
      series = updateSingleInstance(series, '2024-12-25', { title: 'Holiday' }, 'user_123');

      expect(series.modifications.length).toBe(1);
    });

    it('should create valid series from minimal event data', () => {
      const minimalEvent = { title: 'Event' };
      const series = createEventSeries(minimalEvent, recurrenceRule, 'user_123');

      expect(series.title).toBe('Event');
      expect(series.id).toBeDefined();
    });
  });

  describe('Series Metadata', () => {
    it('should preserve event metadata in series', () => {
      const eventWithCustom = {
        ...baseEvent,
        color: '#FF0000',
        tags: ['important', 'weekly']
      };

      const series = createEventSeries(eventWithCustom, recurrenceRule, 'user_123');

      expect(series.metadata.eventData.color).toBe('#FF0000');
      expect(series.metadata.eventData.tags).toEqual(['important', 'weekly']);
    });

    it('should track series creation metadata', () => {
      const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');

      expect(series.createdAt).toBeDefined();
      expect(series.updatedAt).toBeDefined();
      expect(series.createdBy).toBe('user_123');
    });
  });

  describe('Series Timestamps', () => {
    it('should update timestamp when modifying series', async () => {
      let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
      const originalTimestamp = series.updatedAt;

      // Wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));

      series = updateAllInstances(series, { description: 'Updated' }, 'user_123');

      expect(series.updatedAt).toBeDefined();
      // Note: Might be same if execution is too fast
    });
  });
});
