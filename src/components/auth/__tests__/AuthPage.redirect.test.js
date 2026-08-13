import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "../AuthPage";

describe("sanitizeRedirectPath (#13601)", () => {
  it("allows relative same-origin paths", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/events/12/register?x=1#top")).toBe(
      "/events/12/register?x=1#top",
    );
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(sanitizeRedirectPath("https://phish.example/login")).toBe(
      "/dashboard",
    );
    expect(sanitizeRedirectPath("//phish.example/login")).toBe("/dashboard");
    expect(sanitizeRedirectPath("http://evil.test")).toBe("/dashboard");
  });

  it("rejects auth routes and empty values", () => {
    expect(sanitizeRedirectPath("/login")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/signup")).toBe("/dashboard");
    expect(sanitizeRedirectPath("")).toBe("/dashboard");
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
  });
});
