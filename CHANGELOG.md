# Changelog

### Fixed
- Fixed `isPast()` and `isFuture()` in relativeTime.js to use server-synced `getServerNow()` instead of client `Date.now()`, matching the rest of the codebase (#7200).
