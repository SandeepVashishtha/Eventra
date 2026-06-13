# Secret Scanning

## Overview

To improve the security posture of Eventra, automated secret scanning has been integrated into the CI/CD pipeline using **Gitleaks**.

This helps detect accidentally committed credentials, tokens, API keys, and other sensitive information before changes are merged into the codebase.

---

## Why Secret Scanning?

Modern applications rely on numerous third-party services and deployment environments.

Accidentally exposing secrets can lead to:

- Unauthorized access to infrastructure
- Data breaches
- Service disruption
- Supply-chain attacks
- Credential abuse

Automated scanning helps identify these issues early in the development lifecycle.

---

## What Gets Detected?

Gitleaks scans the repository for patterns commonly associated with sensitive information, including:

- API Keys
- Access Tokens
- JWT Secrets
- Cloud Provider Credentials
- Private Keys
- Database Credentials
- Authentication Tokens

---

## When Are Scans Executed?

Secret scans automatically run on:

- Pull Requests targeting `master`
- Direct pushes to `master`

This ensures that new code is checked before being merged into the project.

---

## False Positives

Some examples in documentation or test files may resemble secrets.

To reduce false positives, Eventra uses a configurable allowlist defined in:

```text
.gitleaks.toml