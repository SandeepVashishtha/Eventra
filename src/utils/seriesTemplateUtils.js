/**
 * seriesTemplateUtils.js
 * Utilities for managing recurring event series templates and instances.
 */

import { validateRecurrenceRule, generateRecurrenceInstances, cloneRecurrenceRule } from './recurringEventUtils.js';

/**
 * Creates a new event series from a recurrence rule
 * @param {Object} baseEvent - Base event data
 * @param {Object} recurrenceRule - Recurrence rule
 * @param {string} userId - User ID creating the series
 * @returns {Object} Created series object
 */
export const createEventSeries = (baseEvent, recurrenceRule, userId) => {
  // Validate recurrence rule
  const validation = validateRecurrenceRule(recurrenceRule);
  if (!validation.isValid) {
    throw new Error(`Invalid recurrence rule: ${validation.errors.join(', ')}`);
  }

  const seriesId = generateSeriesId();
  const now = new Date().toISOString();

  return {
    id: seriesId,
    recurrenceRule,
    originalEventId: baseEvent.id,
    title: baseEvent.title || 'Untitled Series',
    description: baseEvent.description,
    totalInstances: null, // Will be calculated on demand
    modifications: [],
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    metadata: {
      eventData: {
        title: baseEvent.title,
        description: baseEvent.description,
        venue: baseEvent.venue,
        category: baseEvent.category,
        duration: baseEvent.duration,
        maxAttendees: baseEvent.maxAttendees,
        color: baseEvent.color,
        tags: baseEvent.tags,
        ...baseEvent.customFields
      }
    }
  };
};

/**
 * Generates a unique series ID
 * @returns {string} Unique series ID
 */
