import React from "react";

/**
 * Escapes all special RegExp metacharacters in a string so it can be used
 * safely inside `new RegExp(...)` without causing a SyntaxError or a
 * ReDoS (Regular Expression Denial of Service) attack.
 *
 * Without escaping, a user-controlled search query such as `(a+)+$` would
 * cause catastrophic backtracking in the regex engine, hanging the browser
 * tab. Even ordinary search terms containing `.`, `*`, `+`, `(`, or `[`
 * would throw a SyntaxError and crash the component.
 *
 * @param {string} str - Raw string to escape
 * @returns {string} String safe to embed inside a RegExp literal
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * highlightMatch
 *
 * Splits `text` around every occurrence of `query` (case-insensitive) and
 * wraps each matching segment in a styled <span> for visual highlighting.
 *
 * Security note
 * ─────────────
 * `query` is always escaped with `escapeRegex` before being passed to
 * `new RegExp()`. This prevents:
 *  - ReDoS attacks via crafted regex patterns (e.g. `(a+)+$`)
 *  - SyntaxError crashes from unescaped metacharacters (e.g. `[broken`)
 *
 * @param {string} text  - The full string to search within
 * @param {string} query - The user-supplied search term to highlight
 * @returns {React.ReactNode} Text with matching segments wrapped in <span>
 */
const highlightMatch = (text, query) => {
  // Nothing to highlight — return the original text unchanged
  if (!query || !text) return text;

  // Escape the query so metacharacters are treated as literals, not regex syntax
  const safeQuery = escapeRegex(query);

  // Capture group around safeQuery so Array.split() retains the matched segments
  const regex = new RegExp(`(${safeQuery})`, "gi");

  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span
        key={index}
        className="
          bg-yellow-200
          dark:bg-yellow-500/30
          text-black
          dark:text-yellow-100
          px-1
          rounded
          font-medium
        "
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default highlightMatch;