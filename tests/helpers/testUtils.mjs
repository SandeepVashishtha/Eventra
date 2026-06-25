/**
 * Reusable Test Utilities for .mjs tests
 */

/**
 * Pause execution for a given number of milliseconds.
 * Useful for testing timeouts, debouncing, or async states.
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a mock HTTP Response object, commonly used for mocking fetch.
 * 
 * @param {any} body - The body payload to return
 * @param {Object} options - Response options
 * @param {number} [options.status=200] - HTTP status code
 * @param {boolean} [options.ok] - Response.ok flag
 * @returns {Object} Mock Response object
 */
export const createMockResponse = (body, options = { status: 200 }) => {
  const ok = options.ok !== undefined 
    ? options.ok 
    : (options.status >= 200 && options.status < 300);
    
  return {
    ok,
    status: options.status,
    json: async () => body,
    text: async () => typeof body === 'string' ? body : JSON.stringify(body),
    blob: async () => new Blob([JSON.stringify(body)]),
  };
};

/**
 * Creates a mock Next.js/Express-like Request object.
 * 
 * @param {Object} options - Request overrides
 * @returns {Object} Mock Request
 */
export const createMockRequest = (options = {}) => {
  return {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body || null,
    query: options.query || {},
    cookies: options.cookies || {},
    socket: options.socket || { remoteAddress: '127.0.0.1' },
    ...options
  };
};

/**
 * Creates a mock Response object for Express/Next.js API handlers.
 * Includes tracking for status, json, and send calls.
 * 
 * @returns {Object} Mock Res object
 */
export const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.send = (data) => {
    res.body = data;
    return res;
  };
  res.end = () => res;
  return res;
};

/**
 * Suppresses console output for a test block.
 * Returns a restore function to call in an 'afterEach' or 'finally' block.
 * 
 * @returns {Function} restoreConsole
 */
export const suppressConsole = () => {
  const original = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };
  
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  
  return () => {
    Object.assign(console, original);
  };
};
