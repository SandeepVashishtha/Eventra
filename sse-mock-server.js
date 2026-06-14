/**
 * Local mock SSE server for testing useRealTimeConnection.
 * Run: node sse-mock-server.js
 * Then set REACT_APP_API_URL=http://localhost:8080 in .env.local and restart the dev server.
 */
import http from "http";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadJson = (relativePath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), "utf8"));
  } catch {
    return [];
  }
};

const MOCK_EVENT_CATALOG = loadJson("src/Pages/Events/eventsMockData.json");
const MOCK_PROJECT_CATALOG = loadJson("src/Pages/Projects/mockProjectsData.json");
const MOCK_NOTIFICATION_SEED = loadJson("src/data/mockNotifications.json");

let notificationStore = MOCK_NOTIFICATION_SEED.map((item) => ({ ...item }));
const notificationSseClients = new Set();

const LIVE_NOTIFICATION_TEMPLATES = [
  {
    title: "New Registration",
    message: "Someone just registered for React Conference 2026.",
    category: "registrations",
    type: "registration",
    link: "/events/1",
  },
  {
    title: "Team Invite",
    message: "You have a new team invitation for Global AI Hackathon.",
    category: "social",
    type: "team_invitation",
    link: "/hackathons/2",
  },
  {
    title: "Organizer Announcement",
    message: "Venue details updated for DevOps Summit 2026.",
    category: "announcements",
    type: "announcement",
    link: "/events/3",
  },
  {
    title: "Event Reminder",
    message: "Your workshop starts in 1 hour.",
    category: "reminders",
    type: "reminder",
    link: "/events/2",
  },
];

const broadcastNotification = (notification) => {
  const payload = JSON.stringify({ notification });
  for (const client of notificationSseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      notificationSseClients.delete(client);
    }
  }
};

