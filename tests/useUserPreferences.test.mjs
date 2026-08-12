/**
 * useUserPreferences.test.mjs
 *
 * Tests for the useUserPreferences hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useUserPreferences from "../src/hooks/useUserPreferences";

vi.mock("../src/utils/safeJsonParse", () => ({
  safeJsonParse: (str, fallback) => {
    try { return JSON.parse(str); } catch { return fallback; }
  },
}));

beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — initial state", () => {
  it("returns global defaults when storage is empty", () => {
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences.cursor).toBe("on");
    expect(result.current.preferences.notifications).toBe(true);
    expect(result.current.preferences.privacyMode).toBe(false);
    expect(result.current.preferences.theme).toBe("system");
  });

  it("sets isLoaded=true after mount", async () => {
    const { result } = renderHook(() => useUserPreferences());
    await act(async () => {});
    expect(result.current.isLoaded).toBe(true);
  });

  it("reads persisted preferences from localStorage", () => {
    localStorage.setItem(
      "eventra:prefs",
      JSON.stringify({ cursor: "off", notifications: false })
    );
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences.cursor).toBe("off");
    expect(result.current.preferences.notifications).toBe(false);
  });

  it("merges stored values with defaults (backfills new keys)", () => {
    // Storage only has cursor — missing 'theme' should come from defaults
    localStorage.setItem("eventra:prefs", JSON.stringify({ cursor: "off" }));
    const { result } = renderHook(() => useUserPreferences());
    expect(result.current.preferences.cursor).toBe("off");
    expect(result.current.preferences.theme).toBe("system"); // backfilled
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setPreference
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — setPreference", () => {
  it("updates a single preference", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => { result.current.setPreference("cursor", "off"); });
    expect(result.current.preferences.cursor).toBe("off");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => { result.current.setPreference("theme", "dark"); });
    const stored = JSON.parse(localStorage.getItem("eventra:prefs") || "{}");
    expect(stored.theme).toBe("dark");
  });

  it("does not overwrite other preferences", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => { result.current.setPreference("cursor", "off"); });
    act(() => { result.current.setPreference("theme", "dark"); });
    expect(result.current.preferences.cursor).toBe("off");
    expect(result.current.preferences.theme).toBe("dark");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setPreferences (batch)
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — setPreferences", () => {
  it("updates multiple preferences at once", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => {
      result.current.setPreferences({ cursor: "off", theme: "dark", notifications: false });
    });
    expect(result.current.preferences.cursor).toBe("off");
    expect(result.current.preferences.theme).toBe("dark");
    expect(result.current.preferences.notifications).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resetPreferences
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — resetPreferences", () => {
  it("resets to global defaults", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => { result.current.setPreference("cursor", "off"); });
    act(() => { result.current.resetPreferences(); });
    expect(result.current.preferences.cursor).toBe("on");
    expect(result.current.preferences.theme).toBe("system");
  });

  it("removes entry from localStorage", () => {
    const { result } = renderHook(() => useUserPreferences());
    act(() => { result.current.setPreference("cursor", "off"); });
    act(() => { result.current.resetPreferences(); });
    expect(localStorage.getItem("eventra:prefs")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Namespace
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — namespace", () => {
  it("uses separate storage key for sponsor namespace", () => {
    const { result } = renderHook(() => useUserPreferences({ namespace: "sponsor" }));
    act(() => { result.current.setPreference("boothName", "Acme Corp"); });
    expect(localStorage.getItem("eventra:prefs:sponsor")).toBeTruthy();
    expect(localStorage.getItem("eventra:prefs")).toBeNull();
  });

  it("returns sponsor defaults", () => {
    const { result } = renderHook(() => useUserPreferences({ namespace: "sponsor" }));
    expect(result.current.preferences.showLogo).toBe(true);
    expect(result.current.preferences.boothTheme).toBe("default");
  });

  it("does not leak between namespaces", () => {
    const { result: global } = renderHook(() => useUserPreferences());
    const { result: sponsor } = renderHook(() => useUserPreferences({ namespace: "sponsor" }));
    act(() => { global.result?.current?.setPreference?.("cursor", "off"); });
    expect(sponsor.current.preferences.cursor).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-tab sync
// ─────────────────────────────────────────────────────────────────────────────

describe("useUserPreferences — cross-tab sync", () => {
  it("updates state when storage event fires", () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      localStorage.setItem("eventra:prefs", JSON.stringify({ cursor: "off", notifications: true, privacyMode: false, backupKey: null, theme: "dark", language: "en", reducedMotion: false, fontSize: "medium" }));
      window.dispatchEvent(new StorageEvent("storage", {
        key: "eventra:prefs",
        newValue: JSON.stringify({ cursor: "off", theme: "dark" }),
      }));
    });

    expect(result.current.preferences.cursor).toBe("off");
  });
});