const generateSeriesId = () => {
  return `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generates event instances from a series
 * @param {Object} series - Event series object
 * @param {Object} options - Generation options { maxInstances, startDate, endDate, timezone }
 * @returns {Array} Array of generated instances
 */
export const generateSeriesInstances = (series, options = {}) => {
  if (!series || !series.recurrenceRule) {
    return [];
  }

  const instanceDates = generateRecurrenceInstances(series.recurrenceRule, options);
  const instances = [];

  instanceDates.forEach((date, index) => {
    const instance = createInstance(series, date, index);
    
    // Apply modifications if any
    const modification = findModificationForDate(series.modifications, date);
    if (modification) {
      instance.eventData = {
        ...instance.eventData,
        ...modification.modifiedFields
      };
      instance.modification = modification;
      instance.isModified = true;
    }

    instances.push(instance);
  });

  return instances;
};

/**
 * Creates a single event instance
 * @param {Object} series - Event series
 * @param {string} date - Instance date in ISO format
 * @param {number} occurrenceIndex - Occurrence index (0-based)
 * @returns {Object} Event instance
 */
const createInstance = (series, date, occurrenceIndex) => {
  const instanceId = generateInstanceId(series.id, occurrenceIndex);

  return {
    id: instanceId,
    seriesId: series.id,
    occurrenceIndex,
    date,
    eventData: {
      ...series.metadata?.eventData,
      seriesId: series.id,
      instanceId
    },
    isModified: false,
    modification: null
  };
};

/**
 * Generates a unique instance ID
 * @param {string} seriesId - Series ID
 * @param {number} occurrenceIndex - Occurrence index
 * @returns {string} Unique instance ID
 */
const generateInstanceId = (seriesId, occurrenceIndex) => {
  return `${seriesId}_instance_${occurrenceIndex}`;
};

/**
 * Finds a modification for a specific date
 * @param {Array} modifications - Array of modifications
 * @param {string} date - Date to search for
 * @returns {Object|null} Matching modification or null
 */
const findModificationForDate = (modifications, date) => {
  if (!modifications || modifications.length === 0) return null;

  return modifications.find(mod => {
    const modDate = mod.modifiedFields?.date || mod.originalRRule?.dtstart;
    return modDate === date;
  });
};

/**
 * Updates a single instance in a series
 * @param {Object} series - Event series
 * @param {string} instanceDate - Date of instance to update
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID performing update
 * @returns {Object} Updated series with modification
 */
export const updateSingleInstance = (series, instanceDate, updates, userId) => {
  const newSeries = JSON.parse(JSON.stringify(series));
  
  const modification = {
    id: generateModificationId(),
    eventInstanceId: generateInstanceId(series.id, 0), // Placeholder
    seriesId: series.id,
    modificationType: 'UPDATE_ONLY_THIS',
    originalRRule: cloneRecurrenceRule(series.recurrenceRule),
    modifiedFields: {
      date: instanceDate,
      ...updates
    },
    modifiedAt: new Date().toISOString(),
    modifiedBy: userId
  };

  newSeries.modifications.push(modification);
  newSeries.updatedAt = new Date().toISOString();

  return newSeries;
};

/**
 * Updates all instances from a specific date forward
 * @param {Object} series - Event series
 * @param {string} startDate - Start date for updates
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID performing update
 * @returns {Object} Updated series with modification
 */
export const updateThisAndFutureInstances = (series, startDate, updates, userId) => {
  const newSeries = JSON.parse(JSON.stringify(series));
  
  // Split the series at the start date
  const newRecurrenceRule = cloneRecurrenceRule(series.recurrenceRule);
  newRecurrenceRule.dtstart = startDate;

  const modification = {
    id: generateModificationId(),
    eventInstanceId: generateInstanceId(series.id, 0),
    seriesId: series.id,
    modificationType: 'UPDATE_THIS_AND_FUTURE',
    originalRRule: cloneRecurrenceRule(series.recurrenceRule),
    modifiedFields: {
      ...updates,
      recurrenceRuleOverride: newRecurrenceRule
    },
    modifiedAt: new Date().toISOString(),
    modifiedBy: userId
  };

  newSeries.modifications.push(modification);
  newSeries.updatedAt = new Date().toISOString();

  return newSeries;
};

/**
 * Updates all instances in a series
 * @param {Object} series - Event series
 * @param {Object} updates - Fields to update
 * @param {string} userId - User ID performing update
 * @returns {Object} Updated series
 */
export const updateAllInstances = (series, updates, userId) => {
  const newSeries = JSON.parse(JSON.stringify(series));
  
  // Update metadata directly
  newSeries.metadata.eventData = {
    ...newSeries.metadata.eventData,
    ...updates
  };

  newSeries.updatedAt = new Date().toISOString();

  return newSeries;
};

/**
 * Deletes a single instance from a series
 * @param {Object} series - Event series
 * @param {string} instanceDate - Date of instance to delete
 * @param {string} userId - User ID performing deletion
 * @returns {Object} Updated series
 */
export const deleteSingleInstance = (series, instanceDate, userId) => {
  const newSeries = JSON.parse(JSON.stringify(series));
  
  // Add to exception dates
  if (!newSeries.recurrenceRule.exdates) {
    newSeries.recurrenceRule.exdates = [];
  }

  if (!newSeries.recurrenceRule.exdates.includes(instanceDate)) {
    newSeries.recurrenceRule.exdates.push(instanceDate);
  }

  newSeries.updatedAt = new Date().toISOString();

  return newSeries;
};

/**
 * Deletes all instances from a specific date forward
 * @param {Object} series - Event series
 * @param {string} startDate - Start date for deletion
 * @param {string} userId - User ID performing deletion
 * @returns {Object} Updated series
 */
export const deleteThisAndFutureInstances = (series, startDate, userId) => {
  const newSeries = JSON.parse(JSON.stringify(series));
  
  // Set end date to the day before start date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() - 1);
  newSeries.recurrenceRule.dtend = endDate.toISOString().split('T')[0];

  newSeries.updatedAt = new Date().toISOString();

  return newSeries;
};

/**
 * Generates a unique modification ID
 * @returns {string} Unique modification ID
 */
const generateModificationId = () => {
  return `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates a recurrence template from an existing series
 * @param {Object} series - Event series
 * @param {string} templateName - Template name
 * @param {string} userId - Creator user ID
 * @param {boolean} isPublic - Whether template is public
 * @returns {Object} Recurrence template
 */
export const createTemplateFromSeries = (series, templateName, userId, isPublic = false) => {
  return {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: templateName,
    description: series.description,
    recurrenceRule: cloneRecurrenceRule(series.recurrenceRule),
    defaultProperties: {
      ...series.metadata?.eventData
    },
    isPublic,
    createdBy: userId,
    createdAt: new Date().toISOString()
  };
};

/**
 * Applies a template to create a new series
 * @param {Object} template - Recurrence template
 * @param {Object} eventData - Event data to merge with template
 * @param {string} userId - User ID creating the series
 * @returns {Object} New event series
 */
export const createSeriesFromTemplate = (template, eventData, userId) => {
  const baseEvent = {
    ...template.defaultProperties,
    ...eventData
  };

  return createEventSeries(baseEvent, template.recurrenceRule, userId);
};

/**
 * Predefined templates for common recurrence patterns
 */
export const PREDEFINED_TEMPLATES = {
  DAILY: {
    name: 'Daily',
    recurrenceRule: {
      freq: 'DAILY',
      interval: 1
    }
  },
  
  WEEKLY: {
    name: 'Weekly',
    recurrenceRule: {
      freq: 'WEEKLY',
      interval: 1,
      byweekday: ['MO', 'WE', 'FR']
    }
  },
  
  BIWEEKLY: {
    name: 'Bi-weekly',
    recurrenceRule: {
      freq: 'WEEKLY',
      interval: 2,
      byweekday: ['MO']
    }
  },
  
  MONTHLY: {
    name: 'Monthly',
    recurrenceRule: {
      freq: 'MONTHLY',
      interval: 1,
      bymonthday: [1]
    }
  },
  
  QUARTERLY: {
    name: 'Quarterly',
    recurrenceRule: {
      freq: 'MONTHLY',
      interval: 3,
      bymonthday: [1]
    }
  },
  
  YEARLY: {
    name: 'Yearly',
    recurrenceRule: {
      freq: 'YEARLY',
      interval: 1,
      bymonth: [1],
      bymonthday: [1]
    }
  },
  
  WEEKDAY: {
    name: 'Weekdays (Mon-Fri)',
    recurrenceRule: {
      freq: 'WEEKLY',
      byweekday: ['MO', 'TU', 'WE', 'TH', 'FR']
    }
  },
  
  WEEKEND: {
    name: 'Weekends (Sat-Sun)',
    recurrenceRule: {
      freq: 'WEEKLY',
      byweekday: ['SA', 'SU']
    }
  }
};

/**
 * Gets a predefined template by key
 * @param {string} templateKey - Template key (e.g., 'DAILY', 'WEEKLY')
 * @returns {Object|null} Template or null
 */
export const getPredefinedTemplate = (templateKey) => {
  return PREDEFINED_TEMPLATES[templateKey] || null;
};

/**
 * Lists all available predefined templates
 * @returns {Array} Array of template objects
 */
export const listPredefinedTemplates = () => {
  return Object.entries(PREDEFINED_TEMPLATES).map(([key, value]) => ({
    key,
    ...value
  }));
};

/**
 * Validates series modifications are compatible
 * @param {Object} series - Event series
 * @param {Array} modifications - Modifications to validate
 * @returns {Object} Validation result
 */
export const validateSeriesModifications = (series, modifications = []) => {
  const errors = [];
  const warnings = [];

  if (!series) {
    errors.push('Series is required');
  }

  modifications.forEach((mod, index) => {
    if (!mod.modificationType) {
      errors.push(`Modification ${index}: Missing modificationType`);
    }

    const validTypes = ['UPDATE_ALL', 'UPDATE_THIS_AND_FUTURE', 'UPDATE_ONLY_THIS'];
    if (!validTypes.includes(mod.modificationType)) {
      errors.push(`Modification ${index}: Invalid modificationType`);
    }

    if (!mod.modifiedFields || Object.keys(mod.modifiedFields).length === 0) {
      warnings.push(`Modification ${index}: No fields to modify`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Exports series to iCalendar format
 * @param {Object} series - Event series
 * @param {Array} instances - Event instances
 * @returns {string} iCalendar format string
 */
export const exportSeriesToICalendar = (series, instances = []) => {
  let ical = 'BEGIN:VCALENDAR\r\n';
  ical += 'VERSION:2.0\r\n';
  ical += 'PRODID:-//Eventra//Recurring Events//EN\r\n';
  ical += `CALSCALE:GREGORIAN\r\n`;

  if (series && instances.length > 0) {
    instances.slice(0, 10).forEach(instance => {
      ical += 'BEGIN:VEVENT\r\n';
      ical += `DTSTART:${instance.date.replace(/-/g, '')}\r\n`;
      ical += `SUMMARY:${series.title || 'Event'}\r\n`;
      ical += `DESCRIPTION:${series.description || ''}\r\n`;
      ical += `UID:${instance.id}@eventra.com\r\n`;
      ical += `CREATED:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\r\n`;
      ical += 'END:VEVENT\r\n';
    });
  }

  ical += 'END:VCALENDAR\r\n';
  return ical;
};
