import { renderHook, act } from "@testing-library/react";
import useDebounce from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("returns the initial value immediately without delay", () => {
    const { result } = renderHook(() => useDebounce("hello", 400));
    expect(result.current).toBe("hello");
  });

  it("does not update the debounced value before the delay has elapsed", () => {
    let value = "initial";
    const { result, rerender } = renderHook(() => useDebounce(value, 400));

    value = "updated";
    rerender();

    // Advance only partially through the delay
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current).toBe("initial");
  });

  it("updates the debounced value after the delay has elapsed", () => {
    let value = "initial";
    const { result, rerender } = renderHook(() => useDebounce(value, 400));

    value = "updated";
    rerender();

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current).toBe("updated");
  });

  it("resets the delay timer on rapid value changes (debouncing behaviour)", () => {
    let value = "a";
    const { result, rerender } = renderHook(() => useDebounce(value, 300));

    // Rapid successive changes
    act(() => {
      value = "b";
      rerender();
      jest.advanceTimersByTime(100);
      value = "c";
      rerender();
      jest.advanceTimersByTime(100);
      value = "d";
      rerender();
      jest.advanceTimersByTime(100);
    });

    // Still at "a" because the 300ms window has not completed since last change
    expect(result.current).toBe("a");

    // Let the full delay pass after the last change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("d");
  });

  it("respects a custom delay value", () => {
    let value = "initial";
    const { result, rerender } = renderHook(() => useDebounce(value, 1000));

    value = "changed";
    rerender();

    act(() => jest.advanceTimersByTime(999));
    expect(result.current).toBe("initial");

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("changed");
  });

  it("uses the default delay of 400ms when no delay is provided", () => {
    let value = "start";
    const { result, rerender } = renderHook(() => useDebounce(value));

    value = "end";
    rerender();

    act(() => jest.advanceTimersByTime(399));
    expect(result.current).toBe("start");

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe("end");
  });

  it("handles numeric values", () => {
    let value = 0;
    const { result, rerender } = renderHook(() => useDebounce(value, 200));

    value = 42;
    rerender();

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe(42);
  });

  it("handles object values (by reference)", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    let value = obj1;
    const { result, rerender } = renderHook(() => useDebounce(value, 200));

    value = obj2;
    rerender();

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe(obj2);
  });

  it("handles null and undefined values gracefully", () => {
    let value = null;
    const { result, rerender } = renderHook(() => useDebounce(value, 200));
    expect(result.current).toBeNull();

    value = undefined;
    rerender();

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBeUndefined();
  });

  it("clears pending timer on unmount to prevent memory leaks", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    let value = "initial";
    const { rerender, unmount } = renderHook(() => useDebounce(value, 400));

    value = "changed";
    rerender();

    unmount();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("updates correctly when delay prop changes between renders", () => {
    let value = "hello";
    let delay = 400;
    const { result, rerender } = renderHook(() => useDebounce(value, delay));

    // Change value and delay together
    value = "world";
    delay = 100;
    rerender();

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe("world");
  });
});
