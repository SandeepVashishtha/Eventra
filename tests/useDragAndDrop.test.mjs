/**
 * useDragAndDrop.test.mjs
 *
 * Tests for the useDragAndDrop hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDragAndDrop from "../src/hooks/useDragAndDrop";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

const makeFile = (name = "test.jpg", size = 1024, type = "image/jpeg") => {
  const f = new File(["x".repeat(size)], name, { type });
  Object.defineProperty(f, "size", { value: size });
  return f;
};

const makeDragEvent = (files = []) => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  dataTransfer: {
    files,
    dropEffect: "",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — initial state", () => {
  it("isDragOver=false on mount", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(result.current.isDragOver).toBe(false);
  });

  it("error=null on mount", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(result.current.error).toBe(null);
  });

  it("returns getRootProps and getInputProps functions", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(typeof result.current.getRootProps).toBe("function");
    expect(typeof result.current.getInputProps).toBe("function");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Drag counter — prevents isDragging flicker
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — drag counter", () => {
  it("sets isDragOver=true on dragenter", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    const { onDragEnter } = result.current.getRootProps();
    act(() => { onDragEnter(makeDragEvent()); });
    expect(result.current.isDragOver).toBe(true);
  });

  it("keeps isDragOver=true when entering a child then leaving parent", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    const { onDragEnter, onDragLeave } = result.current.getRootProps();
    act(() => { onDragEnter(makeDragEvent()); }); // enter parent (counter=1)
    act(() => { onDragEnter(makeDragEvent()); }); // enter child  (counter=2)
    act(() => { onDragLeave(makeDragEvent()); }); // leave child  (counter=1)
    expect(result.current.isDragOver).toBe(true); // still true!
  });

  it("sets isDragOver=false when fully leaving the dropzone", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    const { onDragEnter, onDragLeave } = result.current.getRootProps();
    act(() => { onDragEnter(makeDragEvent()); }); // counter=1
    act(() => { onDragLeave(makeDragEvent()); }); // counter=0
    expect(result.current.isDragOver).toBe(false);
  });

  it("resets counter to 0 on drop", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    const { onDragEnter, onDrop } = result.current.getRootProps();
    act(() => { onDragEnter(makeDragEvent()); });
    act(() => { onDragEnter(makeDragEvent()); });
    act(() => { onDrop(makeDragEvent([makeFile()])); });
    expect(result.current.isDragOver).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// onDrop callback
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — onDrop", () => {
  it("calls onDrop with valid files", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDrop }));
    const { onDrop: handleDrop } = result.current.getRootProps();
    const file = makeFile();
    act(() => { handleDrop(makeDragEvent([file])); });
    expect(onDrop).toHaveBeenCalledWith([file]);
  });

  it("only passes first file when multiple=false", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() => useDragAndDrop({ onDrop, multiple: false }));
    const { onDrop: handleDrop } = result.current.getRootProps();
    const files = [makeFile("a.jpg"), makeFile("b.jpg")];
    act(() => { handleDrop(makeDragEvent(files)); });
    expect(onDrop).toHaveBeenCalledWith([files[0]]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// File validation
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — validation", () => {
  it("sets error for oversized file", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop, maxBytes: 1024 })
    );
    const { onDrop: handleDrop } = result.current.getRootProps();
    act(() => { handleDrop(makeDragEvent([makeFile("big.jpg", 2048)])); });
    expect(result.current.error).toMatch(/too large/i);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("sets error for invalid MIME type", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop, accept: ["image/jpeg"] })
    );
    const { onDrop: handleDrop } = result.current.getRootProps();
    act(() => {
      handleDrop(makeDragEvent([makeFile("doc.pdf", 1024, "application/pdf")]));
    });
    expect(result.current.error).toMatch(/unsupported file type/i);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("clears error on valid drop after invalid", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop, maxBytes: 1024 })
    );
    const { onDrop: handleDrop } = result.current.getRootProps();
    act(() => { handleDrop(makeDragEvent([makeFile("big.jpg", 2048)])); });
    expect(result.current.error).not.toBeNull();
    act(() => { handleDrop(makeDragEvent([makeFile("ok.jpg", 512)])); });
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Disabled state
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — disabled", () => {
  it("does not set isDragOver when disabled", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop: vi.fn(), disabled: true })
    );
    const { onDragEnter } = result.current.getRootProps();
    act(() => { onDragEnter(makeDragEvent()); });
    expect(result.current.isDragOver).toBe(false);
  });

  it("does not call onDrop when disabled", () => {
    const onDrop = vi.fn();
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop, disabled: true })
    );
    const { onDrop: handleDrop } = result.current.getRootProps();
    act(() => { handleDrop(makeDragEvent([makeFile()])); });
    expect(onDrop).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility
// ─────────────────────────────────────────────────────────────────────────────

describe("useDragAndDrop — accessibility", () => {
  it("getRootProps includes role=button", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(result.current.getRootProps().role).toBe("button");
  });

  it("getRootProps includes tabIndex=0 when enabled", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(result.current.getRootProps().tabIndex).toBe(0);
  });

  it("getRootProps includes tabIndex=-1 when disabled", () => {
    const { result } = renderHook(() =>
      useDragAndDrop({ onDrop: vi.fn(), disabled: true })
    );
    expect(result.current.getRootProps().tabIndex).toBe(-1);
  });

  it("getInputProps type is 'file'", () => {
    const { result } = renderHook(() => useDragAndDrop({ onDrop: vi.fn() }));
    expect(result.current.getInputProps().type).toBe("file");
  });
});
