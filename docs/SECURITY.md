# Eventra Security Headers Reference

This document describes every HTTP security header Eventra sets, why each value was chosen, and how to verify the configuration is active after deployment.

---

## Response Headers (set in `vercel.json`)

All headers in the `"source": "/(.*)"` block apply to every route the Vercel edge serves.

### `Strict-Transport-Security`

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Why:** Tells browsers to only ever connect to Eventra over HTTPS for the next 365 days, even if the user types `http://`. Without this header, the very first HTTP request a new user makes can be intercepted by a network attacker and downgraded to plaintext before the server's redirect fires — exposing any credentials or tokens in transit. `includeSubDomains` protects `api.eventra.*` and any other subdomains from the same attack. `preload` opts the domain into browser preload lists so first-time visitors are protected before their browser has cached the header.

**Action required after deploy:** Submit the production domain to [https://hstspreload.org](https://hstspreload.org) to be added to the Chromium/Firefox preload list. This is a one-time step and protects new users before their browser has seen a single response from Eventra.

---

### `X-Frame-Options`

```
X-Frame-Options: DENY
```

**Why:** Prevents any page on Eventra from being embedded in an `<iframe>` on another origin, blocking clickjacking attacks. Consistent with the `frame-ancestors 'none'` directive in the CSP (below).

---

### `X-Content-Type-Options`

```
X-Content-Type-Options: nosniff
```

**Why:** Stops browsers from MIME-sniffing a response away from the declared `Content-Type`. Without this, a browser might execute a JSON file as JavaScript if an attacker can control its content — a critical defence when serving user-uploaded data.

---

### `Referrer-Policy`

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Why:** Sends the full URL as the `Referer` header for same-origin requests (useful for analytics), but only sends the origin (no path or query string) for cross-origin requests. This prevents leaking sensitive URL tokens or event IDs to third-party scripts loaded on the page.

---

### `Permissions-Policy`

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Why:** Explicitly disables browser features Eventra does not use. Blocks any embedded third-party script or compromised dependency from silently requesting camera, microphone, or geolocation access on behalf of the user.

---

### `Content-Security-Policy`

```
default-src 'self';
script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
connect-src 'self'
  https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
  https://accounts.google.com
  https://www.googleapis.com
  https://api.emailjs.com
  https://api.github.com;
font-src 'self' data: https://fonts.gstatic.com;
frame-src 'self' https://accounts.google.com;
frame-ancestors 'none';
upgrade-insecure-requests
```

**Why each directive:**

| Directive | Reason |
|---|---|
| `default-src 'self'` | Default deny-all for unlisted resource types |
| `script-src` | Allows only the app bundle, Google Sign-In, and EmailJS — blocks injected scripts from any other origin |
| `style-src 'unsafe-inline'` | Required by Tailwind CSS JIT and Framer Motion inline styles. A future migration to nonce-based CSP would remove this — tracked as a separate issue |
| `img-src data: https:` | Allows base64-encoded images (banner previews) and any HTTPS image (contributor avatars, event banners) |
| `connect-src` | Allows XHR/fetch only to the Eventra backend, Google auth, EmailJS, and GitHub APIs |
| `font-src data:` | Required for icon fonts that embed glyphs as base64 data URIs |
| `frame-src accounts.google.com` | Required for the Google Sign-In popup flow |
| `frame-ancestors 'none'` | Reinforces `X-Frame-Options: DENY` for CSP2+ browsers |
| `upgrade-insecure-requests` | Forces all sub-resource fetches to HTTPS even before HSTS is cached |

**Known limitation:** `style-src 'unsafe-inline'` weakens CSS injection protection. See the open issue for the nonce-based migration plan.

---

## Meta Tag (set in `public/index.html`)

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
```

**Why:** Applies `upgrade-insecure-requests` at HTML parse time, before the browser has processed any response headers. This is the only CSP directive that is safe and meaningful to set via `<meta>`. HSTS cannot be set via `<meta>` — it must be a response header.

---

## CORS Headers (set in `vercel.json` for `/api/(.*)`)

```
Access-Control-Allow-Origin: https://eventra.sandeepvashishtha.tech
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Why a specific origin, not `*`:** `Access-Control-Allow-Credentials: true` and a wildcard origin is rejected by all browsers — it would silently break credentialed requests. The specific origin ensures cookies and `Authorization` headers are sent correctly from the frontend while blocking cross-origin requests from other domains.

---

## Verifying Headers After Deployment

Run the following command against the production URL to confirm all headers are present:

```bash
curl -I https://eventra.sandeepvashishtha.in/ 2>/dev/null | grep -iE \
  "strict-transport|x-frame|x-content-type|referrer|permissions|content-security"
```

Expected output should include a line for each of the six headers above. If `Strict-Transport-Security` is missing, check that the `vercel.json` changes are deployed and that you are hitting the production edge (not a preview deployment).

You can also use [https://securityheaders.com](https://securityheaders.com) for a full graded report.

---

## Preload Submission Checklist

After the HSTS header is confirmed live on production:

1. Visit [https://hstspreload.org](https://hstspreload.org)
2. Enter `eventra.sandeepvashishtha.in`
3. Confirm the site passes all requirements (HSTS header present, `includeSubDomains`, `preload`, `max-age >= 31536000`, HTTPS redirect working)
4. Click **Submit**
5. Propagation to Chrome and Firefox typically takes 6–8 weeks

Once on the preload list, removing the domain requires a separate removal request and weeks of propagation — ensure the team is committed to HTTPS-only before submitting.
