/**
 * Fetch with timeout using AbortController
 * @param {string} url
 * @param {object} options - fetch options
 * @param {number} timeout - timeout in ms (default 10000)
 */
export default async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}
