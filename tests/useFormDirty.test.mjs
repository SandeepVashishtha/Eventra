/**
 * useFormDirty.test.mjs
 *
 * Tests for the useFormDirty hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFormDirty from "../src/hooks/useFormDirty";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — initial state", () => {
  it("returns isDirty=false on mount", () => {
    const { result } = renderHook(() =>
      useFormDirty({ name: "Alice", email: "a@b.com" })
    );
    expect(result.current.isDirty).toBe(false);
  });

  it("savedValue equals initial currentValue", () => {
    const initial = { name: "Alice" };
    const { result } = renderHook(() => useFormDirty(initial));
    expect(result.current.savedValue).toEqual(initial);
  });

  it("dirtyFields are all false initially", () => {
    const { result } = renderHook(() =>
      useFormDirty({ name: "Alice", email: "a@b.com" })
    );
    expect(result.current.dirtyFields.name).toBe(false);
    expect(result.current.dirtyFields.email).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isDirty detection
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — isDirty", () => {
  it("returns isDirty=true when value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Bob" } });
    expect(result.current.isDirty).toBe(true);
  });

  it("returns isDirty=false when value unchanged", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Alice" } });
    expect(result.current.isDirty).toBe(false);
  });

  it("handles deep object changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { user: { name: "Alice", age: 30 } } } }
    );
    rerender({ value: { user: { name: "Alice", age: 31 } } });
    expect(result.current.isDirty).toBe(true);
  });

  it("ignores property order differences", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { a: 1, b: 2 } } }
    );
    rerender({ value: { b: 2, a: 1 } }); // same values, different order
    expect(result.current.isDirty).toBe(false);
  });

  it("works with primitive values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: "hello" } }
    );
    rerender({ value: "world" });
    expect(result.current.isDirty).toBe(true);
  });

  it("works with arrays", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: [1, 2, 3] } }
    );
    rerender({ value: [1, 2, 3, 4] });
    expect(result.current.isDirty).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// dirtyFields
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — dirtyFields", () => {
  it("marks only changed fields as dirty", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice", email: "a@b.com" } } }
    );
    rerender({ value: { name: "Bob", email: "a@b.com" } });
    expect(result.current.dirtyFields.name).toBe(true);
    expect(result.current.dirtyFields.email).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// markSaved
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — markSaved", () => {
  it("resets isDirty to false after markSaved()", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Bob" } });
    expect(result.current.isDirty).toBe(true);
    act(() => { result.current.markSaved(); });
    expect(result.current.isDirty).toBe(false);
  });

  it("updates savedValue to current value after markSaved()", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Bob" } });
    act(() => { result.current.markSaved(); });
    expect(result.current.savedValue).toEqual({ name: "Bob" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// reset
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — reset", () => {
  it("reset() returns the saved snapshot", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useFormDirty(value),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Bob" } });
    const snapshot = result.current.reset();
    expect(snapshot).toEqual({ name: "Alice" });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// beforeunload
// ─────────────────────────────────────────────────────────────────────────────

describe("useFormDirty — beforeunload", () => {
  it("fires beforeunload when isDirty=true", () => {
    const { rerender } = renderHook(
      ({ value }) => useFormDirty(value, { enableBeforeUnload: true }),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Bob" } });
    const e = { preventDefault: vi.fn(), returnValue: "" };
    act(() => { window.dispatchEvent(Object.assign(new Event("beforeunload"), e)); });
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("does not fire beforeunload when isDirty=false", () => {
    const { rerender } = renderHook(
      ({ value }) => useFormDirty(value, { enableBeforeUnload: true }),
      { initialProps: { value: { name: "Alice" } } }
    );
    rerender({ value: { name: "Alice" } });
    const e = { preventDefault: vi.fn(), returnValue: "" };
    act(() => { window.dispatchEvent(Object.assign(new Event("beforeunload"), e)); });
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("removes beforeunload listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useFormDirty({ name: "Alice" }, { enableBeforeUnload: true })
    );
    unmount();
    const calls = removeSpy.mock.calls.filter(([type]) => type === "beforeunload");
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });

  it("skips beforeunload when enableBeforeUnload=false", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() =>
      useFormDirty({ name: "Alice" }, { enableBeforeUnload: false })
    );
    const calls = addSpy.mock.calls.filter(([type]) => type === "beforeunload");
    expect(calls.length).toBe(0);
  });
});
