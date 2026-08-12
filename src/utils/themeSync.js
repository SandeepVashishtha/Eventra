/**
 * @fileoverview Theme sync utilities for cross-device theme persistence (#7653) & Cross-Tab Ping-Pong Prevention (#13900)
 */

const VALID_THEMES = new Set(["light", "dark", "system"]);
const THEME_CHANNEL_NAME = "eventra_theme_sync_channel";

// FIX (#13900): Unique tab identifier to prevent infinite cross-tab broadcast ping-pong loops
export const TAB_ID = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);

let themeBroadcastChannel = null;
let lastBroadcastTimestamp = 0;

if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    themeBroadcastChannel = new BroadcastChannel(THEME_CHANNEL_NAME);
  } catch (err) {
    console.warn("[themeSync] BroadcastChannel unavailable:", err);
  }
}

export const isValidTheme = (value) => VALID_THEMES.has(value);

export const getProfileTheme = (user) => {
  const theme = user?.preferences?.theme;
  return isValidTheme(theme) ? theme : null;
};

export const broadcastThemeChange = (theme) => {
  if (!isValidTheme(theme)) return;
  const now = Date.now();
  if (now - lastBroadcastTimestamp < 50) return; // 50ms lock window to prevent echo loops
  lastBroadcastTimestamp = now;

  if (themeBroadcastChannel) {
    themeBroadcastChannel.postMessage({
      type: "THEME_CHANGE",
      theme,
      senderTabId: TAB_ID,
      timestamp: now,
    });
  }
};

export const subscribeThemeBroadcast = (onThemeReceived) => {
  if (!themeBroadcastChannel) return () => {};

  const handleMessage = (event) => {
    const data = event.data;
    if (data && data.type === "THEME_CHANGE" && data.senderTabId !== TAB_ID && isValidTheme(data.theme)) {
      onThemeReceived(data.theme);
    }
  };

  themeBroadcastChannel.addEventListener("message", handleMessage);
  return () => {
    if (themeBroadcastChannel) {
      themeBroadcastChannel.removeEventListener("message", handleMessage);
    }
  };
};

export const syncThemeToProfile = async (theme, isAuthenticated = false) => {
  if (!isAuthenticated) return;
  if (!isValidTheme(theme)) return;

  try {
    const { apiUtils, API_ENDPOINTS } = await import("../config/api.js");
    apiUtils
      .put(API_ENDPOINTS.USERS.PREFERENCES, { preferences: { theme } })
      .catch(() => console.warn("[themeSync] Theme update failed"));
  } catch {
    console.warn("[themeSync] Could not load API config");
  }
};
