export const API_BASE_URL = "https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net";

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("eventra_token");
  localStorage.removeItem("eventra_user");
  localStorage.removeItem("eventra_refresh_token");
}

export function decodeJWT(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getTokenExpiration(token) {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000;
}

let refreshPromise = null;

export async function attemptTokenRefresh() {
  if (typeof window === "undefined") return false;

  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("eventra_refresh_token") || localStorage.getItem("eventra_token");
  if (!refreshToken) return false;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`);
      }

      const data = await response.json();
      const newToken = data.token || data.accessToken;
      const newRefreshToken = data.refreshToken || data.refresh_token;

      if (newToken) {
        localStorage.setItem("eventra_token", newToken);
        if (newRefreshToken) {
          localStorage.setItem("eventra_refresh_token", newRefreshToken);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("eventra:token_refreshed"));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn("[Eventra Auth] Silent token refresh failed:", err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eventra_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
    });

    if (res.status === 401 && typeof window !== "undefined") {
      if (!options._isRetry) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          return fetchAPI(endpoint, {
            ...options,
            _isRetry: true,
          });
        }
      }

      clearAuthStorage();
      window.dispatchEvent(new Event("eventra:session_expired"));
      window.location.href = "/login?reason=session_expired";
      throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
      let errText = res.statusText;
      try {
        const errorJson = await res.json();
        errText = errorJson.message || errorJson.error || errText;
      } catch (e) {}
      throw new Error(`API Error ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`[Eventra API Error] Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

export async function loginUser(credentials) {
  try {
    const payload = {
      usernameOrEmail: credentials.usernameOrEmail || credentials.email || credentials.username || "",
      password: credentials.password || ""
    };

    const data = await fetchAPI("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("eventra_token", data.token);
      if (data.refreshToken || data.refresh_token) {
        localStorage.setItem("eventra_refresh_token", data.refreshToken || data.refresh_token);
      }
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
      body: JSON.stringify(payload)
    });

    if (data?.token && typeof window !== "undefined") {
      localStorage.setItem("eventra_token", data.token);
      if (data.refreshToken || data.refresh_token) {
        localStorage.setItem("eventra_refresh_token", data.refreshToken || data.refresh_token);
      }
      localStorage.setItem("eventra_user", JSON.stringify(data));
    }
    return data;
  } catch (err) {
    console.error("Registration failed:", err);
    throw err;
  }
}

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

export async function getMyRegisteredEvents() {
  try {
    const res = await fetchAPI("/api/users/my-events");
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error("Failed to fetch my registered events:", err);
    return [];
  }
}

export async function getUserNotifications() {
  try {
    const res = await fetchAPI("/api/notifications");
    return Array.isArray(res) ? res : [];
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}

export async function markNotificationRead(id) {
  try {
    return await fetchAPI(`/api/notifications/${id}/read`, {
      method: "PUT"
    });
  } catch (err) {
    console.error(`Failed to mark notification ${id} read:`, err);
    throw err;
  }
}

export async function getEvents() {
  try {
    const events = await fetchAPI("/api/events");
    return Array.isArray(events) ? events : [];
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

export async function registerForEvent(eventId) {
  try {
    return await fetchAPI(`/api/events/${eventId}/register`, {
      method: "POST"
    });
  } catch (err) {
    console.error(`Failed to register for event ID ${eventId}:`, err);
    throw err;
  }
}

export async function getHackathons() {
  try {
    const hackathons = await fetchAPI("/api/hackathons");
    return Array.isArray(hackathons) ? hackathons : [];
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

export async function registerForHackathon(hackathonId) {
  try {
    return await fetchAPI(`/api/hackathons/${hackathonId}/register`, {
      method: "POST"
    });
  } catch (err) {
    console.error(`Failed to register for hackathon ID ${hackathonId}:`, err);
    throw err;
  }
}

export async function getProjects() {
  try {
    const projects = await fetchAPI("/api/projects");
    return Array.isArray(projects) ? projects : [];
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
    return await fetchAPI(`/api/projects/${id}/upvote`, {
      method: "POST"
    });
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

export async function getEventAnalytics(eventId) {
  try {
    // Attempt to fetch from local Next.js API route first for rich analytics
    const res = await fetch(`/api/events/${eventId}/analytics`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch local analytics route, falling back...", err);
  }

  try {
    // Fallback to backend API endpoint if configured
    return await fetchAPI(`/api/events/${eventId}/analytics`);
  } catch (err) {
    console.error(`Failed to fetch analytics for event ${eventId}:`, err);
    throw err;
  }
}

export function exportEventRegistrationsCSV(analyticsData, eventTitle = "event") {
  if (!analyticsData || !analyticsData.attendees || analyticsData.attendees.length === 0) {
    throw new Error("No attendee registration data available to export.");
  }

  const headers = ["Registration ID", "Name", "Email", "Role", "Location", "Registration Date", "Checked In", "Check-in Time"];
  const rows = analyticsData.attendees.map((attendee) => [
    attendee.id,
    `"${attendee.name.replace(/"/g, '""')}"`,
    attendee.email,
    `"${attendee.role.replace(/"/g, '""')}"`,
    `"${attendee.location.replace(/"/g, '""')}"`,
    attendee.registeredAt,
    attendee.checkedIn ? "Yes" : "No",
    attendee.checkInTime || "N/A"
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const sanitizedTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");
  link.setAttribute("href", url);
  link.setAttribute("download", `registrations-${sanitizedTitle}-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

