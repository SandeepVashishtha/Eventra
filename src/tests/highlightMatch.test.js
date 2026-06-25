import highlightMatch from "../utils/highlightMatch";

const MAX_TEST_TIME_MS = 500;

function timed(fn) {
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  return { result, elapsed };
}

describe("highlightMatch ReDoS & SyntaxError Prevention", () => {
  describe("escapeRegex protection", () => {
    it("handles regex metacharacters without SyntaxError", () => {
      expect(() => highlightMatch("some text", "(a+)+$")).not.toThrow();
      expect(() => highlightMatch("some text", "[broken")).not.toThrow();
      expect(() => highlightMatch("some text", ".*+?^${}()|[]\\")).not.toThrow();
    });

    it("highlights text containing regex metacharacters correctly", () => {
      const result = highlightMatch("test (a+)+$ text", "test");
      expect(result).not.toBeNull();
    });
  });

  describe("ReDoS prevention with adversarial patterns", () => {
    it("handles catastrophic backtracking pattern quickly", () => {
      const evilPattern = "(a+)+$";
      const text = "aaaaaaaaaaaaaaaaaaaaaaa";
      const { elapsed } = timed(() => highlightMatch(text, evilPattern));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it("handles nested groups pattern quickly", () => {
      const evilPattern = "([a-z]+)+";
      const text = "abcdefghijklmnopqrstuvwxyz";
      const { elapsed } = timed(() => highlightMatch(text, evilPattern));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it("handles alternation with quantifiers pattern quickly", () => {
      const evilPattern = "(a|a)+";
      const text = "aaaaaaaaaa";
      const { elapsed } = timed(() => highlightMatch(text, evilPattern));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });
  });

  describe("normal operation", () => {
    it("highlights matching text correctly", () => {
      const result = highlightMatch("hello world", "world");
      expect(result).not.toBe("hello world");
    });

    it("returns original text when no query provided", () => {
      expect(highlightMatch("hello world", "")).toBe("hello world");
      expect(highlightMatch("hello world", null)).toBe("hello world");
    });

    it("handles empty text gracefully", () => {
      expect(highlightMatch("", "hello")).toBe("");
    });
  });
});