const pushLiveNotification = () => {
  const template =
    LIVE_NOTIFICATION_TEMPLATES[
      Math.floor(Math.random() * LIVE_NOTIFICATION_TEMPLATES.length)
    ];
  const notification = {
    ...template,
    id: `notif-live-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notificationStore = [notification, ...notificationStore];
  broadcastNotification(notification);
  return notification;
};

// Updated default fallback port to 8080 to match your api.js default config
const PORT = parseInt(process.env.SSE_MOCK_PORT || process.env.PORT || "8080", 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

// Gated behind SSE_DEBUG env var in development to reduce console noise
const enableLogs = process.env.NODE_ENV !== "production" && process.env.SSE_DEBUG === "true";

const log = (...args) => {
  if (enableLogs) {
    console.log(...args);
  }
};

const MOCK_CONTRIBUTORS = [
  { username: "alice", name: "Alice Dev", avatar: "https://avatars.githubusercontent.com/u/1?v=4", profile: "https://github.com/alice", points: 42, prs: 6 },
  { username: "bob", name: "Bob Coder", avatar: "https://avatars.githubusercontent.com/u/2?v=4", profile: "https://github.com/bob", points: 35, prs: 5 },
  { username: "carol", name: "Carol Builder", avatar: "https://avatars.githubusercontent.com/u/3?v=4", profile: "https://github.com/carol", points: 28, prs: 4 },
];

const MOCK_NAMES = ["Priya Sharma", "Arjun Mehta", "Sneha Nair", "Karan Patel", "Divya Rao"];
const MOCK_EVENTS = [
  { id: "event-1", title: "Global AI Hackathon" },
  { id: "event-2", title: "React Conference 2025" },
  { id: "event-3", title: "Web Dev Workshop" }
];

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || !JWT_SECRET.trim()) {
  console.error("FATAL: JWT_SECRET environment variable is required and must not be empty or whitespace-only.");
  console.error("Generate a secure secret using: openssl rand -base64 32");
  process.exit(1);
}

// Mock registration store for ticket check-in testing
const mockRegistrations = new Map([
  ["reg-1", { registrationId: "reg-1", eventId: "event-1", userId: "mock-dev-123", userName: "Sadwika", attendanceStatus: "Registered", registeredAt: new Date().toISOString() }],
  ["reg-2", { registrationId: "reg-2", eventId: "event-1", userId: "user-2", userName: "Priyanshu Ranjan", attendanceStatus: "Registered", registeredAt: new Date().toISOString() }],
  ["reg-3", { registrationId: "reg-3", eventId: "event-2", userId: "user-3", userName: "Karan Patel", attendanceStatus: "Checked In", checkedInAt: new Date().toISOString() }]
]);

const mockScanLogs = [
  { logId: "log-initial-1", registrationId: "reg-3", eventId: "event-2", userId: "user-3", userName: "Karan Patel", scannedBy: "mock-dev-123", timestamp: new Date().toISOString(), status: "Checked In", eventName: "React Conference 2025" }
];

const decodeJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(jsonPayload);
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const MAX_BODY_SIZE = 100 * 1024; // 100KB

const getRequestBody = (req, res) => {
  return new Promise((resolve) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        req.destroy();
        if (res && !res.headersSent) {
          jsonResponse(res, 413, { error: "Request body too large. Maximum size is 100KB." });
        }
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on("error", () => {
      resolve({});
    });
  });
};

const jsonResponse = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
  });
  res.end(JSON.stringify(data));
};

function sseHeaders(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
  });
}

function send(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const server = http.createServer(async (req, res) => {
  // Handle Preflight OPTIONS requests for regular API calls
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  // Mock Profile Endpoint Handler - Stops AuthProvider context crashes
  if (pathname === "/api/users/profile" || pathname === "/users/profile") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Credentials": "true",
    });
    res.end(JSON.stringify({
      success: true,
      user: { id: "mock-dev-123", name: "Sadwika", role: "developer" }
    }));
    return;
  }

  // Get all events (paginated Spring-style response)
  if ((pathname === "/api/events" || pathname === "/events") && req.method === "GET") {
    const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
    const size = Math.max(1, parseInt(searchParams.get("size") || "12", 10));
    const start = page * size;
    const content = MOCK_EVENT_CATALOG.slice(start, start + size);
    const totalElements = MOCK_EVENT_CATALOG.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    return jsonResponse(res, 200, {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
    });
  }

  // Projects list for local development
  if ((pathname === "/api/projects" || pathname === "/projects") && req.method === "GET") {
    return jsonResponse(res, 200, MOCK_PROJECT_CATALOG);
  }

  if (pathname === "/api/projects/categories" && req.method === "GET") {
    const categories = [
      ...new Set(MOCK_PROJECT_CATALOG.map((project) => project.category).filter(Boolean)),
    ];
    return jsonResponse(res, 200, categories);
  }

  // Get statistics
  if (pathname === "/api/tickets/stats" && req.method === "GET") {
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return jsonResponse(res, 400, { error: "Missing required parameter: eventId" });
    }
    const eventRegs = Array.from(mockRegistrations.values()).filter(
      r => String(r.eventId) === String(eventId)
    );
    const totalRegistrations = eventRegs.length;
    const checkedInAttendees = eventRegs.filter(r => r.attendanceStatus === "Checked In").length;
    const remainingAttendees = totalRegistrations - checkedInAttendees;
    const attendancePercentage = totalRegistrations > 0
      ? Math.round((checkedInAttendees / totalRegistrations) * 100)
      : 0;

    return jsonResponse(res, 200, {
      totalRegistrations,
      checkedInAttendees,
      attendancePercentage,
      remainingAttendees
    });
  }

  // Get check-in history log
  if (pathname === "/api/tickets/checkins" && req.method === "GET") {
    const eventId = searchParams.get("eventId");
    let filtered = mockScanLogs;
    if (eventId) {
      filtered = mockScanLogs.filter(log => String(log.eventId) === String(eventId));
    }
    const history = filtered.map(log => ({
      id: log.logId,
      ticketId: log.registrationId,
      name: log.userName,
      event: log.eventName || `Event #${log.eventId}`,
      status: log.status === "Checked In" ? "Verified" : "Flagged",
      time: log.timestamp
    }));
    return jsonResponse(res, 200, history.slice().reverse());
  }

  // Token generation
  if (pathname === "/api/tickets/token" && req.method === "POST") {
    const body = await getRequestBody(req, res);
    const { registrationId, eventId } = body;
    if (!registrationId || !eventId) {
      return jsonResponse(res, 400, { error: "Missing required fields: registrationId and eventId" });
    }

    let reg = mockRegistrations.get(registrationId);
    if (!reg) {
      reg = {
        registrationId,
        eventId: eventId,
        userId: "mock-dev-123",
        userName: "Sadwika",
        registeredAt: new Date().toISOString(),
        attendanceStatus: "Registered"
      };
      mockRegistrations.set(registrationId, reg);
    }

    try {
      const token = jwt.sign(
        { registrationId: reg.registrationId, eventId: reg.eventId, userId: reg.userId, userName: reg.userName },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      reg.qrToken = token;
      return jsonResponse(res, 200, { success: true, token, registrationId: reg.registrationId });
    } catch (err) {
      return jsonResponse(res, 500, { error: "Failed to sign mock token" });
    }
  }

  // Validate ticket code / JWT token
  if (pathname === "/api/tickets/validate" && req.method === "POST") {
    const body = await getRequestBody(req, res);
    const { ticketId, eventId } = body;
    if (!ticketId || !eventId) {
      return jsonResponse(res, 400, { error: "Missing ticketId or eventId" });
    }

    let registrationId = ticketId;
    let decodedToken = null;
    if (ticketId.startsWith("eyJ")) {
      try {
        decodedToken = jwt.verify(ticketId, JWT_SECRET);
        registrationId = decodedToken.registrationId;
        if (String(decodedToken.eventId) !== String(eventId)) {
          return jsonResponse(res, 400, { valid: false, message: "Security Alert: Ticket is valid, but registered for a different event." });
        }
      } catch (err) {
        const decoded = decodeJwtPayload(ticketId);
        if (decoded) {
          decodedToken = decoded;
          registrationId = decoded.registrationId;
          if (String(decoded.eventId) !== String(eventId)) {
            return jsonResponse(res, 400, { valid: false, message: "Security Alert: Ticket is valid, but registered for a different event." });
          }
        } else {
          return jsonResponse(res, 400, { valid: false, message: "Security Alert: QR Code is invalid or has been tampered with!" });
        }
      }
    }

    let reg = mockRegistrations.get(registrationId);
    if (!reg && decodedToken) {
      reg = {
        registrationId,
        eventId: eventId,
        userId: decodedToken.userId || "unknown",
        userName: decodedToken.userName || "Attendee",
        attendanceStatus: "Registered",
        registeredAt: new Date().toISOString(),
        qrToken: ticketId
      };
      mockRegistrations.set(registrationId, reg);
    }

    if (!reg) {
      return jsonResponse(res, 404, { valid: false, message: "Ticket registration not found." });
    }

    if (String(reg.eventId) !== String(eventId)) {
      return jsonResponse(res, 400, { valid: false, message: "Ticket is registered for a different event." });
    }

    if (reg.attendanceStatus === "Checked In") {
      const duplicateLog = {
        logId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        registrationId: reg.registrationId,
        eventId: reg.eventId,
        userId: reg.userId,
        userName: reg.userName,
        scannedBy: "mock-dev-123",
        timestamp: new Date().toISOString(),
        status: "Duplicate Attempt",
        eventName: MOCK_EVENTS.find(e => String(e.id) === String(eventId))?.title || "Active Event"
      };
      mockScanLogs.push(duplicateLog);

      return jsonResponse(res, 200, {
        valid: true,
        alreadyCheckedIn: true,
        registrationId: reg.registrationId,
        userName: reg.userName,
        eventId: reg.eventId,
        message: "This ticket has already been checked in!"
      });
    }

    return jsonResponse(res, 200, {
      valid: true,
      alreadyCheckedIn: false,
      registrationId: reg.registrationId,
      userName: reg.userName,
      eventId: reg.eventId,
      attendanceStatus: reg.attendanceStatus,
      message: "Ticket verified successfully."
    });
  }

  // Record check-in
  if (pathname === "/api/tickets/checkin" && req.method === "POST") {
    const body = await getRequestBody(req, res);
    const { ticketId, eventId } = body;
    if (!ticketId || !eventId) {
      return jsonResponse(res, 400, { error: "Missing ticketId or eventId" });
    }

    let registrationId = ticketId;
    let decodedToken = null;
    if (ticketId.startsWith("eyJ")) {
      try {
        decodedToken = jwt.verify(ticketId, JWT_SECRET);
        registrationId = decodedToken.registrationId;
      } catch (err) {
        const decoded = decodeJwtPayload(ticketId);
        if (decoded) {
          decodedToken = decoded;
          registrationId = decoded.registrationId;
        }
      }
    }

    let reg = mockRegistrations.get(registrationId);
    if (!reg && decodedToken) {
      reg = {
        registrationId,
        eventId: eventId,
        userId: decodedToken.userId || "unknown",
        userName: decodedToken.userName || "Attendee",
        attendanceStatus: "Registered",
        registeredAt: new Date().toISOString(),
        qrToken: ticketId
      };
      mockRegistrations.set(registrationId, reg);
    }

    if (!reg) {
      return jsonResponse(res, 404, { error: "Ticket registration not found." });
    }

    if (reg.attendanceStatus === "Checked In") {
      return jsonResponse(res, 409, { error: "Attendee is already checked in" });
    }

    reg.attendanceStatus = "Checked In";
    reg.checkedInAt = new Date().toISOString();
    reg.checkedInBy = "mock-dev-123";

    const checkInLog = {
      logId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      registrationId: reg.registrationId,
      eventId: reg.eventId,
      userId: reg.userId,
      userName: reg.userName,
      scannedBy: "mock-dev-123",
      timestamp: reg.checkedInAt,
      status: "Checked In",
      eventName: MOCK_EVENTS.find(e => String(e.id) === String(eventId))?.title || "Active Event"
    };
    mockScanLogs.push(checkInLog);

    return jsonResponse(res, 200, {
      success: true,
      message: "Attendee check-in recorded successfully",
      registration: reg
    });
  }

  // Notifications REST API
  if (pathname === "/api/notifications" && req.method === "GET") {
    return jsonResponse(res, 200, notificationStore);
  }

  const readMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (readMatch && (req.method === "PUT" || req.method === "PATCH")) {
    const id = decodeURIComponent(readMatch[1]);
    notificationStore = notificationStore.map((item) =>
      item.id === id ? { ...item, isRead: true } : item
    );
    return jsonResponse(res, 200, {
      message: "Notification marked as read",
      notificationId: id,
    });
  }

  if (pathname === "/api/notifications/read-all" && (req.method === "PUT" || req.method === "PATCH")) {
    notificationStore = notificationStore.map((item) => ({ ...item, isRead: true }));
    return jsonResponse(res, 200, { message: "All notifications marked as read" });
  }

  const deleteMatch = pathname.match(/^\/api\/notifications\/([^/]+)$/);
  if (deleteMatch && req.method === "DELETE") {
    const id = decodeURIComponent(deleteMatch[1]);
    notificationStore = notificationStore.filter((item) => item.id !== id);
    return jsonResponse(res, 200, { message: "Notification deleted", notificationId: id });
  }

  if (pathname === "/stream/notifications" || pathname === "/api/stream/notifications") {
    sseHeaders(res);
    log("[SSE] notifications client connected");

    notificationSseClients.add(res);

    // Send current unread snapshot
    const unread = notificationStore.filter((item) => !item.isRead).slice(0, 5);
    if (unread.length > 0) {
      send(res, { notifications: unread });
    }

    const interval = setInterval(() => {
      const notification = pushLiveNotification();
      send(res, { notification });
      log(`[SSE] notification pushed: ${notification.title}`);
    }, 20000);

    req.on("close", () => {
      clearInterval(interval);
      notificationSseClients.delete(res);
      log("[SSE] notifications client disconnected");
    });
    return;
  }

  if (pathname === "/stream/leaderboard" || pathname === "/api/stream/leaderboard") {
    sseHeaders(res);
    log("[SSE] leaderboard client connected");

    // Send initial snapshot immediately
    send(res, MOCK_CONTRIBUTORS);

    // Then push a simulated rank change every 8 seconds
    const interval = setInterval(() => {
      const updated = MOCK_CONTRIBUTORS.map((c) => ({
        ...c,
        points: c.points + Math.floor(Math.random() * 3),
        prs: c.prs + (Math.random() > 0.7 ? 1 : 0),
      })).sort((a, b) => b.points - a.points);
      send(res, updated);
      log("[SSE] leaderboard update sent");
    }, 8000);

    req.on("close", () => {
      clearInterval(interval);
      log("[SSE] leaderboard client disconnected");
    });
    return;
  }

  if (pathname === "/stream/analytics" || pathname === "/api/stream/analytics") {
    sseHeaders(res);
    log("[SSE] analytics client connected");

    // Push a new check-in every 5 seconds
    const interval = setInterval(() => {
      const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
      const eventObj = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      const event = eventObj.title;
      const status = Math.random() > 0.1 ? "Verified" : "Flagged";
      const checkin = { id: `sse-${Date.now()}`, name, event, time: "Just now", status };
      send(res, checkin);
      log(`[SSE] analytics check-in: ${name} → ${status}`);
    }, 5000);

    req.on("close", () => {
      clearInterval(interval);
      log("[SSE] analytics client disconnected");
    });
    return;
  }

  // Fallback 404 with safety CORS headers included to protect browser channel
  res.writeHead(404, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
  });
  res.end(JSON.stringify({ error: `Route ${req.url} not found on local mock server.` }));
});

