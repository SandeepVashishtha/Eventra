# Untracked Issue Candidates for Eventra Repository

This document lists the 20 isolated, non-conflicting issues designed to optimize test coverage, improve reliability, and guarantee green CI pipelines across the Eventra codebase.

| # | Title | Target File(s) | Description |
|---|---|---|---|
| 1 | fix: align relativeTime edge cases with test expectation | `src/utils/relativeTime.js` | Returns "—" for invalid/null date parameters to satisfy relativeTime tests. |
| 2 | fix: strip HTML tags in sanitizeSearchQuery | `src/utils/inputSanitization.js` | Extends dangerous patterns to strip "<" and ">" characters, ensuring search query safety and satisfying test. |
| 3 | fix: resolve duplicate identifier syntax errors in secureStorage | `src/utils/secureStorage.js` | Consolidates duplicate declarations (`cryptoSupported`, `encrypt`, `decrypt`) causing runtime syntax errors. |
| 4 | test: add unit tests for secureStorage utility | `tests/secureStorage.test.mjs` | Tests sync/async AES-GCM data encryption/decryption at rest. |
| 5 | test: add unit tests for tokenUtils helper | `tests/tokenUtils.test.mjs` | Tests JWT payload decoding, expiration, and validation. |
| 6 | test: add unit tests for safeJsonParse utility | `tests/safeJsonParse.test.mjs` | Tests JSON parsing edge cases, robust error handling, and custom fallbacks. |
| 7 | test: add unit tests for calendarUtils | `tests/calendarUtils.test.mjs` | Tests Google Calendar URL builders and duration-offset calculations. |
| 8 | test: add unit tests for advancedFilterUtils | `tests/advancedFilterUtils.test.mjs` | Tests price, date, mode, status, and category event query filter logic. |
| 9 | test: add unit tests for calendarExporter helper | `tests/calendarExporter.test.mjs` | Tests RFC-5545 compliance, ICS file builders, and external deep links. |
| 10 | test: add unit tests for logger utility | `tests/logger.test.mjs` | Tests log levels and debug output suppressions based on node environment. |
| 11 | test: add unit tests for globalErrorHandler | `tests/globalErrorHandler.test.mjs` | Tests unhandled rejections and global onerror intercepts. |
| 12 | test: add unit tests for githubApiClient | `tests/githubApiClient.test.mjs` | Tests repository URL parser and API proxy endpoint decorators. |
| 13 | test: add unit tests for leaderboardUtils | `tests/leaderboardUtils.test.mjs` | Tests GSSoC leaderboard score arithmetic, achievements, sorting, and tiers. |
| 14 | test: add unit tests for eventUtils | `tests/eventUtils.test.mjs` | Tests date status calculators and registration limits. |
| 15 | test: add unit tests for activityTracker utility | `tests/activityTracker.test.mjs` | Tests in-memory queueing, interest profile storage, and lock safety. |
| 16 | test: add unit tests for asyncValidators | `tests/asyncValidators.test.mjs` | Tests retry backoff, validation limits, and async debounce wrappers. |
| 17 | test: add unit tests for exportUtils | `tests/exportUtils.test.mjs` | Tests filename cleaners, CSV generators, and JSON exporters. |
| 18 | test: add unit tests for timezoneUtils | `tests/timezoneUtils.test.mjs` | Migrates timezone logic checks to standard ESM test suites runner. |
| 19 | fix: configure ALLOWED_ORIGIN in signupEndpoint tests | `tests/signupEndpoint.test.mjs` | Defines the ALLOWED_ORIGIN env, correcting failing CORS header assertions. |
| 20 | ci: integrate missing test suites into main test pipeline | `package.json` | Registers all 18 new and updated test files into unit testing scripts. |
