# feat/http-only-cookies — Plan

Goal: Complete migration to server-managed HttpOnly cookies for auth sessions.

Work items:
- Ensure backend sets `Set-Cookie` on login/signup with Secure; HttpOnly; SameSite=Strict and proper path
- Ensure logout clears cookie with expired Set-Cookie
- Remove or deprecate client-side token storage usages
- Add unit tests for cookie behavior in `api/auth` handlers
- Add e2e tests to validate session restore (Playwright)

Notes: This branch contains scaffolding and test skeletons. Implementations will follow in subsequent commits.
