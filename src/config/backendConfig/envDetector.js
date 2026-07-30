/**
 * Environment Detection Module
 * 
 * Detects the current runtime environment (development/production)
 * and provides environment variable access.
 */

/**
 * Gets the runtime environment object (import.meta.env or process.env)
 */
export const getRuntimeEnv = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  return {};
};

/**
 * Current mode (development/production)
 */
export const getCurrentMode = () => {
  const runtimeEnv = getRuntimeEnv();
  return runtimeEnv.MODE || runtimeEnv.NODE_ENV || "development";
};

/**
 * Whether running in development mode
 */
export const isDevelopment = () => getCurrentMode() === "development";

/**
 * Whether running in production mode
 */
export const isProduction = () => getCurrentMode() === "production";
