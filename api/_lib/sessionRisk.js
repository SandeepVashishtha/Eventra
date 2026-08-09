/**
 * api/_lib/sessionRisk.js
 *
 * Utilities for tracking session risk, handling failed logins, and evaluating session states.
 */

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

// Config
const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_S = 600; // 10 minutes
const INACTIVITY_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const SESSION_EXPIRY_S = 24 * 60 * 60; // 24 hours

const memoryStore = new Map();

/**
 * Helper to fetch KV
 */
async function kvFetch(endpoint, options = {}) {
  if (!KV_URL || !KV_TOKEN) return null;
  const url = `${KV_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function trackFailedLogin(username) {
  if (!username) return false;
  const key = `auth:failed:${username.toLowerCase()}`;
  
  if (!KV_URL || !KV_TOKEN) {
    const data = memoryStore.get(key) || { count: 0, expires: Date.now() + FAILED_LOGIN_WINDOW_S * 1000 };
    if (Date.now() > data.expires) {
      data.count = 1;
      data.expires = Date.now() + FAILED_LOGIN_WINDOW_S * 1000;
    } else {
      data.count += 1;
    }
    memoryStore.set(key, data);
    return data.count >= FAILED_LOGIN_THRESHOLD;
  }

  const res = await kvFetch(`/incr/${key}`, { method: "POST" });
  if (!res) return false;
  const count = res.result;

  if (count === 1) {
    await kvFetch(`/expire/${key}/${FAILED_LOGIN_WINDOW_S}`, { method: "POST" });
  }

  return count >= FAILED_LOGIN_THRESHOLD;
}

export async function clearFailedLogin(username) {
  if (!username) return;
  const key = `auth:failed:${username.toLowerCase()}`;
  if (!KV_URL || !KV_TOKEN) {
    memoryStore.delete(key);
    return;
  }
  await kvFetch(`/del/${key}`, { method: "POST" });
}

export async function registerSession(sessionId, userId, ip) {
  const key = `session:${sessionId}`;
  const sessionData = {
    userId,
    ip,
    status: "active",
    lastActive: Date.now(),
    riskScore: 0,
  };

  if (!KV_URL || !KV_TOKEN) {
    memoryStore.set(key, sessionData);
    return;
  }

  await kvFetch(`/set/${key}`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  await kvFetch(`/expire/${key}/${SESSION_EXPIRY_S}`, { method: "POST" });
}

export async function getSessionState(sessionId) {
  const key = `session:${sessionId}`;
  
  if (!KV_URL || !KV_TOKEN) {
    const data = memoryStore.get(key);
    if (!data) return null;
    if (Date.now() - data.lastActive > INACTIVITY_THRESHOLD_MS && data.status === "active") {
      data.status = "requires_reauth";
    }
    return data;
  }

  const res = await kvFetch(`/get/${key}`);
  if (!res || !res.result) return null;

  let sessionData = res.result;
  if (typeof sessionData === 'string') {
    try {
      sessionData = JSON.parse(sessionData);
    } catch(e) {
      return null;
    }
  }

  if (Date.now() - sessionData.lastActive > INACTIVITY_THRESHOLD_MS && sessionData.status === "active") {
    sessionData.status = "requires_reauth";
    // Optimistically update KV in background
    kvFetch(`/set/${key}`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    }).catch(() => {});
  }

  return sessionData;
}

export async function updateSessionActivity(sessionId) {
  const sessionData = await getSessionState(sessionId);
  if (!sessionData) return;

  sessionData.lastActive = Date.now();
  
  const key = `session:${sessionId}`;
  if (!KV_URL || !KV_TOKEN) {
    memoryStore.set(key, sessionData);
    return;
  }

  await kvFetch(`/set/${key}`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  await kvFetch(`/expire/${key}/${SESSION_EXPIRY_S}`, { method: "POST" });
}

export async function setSessionStatus(sessionId, status) {
  const sessionData = await getSessionState(sessionId);
  if (!sessionData) return;

  sessionData.status = status;
  
  const key = `session:${sessionId}`;
  if (!KV_URL || !KV_TOKEN) {
    memoryStore.set(key, sessionData);
    return;
  }

  await kvFetch(`/set/${key}`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  await kvFetch(`/expire/${key}/${SESSION_EXPIRY_S}`, { method: "POST" });
}
