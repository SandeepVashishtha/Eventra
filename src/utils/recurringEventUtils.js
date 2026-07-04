/**
 * recurringEventUtils.js
 * Core utilities for handling recurring events and RRULE management.
 * Follows RFC 5545 iCalendar standard.
 */

/**
 * Validates a recurrence rule for correctness and completeness
 * @param {Object} rrule - Recurrence rule object
 * @returns {Object} Validation result with isValid flag and errors array
 */
export const validateRecurrenceRule = (rrule) => {
  const errors = [];
  const warnings = [];

  if (!rrule) {
    errors.push('Recurrence rule is required');
    return { isValid: false, errors, warnings };
  }

  // Validate frequency
  const validFrequencies = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'];
  if (!rrule.freq || !validFrequencies.includes(rrule.freq)) {
    errors.push(`Invalid frequency: ${rrule.freq}`);
  }

  // Validate dtstart
  if (!rrule.dtstart || !isValidISODate(rrule.dtstart)) {
    errors.push('Invalid or missing start date (dtstart)');
  }

  // Validate that either dtend or count is specified (not both ideally)
  if (!rrule.dtend && !rrule.count) {
    warnings.push('No end condition specified; recurrence may be infinite');
  }

  if (rrule.dtend && rrule.count) {
    warnings.push('Both dtend and count specified; dtend will take precedence');
  }

  // Validate dtend if present
  if (rrule.dtend && !isValidISODate(rrule.dtend)) {
    errors.push('Invalid end date (dtend)');
  }

  // Validate interval
  if (rrule.interval !== undefined && (rrule.interval < 1 || !Number.isInteger(rrule.interval))) {
    errors.push('Interval must be a positive integer');
  }

  // Validate count
  if (rrule.count !== undefined && (rrule.count < 1 || !Number.isInteger(rrule.count))) {
    errors.push('Count must be a positive integer');
  }

  // Validate byweekday for WEEKLY
  if (rrule.byweekday && Array.isArray(rrule.byweekday)) {
    const validDays = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const invalidDays = rrule.byweekday.filter(day => !validDays.includes(day));
    if (invalidDays.length > 0) {
      errors.push(`Invalid weekdays: ${invalidDays.join(', ')}`);
    }
  }

  // Validate bymonthday
  if (rrule.bymonthday && Array.isArray(rrule.bymonthday)) {
    const invalidDays = rrule.bymonthday.filter(d => d < 1 || d > 31);
    if (invalidDays.length > 0) {
      errors.push(`Invalid month days: ${invalidDays.join(', ')}`);
    }
  }

  // Validate bymonth
  if (rrule.bymonth && Array.isArray(rrule.bymonth)) {
    const invalidMonths = rrule.bymonth.filter(m => m < 1 || m > 12);
    if (invalidMonths.length > 0) {
      errors.push(`Invalid months: ${invalidMonths.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Checks if a date string is in valid ISO 8601 format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Whether date is valid ISO format
 */
export const isValidISODate = (dateString) => {
  if (typeof dateString !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  if (!isoRegex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Generates recurrence instances based on RRULE
 * @param {Object} rrule - Recurrence rule
 * @param {Object} options - Generation options { maxInstances, startDate, endDate, timezone }
 * @returns {Array} Array of generated instance dates
 */
export const generateRecurrenceInstances = (rrule, options = {}) => {
  const {
    maxInstances = 365,
    startDate = null,
    endDate = null,
    timezone = 'UTC'
  } = options;

  const instances = [];
  
  if (!rrule || !rrule.dtstart) {
    return instances;
  }

  let currentDate = new Date(rrule.dtstart);
  const limit = new Date(startDate || rrule.dtstart);
  const maxDate = endDate ? new Date(endDate) : new Date(limit.getTime() + (365 * 24 * 60 * 60 * 1000));

  const interval = rrule.interval || 1;
  let count = 0;

  // Calculate end condition
  const hasEndDate = rrule.dtend && new Date(rrule.dtend) > limit;
  const hasCount = rrule.count && rrule.count > 0;
  const maxCount = rrule.count || maxInstances;

  // Skip to start date if provided
  if (startDate && currentDate < limit) {
    currentDate = getNextOccurrence(currentDate, rrule.freq, interval);
  }

  // Generate instances
  while (count < maxCount && count < maxInstances && currentDate < maxDate) {
    // Check exceptions
    if (rrule.exdates && rrule.exdates.includes(currentDate.toISOString().split('T')[0])) {
      currentDate = getNextOccurrence(currentDate, rrule.freq, interval);
      continue;
    }

    // Check if matches recurrence criteria
    if (matchesRecurrenceCriteria(currentDate, rrule)) {
      instances.push(currentDate.toISOString().split('T')[0]);
      count++;
    }

    currentDate = getNextOccurrence(currentDate, rrule.freq, interval);

    if (hasEndDate && currentDate > new Date(rrule.dtend)) {
      break;
    }
  }

  // Add rdates if present
  if (rrule.rdate && Array.isArray(rrule.rdate)) {
    instances.push(...rrule.rdate.filter(d => d >= (startDate || rrule.dtstart)));
  }

  // Remove duplicates and sort
  return [...new Set(instances)].sort();
};

/**
 * Gets the next occurrence date based on frequency
 * @param {Date} currentDate - Current date
 * @param {string} freq - Frequency (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param {number} interval - Interval between occurrences
 * @returns {Date} Next occurrence date
 */
const getNextOccurrence = (currentDate, freq, interval = 1) => {
  const nextDate = new Date(currentDate);

  switch (freq) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + interval);
  }

  return nextDate;
};

/**
 * Checks if a date matches recurrence criteria
 * @param {Date} date - Date to check
 * @param {Object} rrule - Recurrence rule
 * @returns {boolean} Whether date matches criteria
 */
const matchesRecurrenceCriteria = (date, rrule) => {
  // Check byweekday
  if (rrule.byweekday && Array.isArray(rrule.byweekday)) {
    const dayMap = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' };
    if (!rrule.byweekday.includes(dayMap[date.getDay()])) {
      return false;
    }
  }

  // Check bymonthday
  if (rrule.bymonthday && Array.isArray(rrule.bymonthday)) {
    if (!rrule.bymonthday.includes(date.getDate())) {
      return false;
    }
  }

  // Check bymonth
  if (rrule.bymonth && Array.isArray(rrule.bymonth)) {
    if (!rrule.bymonth.includes(date.getMonth() + 1)) {
      return false;
    }
  }

  return true;
};

/**
 * Converts a recurrence rule to RFC 5545 RRULE string format
 * @param {Object} rrule - Recurrence rule object
 * @returns {string} RFC 5545 RRULE string
 */
export const toRFC5545String = (rrule) => {
  if (!rrule || !rrule.freq) {
    return '';
  }

  let ruleString = `RRULE:FREQ=${rrule.freq}`;

  if (rrule.dtstart) {
    ruleString += `;DTSTART=${rrule.dtstart.replace(/[:-]/g, '').split('T')[0]}`;
  }

  if (rrule.interval && rrule.interval > 1) {
    ruleString += `;INTERVAL=${rrule.interval}`;
  }

  if (rrule.count) {
    ruleString += `;COUNT=${rrule.count}`;
  }

  if (rrule.dtend) {
    ruleString += `;UNTIL=${rrule.dtend.replace(/[:-]/g, '').split('T')[0]}`;
  }

  if (rrule.byweekday && Array.isArray(rrule.byweekday)) {
    ruleString += `;BYDAY=${rrule.byweekday.join(',')}`;
  }

  if (rrule.bymonthday && Array.isArray(rrule.bymonthday)) {
    ruleString += `;BYMONTHDAY=${rrule.bymonthday.join(',')}`;
  }

  if (rrule.bymonth && Array.isArray(rrule.bymonth)) {
    ruleString += `;BYMONTH=${rrule.bymonth.join(',')}`;
  }

  if (rrule.tzid) {
    ruleString += `;TZID=${rrule.tzid}`;
  }

  return ruleString;
};

/**
 * Parses an RFC 5545 RRULE string to object
 * @param {string} rruleString - RFC 5545 RRULE string
 * @returns {Object} Parsed recurrence rule object
 */
export const parseRFC5545String = (rruleString) => {
  if (!rruleString || typeof rruleString !== 'string') {
    return null;
  }

  const rrule = {
    freq: null,
    dtstart: null,
    byweekday: [],
    bymonthday: [],
    bymonth: []
  };

  const parts = rruleString.replace('RRULE:', '').split(';');

  parts.forEach(part => {
    const [key, value] = part.split('=');
    
    switch (key) {
      case 'FREQ':
        rrule.freq = value;
        break;
      case 'DTSTART':
        rrule.dtstart = formatDateFromRFC(value);
        break;
      case 'UNTIL':
        rrule.dtend = formatDateFromRFC(value);
        break;
      case 'COUNT':
        rrule.count = parseInt(value, 10);
        break;
      case 'INTERVAL':
        rrule.interval = parseInt(value, 10);
        break;
      case 'BYDAY':
        rrule.byweekday = value.split(',');
        break;
      case 'BYMONTHDAY':
        rrule.bymonthday = value.split(',').map(Number);
        break;
      case 'BYMONTH':
        rrule.bymonth = value.split(',').map(Number);
        break;
      case 'TZID':
        rrule.tzid = value;
        break;
    }
  });

  return rrule;
};

/**
 * Formats date from RFC 5545 format (YYYYMMDD) to ISO 8601
 * @param {string} rfcDate - Date in RFC format
 * @returns {string} Date in ISO 8601 format
 */
const formatDateFromRFC = (rfcDate) => {
  if (!rfcDate || rfcDate.length < 8) return null;
  const year = rfcDate.substring(0, 4);
  const month = rfcDate.substring(4, 6);
  const day = rfcDate.substring(6, 8);
  return `${year}-${month}-${day}`;
};

/**
 * Checks for conflicts between recurring event instances
 * @param {Array} instances - Array of event instances
 * @param {Array} existingEvents - Array of existing events to check against
 * @returns {Array} Array of conflict objects
 */
export const detectSeriesConflicts = (instances, existingEvents = []) => {
  const conflicts = [];

  instances.forEach((instance, index) => {
    const conflictingEvents = existingEvents.filter(event => {
      const eventDate = new Date(event.startDate || event.date);
      const eventEndDate = new Date(event.endDate || event.date);
      const instanceDate = new Date(instance.date);
      
      return instanceDate >= eventDate && instanceDate <= eventEndDate;
    });

    conflictingEvents.forEach(conflict => {
      conflicts.push({
        id: `conflict_${index}_${conflict.id}`,
        instanceId: instance.id,
        conflictingEventId: conflict.id,
        conflictType: 'TIME_OVERLAP',
        details: `Instance on ${instance.date} overlaps with event "${conflict.title}"`,
        severity: 'MEDIUM',
        isResolved: false
      });
    });
  });

  return conflicts;
};

/**
 * Gets the series expansion date range
 * @param {Object} rrule - Recurrence rule
 * @returns {Object} Date range with start and end
 */
export const getSeriesDateRange = (rrule) => {
  if (!rrule || !rrule.dtstart) {
    return { start: null, end: null };
  }

  return {
    start: rrule.dtstart,
    end: rrule.dtend || (rrule.count 
      ? calculateFinalDate(rrule.dtstart, rrule.freq, rrule.count - 1, rrule.interval)
      : null)
  };
};

/**
 * Calculates the final date based on frequency and count
 * @param {string} startDate - Start date in ISO format
 * @param {string} freq - Frequency
 * @param {number} occurrences - Number of occurrences
 * @param {number} interval - Interval
 * @returns {string} Final date in ISO format
 */
const calculateFinalDate = (startDate, freq, occurrences, interval = 1) => {
  const date = new Date(startDate);
  
  switch (freq) {
    case 'DAILY':
      date.setDate(date.getDate() + (occurrences * interval));
      break;
    case 'WEEKLY':
      date.setDate(date.getDate() + (occurrences * interval * 7));
      break;
    case 'MONTHLY':
      date.setMonth(date.getMonth() + (occurrences * interval));
      break;
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + (occurrences * interval));
      break;
  }

  return date.toISOString().split('T')[0];
};

/**
 * Estimates the number of instances that will be generated
 * @param {Object} rrule - Recurrence rule
 * @returns {number} Estimated instance count
 */
export const estimateInstanceCount = (rrule) => {
  if (!rrule) return 0;
  if (rrule.count) return rrule.count;
  if (rrule.dtend) {
    const start = new Date(rrule.dtstart);
    const end = new Date(rrule.dtend);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    switch (rrule.freq) {
      case 'DAILY':
        return Math.ceil(days / (rrule.interval || 1));
      case 'WEEKLY':
        return Math.ceil(days / ((rrule.interval || 1) * 7));
      case 'MONTHLY':
        return Math.ceil(days / ((rrule.interval || 1) * 30));
      case 'YEARLY':
        return Math.ceil(days / ((rrule.interval || 1) * 365));
      default:
        return days;
    }
  }
  
  return 0;
};

/**
 * Creates a deep copy of a recurrence rule
 * @param {Object} rrule - Recurrence rule to copy
 * @returns {Object} Deep copy of the rule
 */
export const cloneRecurrenceRule = (rrule) => {
  if (!rrule) return null;
  
  const cloned = { ...rrule };
  
  // Deep clone array properties if they exist
  if (rrule.byweekday) {
    cloned.byweekday = [...rrule.byweekday];
  }
  if (rrule.bymonthday) {
    cloned.bymonthday = [...rrule.bymonthday];
  }
  if (rrule.bymonth) {
    cloned.bymonth = [...rrule.bymonth];
  }
  if (rrule.exdates) {
    cloned.exdates = [...rrule.exdates];
  }
  if (rrule.rdate) {
    cloned.rdate = [...rrule.rdate];
  }
  
  return cloned;
};

/**
 * Validates and sanitizes recurrence rule
 * @param {Object} rrule - Recurrence rule to sanitize
 * @returns {Object} Sanitized recurrence rule
 */
export const sanitizeRecurrenceRule = (rrule) => {
  if (!rrule) return null;

  const sanitized = {
    freq: rrule.freq,
    dtstart: rrule.dtstart,
    dtend: rrule.dtend,
    count: rrule.count,
    interval: rrule.interval || 1,
    byweekday: rrule.byweekday || [],
    bymonthday: rrule.bymonthday || [],
    bymonth: rrule.bymonth || [],
    exdates: rrule.exdates || [],
    rdate: rrule.rdate || [],
    tzid: rrule.tzid || 'UTC'
  };

  // Validate interval
  if (sanitized.interval < 1) sanitized.interval = 1;
  if (!Number.isInteger(sanitized.interval)) sanitized.interval = Math.floor(sanitized.interval);

  return sanitized;
};
