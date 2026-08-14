export const API_BASE_URL = "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

// ==========================================
// 1. CORE UTILITIES & AUTH HEADERS
// ==========================================

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eventra_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eventra_refresh_token");
}

function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("eventra_token");
    localStorage.removeItem("eventra_refresh_token");
    localStorage.removeItem("eventra_user");
  }
}

// ==========================================
// 2. NETWORK INTERCEPTORS & RETRY ENGINE
// ==========================================

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearAuthSession();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  if (data?.token && typeof window !== "undefined") {
    localStorage.setItem("eventra_token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("eventra_refresh_token", data.refreshToken);
    }
  }
  return data.token;
}

async function fetchAPI(endpoint, options = {}) {
  const { retries = 3, backoff = 500, skipAuth = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(skipAuth ? {} : getAuthHeader()),
        ...fetchOptions.headers,
      };

      const res = await fetch(url, { ...fetchOptions, headers });

      if (res.status === 401 && !skipAuth && !options._isRetry) {
        try {
          await refreshAccessToken();
          return await fetchAPI(endpoint, { ...options, _isRetry: true });
        } catch (refreshErr) {
          clearAuthSession();
          throw refreshErr;
        }
      }

      if (!res.ok) {
        let errText = res.statusText;
        try {
          const errorJson = await res.json();
          errText = errorJson.message || errorJson.error || errText;
        } catch (e) {}

        if (res.status >= 500 && attempt < retries) {
          attempt++;
          await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, attempt)));
          continue;
        }

        throw new Error(`API Error ${res.status}: ${errText}`);
      }

      if (res.status === 204) return true;
      return await res.json();
    } catch (error) {
      if (attempt < retries && error.message.includes("Failed to fetch")) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, backoff * Math.pow(2, attempt)));
        continue;
      }
      console.error(`[Eventra API Error] Request failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

// ==========================================
// 3. AUTHENTICATION & SESSION MANAGEMENT
// ==========================================

export async function loginUser(credentials) {
  try {
    const payload = {
      usernameOrEmail: credentials.usernameOrEmail || credentials.email || credentials.username || "",
      password: credentials.password || ""
    };

    const data = await fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });

    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("eventra_token", data.token);
      if (data.refreshToken) localStorage.setItem("eventra_refresh_token", data.refreshToken);
      localStorage.setItem("eventra_user", JSON.stringify(data));
    }
    return data;
  } catch (err) {
    console.error("Login failed:", err);
    throw err;
  }
}

export async function registerUser(userData) {
  try {
    const payload = {
      firstName: userData.firstName || userData.name?.split(" ")[0] || "User",
      lastName: userData.lastName || userData.name?.split(" ")[1] || "Member",
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword || userData.password
    };

    const data = await fetchAPI("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });

    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("eventra_token", data.token);
      if (data.refreshToken) localStorage.setItem("eventra_refresh_token", data.refreshToken);
      localStorage.setItem("eventra_user", JSON.stringify(data));
    }
    return data;
  } catch (err) {
    console.error("Registration failed:", err);
    throw err;
  }
}

export async function logoutUser() {
  try {
    await fetchAPI("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.warn("Server logout notification failed, clearing local state.");
  } finally {
    clearAuthSession();
  }
}

export async function requestPasswordReset(email) {
  return fetchAPI("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true
  });
}

export async function resetPassword(token, newPassword) {
  return fetchAPI("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true
  });
}

// ==========================================
// 4. USER PROFILES & SETTINGS
// ==========================================

export async function getUserProfile() {
  try {
    return await fetchAPI("/api/users/profile");
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
    throw err;
  }
}

export async function updateUserProfile(profileData) {
  try {
    return await fetchAPI("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData)
    });
  } catch (err) {
    console.error("Failed to update profile:", err);
    throw err;
  }
}

export async function updateAvatar(formData) {
  return fetchAPI("/api/users/avatar", {
    method: "POST",
    headers: {}, // Retain boundary for multipart
    body: formData
  });
}

export async function getUserPreferences() {
  return fetchAPI("/api/users/preferences");
}

export async function updateUserPreferences(preferences) {
  return fetchAPI("/api/users/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences)
  });
}

export async function getMyRegisteredEvents() {
  try {
    const res = await fetchAPI("/api/users/my-events");
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error("Failed to fetch my registered events:", err);
    return [];
  }
}

// ==========================================
// 5. NOTIFICATIONS & PREFERENCES
// ==========================================

export async function getUserNotifications(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/api/notifications${query ? `?${query}` : ""}`;
    const res = await fetchAPI(endpoint);
    return Array.isArray(res) ? res : res?.items || [];
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    return await fetchAPI(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch (err) {
    console.error(`Failed to mark notification ${id} read:`, err);
    throw err;
  }
}

export async function markAllNotificationsRead() {
  return fetchAPI("/api/notifications/read-all", { method: "PUT" });
}

export async function deleteNotification(id) {
  return fetchAPI(`/api/notifications/${id}`, { method: "DELETE" });
}

// ==========================================
// 6. EVENTS MANAGEMENT ENGINE
// ==========================================

export async function getEvents(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const endpoint = `/api/events${query ? `?${query}` : ""}`;
    const events = await fetchAPI(endpoint);
    return Array.isArray(events) ? events : events?.content || [];
  } catch (err) {
    console.error("Failed to fetch events from API:", err);
    return [];
  }
}

