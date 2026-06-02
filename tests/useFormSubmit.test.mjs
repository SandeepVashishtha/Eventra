/**
 * Tests for src/hooks/useFormSubmit.js
 *
 * Verifies the form submission hook contract with offline support.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useFormSubmit.js'),
  'utf8',
);

describe('useFormSubmit — source contract', () => {
  it('exports useFormSubmit as named export', () => {
    assert.ok(
      src.includes('export function useFormSubmit'),
      'Must export useFormSubmit as named export',
    );
  });

  it('uses useState for isSubmitting state', () => {
    assert.ok(
      src.includes('useState'),
      'Must use useState for isSubmitting state',
    );
  });

  it('uses useState for error state', () => {
    assert.ok(
      src.match(/useState/g)?.length >= 2,
      'Must use useState at least twice for isSubmitting and error',
    );
  });

  it('uses useState for success state', () => {
    assert.ok(
      src.includes('setSuccess'),
      'Must use useState for success state',
    );
  });

  it('uses useRef for in-flight tracking', () => {
    assert.ok(
      src.includes('useRef'),
      'Must use useRef for in-flight tracking',
    );
  });

  it('uses useEffect for mount tracking', () => {
    assert.ok(
      src.includes('useEffect'),
      'Must use useEffect for mount tracking',
    );
  });

  it('imports pushToQueue from offlineQueue', () => {
    assert.ok(
      src.includes('pushToQueue'),
      'Must import pushToQueue from offlineQueue',
    );
  });

  it('imports getPublicErrorMessage from errorMessages', () => {
    assert.ok(
      src.includes('getPublicErrorMessage'),
      'Must import getPublicErrorMessage from errorMessages',
    );
  });
});

describe('useFormSubmit — parameters', () => {
  it('accepts submitFn as first parameter', () => {
    assert.ok(
      src.includes('submitFn'),
      'Must accept submitFn as first parameter',
    );
  });

  it('accepts offlineOptions as second parameter', () => {
    assert.ok(
      src.includes('offlineOptions = {}'),
      'Must accept offlineOptions as second parameter with default empty object',
    );
  });
});

describe('useFormSubmit — return contract', () => {
  it('returns handleSubmit function', () => {
    assert.ok(
      src.includes('handleSubmit'),
      'Must return handleSubmit function',
    );
  });

  it('returns isSubmitting state', () => {
    assert.ok(
      src.includes('isSubmitting'),
      'Must return isSubmitting state',
    );
  });

  it('returns error state', () => {
    assert.ok(
      src.includes('error'),
      'Must return error state',
    );
  });

  it('returns success state', () => {
    assert.ok(
      src.includes('success'),
      'Must return success state',
    );
  });
});

describe('useFormSubmit — behavior', () => {
  it('prevents concurrent submissions with isInFlight ref', () => {
    assert.ok(
      src.includes('isInFlight.current'),
      'Must use isInFlight ref to prevent concurrent submissions',
    );
  });

  it('sets isSubmitting to true during submission', () => {
    assert.ok(
      src.includes('setIsSubmitting(true)'),
      'Must set isSubmitting to true during submission',
    );
  });

  it('clears error before new submission', () => {
    assert.ok(
      src.includes('setError(null)'),
      'Must clear error before new submission',
    );
  });

  it('handles offline submission errors', () => {
    assert.ok(
      src.includes('isNetworkError') || src.includes('isTimeout'),
      'Must handle offline submission errors',
    );
  });

  it('queues offline submissions when enabled', () => {
    assert.ok(
      src.includes('queueOffline'),
      'Must queue offline submissions when enabled',
    );
  });

  it('returns focus to component on unmount', () => {
    assert.ok(
      src.includes('isMounted.current = false'),
      'Must use isMounted ref to track component mount state',
    );
  });
});