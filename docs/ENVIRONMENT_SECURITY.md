# Environment Variable Security Guidelines

This guide provides best practices for securely managing environment variables used by Eventra during development and deployment.

---

# Required Environment Variables

The following variables are typically required for the application to function correctly.

Examples include:

- API Base URL
- Authentication secrets
- JWT configuration
- Third-party service credentials

Always consult the project's `.env.example` file for the latest list of required variables.

---

# Optional Environment Variables

Some variables enable optional functionality such as:

- Analytics integrations
- Email services
- Development debugging
- Feature flags

These variables may be omitted if the corresponding feature is not being used.

---

# Secure Storage Recommendations

Follow these practices when working with environment variables:

- Store secrets only in local `.env` files.
- Never commit `.env` files to version control.
- Use your deployment platform's secret management system.
- Rotate credentials periodically.
- Restrict access to production secrets.

---

# Using `.env.example`

The `.env.example` file should contain:

- Placeholder values only.
- No real credentials.
- Clear descriptions for each variable.
- Default values where appropriate.

Example:

```env
VITE_API_URL=http://localhost:3000
JWT_SECRET=your-secret-here
```

---

# Secrets Management Best Practices

- Keep production credentials separate from development credentials.
- Generate strong, unique secrets.
- Rotate compromised secrets immediately.
- Never share secrets through email or chat.
- Avoid hardcoding credentials in source code.

---

# Common Mistakes

Avoid the following:

- Committing `.env` files.
- Reusing production credentials locally.
- Logging sensitive environment variables.
- Storing secrets inside frontend source files.
- Sharing screenshots containing secrets.

---

# Security Checklist

Before committing code:

- `.env` is included in `.gitignore`
- No secrets are hardcoded
- `.env.example` contains placeholders only
- Production secrets are stored securely
- Credentials have not been exposed in commits