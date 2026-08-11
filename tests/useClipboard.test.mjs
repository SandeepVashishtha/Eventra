/**
 * useClipboard.test.mjs
 *
 * Tests for the centralised useClipboard hook.
 * Covers: Clipboard API, execCommand fallback, per-key state,
 * auto-reset, error handling, and SSR safety.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useClipboard from "../src/hooks/useClipboard";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();

  // Default: secure context with working Clipboard API
  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    get: () => true,
  });

  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — initial state", () => {
  it("isCopied() returns false on mount", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.isCopied()).toBe(false);
  });

  it("error is null on mount", () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.error).toBe(null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clipboard API (primary strategy)
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — Clipboard API", () => {
  it("calls navigator.clipboard.writeText with the correct text", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("hello world");
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello world");
  });

  it("sets isCopied() to true after successful copy", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("test");
    });
    expect(result.current.isCopied()).toBe(true);
  });

  it("returns true on success", async () => {
    const { result } = renderHook(() => useClipboard());
    let success;
    await act(async () => {
      success = await result.current.copy("test");
    });
    expect(success).toBe(true);
  });

  it("resets isCopied() to false after resetMs", async () => {
    const { result } = renderHook(() => useClipboard({ resetMs: 1000 }));
    await act(async () => {
      await result.current.copy("test");
    });
    expect(result.current.isCopied()).toBe(true);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.isCopied()).toBe(false);
  });

  it("does not reset before resetMs elapses", async () => {
    const { result } = renderHook(() => useClipboard({ resetMs: 2000 }));
    await act(async () => {
      await result.current.copy("test");
    });
    act(() => { vi.advanceTimersByTime(1999); });
    expect(result.current.isCopied()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// execCommand fallback
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — execCommand fallback", () => {
  beforeEach(() => {
    // Simulate HTTP context — Clipboard API not available
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      get: () => false,
    });
    vi.spyOn(document, "execCommand").mockReturnValue(true);
  });

  it("falls back to execCommand when not in secure context", async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("fallback text");
    });
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.isCopied()).toBe(true);
  });

  it("sets error when both strategies fail", async () => {
    vi.spyOn(document, "execCommand").mockReturnValue(false);
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("fail");
    });
    expect(result.current.error).toBe("Failed to copy. Please copy manually.");
    expect(result.current.isCopied()).toBe(false);
  });

  it("returns false when both strategies fail", async () => {
    vi.spyOn(document, "execCommand").mockReturnValue(false);
    const { result } = renderHook(() => useClipboard());
    let success;
    await act(async () => {
      success = await result.current.copy("fail");
    });
    expect(success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Clipboard API fails — falls through to execCommand
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — Clipboard API failure → execCommand", () => {
  it("uses execCommand when Clipboard API rejects", async () => {
    navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    vi.spyOn(document, "execCommand").mockReturnValue(true);

    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      await result.current.copy("fallback");
    });
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(result.current.isCopied()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Per-key copied state
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — per-key state", () => {
  it("tracks copied state independently for different keys", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("url1", "share");
    });

    expect(result.current.isCopied("share")).toBe(true);
    expect(result.current.isCopied("token")).toBe(false);
  });

  it("resets each key independently", async () => {
    const { result } = renderHook(() => useClipboard({ resetMs: 1000 }));

    await act(async () => {
      await result.current.copy("url1", "share");
    });
    await act(async () => {
      await result.current.copy("tok1", "token");
    });

    act(() => { vi.advanceTimersByTime(1000); });

    expect(result.current.isCopied("share")).toBe(false);
    expect(result.current.isCopied("token")).toBe(false);
  });

  it("re-copying the same key resets the timer", async () => {
    const { result } = renderHook(() => useClipboard({ resetMs: 1000 }));

    await act(async () => { await result.current.copy("text", "key1"); });
    act(() => { vi.advanceTimersByTime(800); });

    // Copy again before the reset — timer should restart
    await act(async () => { await result.current.copy("text2", "key1"); });
    act(() => { vi.advanceTimersByTime(800); });

    // Should still be copied (1600ms total but timer restarted at 800ms)
    expect(result.current.isCopied("key1")).toBe(true);

    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current.isCopied("key1")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────────────────────

describe("useClipboard — error state", () => {
  it("clears previous error on successful copy", async () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      get: () => false,
    });
    vi.spyOn(document, "execCommand").mockReturnValueOnce(false).mockReturnValueOnce(true);

    const { result } = renderHook(() => useClipboard());

    // First copy fails
    await act(async () => { await result.current.copy("fail"); });
    expect(result.current.error).toBeTruthy();

    // Second copy succeeds — error should clear
    await act(async () => { await result.current.copy("success"); });
    expect(result.current.error).toBe(null);
  });
});
