# CSP Reporting

## Overview

Eventra supports Content Security Policy (CSP) violation reporting.

## Flow

1. Browser detects CSP violation.
2. Frontend generates a CSP report.
3. Report is sent using Beacon API.
4. Server validates the report.
5. Violation is logged for security monitoring.

## Example Report

```json
{
  "csp-report": {
    "violated-directive": "script-src",
    "blocked-uri": "https://malicious-site.com"
  }
}
```