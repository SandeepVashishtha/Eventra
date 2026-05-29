# Login Form Email Verification Standards

Enforce client-side regex checks before login form dispatching.

## Regex Formula
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError("Invalid email format.");
}
```