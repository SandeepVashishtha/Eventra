# Security Guide: Environment Variables & Secrets

## Overview

This guide explains how to properly handle sensitive environment variables in Eventra to prevent secret leakage and maintain security best practices.

## ⚠️ Critical Rule

**NEVER use `REACT_APP_*` prefix for sensitive secrets like API tokens, database credentials, or authentication keys.**

In Create React App, any environment variable prefixed with `REACT_APP_` is embedded directly into the frontend bundle and is publicly accessible to anyone who:

- Downloads the built JavaScript files
- Inspects the web browser's resources
- Reads the source map (if not disabled in production)

## Environment Variable Categories

### Frontend-Safe Variables (REACT_APP_*)

These are okay to expose in the frontend bundle:

- Public API URLs (without credentials)
- Public third-party service IDs (Google, Facebook public IDs)
- Feature flags / configuration
- Analytics IDs
- Public CDN URLs

```env
# ✅ Safe - public information only
REACT_APP_API_URL=https://api.eventra.com
REACT_APP_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
REACT_APP_ENVIRONMENT=production
```

### Backend-Only Variables (NO prefix)

These must NEVER be exposed to the frontend:

- API tokens and authentication keys
- Database credentials and connection strings
- Private API keys
- Security certificates
- Encryption keys
- Webhook secrets

```env
# ❌ NEVER use REACT_APP_ prefix for these
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
DATABASE_PASSWORD=secure_password
JWT_SECRET=super_secret_key
```

## GitHub API Token Security

### ❌ Insecure Pattern

```env
# BAD: Token exposed in frontend bundle
REACT_APP_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

```javascript
// Frontend code - TOKEN VISIBLE IN BUNDLE
const token = process.env.REACT_APP_GITHUB_TOKEN;
fetch(`https://api.github.com/repos/owner/repo`, {
  headers: { Authorization: `token ${token}` }
});
```

### ✅ Secure Pattern

```env
# Backend only - NOT accessible to frontend
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
```

**Backend (`/api/github-proxy`):**

```javascript
// Server code - TOKEN REMAINS SECRET
router.get('/github-proxy', (req, res) => {
  const token = process.env.GITHUB_TOKEN; // Secret, server-side only
  const path = req.query.path;
  
  fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `token ${token}` }
  })
    .then(r => r.json())
    .then(data => res.json(data));
});
```

**Frontend (`/api/github-proxy?path=/repos/...`):**

```javascript
// Frontend code - NO TOKEN NEEDED
const response = await fetch(`/api/github-proxy?path=/repos/owner/repo`);
const data = await response.json();
```

## Benefits of Backend Proxy Pattern

1. **Security**: Tokens never reach the client
2. **Rate Limiting**: Pool API rate limits across all users
3. **Control**: Add authentication, validation, caching at gateway
4. **Flexibility**: Change backend tokens without redeploying frontend
5. **Audit**: Log all API requests server-side

## Implementation Checklist

- [ ] Remove all `REACT_APP_*` prefixed secret variables
- [ ] Create backend proxy endpoints for third-party APIs requiring auth
- [ ] Move all secrets to backend-only environment variables
- [ ] Document the proxy endpoints used by frontend
- [ ] Audit built bundle to ensure no secrets are exposed
- [ ] Set up automatic secret scanning in CI/CD
- [ ] Train team on secret handling best practices

## Auditing Your Bundle

### Check for exposed secrets

```bash
# Build the frontend
npm run build

# Search for sensitive patterns in the bundle
grep -r "ghp_\|password\|secret\|token" build/

# Use bundlesize analyzer
npm install -D webpack-bundle-analyzer
```

### Example audit in package.json

```json
{
  "scripts": {
    "audit:secrets": "grep -r 'REACT_APP_' .env* && grep -r 'password\\|token\\|secret' build/js/ || echo '✓ No secrets found'"
  }
}
```

## Related Issues

- #3: Service Worker caches sensitive API responses
- #2: Client-side role authorization vulnerability (localStorage)
- #6: Event registration uses mock JSON with hardcoded secrets

## See Also

- [Create React App Security](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [OWASP: Secrets Management](https://owasp.org/www-community/Sensitive_Data_Exposure)
- [12-Factor App: Config](https://12factor.net/config)
