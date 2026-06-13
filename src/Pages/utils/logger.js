import { logger as baseLogger } from "../../utils/logger";

// Standalone recursive worker function to lower cyclomatic complexity
const recursivelyMaskKeys = (obj, sensitiveKeys) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      recursivelyMaskKeys(obj[key], sensitiveKeys);
    } else if (sensitiveKeys.includes(key.toLowerCase()) || sensitiveKeys.some(sk => key.includes(sk))) {
      obj[key] = '******** [SECURE - MASKED FOR PRIVACY]';
    }
  }
};

// Main sanitization wrapper
const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;

  try {
    const cleanData = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['token', 'jwt', 'password', 'accesstoken', 'refreshtoken', 'secret'];
    
    recursivelyMaskKeys(cleanData, sensitiveKeys);
    return cleanData;
  } catch (e) {
    return '[Unparsable Data - Securely Masked]';
  }
};

// Define custom secure wrapper matching their logger pattern
const logger = {
  ...baseLogger,
  
  log: (message, data = null) => {
    if (import.meta.env?.PROD || process.env.NODE_ENV === 'production') return;

    if (data) {
      baseLogger.log(message, sanitizeLogData(data));
    } else {
      baseLogger.log(message);
    }
  },

  error: (message, error = null) => {
    if (error) {
      baseLogger.error(message, sanitizeLogData(error));
    } else {
      baseLogger.error(message);
    }
  }
};

export { logger };