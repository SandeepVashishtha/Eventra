## Target
**File:** `src/context/AuthContext.js` (line 51) and `src/config/api.js` (lines 98-105)
**Category:** Security | **Level:** Intermediate

## The Vulnerability
The application relies on JWT tokens for authentication, but the token is managed entirely on the client side via localStorage. The Axios instance is configured with `withCredentials: true` (suggesting HttpOnly cookie based auth is possible), yet the actual authentication state is controlled by a client-side JWT stored in plaintext. The `clearSession` function sets a cookie via `document.cookie` (line 51), but there is no evidence that the server sets the token as an HttpOnly, Secure, SameSite cookie during login.

Furthermore, the `AuthContext` stores the token in React state (line 28: `const [token, setToken] = useState(null)`), making it accessible to any JavaScript running in the page context.

## The Impact
Any XSS vulnerability — even a minor one in a third-party script, a comment field, or the chatbot — immediately exposes the JWT token to attackers. Unlike HttpOnly cookies, a localStorage JWT cannot be protected from JavaScript access. This means session hijacking is trivial once any injection point is found. The `withCredentials: true` setup suggests the backend may support HttpOnly cookies, making this a config gap rather than an architectural limitation.

## Suggested Fix
1. Configure the backend to set the JWT as an HttpOnly, Secure, SameSite=Strict cookie on the login response.
2. Remove client-side token storage entirely — rely on the HttpOnly cookie for auth.
3. If HttpOnly cookies are not feasible (e.g., cross-origin API), ensure the server sets proper CSP headers and explore using the `__Host-` cookie prefix for additional security.
