# Changelog

### Fixed
- Fixed `savedAt` timestamp in useBookmarks to use server-synced `getServerNow()` instead of client `Date.now()`, preventing incorrect bookmark eviction due to clock skew (#7201).
