/**
 * Conflict Detection Utilities
 * 
 * Provides functions to detect scheduling conflicts between events
 * and suggest alternative events when conflicts are found.
 */

/**
 * Parse event time string (e.g., "10:00 AM") to minutes from midnight
 * @param {string} timeStr - Time string in format "HH:MM AM/PM"
 * @returns {number} Minutes from midnight
 */
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period?.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period?.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
};

/**
 * Get event start and end times in minutes from midnight
 * Assumes events have a default duration of 1 hour if not specified
 * @param {object} event - Event object with date and time
 * @param {number} durationMinutes - Duration of event in minutes (default: 60)
 * @returns {object} Object with startMinutes and endMinutes
 */
export const getEventTimeRange = (event, durationMinutes = 60) => {
  const startMinutes = parseTimeToMinutes(event.time);
  const endMinutes = startMinutes + durationMinutes;
  
  return { startMinutes, endMinutes };
};

/**
 * Check if two events have overlapping time ranges
 * @param {object} event1 - First event
 * @param {object} event2 - Second event
 * @param {number} durationMinutes - Default event duration in minutes
 * @returns {boolean} True if events overlap
 */
export const doEventsOverlap = (event1, event2, durationMinutes = 60) => {
  // Check if events are on the same date
  if (event1.date !== event2.date) {
    return false;
  }
  
  const range1 = getEventTimeRange(event1, durationMinutes);
  const range2 = getEventTimeRange(event2, durationMinutes);
  
  // Overlap condition: (start1 < end2) && (end1 > start2)
  return (range1.startMinutes < range2.endMinutes) && (range1.endMinutes > range2.startMinutes);
};

/**
 * Find all conflicting events for a given event
 * @param {object} newEvent - Event to check for conflicts
 * @param {Array} registeredEvents - Array of user's registered events
 * @param {number} durationMinutes - Default event duration in minutes
 * @returns {Array} Array of conflicting events
 */
export const findConflictingEvents = (newEvent, registeredEvents, durationMinutes = 60) => {
  if (!registeredEvents || registeredEvents.length === 0) {
    return [];
  }
  
  return registeredEvents
    .map(reg => reg.event || reg)
    .filter(event => doEventsOverlap(newEvent, event, durationMinutes));
};

/**
 * Check if registering for an event would cause a conflict
 * @param {object} newEvent - Event to register for
 * @param {Array} registeredEvents - User's registered events
 * @param {number} durationMinutes - Default event duration in minutes
 * @returns {object} Object with hasConflict (boolean) and conflicts (array)
 */
export const checkRegistrationConflict = (newEvent, registeredEvents, durationMinutes = 60) => {
  const conflicts = findConflictingEvents(newEvent, registeredEvents, durationMinutes);
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};

/**
 * Suggest alternative events that don't conflict with registered events
 * @param {object} targetEvent - The event user wants to register for
 * @param {Array} allEvents - All available events
 * @param {Array} registeredEvents - User's registered events
 * @param {number} durationMinutes - Default event duration in minutes
 * @param {number} maxSuggestions - Maximum number of suggestions to return
 * @returns {Array} Array of suggested events
 */
export const suggestAlternativeEvents = (
  targetEvent,
  allEvents,
  registeredEvents,
  durationMinutes = 60,
  maxSuggestions = 3
) => {
  if (!allEvents || allEvents.length === 0) {
    return [];
  }
  
  // Filter out the target event and already registered events
  const availableEvents = allEvents.filter(event => {
    const isTargetEvent = event.id === targetEvent.id;
    const isRegistered = registeredEvents.some(reg => 
      (reg.event?.id || reg.id) === event.id
    );
    return !isTargetEvent && !isRegistered;
  });
  
  // Find events that don't conflict with registered events
  const nonConflictingEvents = availableEvents.filter(event => {
    const conflictCheck = checkRegistrationConflict(event, registeredEvents, durationMinutes);
    return !conflictCheck.hasConflict;
  });
  
  // Prioritize events with same category/type as target event
  const sameCategoryEvents = nonConflictingEvents.filter(event => 
    event.category === targetEvent.category || 
    event.type === targetEvent.type ||
    event.tags?.some(tag => targetEvent.tags?.includes(tag))
  );
  
  // If we have enough same-category events, return those
  if (sameCategoryEvents.length >= maxSuggestions) {
    return sameCategoryEvents.slice(0, maxSuggestions);
  }
  
  // Otherwise, mix same-category and other non-conflicting events
  const otherEvents = nonConflictingEvents.filter(event => 
    !sameCategoryEvents.includes(event)
  );
  
  const suggestions = [...sameCategoryEvents, ...otherEvents];
  return suggestions.slice(0, maxSuggestions);
};

/**
 * Format time range for display
 * @param {string} timeStr - Time string in format "HH:MM AM/PM"
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} Formatted time range (e.g., "10:00 AM - 11:00 AM")
 */
export const formatTimeRange = (timeStr, durationMinutes = 60) => {
  const startMinutes = parseTimeToMinutes(timeStr);
  const endMinutes = startMinutes + durationMinutes;
  
  const formatMinutes = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatMinutes(startMinutes)} - ${formatMinutes(endMinutes)}`;
};
