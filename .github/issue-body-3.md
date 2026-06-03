## Target
**File:** `src/utils/inputSanitization.js` (line 28)
**Category:** Security | **Level:** Intermediate

## The Vulnerability
The regex pattern used for stripping script/style blocks:
```js
/<\s*(script|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
```
contains nested quantifiers that can cause **catastrophic backtracking** on crafted input. The `[\s\S]*?` (lazy dot-all) inside the group, combined with the backreference `\1` and the surrounding optional whitespace patterns, creates a path where certain non-matching strings cause the regex engine to try exponentially many permutations before failing.

## The Impact
An attacker can send a search query or user input of a few hundred characters containing a crafted near-miss pattern (e.g., `<script xxxxxxxxx...`) that blocks the JavaScript event loop for seconds or minutes, causing a client-side Denial of Service. Since this sanitizer runs synchronously on the main thread in an input handler, the entire UI freezes during the backtracking.

## Suggested Fix
Replace this regex with a simpler two-pass approach: (1) strip tags via a non-backtracking pattern, (2) validate structure separately. Or use DOMPurify (already imported elsewhere) instead of custom regex sanitization. At minimum, use atomic groups or possessive quantifiers if the runtime supports them.