export async function getEventById(id) {
  try {
    return await fetchAPI(`/api/events/${id}`);
  } catch (err) {
    console.error(`Failed to fetch event ID ${id} from API:`, err);
    return null;
  }
}

export async function createEvent(eventData) {
  return fetchAPI("/api/events", {
    method: "POST",
    body: JSON.stringify(eventData)
  });
}

export async function updateEvent(id, eventData) {
  return fetchAPI(`/api/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(eventData)
  });
}

export async function deleteEvent(id) {
  return fetchAPI(`/api/events/${id}`, { method: "DELETE" });
}

export async function registerForEvent(eventId, metadata = {}) {
  try {
    return await fetchAPI(`/api/events/${eventId}/register`, {
      method: "POST",
      body: JSON.stringify(metadata)
    });
  } catch (err) {
    console.error(`Failed to register for event ID ${eventId}:`, err);
    throw err;
  }
}

export async function cancelEventRegistration(eventId) {
  return fetchAPI(`/api/events/${eventId}/register`, { method: "DELETE" });
}

// ==========================================
// 7. HACKATHONS & TEAM ENGINE
// ==========================================

export async function getHackathons(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const hackathons = await fetchAPI(`/api/hackathons${query ? `?${query}` : ""}`);
    return Array.isArray(hackathons) ? hackathons : hackathons?.content || [];
  } catch (err) {
    console.error("Failed to fetch hackathons from API:", err);
    return [];
  }
}

export async function getHackathonById(id) {
  try {
    return await fetchAPI(`/api/hackathons/${id}`);
  } catch (err) {
    console.error(`Failed to fetch hackathon ID ${id} from API:`, err);
    return null;
  }
}

export async function registerForHackathon(hackathonId, teamDetails = {}) {
  try {
    return await fetchAPI(`/api/hackathons/${hackathonId}/register`, {
      method: "POST",
      body: JSON.stringify(teamDetails)
    });
  } catch (err) {
    console.error(`Failed to register for hackathon ID ${hackathonId}:`, err);
    throw err;
  }
}

export async function createHackathonTeam(hackathonId, teamData) {
  return fetchAPI(`/api/hackathons/${hackathonId}/teams`, {
    method: "POST",
    body: JSON.stringify(teamData)
  });
}

export async function joinHackathonTeam(hackathonId, teamCode) {
  return fetchAPI(`/api/hackathons/${hackathonId}/teams/join`, {
    method: "POST",
    body: JSON.stringify({ inviteCode: teamCode })
  });
}

export async function submitHackathonProject(hackathonId, submissionData) {
  return fetchAPI(`/api/hackathons/${hackathonId}/submit`, {
    method: "POST",
    body: JSON.stringify(submissionData)
  });
}

export async function getHackathonLeaderboard(hackathonId) {
  return fetchAPI(`/api/hackathons/${hackathonId}/leaderboard`);
}

// ==========================================
// 8. PROJECTS & SHOWCASE ENGINE
// ==========================================

export async function getProjects(filters = {}) {
  try {
    const query = new URLSearchParams(filters).toString();
    const projects = await fetchAPI(`/api/projects${query ? `?${query}` : ""}`);
    return Array.isArray(projects) ? projects : projects?.content || [];
  } catch (err) {
    console.error("Failed to fetch projects from API:", err);
    return [];
  }
}

export async function getProjectById(id) {
  try {
    return await fetchAPI(`/api/projects/${id}`);
  } catch (err) {
    console.error(`Failed to fetch project ID ${id} from API:`, err);
    return null;
  }
}

export async function upvoteProject(id) {
  try {
    return await fetchAPI(`/api/projects/${id}/upvote`, { method: "POST" });
  } catch (err) {
    console.error(`Failed to upvote project ID ${id}:`, err);
    throw err;
  }
}

export async function createProject(projectData) {
  try {
    return await fetchAPI("/api/projects", {
      method: "POST",
      body: JSON.stringify(projectData)
    });
  } catch (err) {
    console.error("Failed to create project:", err);
    throw err;
  }
}

export async function updateProject(id, projectData) {
  return fetchAPI(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(projectData)
  });
}

export async function deleteProject(id) {
  return fetchAPI(`/api/projects/${id}`, { method: "DELETE" });
}

export async function addProjectComment(projectId, commentText) {
  return fetchAPI(`/api/projects/${projectId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: commentText })
  });
}

