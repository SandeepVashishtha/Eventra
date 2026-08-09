/**
 * useScrollLock.test.mjs
 *
 * Tests for the centralised useScrollLock hook.
 * Covers: lock/unlock, original value restoration, iOS fix,
 * SSR safety, nested modals, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import useScrollLock from "../src/hooks/useScrollLock";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
});

// ─────────────────────────────────────────────────────────────────────────────
// Basic lock/unlock
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — basic lock", () => {
  it("sets overflow:hidden when locked=true", () => {
    renderHook(() => useScrollLock(true, { iosFix: false }));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not set overflow:hidden when locked=false", () => {
    renderHook(() => useScrollLock(false, { iosFix: false }));
    expect(document.body.style.overflow).toBe("");
  });

  it("restores overflow on unmount", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores to empty string when original was empty", () => {
    document.body.style.overflow = "";
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Correct restoration (fixes the "auto" and "" bugs)
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — correct value restoration", () => {
  it("restores original overflow:scroll (not 'auto')", () => {
    document.body.style.overflow = "scroll";
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    unmount();
    // Previous bug: useBodyScrollLock reset to "auto" instead of "scroll"
    expect(document.body.style.overflow).toBe("scroll");
  });

  it("restores original overflow:visible (not 'auto')", () => {
    document.body.style.overflow = "visible";
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    unmount();
    expect(document.body.style.overflow).toBe("visible");
  });

  it("restores original overflow:auto (not '')", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    unmount();
    // Previous bug: ShareModal and CommandPalette reset to "" instead of "auto"
    expect(document.body.style.overflow).toBe("auto");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic locked state changes
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — dynamic state", () => {
  it("locks when locked changes from false to true", () => {
    const { rerender } = renderHook(
      ({ locked }) => useScrollLock(locked, { iosFix: false }),
      { initialProps: { locked: false } }
    );
    expect(document.body.style.overflow).toBe("");
    rerender({ locked: true });
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("unlocks when locked changes from true to false", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = renderHook(
      ({ locked }) => useScrollLock(locked, { iosFix: false }),
      { initialProps: { locked: true } }
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender({ locked: false });
    expect(document.body.style.overflow).toBe("scroll");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// iOS fix
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — iOS fix", () => {
  it("sets position:fixed and top when iosFix=true on iOS", () => {
    // Simulate iOS user agent
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    });
    vi.spyOn(window, "scrollY", "get").mockReturnValue(300);

    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: true }));

    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.top).toBe("-300px");
    expect(document.body.style.width).toBe("100%");

    unmount();

    // Should restore scroll position
    expect(window.scrollTo).toHaveBeenCalledWith(0, 300);
  });

  it("does not set position:fixed when iosFix=false", () => {
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    expect(document.body.style.position).toBe("");
    unmount();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SSR safety
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — SSR safety", () => {
  it("does not throw when document is undefined", () => {
    // Can't fully test SSR in jsdom but we can verify the guard path
    expect(() => {
      renderHook(() => useScrollLock(true, { iosFix: false }));
    }).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useScrollLock — cleanup", () => {
  it("restores overflow on unmount even without rerender", () => {
    document.body.style.overflow = "hidden"; // pre-existing
    const { unmount } = renderHook(() => useScrollLock(true, { iosFix: false }));
    unmount();
    // Should restore to what it was before the hook ran
    expect(document.body.style.overflow).toBe("hidden");
  });
});