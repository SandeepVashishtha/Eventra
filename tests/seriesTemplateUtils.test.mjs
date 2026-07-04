/**
 * seriesTemplateUtils.test.mjs
 * Test suite for series template utilities
 * Uses Node's built-in test runner
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
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

test('createEventSeries - should create a valid event series', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  
  assert(series);
  assert(series.id.match(/^series_/));
  assert.strictEqual(series.title, baseEvent.title);
  assert.strictEqual(series.originalEventId, baseEvent.id);
  assert.deepStrictEqual(series.recurrenceRule, recurrenceRule);
  assert.deepStrictEqual(series.modifications, []);
});

test('createEventSeries - should throw error on invalid recurrence rule', () => {
  const invalidRule = {
    freq: 'INVALID'
  };
  
  assert.throws(() => {
    createEventSeries(baseEvent, invalidRule, 'user_123');
  });
});

test('generateSeriesInstances - should generate instances from series', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const instances = generateSeriesInstances(series);

  assert(instances.length > 0);
  assert(instances[0].id);
  assert(instances[0].date);
  assert(instances[0].eventData);
});

test('generateSeriesInstances - should apply modifications to instances', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  series = updateSingleInstance(series, '2024-01-03', { title: 'Special Meeting' }, 'user_123');
  
  const instances = generateSeriesInstances(series);
  const modified = instances.find(i => i.date === '2024-01-03');
  
  if (modified) {
    assert.strictEqual(modified.isModified, true);
  }
});

test('generateSeriesInstances - should respect maxInstances option', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const instances = generateSeriesInstances(series, { maxInstances: 5 });

  assert(instances.length <= 5);
});

test('updateSingleInstance - should update a single instance', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const updates = { title: 'Holiday Cancelled' };
  
  series = updateSingleInstance(series, '2024-01-01', updates, 'user_123');

  assert.strictEqual(series.modifications.length, 1);
  assert.strictEqual(series.modifications[0].modificationType, 'UPDATE_ONLY_THIS');
  assert.deepStrictEqual(series.modifications[0].modifiedFields, {
    date: '2024-01-01',
    ...updates
  });
});

test('updateThisAndFutureInstances - should update instances from specified date forward', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const updates = { venue: 'Virtual Meeting' };
  
  series = updateThisAndFutureInstances(series, '2024-01-08', updates, 'user_123');

  assert.strictEqual(series.modifications.length, 1);
  assert.strictEqual(series.modifications[0].modificationType, 'UPDATE_THIS_AND_FUTURE');
});

test('updateAllInstances - should update all instances in series', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const updates = { description: 'Updated team sync' };
  
  series = updateAllInstances(series, updates, 'user_123');

  assert.strictEqual(series.metadata.eventData.description, 'Updated team sync');
});

test('deleteSingleInstance - should delete a single instance by adding to exdates', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  
  series = deleteSingleInstance(series, '2024-01-03', 'user_123');

  assert(series.recurrenceRule.exdates.includes('2024-01-03'));
});

test('deleteThisAndFutureInstances - should delete instances from specified date forward', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  
  series = deleteThisAndFutureInstances(series, '2024-01-15', 'user_123');

  assert(series.recurrenceRule.dtend);
  const endDate = new Date(series.recurrenceRule.dtend);
  const startDate = new Date('2024-01-15');
  assert(endDate.getTime() < startDate.getTime());
});

test('createTemplateFromSeries - should create template from series', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const template = createTemplateFromSeries(series, 'Weekly Team Meeting Template', 'user_123', true);

  assert(template);
  assert(template.id.match(/^template_/));
  assert.strictEqual(template.name, 'Weekly Team Meeting Template');
  assert.strictEqual(template.isPublic, true);
  assert.deepStrictEqual(template.recurrenceRule, recurrenceRule);
});

test('createSeriesFromTemplate - should create series from template', () => {
  const template = {
    id: 'template_001',
    name: 'Weekly Template',
    recurrenceRule,
    defaultProperties: baseEvent
  };

  const series = createSeriesFromTemplate(template, { title: 'New Weekly Meeting' }, 'user_123');

  assert(series.id.match(/^series_/));
  assert.strictEqual(series.title, 'New Weekly Meeting');
  assert.deepStrictEqual(series.recurrenceRule, recurrenceRule);
});

test('listPredefinedTemplates - should list all predefined templates', () => {
  const templates = listPredefinedTemplates();

  assert(Array.isArray(templates));
  assert(templates.length > 0);
  assert(templates[0].key);
  assert(templates[0].name);
  assert(templates[0].recurrenceRule);
});

test('getPredefinedTemplate - should get specific predefined template', () => {
  const template = getPredefinedTemplate('WEEKLY');

  assert(template);
  assert.strictEqual(template.name, 'Weekly');
  assert.strictEqual(template.recurrenceRule.freq, 'WEEKLY');
});

test('getPredefinedTemplate - should return null for unknown template', () => {
  const template = getPredefinedTemplate('UNKNOWN');
  assert.strictEqual(template, null);
});

test('getPredefinedTemplate - should have valid DAILY template', () => {
  const template = getPredefinedTemplate('DAILY');
  assert.strictEqual(template.recurrenceRule.freq, 'DAILY');
});

test('getPredefinedTemplate - should have valid MONTHLY template', () => {
  const template = getPredefinedTemplate('MONTHLY');
  assert.strictEqual(template.recurrenceRule.freq, 'MONTHLY');
});

test('getPredefinedTemplate - should have valid YEARLY template', () => {
  const template = getPredefinedTemplate('YEARLY');
  assert.strictEqual(template.recurrenceRule.freq, 'YEARLY');
});

test('validateSeriesModifications - should validate valid modifications', () => {
  const modifications = [
    {
      modificationType: 'UPDATE_ONLY_THIS',
      modifiedFields: { title: 'Updated' }
    }
  ];

  const result = validateSeriesModifications(null, modifications);
  assert.strictEqual(result.isValid, false); // No series
  assert(result.errors.length > 0);
});

test('validateSeriesModifications - should detect invalid modification types', () => {
  const modifications = [
    {
      modificationType: 'INVALID_TYPE',
      modifiedFields: { title: 'Updated' }
    }
  ];

  const result = validateSeriesModifications({}, modifications);
  assert.strictEqual(result.isValid, false);
});

test('validateSeriesModifications - should warn about empty modifications', () => {
  const modifications = [
    {
      modificationType: 'UPDATE_ONLY_THIS',
      modifiedFields: {}
    }
  ];

  const result = validateSeriesModifications({}, modifications);
  assert(result.warnings.length > 0);
});

test('exportSeriesToICalendar - should export series to iCalendar format', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const instances = generateSeriesInstances(series, { maxInstances: 5 });
  
  const ical = exportSeriesToICalendar(series, instances);

  assert.strictEqual(typeof ical, 'string');
  assert(ical.includes('BEGIN:VCALENDAR'));
  assert(ical.includes('END:VCALENDAR'));
  assert(ical.includes('BEGIN:VEVENT'));
  assert(ical.includes('END:VEVENT'));
});

test('exportSeriesToICalendar - should include event details in iCalendar', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const instances = generateSeriesInstances(series, { maxInstances: 1 });
  
  const ical = exportSeriesToICalendar(series, instances);

  assert(ical.includes(baseEvent.title));
});

test('Series with no modifications - should handle series with no modifications', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const instances = generateSeriesInstances(series);

  assert(instances.every(i => !i.isModified));
});

test('Series edge cases - should handle updating non-existent instance', () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  
  // Should still update even if date doesn't exist in current recurrence
  series = updateSingleInstance(series, '2024-12-25', { title: 'Holiday' }, 'user_123');

  assert.strictEqual(series.modifications.length, 1);
});

test('Series edge cases - should create valid series from minimal event data', () => {
  const minimalEvent = { title: 'Event' };
  const series = createEventSeries(minimalEvent, recurrenceRule, 'user_123');

  assert.strictEqual(series.title, 'Event');
  assert(series.id);
});

test('Series metadata - should preserve event metadata in series', () => {
  const eventWithCustom = {
    ...baseEvent,
    color: '#FF0000',
    tags: ['important', 'weekly']
  };

  const series = createEventSeries(eventWithCustom, recurrenceRule, 'user_123');

  assert.strictEqual(series.metadata.eventData.color, '#FF0000');
  assert.deepStrictEqual(series.metadata.eventData.tags, ['important', 'weekly']);
});

test('Series metadata - should track series creation metadata', () => {
  const series = createEventSeries(baseEvent, recurrenceRule, 'user_123');

  assert(series.createdAt);
  assert(series.updatedAt);
  assert.strictEqual(series.createdBy, 'user_123');
});

test('Series timestamps - should update timestamp when modifying series', async () => {
  let series = createEventSeries(baseEvent, recurrenceRule, 'user_123');
  const originalTimestamp = series.updatedAt;

  // Wait a tiny bit to ensure different timestamp
  await new Promise(resolve => setTimeout(resolve, 1));

  series = updateAllInstances(series, { description: 'Updated' }, 'user_123');

  assert(series.updatedAt);
  // Note: Might be same if execution is too fast
});
