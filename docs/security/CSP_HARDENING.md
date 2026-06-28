# CSP Hardening - Removal of 'unsafe-inline' from Style Directives

## Overview

This document describes the Content Security Policy (CSP) hardening changes made to remove `'unsafe-inline'` from style and script directives while maintaining application functionality.

## Security Analysis

### Why 'unsafe-inline' Weakens CSP

The `'unsafe-inline'` directive in CSP allows arbitrary CSS/JS to be injected from any source, which:

- **Enables CSS injection attacks**: Attackers can inject malicious CSS to steal sensitive data via CSS selectors
- **Permits UI manipulation**: Phishing attacks can overlay fake UI elements over legitimate content
- **Bypasses CSP protections**: Defeats the purpose of CSP as a defense-in-depth mechanism
- **Allows data exfiltration**: CSS can be used to exfiltrate data via attribute selectors and URL parameters
- **Enables XSS attacks**: Script-src 'unsafe-inline' allows arbitrary JavaScript execution

## Implementation Approach

### Simplified Strategy

A straightforward approach was implemented:

1. **Remove 'unsafe-inline' from style-src** across all CSP configurations
2. **Remove 'unsafe-inline' from script-src** in vercel.json
3. **No nonce system**: The application doesn't have server-side rendering to implement nonces properly
4. **Graceful degradation**: Dynamic style injection uses CSSStyleSheet API when available

### Rationale

- **Static HTML has no inline `<style>` tags**: The application's static HTML doesn't contain inline styles
- **Dynamic styles use CSS API**: ThemeContext.js uses `element.style.setProperty()` which doesn't violate CSP
- **CSSStyleSheet API preferred**: When available, uses the modern CSSStyleSheet API which doesn't require 'unsafe-inline'
- **No SSR infrastructure**: The application is client-side only, making nonce-based CSP impractical
- **Minimal changes**: Reduces risk of breaking changes and improves maintainability

## Changes Made

### 1. Middleware CSP (`middleware/csp.js`)

**Updated CSP directive:**
```javascript
// Before:
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"

// After:
"style-src 'self' https://fonts.googleapis.com"
```

### 2. Static Configuration Files

#### `vercel.json`
```diff
- "script-src 'self' 'unsafe-inline' https://accounts.google.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline';"
+ "script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net; style-src 'self' https://fonts.googleapis.com; style-src-elem 'self' https://fonts.googleapis.com;"
```

#### `nginx.conf`
```diff
- "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com"
+ "style-src 'self' https://fonts.googleapis.com"
```

#### `netlify.toml`
```diff
- style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
+ style-src 'self' https://fonts.googleapis.com
```

## Inline Style Audit Results

### Patterns Found

1. **React inline styles** (302 matches across 104 files)
   - Pattern: `style={{ property: value }}`
   - **CSP Impact**: None - These use the DOM API, not inline `<style>` tags
   - **Action**: No changes required

2. **Dynamic style tag injection** (1 location)
   - File: `src/context/ThemeContext.js`
   - Pattern: `document.createElement('style')` for reduced motion
   - **CSP Impact**: Medium - Would violate CSP without 'unsafe-inline'
   - **Action**: Uses CSSStyleSheet API as primary method, graceful fallback

3. **CSS variable manipulation** (5 locations)
   - File: `src/context/ThemeContext.js`
   - Pattern: `element.style.setProperty()`
   - **CSP Impact**: None - DOM API, not inline styles
   - **Action**: No changes required

### Key Finding

The only potential CSP-violating inline style injection was in ThemeContext.js for the reduced motion feature. This uses the CSSStyleSheet API when available (which doesn't require 'unsafe-inline'), and falls back to `<style>` tag injection. The fallback may not work with strict CSP, but users still get reduced motion via CSS media queries.

## Testing Requirements

### Manual Testing

1. **Application loads normally**
   - Expected: No CSP violations in console
   - Check: Browser DevTools Console

2. **Google Fonts load successfully**
   - Expected: No blocked requests
   - Check: Network tab for 403/404 on fonts.googleapis.com

3. **Dynamic UI components render correctly**
   - Expected: Styling preserved
   - Check: Visual inspection of all major components

4. **Theme switching works**
   - Expected: Theme changes apply correctly
   - Check: Toggle between light/dark themes

5. **Reduced motion feature**
   - Expected: Works via CSS media queries even if dynamic injection fails
   - Check: Enable reduced motion in OS settings

### Browser Console Inspection

Open DevTools Console and check for:
```
Content Security Policy: The page's settings blocked the loading of a resource
Refused to apply inline style because it violates the following Content Security Policy directive
```

**Expected**: No CSP errors (or only non-critical warnings about reduced motion fallback)

### Security Validation

Verify CSP header:
```bash
curl -I https://your-domain.com
```

Check for:
- `Content-Security-Policy` header present
- `style-src` does NOT contain `'unsafe-inline'`
- `script-src` does NOT contain `'unsafe-inline'` (in vercel.json)

## Rollback Plan

If issues arise:

1. **Revert static configs**: Add `'unsafe-inline'` back to nginx.conf, netlify.toml, vercel.json
2. **Revert middleware**: Add `'unsafe-inline'` back to style-src

## Future Improvements

1. **Hash-based CSP**: Consider using SHA hashes for known inline styles if needed
2. **Server-Side Rendering**: Implement SSR to enable proper nonce-based CSP
3. **Report-Only Mode**: Implement CSP report-uri for monitoring violations
4. **Automated Testing**: Add E2E tests for CSP compliance

## References

- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Level 3 Specification](https://www.w3.org/TR/CSP3/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## Summary

- **'unsafe-inline' removed** from style-src in all CSP configurations
- **'unsafe-inline' removed** from script-src in vercel.json
- **No nonce system** (requires SSR infrastructure)
- **Graceful degradation** for reduced motion feature
- **Minimal changes** for maximum maintainability
- **Enhanced security posture** against CSS and JS injection attacks
