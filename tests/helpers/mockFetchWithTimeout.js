export const fetchWithTimeout = async (url, options, timeout) => {
  if (globalThis.mockFetchWithTimeout) {
    return globalThis.mockFetchWithTimeout(url, options, timeout);
  }
  return {
    response: { ok: true, status: 200 },
    data: {}
  };
};
