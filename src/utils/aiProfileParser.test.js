import { parseGithubProfile } from "./aiProfileParser";

const makeResponse = ({ ok = true, status = 200, headers = {}, body = {} }) => ({
  ok,
  status,
  headers: { get: (name) => (name in headers ? headers[name] : null) },
  json: async () => body,
});

const userOk = (overrides = {}) =>
  makeResponse({ body: { name: "Octocat", html_url: "https://github.com/octocat" }, ...overrides });

const reposOk = (repos = []) => makeResponse({ body: repos });

describe("parseGithubProfile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects an invalid GitHub URL before calling the API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(parseGithubProfile("")).rejects.toThrow(/invalid github url/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns structured data on the happy path", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(userOk())
      .mockResolvedValueOnce(reposOk([{ language: "JavaScript", topics: ["react"] }]));

    const profile = await parseGithubProfile("https://github.com/octocat");
    expect(profile.username).toBe("octocat");
    expect(profile.skills).toContain("JavaScript");
  });

  it("throws a clear rate-limit error on HTTP 429 with a retry hint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeResponse({ ok: false, status: 429, headers: { "Retry-After": "120" } })
    );

    await expect(parseGithubProfile("https://github.com/octocat")).rejects.toMatchObject({
      code: "RATE_LIMITED",
      retryAfterSeconds: 120,
      message: expect.stringMatching(/rate limit exceeded.*2 minute/i),
    });
  });

  it("treats HTTP 403 with no remaining quota as rate limiting", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeResponse({ ok: false, status: 403, headers: { "X-RateLimit-Remaining": "0" } })
    );

    await expect(parseGithubProfile("https://github.com/octocat")).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
  });

  it("derives the wait time from X-RateLimit-Reset when Retry-After is absent", async () => {
    const resetEpoch = Math.floor(Date.now() / 1000) + 180; // ~3 minutes out
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeResponse({
        ok: false,
        status: 429,
        headers: { "X-RateLimit-Reset": String(resetEpoch) },
      })
    );

    const error = await parseGithubProfile("https://github.com/octocat").catch((e) => e);
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.retryAfterSeconds).toBeGreaterThan(120);
  });

  it("still reports a missing profile as not found (404)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeResponse({ ok: false, status: 404 })
    );

    await expect(parseGithubProfile("https://github.com/ghost")).rejects.toThrow(
      /not found/i
    );
  });

  it("surfaces other HTTP errors with their status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      makeResponse({ ok: false, status: 500 })
    );

    await expect(parseGithubProfile("https://github.com/octocat")).rejects.toThrow(
      /HTTP 500/i
    );
  });
});
