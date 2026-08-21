export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eventra_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
        ...options.headers,
      },
      ...options,
    });

    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("eventra_token");
      localStorage.removeItem("eventra_user");
      window.location.href = "/login";
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
