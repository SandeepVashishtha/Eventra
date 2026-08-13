/**
 * useFileUpload.test.mjs
 *
 * Tests for the useFileUpload hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useFileUpload from "../src/hooks/useFileUpload";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const makeFile = (name = "test.jpg", size = 1024, type = "image/jpeg") => {
  const file = new File(["x".repeat(size)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const makeEvent = (file) => ({
  target: { files: [file] },
});

const makeMultiEvent = (files) => ({
  target: { files },
});

let mockObjectUrl = "blob:mock-url";
let revokeCount = 0;

beforeEach(() => {
  revokeCount = 0;
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => mockObjectUrl),
    revokeObjectURL: vi.fn(() => { revokeCount++; }),
  });

  // Mock FileReader
  global.FileReader = class {
    constructor() {
      this.result = null;
      this.onload = null;
      this.onerror = null;
    }
    readAsDataURL(file) {
      this.result = `data:${file.type};base64,mock`;
      setTimeout(() => this.onload?.(), 0);
    }
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — initial state", () => {
  it("returns null file and preview on mount", () => {
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Object URL mode
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — objectUrl mode", () => {
  it("creates object URL for valid file", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "objectUrl" }));
    const file = makeFile();
    await act(async () => { result.current.handleFileChange(makeEvent(file)); });
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.preview).toBe(mockObjectUrl);
    expect(result.current.file).toBe(file);
  });

  it("revokes previous URL when new file selected", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "objectUrl" }));
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile("test2.jpg"))); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
  });

  it("revokes URL on unmount", async () => {
    const { result, unmount } = renderHook(() => useFileUpload({ mode: "objectUrl" }));
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Base64 mode
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — base64 mode", () => {
  it("sets preview to base64 string", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "base64" }));
    await act(async () => {
      result.current.handleFileChange(makeEvent(makeFile()));
    });
    await act(async () => {}); // flush FileReader
    expect(result.current.preview).toMatch(/^data:/);
  });

  it("sets isProcessing=true during FileReader read", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "base64" }));
    act(() => { result.current.handleFileChange(makeEvent(makeFile())); });
    expect(result.current.isProcessing).toBe(true);
  });

  it("sets isProcessing=false after FileReader completes", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "base64" }));
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    await act(async () => {});
    expect(result.current.isProcessing).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Size validation
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — size validation", () => {
  it("sets error when file exceeds maxBytes", async () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxBytes: 1024, mode: "objectUrl" })
    );
    const bigFile = makeFile("big.jpg", 2048);
    await act(async () => { result.current.handleFileChange(makeEvent(bigFile)); });
    expect(result.current.error).toMatch(/too large/i);
    expect(result.current.file).toBeNull();
  });

  it("does not create object URL for rejected files", async () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxBytes: 1024, mode: "objectUrl" })
    );
    await act(async () => {
      result.current.handleFileChange(makeEvent(makeFile("big.jpg", 2048)));
    });
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("accepts file within maxBytes", async () => {
    const { result } = renderHook(() =>
      useFileUpload({ maxBytes: 5 * 1024 * 1024, mode: "objectUrl" })
    );
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    expect(result.current.error).toBeNull();
    expect(result.current.file).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MIME type validation
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — MIME validation", () => {
  it("sets error for invalid MIME type", async () => {
    const { result } = renderHook(() =>
      useFileUpload({ accept: ["image/jpeg", "image/png"], mode: "objectUrl" })
    );
    const pdfFile = makeFile("doc.pdf", 1024, "application/pdf");
    await act(async () => { result.current.handleFileChange(makeEvent(pdfFile)); });
    expect(result.current.error).toMatch(/Invalid file type/i);
  });

  it("accepts wildcard MIME type (image/*)", async () => {
    const { result } = renderHook(() =>
      useFileUpload({ accept: ["image/*"], mode: "objectUrl" })
    );
    await act(async () => {
      result.current.handleFileChange(makeEvent(makeFile("test.png", 1024, "image/png")));
    });
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Reset
// ─────────────────────────────────────────────────────────────────────────────

describe("useFileUpload — reset", () => {
  it("clears file, preview and error on reset()", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "objectUrl" }));
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    act(() => { result.current.reset(); });
    expect(result.current.file).toBeNull();
    expect(result.current.preview).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("revokes object URL on reset()", async () => {
    const { result } = renderHook(() => useFileUpload({ mode: "objectUrl" }));
    await act(async () => { result.current.handleFileChange(makeEvent(makeFile())); });
    act(() => { result.current.reset(); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
  });
});
