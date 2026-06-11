# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| Latest (`master`) | ✅ |
| Older releases | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

### Primary Path — GitHub Private Vulnerability Reporting

Use GitHub's built-in private advisory mechanism:

1. Go to the **[Security tab](../../security/advisories/new)** of this repository.
2. Click **"Report a vulnerability"**.
3. Fill in the details — affected component, steps to reproduce, and potential impact.
4. Submit. Maintainers will be notified privately and will respond within **72 hours**.

### Fallback — If Private Reporting Is Unavailable

If the Security tab is disabled or inaccessible, email the maintainer directly:

- **@SandeepVashishtha** — raise a [GitHub private advisory](../../security/advisories/new) or contact via the email listed on the profile page.

Encrypt sensitive details if possible. Do not share reproduction steps or proof-of-concept code in any public channel until a fix is released.

## What to Include in Your Report

- Affected file(s), module, or endpoint
- Steps to reproduce the vulnerability
- Potential impact (data exposure, privilege escalation, DoS, etc.)
- Your suggested fix or mitigation (optional but appreciated)

## Disclosure Policy

- Maintainers will acknowledge receipt within **72 hours**.
- A fix target will be communicated within **7 days** of confirmation.
- Public disclosure will happen only after a patch is released, coordinated with the reporter.
- Credit will be given to the reporter in the release notes unless anonymity is requested.

## Out of Scope

- Vulnerabilities in dependencies (report upstream; open a public issue here to track)
- Issues requiring physical access to a device
- Social engineering attacks

---
_For general bugs or feature requests, open a regular [GitHub issue](../../issues/new/choose)._
