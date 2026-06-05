# Changelog

### Fixed
- Fixed `useOfflineSync` conflict-retry branches passing raw token string instead of derived `authToken`, causing 401 errors for cookie-managed auth sessions (#7198).
