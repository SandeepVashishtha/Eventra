/**
 * api/_lib/sessionRisk.js
 *
 * Utilities for tracking session risk, handling failed logins, and evaluating session states.
 *
 * This module provides distributed session-risk storage with configurable failure modes.
 * Production requires KV_REST_API_URL and KV_REST_API_TOKEN to be configured.
 */

import {
  isSessionRiskStorageConfigured,
  isInMemorySessionRiskStorageAllowed,
  getSessionRiskFailMode,
} from "./session-risk-config.js";

// Config
const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_S = 600; // 10 minutes
const INACTIVITY_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const SESSION_EXPIRY_S = 24 * 60 * 60; // 24 hours

// In-memory fallback storage (ONLY for development/testing)
const memoryStore = new Map();

/**
 * Helper to fetch KV
 */
async function kvFetch(endpoint, options = {}) {
  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;
  
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
    if (!res.ok) {
      console.error(
        "[SESSION_RISK] KV returned error",
        {
          endpoint,
          status: res.status,
          statusText: res.statusText
        }
      );
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(
      "[SESSION_RISK] KV request failed",
      {
        endpoint,
        error: error.message
      }
    );
    return null;
  }
}

export async function trackFailedLogin(username) {
  if (!username) return false;
  const key = `auth:failed:${username.toLowerCase()}`;
  
  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  const failMode = getSessionRiskFailMode();
  
  // Production: Handle missing distributed storage based on failure mode
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      if (failMode === "closed") {
        console.error(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=closed). Rejecting failed login tracking."
        );
        return false;
      } else if (failMode === "open") {
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=open). Skipping failed login tracking."
        );
        return false;
      } else {
        // fallback mode
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=fallback). Skipping failed login tracking."
        );
        return false;
      }
    }
    
    // Development: Use in-memory storage
    console.log("[SESSION_RISK] Using in-memory storage for failed login tracking (development mode)");
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

  console.log("[SESSION_RISK] Storage configured. Using distributed KV for failed login tracking.");
  const res = await kvFetch(`/incr/${key}`, { method: "POST" });
  if (!res) {
    console.warn("[SESSION_RISK] KV request failed for failed login tracking.");
    return false;
  }
  const count = res.result;

  if (count === 1) {
    await kvFetch(`/expire/${key}/${FAILED_LOGIN_WINDOW_S}`, { method: "POST" });
  }

  return count >= FAILED_LOGIN_THRESHOLD;
}

export async function clearFailedLogin(username) {
  if (!username) return;
  const key = `auth:failed:${username.toLowerCase()}`;
  
  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      console.warn("[SESSION_RISK] Storage unavailable. Skipping clear failed login.");
      return;
    }
    
    // Development: Use in-memory storage
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

  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  const failMode = getSessionRiskFailMode();
  
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      if (failMode === "closed") {
        console.error(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=closed). Rejecting session registration."
        );
        throw new Error("Session registration failed: storage unavailable");
      } else if (failMode === "open") {
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=open). Skipping session registration."
        );
        return;
      } else {
        // fallback mode
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=fallback). Skipping session registration."
        );
        return;
      }
    }
    
    // Development: Use in-memory storage
    console.log("[SESSION_RISK] Using in-memory storage for session registration (development mode)");
    memoryStore.set(key, sessionData);
    return;
  }

  console.log("[SESSION_RISK] Storage configured. Using distributed KV for session registration.");
  await kvFetch(`/set/${key}`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  await kvFetch(`/expire/${key}/${SESSION_EXPIRY_S}`, { method: "POST" });
}

export async function getSessionState(sessionId) {
  const key = `session:${sessionId}`;
  
  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  const failMode = getSessionRiskFailMode();
  
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      if (failMode === "closed") {
        console.error(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=closed). Requiring re-authentication."
        );
        return { status: "requires_reauth", reason: "storage_unavailable" };
      } else if (failMode === "open") {
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=open). Returning null session state."
        );
        return null;
      } else {
        // fallback mode
        console.warn(
          "[SESSION_RISK] Storage unavailable (SESSION_RISK_FAIL_MODE=fallback). Returning null session state."
        );
        return null;
      }
    }
    
    // Development: Use in-memory storage
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
    } catch(error) {
      console.error(
        "[SESSION_RISK] Failed to parse session data",
        {
          sessionId,
          key,
          error: error.message
        }
      );
      return null;
    }
  }

  if (Date.now() - sessionData.lastActive > INACTIVITY_THRESHOLD_MS && sessionData.status === "active") {
    sessionData.status = "requires_reauth";
    // Optimistically update KV in background
    kvFetch(`/set/${key}`, {
      method: "POST",
      body: JSON.stringify(sessionData),
    }).catch((error) => {
      console.error(
        "[SESSION_RISK] Background KV update failed",
        {
          endpoint: `/set/${key}`,
          error: error.message
        }
      );
    });
  }

  return sessionData;
}

export async function updateSessionActivity(sessionId) {
  const sessionData = await getSessionState(sessionId);
  if (!sessionData) return;

  sessionData.lastActive = Date.now();
  
  const key = `session:${sessionId}`;
  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      console.warn("[SESSION_RISK] Storage unavailable. Skipping session activity update.");
      return;
    }
    
    // Development: Use in-memory storage
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
  const isStorageConfigured = isSessionRiskStorageConfigured();
  const isInMemoryAllowed = isInMemorySessionRiskStorageAllowed();
  
  if (!isStorageConfigured) {
    if (!isInMemoryAllowed) {
      console.warn("[SESSION_RISK] Storage unavailable. Skipping session status update.");
      return;
    }
    
    // Development: Use in-memory storage
    memoryStore.set(key, sessionData);
    return;
  }

  await kvFetch(`/set/${key}`, {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
  await kvFetch(`/expire/${key}/${SESSION_EXPIRY_S}`, { method: "POST" });
}
