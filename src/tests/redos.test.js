/**
 * src/tests/redos.test.js
 *
 * ReDoS (Regular Expression Denial of Service) prevention tests.
 *
 * These tests assert that our validation patterns complete in bounded time
 * even when processing adversarially crafted long strings with repeated chars.
 * A test that takes >500ms is considered a ReDoS failure.
 */

import { validate } from '../validation';

const MAX_TEST_TIME_MS = 500;

function timed(fn) {
  const start = Date.now();
  const result = fn();
  const elapsed = Date.now() - start;
  return { result, elapsed };
}

describe('ReDoS Prevention in Validation Patterns', () => {
  describe('email validator', () => {
    it('handles a legitimate email quickly', () => {
      const { elapsed } = timed(() => validate.email('user@example.com'));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it('handles a long adversarial email quickly (no backtracking)', () => {
      // Pattern known to trigger exponential backtracking in naive email regex:
      // many repeated "a@" segments at the boundary
      const evil = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const { elapsed } = timed(() => validate.email(evil));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it('rejects emails exceeding 254 chars without regex evaluation', () => {
      const longEmail = 'a'.repeat(250) + '@b.com';
      const result = validate.email(longEmail);
      expect(result).toBe('Invalid email format');
    });

    it('handles 1000 repeated special chars without hanging', () => {
      const evil = '!'.repeat(500) + '@' + '!'.repeat(500);
      const { elapsed } = timed(() => validate.email(evil));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });
  });

  describe('phone validator', () => {
    it('handles a valid phone quickly', () => {
      const { elapsed } = timed(() => validate.phone('+91 98765 43210'));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it('handles a long adversarial phone string quickly', () => {
      const evil = '(' + '-'.repeat(200) + ')' + ' '.repeat(200);
      const { elapsed } = timed(() => validate.phone(evil));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });
  });

  describe('url validator', () => {
    it('handles a valid URL quickly', () => {
      const { elapsed } = timed(() => validate.url('https://example.com/path?q=1'));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });

    it('rejects URLs exceeding 2048 chars without deep regex', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2048);
      const result = validate.url(longUrl);
      expect(result).toBe('URL is too long');
    });

    it('handles an adversarial URL string quickly', () => {
      const evil = 'https://' + 'a/'.repeat(500);
      const { elapsed } = timed(() => validate.url(evil));
      expect(elapsed).toBeLessThan(MAX_TEST_TIME_MS);
    });
  });
});
