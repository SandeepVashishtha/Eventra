/**
 * useToast.test.mjs
 *
 * Tests for the useToast hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useToast from "../src/hooks/useToast";

// Mock react-toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => "toast-id-1"),
    dismiss: vi.fn(),
    promise: vi.fn((p) => p),
  },
}));

import { toast } from "react-toastify";

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.restoreAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────
// success
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — success", () => {
  it("calls toast.success with message", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.success("Event saved!"); });
    expect(toast.success).toHaveBeenCalledWith("Event saved!", expect.objectContaining({ autoClose: 2500 }));
  });

  it("uses standard 2500ms autoClose", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.success("Done"); });
    expect(toast.success).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ autoClose: 2500 }));
  });

  it("dismisses previous toast with same toastId", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.success("Saved", { toastId: "bookmark-1" }); });
    expect(toast.dismiss).toHaveBeenCalledWith("bookmark-1");
  });

  it("allows custom autoClose override", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.success("Done", { autoClose: 1000 }); });
    expect(toast.success).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ autoClose: 1000 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// error
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — error", () => {
  it("calls toast.error with message", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.error("Something failed"); });
    expect(toast.error).toHaveBeenCalledWith("Something failed", expect.objectContaining({ autoClose: 4000 }));
  });

  it("uses standard 4000ms autoClose", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.error("Error"); });
    expect(toast.error).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ autoClose: 4000 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// warning
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — warning", () => {
  it("calls toast.warning with 3500ms", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.warning("Check this"); });
    expect(toast.warning).toHaveBeenCalledWith("Check this", expect.objectContaining({ autoClose: 3500 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// info
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — info", () => {
  it("calls toast.info with 2500ms", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.info("FYI"); });
    expect(toast.info).toHaveBeenCalledWith("FYI", expect.objectContaining({ autoClose: 2500 }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// loading
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — loading", () => {
  it("calls toast.loading with message", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.loading("Uploading..."); });
    expect(toast.loading).toHaveBeenCalledWith("Uploading...", expect.any(Object));
  });

  it("returns a dismiss function", () => {
    const { result } = renderHook(() => useToast());
    let dismiss;
    act(() => { dismiss = result.current.loading("Loading..."); });
    expect(typeof dismiss).toBe("function");
  });

  it("dismiss function calls toast.dismiss", () => {
    const { result } = renderHook(() => useToast());
    let dismiss;
    act(() => { dismiss = result.current.loading("Loading..."); });
    act(() => { dismiss(); });
    expect(toast.dismiss).toHaveBeenCalledWith("toast-id-1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// promise
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — promise", () => {
  it("calls toast.promise with messages", async () => {
    const { result } = renderHook(() => useToast());
    const p = Promise.resolve("done");
    await act(async () => {
      await result.current.promise(p, {
        loading: "Saving...",
        success: "Saved!",
        error: "Failed",
      });
    });
    expect(toast.promise).toHaveBeenCalledWith(
      p,
      expect.objectContaining({ pending: "Saving...", success: "Saved!", error: "Failed" }),
      expect.any(Object)
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dismiss
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — dismiss", () => {
  it("dismisses by toastId", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.dismiss("my-toast"); });
    expect(toast.dismiss).toHaveBeenCalledWith("my-toast");
  });

  it("dismisses all when no toastId given", () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.dismiss(); });
    expect(toast.dismiss).toHaveBeenCalledWith(undefined);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stable refs
// ─────────────────────────────────────────────────────────────────────────────

describe("useToast — stable refs", () => {
  it("returns same function references across renders", () => {
    const { result, rerender } = renderHook(() => useToast());
    const first = result.current.success;
    rerender();
    expect(result.current.success).toBe(first);
  });
});
