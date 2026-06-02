/**
 * Server-side fetch with timeout support.
 * @param {string} url
 * @param {object} options
 * @param {number} timeout - ms
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};
