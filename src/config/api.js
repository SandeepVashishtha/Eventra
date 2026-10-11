export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const buildApiUrl = (path) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export const API_ENDPOINTS = {
  EVENTS: {
    BASE: buildApiUrl("/events"),
    WAITLIST: (id) => buildApiUrl(`/events/${id}/waitlist`),
  },
  WAITLIST: {
    BASE: buildApiUrl("/events"),
    JOIN: (id) => buildApiUrl(`/events/${id}/waitlist`),
    LEAVE: (id) => buildApiUrl(`/events/${id}/waitlist`),
    STATUS: (id) => buildApiUrl(`/events/${id}/waitlist/me`),
    COUNT: (id) => buildApiUrl(`/events/${id}/waitlist`),
  },
};

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eventra_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiUtils = {
  async get(url, options = {}) {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });
    return res;
  },

  async post(url, body = {}, options = {}) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...(options.headers || {}),
      },
      body: JSON.stringify(body),
      ...options,
    });
    return res;
  },

  async delete(url, options = {}) {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });
    return res;
  },
};
