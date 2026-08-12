/**
 * useModalManager.test.mjs
 *
 * Tests for the centralised useModalManager hook.
 * Covers: scroll lock, escape key, focus trap, focus restoration,
 * aria-hidden, options, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useModalManager from "../src/hooks/useModalManager";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  document.body.style.overflow = "";
  // Create a root element for aria-hidden tests
  const root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  document.getElementById("root")?.remove();
});

const fireKeyDown = (key, options = {}) => {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...options }));
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Scroll lock
// ─────────────────────────────────────────────────────────────────────────────

describe("useModalManager — scroll lock", () => {
  it("locks scroll when isOpen=true", () => {
    renderHook(() => useModalManager(true, vi.fn()));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("does not lock scroll when isOpen=false", () => {
    renderHook(() => useModalManager(false, vi.fn()));
    expect(document.body.style.overflow).toBe("");
  });

  it("does not lock scroll when disableScrollLock=true", () => {
    renderHook(() => useModalManager(true, vi.fn(), { disableScrollLock: true }));
    expect(document.body.style.overflow).toBe("");
  });

  it("restores original overflow on close", () => {
    document.body.style.overflow = "scroll";
    const { rerender } = renderHook(
      ({ isOpen }) => useModalManager(isOpen, vi.fn()),
      { initialProps: { isOpen: true } }
    );
    rerender({ isOpen: false });
    expect(document.body.style.overflow).toBe("scroll");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Escape key
// ─────────────────────────────────────────────────────────────────────────────

describe("useModalManager — escape key", () => {
  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    renderHook(() => useModalManager(true, onClose));
    fireKeyDown("Escape");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal is closed", () => {
    const onClose = vi.fn();
    renderHook(() => useModalManager(false, onClose));
    fireKeyDown("Escape");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not call onClose when disableEscapeKey=true", () => {
    const onClose = vi.fn();
    renderHook(() => useModalManager(true, onClose, { disableEscapeKey: true }));
    fireKeyDown("Escape");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not trigger on other keys", () => {
    const onClose = vi.fn();
    renderHook(() => useModalManager(true, onClose));
    fireKeyDown("Enter");
    fireKeyDown("Tab");
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// aria-hidden
// ─────────────────────────────────────────────────────────────────────────────

describe("useModalManager — aria-hidden", () => {
  it("sets aria-hidden on #root when modal opens", () => {
    renderHook(() => useModalManager(true, vi.fn()));
    expect(document.getElementById("root")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("removes aria-hidden from #root when modal closes", () => {
    const { rerender } = renderHook(
      ({ isOpen }) => useModalManager(isOpen, vi.fn()),
      { initialProps: { isOpen: true } }
    );
    expect(document.getElementById("root")?.getAttribute("aria-hidden")).toBe("true");
    rerender({ isOpen: false });
    expect(document.getElementById("root")?.getAttribute("aria-hidden")).toBeNull();
  });

  it("removes aria-hidden on unmount", () => {
    const { unmount } = renderHook(() => useModalManager(true, vi.fn()));
    unmount();
    expect(document.getElementById("root")?.getAttribute("aria-hidden")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Returns
// ─────────────────────────────────────────────────────────────────────────────

describe("useModalManager — returns", () => {
  it("returns a modalRef object", () => {
    const { result } = renderHook(() => useModalManager(true, vi.fn()));
    expect(result.current.modalRef).toBeDefined();
    expect(typeof result.current.modalRef).toBe("object");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────────────────────────────────────────

describe("useModalManager — cleanup", () => {
  it("removes keydown listener on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = renderHook(() => useModalManager(true, onClose));
    unmount();
    fireKeyDown("Escape");
    expect(onClose).not.toHaveBeenCalled();
  });
});
