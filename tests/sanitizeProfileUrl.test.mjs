import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { sanitizeProfileUrl } from "../src/utils/sanitizeProfileUrl.js";

describe("sanitizeProfileUrl", () => {
  it("allows github.com and www.github.com", () => {
    assert.equal(
      sanitizeProfileUrl("https://github.com/octocat", "github"),
      "https://github.com/octocat",
    );
    assert.equal(
      sanitizeProfileUrl("www.github.com/octocat", "github"),
      "https://www.github.com/octocat",
    );
  });

  it("allows linkedin.com hosts", () => {
    assert.equal(
      sanitizeProfileUrl("https://www.linkedin.com/in/someone", "linkedin"),
      "https://www.linkedin.com/in/someone",
    );
  });

  it("rejects off-site hosts even when prefixed with https", () => {
    assert.equal(sanitizeProfileUrl("evil.example/phish", "github"), "");
    assert.equal(sanitizeProfileUrl("https://evil.example/phish", "github"), "");
  });

  it("rejects javascript and data URLs", () => {
    assert.equal(sanitizeProfileUrl("javascript:alert(1)", "github"), "");
    assert.equal(sanitizeProfileUrl("data:text/html,hi", "linkedin"), "");
  });

  it("rejects empty and unknown networks", () => {
    assert.equal(sanitizeProfileUrl("", "github"), "");
    assert.equal(sanitizeProfileUrl("https://github.com/octocat", "twitter"), "");
  });
});
