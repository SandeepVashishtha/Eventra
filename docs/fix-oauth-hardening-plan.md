# fix/oauth-hardening — Plan

Goal: Harden OAuth popup flow (signup/login) with improved error handling and fallbacks.

Work items:
- Add popup timeout and recovery UI
- Handle window closed/blocked scenarios
- Add server-side redirect fallback handling (OAuth callback route)
- Add unit and e2e tests for popup flows and timeouts
- Update `src/components/auth/Signup.js` and `GoogleLoginButton` to surface errors

Notes: This branch contains scaffolding and a test placeholder.