// ==========================================
// 9. TICKETING & QR CHECK-IN SYSTEM
// ==========================================

export async function getEventTickets(eventId) {
  return fetchAPI(`/api/events/${eventId}/tickets`);
}

export async function purchaseTicket(eventId, ticketTypeId, paymentDetails) {
  return fetchAPI(`/api/events/${eventId}/tickets/purchase`, {
    method: "POST",
    body: JSON.stringify({ ticketTypeId, ...paymentDetails })
  });
}

export async function getMyTickets() {
  return fetchAPI("/api/tickets/my-tickets");
}

export async function getTicketQrCode(ticketId) {
  return fetchAPI(`/api/tickets/${ticketId}/qr`);
}

export async function validateTicketCheckIn(eventId, qrPassCode) {
  return fetchAPI(`/api/events/${eventId}/check-in`, {
    method: "POST",
    body: JSON.stringify({ qrPassCode })
  });
}

// ==========================================
// 10. DISCUSSIONS & Q&A MODULE
// ==========================================

export async function getEventDiscussions(eventId) {
  return fetchAPI(`/api/events/${eventId}/discussions`);
}

export async function postDiscussionThread(eventId, threadData) {
  return fetchAPI(`/api/events/${eventId}/discussions`, {
    method: "POST",
    body: JSON.stringify(threadData)
  });
}

export async function replyToDiscussionThread(threadId, replyData) {
  return fetchAPI(`/api/discussions/${threadId}/replies`, {
    method: "POST",
    body: JSON.stringify(replyData)
  });
}

export async function upvoteDiscussionThread(threadId) {
  return fetchAPI(`/api/discussions/${threadId}/upvote`, { method: "POST" });
}

// ==========================================
// 11. ANALYTICS & ORGANIZER METRICS
// ==========================================

export async function getOrganizerDashboardStats() {
  return fetchAPI("/api/organizer/dashboard/stats");
}

export async function getEventAnalytics(eventId) {
  return fetchAPI(`/api/organizer/events/${eventId}/analytics`);
}

export async function exportEventAttendees(eventId, format = "csv") {
  const url = `${API_BASE_URL}/api/organizer/events/${eventId}/export?format=${format}`;
  const res = await fetch(url, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Export failed");
  return await res.blob();
}

export async function logTelemetryEvent(eventName, payload = {}) {
  try {
    return await fetchAPI("/api/telemetry/event", {
      method: "POST",
      body: JSON.stringify({ eventName, payload, timestamp: new Date().toISOString() }),
      retries: 1
    });
  } catch (err) {
    console.warn("Telemetry dispatch skipped:", err);
  }
}

// ==========================================
// 12. WEBSOCKET & REALTIME CLIENT
// ==========================================

export class EventraWebSocketClient {
  constructor(channel) {
    this.channel = channel;
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnects = 5;
  }

  connect() {
    const token = typeof window !== "undefined" ? localStorage.getItem("eventra_token") : "";
    const url = `${WS_BASE_URL}/ws/${this.channel}?token=${token}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.emit("connection", { status: "connected" });
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type && this.listeners.has(parsed.type)) {
          this.listeners.get(parsed.type).forEach((cb) => cb(parsed.data));
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) this.listeners.set(eventType, []);
    this.listeners.get(eventType).push(callback);
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  disconnect() {
    if (this.ws) this.ws.close();
  }
}

// ==========================================
// 13. OFFLINE SYNC STORAGE ENGINE
// ==========================================

export const OfflineSyncEngine = {
  QUEUE_KEY: "eventra_offline_queue",

  enqueue(endpoint, options) {
    if (typeof window === "undefined") return;
    const queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || "[]");
    queue.push({ id: Date.now(), endpoint, options });
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  },

  async flush() {
    if (typeof window === "undefined" || !navigator.onLine) return;
    const queue = JSON.parse(localStorage.getItem(this.QUEUE_KEY) || "[]");
    if (!queue.length) return;

    const remaining = [];
    for (const item of queue) {
      try {
        await fetchAPI(item.endpoint, item.options);
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(remaining));
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("online", () => OfflineSyncEngine.flush());
}