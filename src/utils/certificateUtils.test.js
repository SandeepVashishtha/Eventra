import { verifyCertificate } from "./certificateUtils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockFetch = (status, body, asText = false) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(asText ? body : JSON.stringify(body)),
  });
};

// Capture and restore import.meta.env
const originalEnv = { ...import.meta.env };

beforeEach(() => {
  jest.clearAllMocks();
  // Default: VITE_API_URL is set
  import.meta.env.VITE_API_URL = "https://api.example.com";
});

afterEach(() => {
  // Restore env
  Object.keys(import.meta.env).forEach((k) => {
    if (!(k in originalEnv)) delete import.meta.env[k];
  });
  Object.assign(import.meta.env, originalEnv);
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// UID sanitization
// ---------------------------------------------------------------------------

describe("verifyCertificate — UID validation", () => {
  it("returns error when uid is empty string", async () => {
    const result = await verifyCertificate("");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/required/i);
    expect(global.fetch).toBeUndefined();
  });

  it("returns error when uid is null", async () => {
    const result = await verifyCertificate(null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it("returns error when uid is undefined", async () => {
    const result = await verifyCertificate(undefined);
    expect(result.success).toBe(false);
  });

  it("strips special characters from uid before fetching", async () => {
    mockFetch(200, { valid: true });
    await verifyCertificate("uid-with-<script>alert(1)</script>");
    const calledUrl = global.fetch.mock.calls[0][0];
    expect(calledUrl).not.toContain("<script>");
    expect(calledUrl).not.toContain(">");
  });

  it("truncates uid longer than 128 characters", async () => {
    mockFetch(200, { valid: true });
    const longUid = "a".repeat(200);
    await verifyCertificate(longUid);
    const calledUrl = global.fetch.mock.calls[0][0];
    // Encoded uid in URL should not exceed 128 chars of original content
    const uidPart = calledUrl.split("/api/verify-certificate/")[1];
    expect(decodeURIComponent(uidPart).length).toBeLessThanOrEqual(128);
  });
});

// ---------------------------------------------------------------------------
// API URL misconfiguration — the core bug fix (issue #7037)
// ---------------------------------------------------------------------------

describe("verifyCertificate — API URL configuration guard", () => {
  it("returns a descriptive error when VITE_API_URL is not set instead of fetching relative URL", async () => {
    import.meta.env.VITE_API_URL = undefined;
    global.fetch = jest.fn();

    const result = await verifyCertificate("valid-uid-123");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/VITE_API_URL/);
    expect(result.error).toMatch(/\.env/);
    // Must NOT attempt a fetch — that would target the frontend host
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns a descriptive error when VITE_API_URL is empty string", async () => {
    import.meta.env.VITE_API_URL = "";
    global.fetch = jest.fn();

    const result = await verifyCertificate("valid-uid-123");

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not configured/i);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("uses VITE_API_URL as the base when set", async () => {
    import.meta.env.VITE_API_URL = "https://api.example.com";
    mockFetch(200, { valid: true, holder: "Alice" });

    await verifyCertificate("abc123");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://api.example.com/api/verify-certificate/")
    );
  });

  it("URL-encodes the uid in the fetch path", async () => {
    mockFetch(200, { valid: true });
    await verifyCertificate("uid_with-dashes_and_underscores");
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain("/api/verify-certificate/uid_with-dashes_and_underscores");
  });
});

// ---------------------------------------------------------------------------
// HTTP response handling
// ---------------------------------------------------------------------------

describe("verifyCertificate — HTTP response handling", () => {
  it("returns success: true with data on 200 OK", async () => {
    mockFetch(200, { valid: true, holder: "Bob", event: "GSSoC 2026" });
    const result = await verifyCertificate("cert-456");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ valid: true, holder: "Bob", event: "GSSoC 2026" });
  });

  it("returns success: false with error text on 404", async () => {
    mockFetch(404, "Certificate not found", true);
    const result = await verifyCertificate("nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Certificate not found/);
  });

  it("returns success: false with status code message on 500 with empty body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue(""),
    });
    const result = await verifyCertificate("uid-xyz");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/500/);
  });

  it("returns success: false with network error message on fetch rejection", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));
    const result = await verifyCertificate("uid-abc");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Network failure");
  });

  it("returns success: false when response.json() throws (e.g. HTML response)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token '<'")),
    });
    const result = await verifyCertificate("uid-html");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unexpected token/);
  });
});
