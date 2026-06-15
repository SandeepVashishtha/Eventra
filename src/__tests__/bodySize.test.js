import { getBodySizeError } from "../_lib/bodySize.js";

function mockRequest(url, headers) {
  return { url, headers: headers || {} };
}

describe("getBodySizeError", () => {
  test("returns null when content-length is missing", () => {
    const req = mockRequest("/api/auth/signup", { "content-type": "application/json" });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("returns null for non-JSON content types", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "text/plain",
      "content-length": "50000",
    });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("returns null when under the endpoint limit", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "application/json",
      "content-length": "500",
    });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("returns error when exceeding single-byte endpoint limit", () => {
    const req = mockRequest("/api/auth/login", {
      "content-type": "application/json",
      "content-length": "5000",
    });
    const result = getBodySizeError(req);
    expect(result).not.toBeNull();
    expect(result.status).toBe(413);
    expect(result.error).toContain("Request body too large");
    expect(result.limit).toBe(2048);
    expect(result.received).toBe(5000);
  });

  test("returns error when exceeding signup endpoint limit", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "application/json",
      "content-length": "10000",
    });
    const result = getBodySizeError(req);
    expect(result).not.toBeNull();
    expect(result.status).toBe(413);
    expect(result.limit).toBe(4096);
  });

  test("uses default limit for unknown endpoints", () => {
    const req = mockRequest("/api/unknown", {
      "content-type": "application/json",
      "content-length": "20000",
    });
    const result = getBodySizeError(req);
    expect(result).not.toBeNull();
    expect(result.limit).toBe(10240);
  });

  test("handles url-encoded content type", () => {
    const req = mockRequest("/api/auth/login", {
      "content-type": "application/x-www-form-urlencoded",
      "content-length": "5000",
    });
    const result = getBodySizeError(req);
    expect(result).not.toBeNull();
    expect(result.status).toBe(413);
  });

  test("handles invalid content-length gracefully", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "application/json",
      "content-length": "not-a-number",
    });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("handles negative content-length gracefully", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "application/json",
      "content-length": "-100",
    });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("allows exactly at the limit", () => {
    const req = mockRequest("/api/auth/signup", {
      "content-type": "application/json",
      "content-length": "4096",
    });
    expect(getBodySizeError(req)).toBeNull();
  });

  test("rejects one byte over the limit", () => {
    const req = mockRequest("/api/auth/login", {
      "content-type": "application/json",
      "content-length": "2049",
    });
    expect(getBodySizeError(req)).not.toBeNull();
  });
});
