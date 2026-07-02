import { describe, test, expect } from 'vitest';
import { isValidRedirectPath, getSafeRedirectPath } from './redirectValidation.js';

describe('isValidRedirectPath', () => {
  test('returns true for root path', () => {
    expect(isValidRedirectPath('/')).toBe(true);
  });

  test('returns true for allowed prefixes', () => {
    expect(isValidRedirectPath('/dashboard')).toBe(true);
    expect(isValidRedirectPath('/dashboard/settings')).toBe(true);
    expect(isValidRedirectPath('/profile')).toBe(true);
    expect(isValidRedirectPath('/events/123')).toBe(true);
  });

  test('returns false for unknown prefixes', () => {
    expect(isValidRedirectPath('/unknown')).toBe(false);
    expect(isValidRedirectPath('/malicious-path')).toBe(false);
  });

  test('returns false for protocol-relative paths', () => {
    expect(isValidRedirectPath('//attacker.com')).toBe(false);
    expect(isValidRedirectPath('/\\attacker.com')).toBe(false);
  });

  test('returns false for absolute URLs', () => {
    expect(isValidRedirectPath('https://attacker.com')).toBe(false);
    expect(isValidRedirectPath('http://attacker.com/dashboard')).toBe(false);
    expect(isValidRedirectPath('javascript:alert(1)')).toBe(false);
  });

  test('returns false for non-string or empty inputs', () => {
    expect(isValidRedirectPath(null)).toBe(false);
    expect(isValidRedirectPath(undefined)).toBe(false);
    expect(isValidRedirectPath('')).toBe(false);
    expect(isValidRedirectPath(123)).toBe(false);
  });
});

describe('getSafeRedirectPath', () => {
  test('returns original path if valid and not an auth loop', () => {
    expect(getSafeRedirectPath('/dashboard', '/default')).toBe('/dashboard');
    expect(getSafeRedirectPath('/events/456', '/default')).toBe('/events/456');
  });

  test('returns fallback for invalid paths', () => {
    expect(getSafeRedirectPath('https://attacker.com', '/default')).toBe('/default');
    expect(getSafeRedirectPath('//attacker.com', '/default')).toBe('/default');
    expect(getSafeRedirectPath('/unknown', '/default')).toBe('/default');
  });

  test('returns fallback for auth paths to prevent infinite loops', () => {
    expect(getSafeRedirectPath('/login', '/default')).toBe('/default');
    expect(getSafeRedirectPath('/register', '/default')).toBe('/default');
    expect(getSafeRedirectPath('/signup', '/default')).toBe('/default');
  });
});
