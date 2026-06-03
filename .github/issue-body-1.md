## Target
**File:** `src/context/AuthContext.js` (lines 52-53, 62)
**Category:** Security | **Level:** Intermediate

## The Vulnerability
The `AuthContext` stores and reads the `user` object (which contains the JWT token) directly in plaintext localStorage via `localStorage.getItem("user")` and `localStorage.removeItem("user")`. The app already has a `syncSecureStorage` wrapper (in `src/utils/secureStorage.js`) that encrypts values with AES-GCM before writing to localStorage, but the auth context bypasses it entirely for the `"user"` key — only using it for the `removeItem` path.

## The Impact
Any XSS vulnerability anywhere in the app instantly leaks the JWT token to an attacker, granting persistent session hijacking. The `syncSecureStorage` wrapper exists specifically to mitigate this (encrypting values at rest with AES-GCM), but the auth token — the single most sensitive piece of client-side data — is stored in the clear as if the wrapper did not exist.

## Suggested Fix
Replace all `localStorage.getItem("user")` and `localStorage.setItem("user", ...)` calls with `syncSecureStorage.getItemAsync("user")` and `syncSecureStorage.setItem("user", ...)` respectively. Update the `clearSession` cleanup to use `syncSecureStorage.removeItem("user")` (which it already does, but the plaintext path at line 53 should be removed).