server.listen(PORT, () => {
  console.log(`\n[Dev Only] SSE mock server running on port ${PORT}`);
  console.log(`Allowed Origin: ${ALLOWED_ORIGIN}`);
  console.log("Streams and Endpoints available:");
  console.log(`  GET http://localhost:${PORT}/api/notifications`);
  console.log(`  PUT http://localhost:${PORT}/api/notifications/:id/read`);
  console.log(`  PUT http://localhost:${PORT}/api/notifications/read-all`);
  console.log(`  DELETE http://localhost:${PORT}/api/notifications/:id`);
  console.log(`  GET http://localhost:${PORT}/api/stream/notifications`);
  console.log(`  GET http://localhost:${PORT}/api/users/profile`);
  console.log(`  GET http://localhost:${PORT}/api/stream/leaderboard`);
  console.log(`  GET http://localhost:${PORT}/api/stream/analytics`);
  console.log(`  GET http://localhost:${PORT}/api/events`);
  console.log(`  GET http://localhost:${PORT}/api/tickets/stats`);
  console.log(`  GET http://localhost:${PORT}/api/tickets/checkins`);
  console.log(`  POST http://localhost:${PORT}/api/tickets/token`);
  console.log(`  POST http://localhost:${PORT}/api/tickets/validate`);
  console.log(`  POST http://localhost:${PORT}/api/tickets/checkin`);
  console.log("\nNext steps:");
  console.log("  1. Restart the React dev server (npm run dev)");
  console.log(`  2. Run with SSE_DEBUG=true to enable verbose streaming logs\n`);
});