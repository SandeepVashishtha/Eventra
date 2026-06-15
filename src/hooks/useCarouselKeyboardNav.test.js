/**
 * useCarouselKeyboardNav Tests
 */

import { renderHook, act } from "@testing-library/react";
import useCarouselKeyboardNav from "../useCarouselKeyboardNav";

function makeKeyEvent(key, target, currentTarget) {
  return {
    key,
    preventDefault: jest.fn(),
    target: target ?? {},
    currentTarget: currentTarget ?? {},
  };
}

describe("useCarouselKeyboardNav", () => {
  const onPrev = jest.fn();
  const onNext = jest.fn();
  const onFirst = jest.fn();
  const onLast = jest.fn();
  const onTogglePlay = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("calls onPrev on ArrowLeft", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(makeKeyEvent("ArrowLeft"));
    });
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("calls onNext on ArrowRight", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(makeKeyEvent("ArrowRight"));
    });
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onFirst on Home", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(makeKeyEvent("Home"));
    });
    expect(onFirst).toHaveBeenCalledTimes(1);
  });

  it("calls onLast on End", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(makeKeyEvent("End"));
    });
    expect(onLast).toHaveBeenCalledTimes(1);
  });

  it("calls onTogglePlay on Space when container is focused element", () => {
    const el = {};
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(makeKeyEvent(" ", el, el));
    });
    expect(onTogglePlay).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onTogglePlay on Space when a child element is focused", () => {
    const container = {};
    const childButton = {};
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext, onFirst, onLast, onTogglePlay })
    );
    act(() => {
      result.current.containerProps.onKeyDown(
        makeKeyEvent(" ", childButton, container)
      );
    });
    expect(onTogglePlay).not.toHaveBeenCalled();
  });

  it("returns containerProps with tabIndex=0", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext })
    );
    expect(result.current.containerProps.tabIndex).toBe(0);
  });

  it("returns containerProps with aria-label", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext })
    );
    expect(result.current.containerProps["aria-label"]).toBeTruthy();
  });

  it("calls preventDefault on arrow keys", () => {
    const { result } = renderHook(() =>
      useCarouselKeyboardNav({ onPrev, onNext })
    );
    const event = makeKeyEvent("ArrowLeft");
    act(() => {
      result.current.containerProps.onKeyDown(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();
  });
});
