# JWT Storage Migration to HttpOnly Cookies - Issue #2625

## Problem
JWTs stored in localStorage are vulnerable to XSS attacks.

## Solution  
This PR implements frontend support for HttpOnly cookie-based authentication.

### Changes
1. Enhanced src/context/AuthContext.js to detect and prefer cookies
2. Updated src/config/api.js to auto-send credentials  
3. Maintained localStorage fallback for transition period
4. Token migration happens on next login

### Backend Requirements
- Set-Cookie headers with HttpOnly, Secure, SameSite=Strict
- POST /api/auth/logout to clear cookies server-side

### Testing
- Cookies are automatically sent with withCredentials: true
- Falls back to localStorage if cookies unavailable
- Session restores without manual token retrieval
