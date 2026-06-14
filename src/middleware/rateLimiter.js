// Client-side rate limiting provides zero security value.
// All rate limiting is enforced server-side in api/auth/login.js,
// api/auth/signup.js, the Vercel Edge Middleware (middleware.js),
// and api/lib/rateLimiter.js.
//
// This file is intentionally empty — see those modules for enforcement.
