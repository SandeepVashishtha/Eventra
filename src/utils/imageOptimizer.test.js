import { getOptimizedImageUrl, generateSrcSet } from "./imageOptimizer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const HTTP_URL = "https://example.com/images/hero.jpg";
const RELATIVE_URL = "/images/hero.jpg";
const BLOB_URL = "blob:https://eventra.app/abc-123";
const DATA_URI = "data:image/png;base64,abc123==";
const CLOUDINARY_URL = "https://res.cloudinary.com/demo/image/upload/v1/hero.jpg";

// ---------------------------------------------------------------------------
// getOptimizedImageUrl
// ---------------------------------------------------------------------------

describe("getOptimizedImageUrl", () => {
  it("returns a Cloudinary fetch URL for an absolute HTTP URL", () => {
    const result = getOptimizedImageUrl(HTTP_URL);
    expect(result).toContain("res.cloudinary.com");
    expect(result).toContain("image/fetch");
    expect(result).toContain(encodeURIComponent(HTTP_URL));
  });

  it("includes width transformation in the URL", () => {
    const result = getOptimizedImageUrl(HTTP_URL, { width: 400 });
    expect(result).toContain("w_400");
  });

  it("includes height and c_fill when height is specified", () => {
    const result = getOptimizedImageUrl(HTTP_URL, { width: 800, height: 600 });
    expect(result).toContain("h_600");
    expect(result).toContain("c_fill");
  });

  it("uses 'webp' format by default", () => {
    const result = getOptimizedImageUrl(HTTP_URL);
    expect(result).toContain("f_webp");
  });

  it("respects a custom format option", () => {
    const result = getOptimizedImageUrl(HTTP_URL, { format: "avif" });
    expect(result).toContain("f_avif");
  });

  it("returns already-Cloudinary URLs unchanged", () => {
    expect(getOptimizedImageUrl(CLOUDINARY_URL)).toBe(CLOUDINARY_URL);
  });

  it("returns relative URLs unchanged", () => {
    expect(getOptimizedImageUrl(RELATIVE_URL)).toBe(RELATIVE_URL);
  });

  it("returns blob URLs unchanged", () => {
    expect(getOptimizedImageUrl(BLOB_URL)).toBe(BLOB_URL);
  });

  it("returns data URIs unchanged", () => {
    expect(getOptimizedImageUrl(DATA_URI)).toBe(DATA_URI);
  });

  it("returns the original value for null input", () => {
    expect(getOptimizedImageUrl(null)).toBeNull();
  });

  it("returns the original value for undefined input", () => {
    expect(getOptimizedImageUrl(undefined)).toBeUndefined();
  });

  it("returns the original value when input is not a string", () => {
    expect(getOptimizedImageUrl(42)).toBe(42);
  });

  it("uses 'demo' as default cloudName when VITE_CLOUDINARY_CLOUD_NAME is unset", () => {
    const result = getOptimizedImageUrl(HTTP_URL);
    expect(result).toContain("/demo/");
  });
});

// ---------------------------------------------------------------------------
// generateSrcSet — the core bug fix (issue #7040)
// ---------------------------------------------------------------------------

describe("generateSrcSet — returns empty string for non-transformable URLs", () => {
  it("returns empty string for a relative path", () => {
    expect(generateSrcSet(RELATIVE_URL)).toBe("");
  });

  it("returns empty string for a blob URL", () => {
    expect(generateSrcSet(BLOB_URL)).toBe("");
  });

  it("returns empty string for a data URI", () => {
    expect(generateSrcSet(DATA_URI)).toBe("");
  });

  it("returns empty string for null", () => {
    expect(generateSrcSet(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(generateSrcSet(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(generateSrcSet("")).toBe("");
  });

  it("returns empty string for a non-string value", () => {
    expect(generateSrcSet(42)).toBe("");
  });
});

describe("generateSrcSet — produces valid srcset for HTTP URLs", () => {
  it("returns a non-empty srcset string for an absolute HTTP URL", () => {
    const result = generateSrcSet(HTTP_URL);
    expect(result).not.toBe("");
    expect(result.length).toBeGreaterThan(0);
  });

  it("contains four width descriptors (400w, 800w, 1200w, 1600w)", () => {
    const result = generateSrcSet(HTTP_URL);
    expect(result).toContain("400w");
    expect(result).toContain("800w");
    expect(result).toContain("1200w");
    expect(result).toContain("1600w");
  });

  it("produces four distinct URL entries separated by commas", () => {
    const result = generateSrcSet(HTTP_URL);
    const entries = result.split(", ");
    expect(entries).toHaveLength(4);
    const urls = entries.map((e) => e.split(" ")[0]);
    // All four URLs should be different (different width params)
    const uniqueUrls = new Set(urls);
    expect(uniqueUrls.size).toBe(4);
  });

  it("does NOT produce identical entries for an HTTP URL (regression test)", () => {
    const result = generateSrcSet(HTTP_URL);
    const entries = result.split(", ").map((e) => e.split(" ")[0]);
    // If all entries were the same the Set would have size 1
    expect(new Set(entries).size).toBeGreaterThan(1);
  });

  it("passes the specified format to all entries", () => {
    const result = generateSrcSet(HTTP_URL, "avif");
    expect(result).toContain("f_avif");
    // Should appear in all 4 entries
    const avifCount = (result.match(/f_avif/g) || []).length;
    expect(avifCount).toBe(4);
  });

  it("uses webp format by default", () => {
    const result = generateSrcSet(HTTP_URL);
    expect(result).toContain("f_webp");
  });
});

describe("generateSrcSet — already-Cloudinary URL behaviour", () => {
  it("produces a non-empty srcset for an already-Cloudinary URL (passes through unchanged per getOptimizedImageUrl)", () => {
    // getOptimizedImageUrl returns Cloudinary URLs as-is, so all 4 entries
    // will point to the same URL. generateSrcSet does not special-case this
    // since Cloudinary URLs ARE http(s) and can in principle be
    // re-fetched at different widths if the user manually constructs
    // transformation URLs. This is a known limitation documented in the JSDoc.
    const result = generateSrcSet(CLOUDINARY_URL);
    // The function doesn't reject Cloudinary URLs — it starts with https://
    expect(result).not.toBe("");
  });
});
