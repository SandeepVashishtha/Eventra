/**
 * Event Filter Query Parameter Validator
 * 
 * Provides strict validation for event filtering endpoint query parameters.
 * Ensures data integrity and provides clear error messages for invalid inputs.
 */

/**
 * Allowed enum values for event fields
 */
const ALLOWED_CATEGORIES = [
  'AI/ML',
  'Blockchain',
  'Cloud Computing',
  'Cybersecurity',
  'Data Science',
  'DevOps',
  'IoT',
  'Mobile Development',
  'Web Development',
  'Workshop',
  'Hackathon',
  'Conference',
  'Meetup',
  'Seminar'
];

const ALLOWED_TYPES = [
  'workshop',
  'hackathon',
  'conference',
  'meetup',
  'seminar',
  'webinar'
];

const ALLOWED_REGISTRATION_STATUSES = [
  'open',
  'closed',
  'waitlist'
];

/**
 * Validates if a string is a valid ISO date format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid date format
 */
function isValidDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  // Try to parse the date
  const date = new Date(dateString);
  
  // Check if it's a valid date
  if (isNaN(date.getTime())) {
    return false;
  }
  
  // Ensure the string matches ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
  const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoRegex.test(dateString);
}

/**
 * Validates a string field against length constraints
 * @param {string} value - The string to validate
 * @param {number} minLength - Minimum allowed length
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if within length constraints
 */
function isValidLength(value, minLength = 1, maxLength = 100) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

/**
 * Validates an enum field against allowed values
 * @param {string} value - The value to validate
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {boolean} True if value is in allowed list
 */
function isValidEnum(value, allowedValues) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  // Case-insensitive comparison for better UX
  return allowedValues.some(allowed => allowed.toLowerCase() === trimmed.toLowerCase());
}

/**
 * Gets the normalized enum value (proper casing from allowed values)
 * @param {string} value - The value to normalize
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {string|null} The normalized value or null if not found
 */
function normalizeEnum(value, allowedValues) {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  const found = allowedValues.find(allowed => allowed.toLowerCase() === trimmed.toLowerCase());
  return found || null;
}

/**
 * Validates a boolean string value
 * @param {string} value - The value to validate
 * @returns {boolean} True if value is 'true' or 'false'
 */
function isValidBoolean(value) {
  if (!value || typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed === 'true' || trimmed === 'false';
}

/**
 * Validates event filter query parameters
 * @param {Object} queryParams - The query parameters from the request
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateEventFilters(queryParams) {
  const errors = [];
  const validated = {};
  
  const {
    category,
    type,
    registrationStatus,
    startDate,
    endDate,
    isVirtual
  } = queryParams;
  
  // Validate category (optional enum field)
  if (category !== undefined && category !== null && category !== '') {
    if (!isValidLength(category, 1, 100)) {
      errors.push('category must be between 1 and 100 characters');
    } else if (!isValidEnum(category, ALLOWED_CATEGORIES)) {
      errors.push(`Invalid category value. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`);
    } else {
      validated.category = normalizeEnum(category, ALLOWED_CATEGORIES);
    }
  }
  
  // Validate type (optional enum field)
  if (type !== undefined && type !== null && type !== '') {
    if (!isValidLength(type, 1, 100)) {
      errors.push('type must be between 1 and 100 characters');
    } else if (!isValidEnum(type, ALLOWED_TYPES)) {
      errors.push(`Invalid type value. Allowed values: ${ALLOWED_TYPES.join(', ')}`);
    } else {
      validated.type = normalizeEnum(type, ALLOWED_TYPES);
    }
  }
  
  // Validate registrationStatus (optional enum field)
  if (registrationStatus !== undefined && registrationStatus !== null && registrationStatus !== '') {
    if (!isValidLength(registrationStatus, 1, 100)) {
      errors.push('registrationStatus must be between 1 and 100 characters');
    } else if (!isValidEnum(registrationStatus, ALLOWED_REGISTRATION_STATUSES)) {
      errors.push(`Invalid registrationStatus value. Allowed values: ${ALLOWED_REGISTRATION_STATUSES.join(', ')}`);
    } else {
      validated.registrationStatus = normalizeEnum(registrationStatus, ALLOWED_REGISTRATION_STATUSES);
    }
  }
  
  // Validate startDate (optional date field)
  let parsedStartDate = null;
  if (startDate !== undefined && startDate !== null && startDate !== '') {
    if (!isValidDateFormat(startDate)) {
      errors.push('Invalid startDate format. Use ISO 8601 format (e.g., 2026-01-01 or 2026-01-01T00:00:00Z)');
    } else {
      parsedStartDate = new Date(startDate);
      validated.startDate = parsedStartDate;
    }
  }
  
  // Validate endDate (optional date field)
  let parsedEndDate = null;
  if (endDate !== undefined && endDate !== null && endDate !== '') {
    if (!isValidDateFormat(endDate)) {
      errors.push('Invalid endDate format. Use ISO 8601 format (e.g., 2026-01-01 or 2026-01-01T00:00:00Z)');
    } else {
      parsedEndDate = new Date(endDate);
      validated.endDate = parsedEndDate;
    }
  }
  
  // Validate date range (startDate must not be after endDate)
  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    errors.push('startDate cannot be after endDate');
  }
  
  // Validate isVirtual (optional boolean field)
  if (isVirtual !== undefined && isVirtual !== null && isVirtual !== '') {
    if (!isValidBoolean(isVirtual)) {
      errors.push('Invalid isVirtual value. Must be "true" or "false"');
    } else {
      validated.isVirtual = isVirtual.trim().toLowerCase() === 'true';
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validated
  };
}

export {
  validateEventFilters,
  ALLOWED_CATEGORIES,
  ALLOWED_TYPES,
  ALLOWED_REGISTRATION_STATUSES
};
