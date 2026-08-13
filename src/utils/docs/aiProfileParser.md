# AI Profile Parser Utility

The `aiProfileParser.js` module provides utility functions for AI-Powered Profile Auto-Generation. It handles extracting information from a user's GitHub profile and parsing local Resume PDFs.

## Functions

### `extractUsername(url)`
Extracts a valid GitHub username from various input formats.
* **Validation**: Restricts input to valid GitHub hostnames (`github.com`) and path structures.
* **Username Constraints**: Enforces standard GitHub username constraints (alphanumeric and single hyphens only, max 39 characters).
* **Reserved Path Safety**: Disallows reserved path keywords such as `features`, `copilot`, `security`, and `trending` from being treated as usernames.

### `parseGithubProfile(githubUrl)`
Fetches structured profile data from the GitHub REST API.
* Infers developer skills from language composition and topic tagging of the top 30 active repositories.

### `parseResumePDF(file, options)`
Extracts readable text literals from an uploaded PDF.
* Matches keywords against the extracted resume content to identify developer skills.

## Verification & Testing

Verify correctness by running the direct node test runner:
```bash
node tests/aiProfileParser.test.mjs
```
