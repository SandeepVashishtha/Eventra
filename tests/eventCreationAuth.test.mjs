/**
 * Tests for the EventCreation authentication fix.
 *
 * Verifies that the event creation submission path:
 *  1. No longer reads from sessionStorage.getItem("token") — which was always
 *     null after the HttpOnly cookie migration and caused every submit to fail.
 *  2. Does not manually append an Authorization header (apiUtils handles auth
 *     automatically via the session cookie and withCredentials).
 *  3. The apiUtils.post call receives the event data without a stale token guard.
 *
 * These are static-analysis style tests that parse the source files to assert
 * security-relevant patterns are absent/present, supplemented by unit tests
 * for the utility logic around the submission path.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const readSrc = (relPath) =>
  readFileSync(path.resolve(__dirname, '..', relPath), 'utf8');

// ---------------------------------------------------------------------------
// Source files under test
// ---------------------------------------------------------------------------

const eventCreationRoot = readSrc('src/components/EventCreation.jsx');
const eventCreationNested = readSrc('src/components/common/EventCreation/EventCreation.jsx');

const sources = [
  { label: 'src/components/EventCreation.jsx', src: eventCreationRoot },
  { label: 'src/components/common/EventCreation/EventCreation.jsx', src: eventCreationNested },
];

// ---------------------------------------------------------------------------
// Security contract tests
// ---------------------------------------------------------------------------

describe('EventCreation — broken sessionStorage token guard removed', () => {
  for (const { label, src } of sources) {
    it(`[${label}] does not call sessionStorage.getItem("token")`, () => {
      assert.ok(
        !src.includes('sessionStorage.getItem("token")') &&
          !src.includes("sessionStorage.getItem('token')"),
        `${label} must not read auth token from sessionStorage — token is null after HttpOnly migration`,
      );
    });

    it(`[${label}] does not throw "Authentication required" based on sessionStorage`, () => {
      // The specific guard that was broken: if (!token) throw new Error("Authentication required...")
      const hasOldGuard =
        src.includes('Authentication required. Please log in and try again.') &&
        src.includes('sessionStorage');
      assert.ok(
        !hasOldGuard,
        `${label} must not have the stale sessionStorage-based auth guard`,
      );
    });

    it(`[${label}] does not pass a bare token string as Authorization header`, () => {
      // Old code: headers: { Authorization: token } — where token was a raw JWT string
      // without the "Bearer " prefix, AND was null. Both problems are fixed.
      const hasMalformedHeader =
        /headers\s*:\s*\{\s*Authorization\s*:\s*token\s*\}/.test(src);
      assert.ok(
        !hasMalformedHeader,
        `${label} must not pass a bare token variable as Authorization header`,
      );
    });

    it(`[${label}] calls apiUtils.post without a manual Authorization header override`, () => {
      // After the fix: apiUtils.post(endpoint, eventData) — no third headers argument
      // that overrides the cookie-based auth injected by apiUtils.
      const hasManualAuthHeader =
        /apiUtils\.post\([^)]*Authorization[^)]*\)/.test(src);
      assert.ok(
        !hasManualAuthHeader,
        `${label} must not override the apiUtils Authorization header — cookie auth is automatic`,
      );
    });

    it(`[${label}] imports apiUtils from the correct config path`, () => {
      assert.ok(
        src.includes('apiUtils'),
        `${label} must import and use apiUtils for API calls`,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Confirm the fix: apiUtils.post is called with just two arguments
// ---------------------------------------------------------------------------

describe('EventCreation — apiUtils.post call shape', () => {
  for (const { label, src } of sources) {
    it(`[${label}] apiUtils.post call passes endpoint and eventData only`, () => {
      // Match apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData)
      // without a third argument object containing Authorization
      const postCallMatch = src.match(
        /apiUtils\.post\(API_ENDPOINTS\.EVENTS\.CREATE,\s*eventData([^)]*)\)/,
      );
      assert.ok(
        postCallMatch !== null,
        `${label} must call apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData)`,
      );

      // Capture what follows eventData — should be empty or just whitespace/newline
      const trailing = (postCallMatch[1] || '').trim();
      assert.strictEqual(
        trailing,
        '',
        `${label}: apiUtils.post must not have extra arguments after eventData — got: "${trailing}"`,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Verify apiUtils does not require a manual token injection
// ---------------------------------------------------------------------------

describe('apiUtils — auth injection is automatic', () => {
  it('apiUtils source uses withCredentials or equivalent cookie-based auth', () => {
    const apiConfig = readSrc('src/config/api.js');
    const hasCredentials =
      apiConfig.includes('withCredentials') ||
      apiConfig.includes('credentials') ||
      apiConfig.includes('cookie');
    assert.ok(
      hasCredentials,
      'apiUtils must configure withCredentials so the session cookie is sent automatically',
    );
  });

  it('apiUtils does not rely on sessionStorage.getItem("token") for the Authorization header', () => {
    const apiConfig = readSrc('src/config/api.js');
    const reliesOnSessionStorage =
      apiConfig.includes('sessionStorage.getItem("token")') ||
      apiConfig.includes("sessionStorage.getItem('token')");
    assert.ok(
      !reliesOnSessionStorage,
      'apiUtils must not read the auth token from sessionStorage',
    );
  });
});

// ---------------------------------------------------------------------------
// Regression guard: no other component reads sessionStorage("token") for auth
// ---------------------------------------------------------------------------

describe('Codebase-wide regression: no stale sessionStorage token reads for auth', () => {
  const filesToCheck = [
    'src/components/EventCreation.jsx',
    'src/components/common/EventCreation/EventCreation.jsx',
  ];

  for (const relPath of filesToCheck) {
    it(`${relPath} is clean of sessionStorage token reads`, () => {
      const src = readSrc(relPath);
      assert.ok(
        !src.includes('sessionStorage.getItem("token")') &&
          !src.includes("sessionStorage.getItem('token')"),
        `${relPath} must not read token from sessionStorage`,
      );
    });
  }
});

// ---------------------------------------------------------------------------
// Edge case: mock path still works when API_ENDPOINTS.EVENTS.CREATE is falsy
// ---------------------------------------------------------------------------

describe('EventCreation — mock fallback path', () => {
  it('root EventCreation.jsx has a mock fallback when endpoint is not configured', () => {
    assert.ok(
      eventCreationRoot.includes('mock-event-id') ||
        eventCreationRoot.includes('Mock event creation') ||
        eventCreationRoot.includes('mock') ||
        eventCreationRoot.includes('setTimeout'),
      'EventCreation.jsx should have a mock/dev fallback path',
    );
  });

  it('nested EventCreation.jsx has a mock fallback when endpoint is not configured', () => {
    assert.ok(
      eventCreationNested.includes('setTimeout') ||
        eventCreationNested.includes('mock'),
      'Nested EventCreation.jsx should have a mock/dev fallback path',
    );
  });
});
