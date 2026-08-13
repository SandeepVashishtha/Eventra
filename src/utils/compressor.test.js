import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { simpleCompress, simpleDecompress } from "./compressor";

describe("compressor utils", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("simpleCompress", () => {
    it("should compress a standard string", () => {
      const input = "Hello World!";
      const result = simpleCompress(input);
      expect(result).not.toBe(input);
      expect(typeof result).toBe("string");
    });

    it("should handle empty strings", () => {
      expect(simpleCompress("")).toBe("");
    });

    it("should handle special and unicode characters", () => {
      const input = "Eventra 🎉 123 !@#$%^&*()";
      const compressed = simpleCompress(input);
      const decompressed = simpleDecompress(compressed);
      expect(decompressed).toBe(input);
    });
  });

  describe("simpleDecompress", () => {
    it("should correctly decompress a previously compressed string", () => {
      const original = "Sample test payload for event data";
      const compressed = simpleCompress(original);
      const decompressed = simpleDecompress(compressed);
      expect(decompressed).toBe(original);
    });

    it("should fallback to returning input and log warning on invalid compressed input", () => {
      const invalidCompressed = "%%%invalid_b64%%%";
      const result = simpleDecompress(invalidCompressed);
      expect(result).toBe(invalidCompressed);
      expect(console.warn).toHaveBeenCalledWith(
        "[compressor] Decompression failed:",
        expect.any(Error)
      );
    });
  });
});
