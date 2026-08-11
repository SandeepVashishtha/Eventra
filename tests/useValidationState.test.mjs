/**
 * Tests for src/hooks/useValidationState.js
 *
 * Verifies the validation state management hook contract.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const src = readFileSync(
  path.resolve(__dirname, '../src/hooks/useValidationState.js'),
  'utf8',
);

describe('useValidationState — source contract', () => {
  it('exports useValidationState as named export', () => {
    assert.ok(
      src.includes('export const useValidationState'),
      'Must export useValidationState as named export',
    );
  });

  it('exports useValidationState as default export', () => {
    assert.ok(
      src.includes('export default useValidationState'),
      'Must export useValidationState as default export',
    );
  });

  it('uses useCallback for memoized functions', () => {
    assert.ok(
      src.includes('useCallback'),
      'Must use useCallback for memoized functions',
    );
  });
});

describe('useValidationState — parameters', () => {
  it('accepts fieldName as first parameter', () => {
    assert.ok(
      src.includes('fieldName'),
      'Must accept fieldName as first parameter',
    );
  });

  it('accepts validationState as second parameter', () => {
    assert.ok(
      src.includes('validationState = "idle"'),
      'Must accept validationState as second parameter with default idle',
    );
  });

  it('accepts error as third parameter', () => {
    assert.ok(
      src.includes('error = null'),
      'Must accept error as third parameter with default null',
    );
  });

  it('accepts touched as fourth parameter', () => {
    assert.ok(
      src.includes('touched = false'),
      'Must accept touched as fourth parameter with default false',
    );
  });
});

describe('useValidationState — return contract', () => {
  it('returns statusIndicator', () => {
    assert.ok(
      src.includes('statusIndicator'),
      'Must return statusIndicator',
    );
  });

  it('returns statusMessage', () => {
    assert.ok(
      src.includes('statusMessage'),
      'Must return statusMessage',
    );
  });

  it('returns shouldShowError', () => {
    assert.ok(
      src.includes('shouldShowError'),
      'Must return shouldShowError',
    );
  });

  it('returns isValidating', () => {
    assert.ok(
      src.includes('isValidating'),
      'Must return isValidating',
    );
  });

  it('returns isValid', () => {
    assert.ok(
      src.includes('isValid'),
      'Must return isValid',
    );
  });

  it('returns fieldClassName function', () => {
    assert.ok(
      src.includes('fieldClassName'),
      'Must return fieldClassName function',
    );
  });

  it('returns ariaAttributes', () => {
    assert.ok(
      src.includes('ariaAttributes'),
      'Must return ariaAttributes',
    );
  });

  it('returns validationState', () => {
    assert.ok(
      src.includes('validationState'),
      'Must return validationState',
    );
  });

  it('returns touched', () => {
    assert.ok(
      src.includes('touched'),
      'Must return touched',
    );
  });

  it('returns error', () => {
    assert.ok(
      src.includes('error'),
      'Must return error',
    );
  });
});

describe('useValidationState — status indicators', () => {
  it('returns validating indicator when validating', () => {
    assert.ok(
      src.includes('case "validating"'),
      'Must return validating indicator when validating',
    );
  });

  it('returns success indicator when success', () => {
    assert.ok(
      src.includes('case "success"'),
      'Must return success indicator when success',
    );
  });

  it('returns error indicator when error', () => {
    assert.ok(
      src.includes('case "error"'),
      'Must return error indicator when error',
    );
  });

  it('returns idle indicator when idle', () => {
    assert.ok(
      src.includes('default:'),
      'Must return idle indicator when idle',
    );
  });
});

describe('useValidationState — status messages', () => {
  it('returns validating message when validating', () => {
    assert.ok(
      src.includes('is being validated'),
      'Must return validating message when validating',
    );
  });

  it('returns valid message when success', () => {
    assert.ok(
      src.includes('is valid'),
      'Must return valid message when success',
    );
  });

  it('returns error message when error', () => {
    assert.ok(
      src.includes('has an error'),
      'Must return error message when error',
    );
  });
});

describe('useValidationState — field class names', () => {
  it('applies green border for success state', () => {
    assert.ok(
      src.includes('border-green-500'),
      'Must apply green border for success state',
    );
  });

  it('applies red border for error state', () => {
    assert.ok(
      src.includes('border-red-500'),
      'Must apply red border for error state',
    );
  });

  it('applies blue border for validating state', () => {
    assert.ok(
      src.includes('border-blue-500'),
      'Must apply blue border for validating state',
    );
  });
});

describe('useValidationState — ARIA attributes', () => {
  it('sets aria-invalid when error exists', () => {
    assert.ok(
      src.includes('aria-invalid'),
      'Must set aria-invalid when error exists',
    );
  });

  it('sets aria-describedby for error message', () => {
    assert.ok(
      src.includes('aria-describedby'),
      'Must set aria-describedby for error message',
    );
  });

  it('sets aria-busy when validating', () => {
    assert.ok(
      src.includes('aria-busy'),
      'Must set aria-busy when validating',
    );
  });
});