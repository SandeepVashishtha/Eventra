import { logger as baseLogger } from "../../utils/logger";

// Helper function to scan objects and mask authentication details
const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;

  try {
    // Deep clone to avoid accidentally modifying real application states
    const cleanData = JSON.parse(JSON.stringify(data));

    // Common names for authorization payloads
    const sensitiveKeys = ['token', 'jwt', 'password', 'accesstoken', 'refreshtoken', 'secret'];

    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        } else if (sensitiveKeys.includes(key.toLowerCase()) || sensitiveKeys.some(sk => key.includes(sk))) {
          obj[key] = '******** [SECURE - MASKED FOR PRIVACY]';
        }
      }
    };

    sanitize(cleanData);
    return cleanData;
  } catch (e) {
    return '[Unparsable Data - Securely Masked]';
  }
};

// Define custom secure wrapper matching their logger pattern
const logger = {
  ...baseLogger,
  
  log: (message, data = null) => {
    // 1. Completely silence standard traces if in a live production build environment
    if (import.meta.env?.PROD || process.env.NODE_ENV === 'production') return;

    // 2. Sanitize before passing to base logger trace
    if (data) {
      baseLogger.log(message, sanitizeLogData(data));
    } else {
      baseLogger.log(message);
    }
  },

  error: (message, error = null) => {
    // Error tracking stays enabled, but payloads remain sanitized
    if (error) {
      baseLogger.error(message, sanitizeLogData(error));
    } else {
      baseLogger.error(message);
    }
  }
};

// Export precisely the way the rest of the application expects it
export { logger };