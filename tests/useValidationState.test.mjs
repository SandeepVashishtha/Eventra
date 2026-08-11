/**
 * Tests for src/hooks/useValidationState.js
 *
 * Verifies the validation state management hook contract using functional behavioral testing.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { renderHook } from '@testing-library/react';
import useValidationStateDefault, {
  useValidationState,
} from '../src/hooks/useValidationState.js';

describe('useValidationState — exports contract', () => {
  it('exports useValidationState as named and default exports', () => {
    assert.ok(
      typeof useValidationState === 'function',
      'Must export useValidationState as named function',
    );
    assert.ok(
      typeof useValidationStateDefault === 'function',
      'Must export useValidationState as default export',
    );
    assert.strictEqual(
      useValidationState,
      useValidationStateDefault,
      'Named and default exports must be identical',
    );
  });
});

describe('useValidationState — parameters & default values', () => {
  it('handles fieldName as first parameter and applies default arguments when omitted', () => {
    const { result } = renderHook(() => useValidationState('username'));

    assert.strictEqual(result.current.validationState, 'idle');
    assert.strictEqual(result.current.error, null);
    assert.strictEqual(result.current.touched, false);
  });

  it('accepts custom parameter values for fieldName, validationState, error, and touched', () => {
    const { result } = renderHook(() =>
      useValidationState('email', 'error', 'Invalid email address', true),
    );

    assert.strictEqual(result.current.validationState, 'error');
    assert.strictEqual(result.current.error, 'Invalid email address');
    assert.strictEqual(result.current.touched, true);
  });

  it('handles edge cases: undefined options or empty fieldName', () => {
    const { result } = renderHook(() =>
      useValidationState('', undefined, undefined, undefined),
    );

    assert.strictEqual(result.current.validationState, 'idle');
    assert.strictEqual(result.current.error, null);
    assert.strictEqual(result.current.touched, false);
  });
});

describe('useValidationState — return contract shape', () => {
  it('returns all expected properties and helper methods', () => {
    const { result } = renderHook(() => useValidationState('password'));

    const keys = [
      'statusIndicator',
      'statusMessage',
      'shouldShowError',
      'isValidating',
      'isValid',
      'fieldClassName',
      'ariaAttributes',
      'validationState',
      'touched',
      'error',
    ];

    for (const key of keys) {
      assert.ok(
        key in result.current,
        `Returned object must contain property "${key}"`,
      );
    }

    assert.strictEqual(
      typeof result.current.fieldClassName,
      'function',
      'fieldClassName must be a function',
    );
  });
});

describe('useValidationState — status indicators and messages', () => {
  it('returns idle indicator and message for default/idle state', () => {
    const { result } = renderHook(() => useValidationState('username', 'idle'));

    assert.ok(result.current.statusIndicator, 'Should have an idle status indicator');
    assert.strictEqual(result.current.isValidating, false);
  });

  it('returns validating indicator, isValidating flag, and message when validating', () => {
    const { result } = renderHook(() =>
      useValidationState('username', 'validating'),
    );

    assert.strictEqual(result.current.isValidating, true);
    assert.ok(
      result.current.statusMessage?.includes('is being validated'),
      'Status message must state field is being validated',
    );
  });

  it('returns success indicator, isValid flag, and message when success', () => {
    const { result } = renderHook(() =>
      useValidationState('username', 'success'),
    );

    assert.strictEqual(result.current.isValid, true);
    assert.ok(
      result.current.statusMessage?.includes('is valid'),
      'Status message must state field is valid',
    );
  });

  it('returns error indicator, shouldShowError flag, and message when error occurs', () => {
    const { result } = renderHook(() =>
      useValidationState('username', 'error', 'Username taken', true),
    );

    assert.strictEqual(result.current.isValid, false);
    assert.strictEqual(result.current.shouldShowError, true);
    assert.ok(
      result.current.statusMessage?.includes('has an error'),
      'Status message must state field has an error',
    );
  });
});

describe('useValidationState — field class names', () => {
  it('applies blue border class for validating state', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'validating'),
    );

    const classes = result.current.fieldClassName();
    assert.ok(
      classes.includes('border-blue-500'),
      'Class list must include border-blue-500 when validating',
    );
  });

  it('applies green border class for success state', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'success'),
    );

    const classes = result.current.fieldClassName();
    assert.ok(
      classes.includes('border-green-500'),
      'Class list must include border-green-500 on success',
    );
  });

  it('applies red border class for error state', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'error', 'Required', true),
    );

    const classes = result.current.fieldClassName();
    assert.ok(
      classes.includes('border-red-500'),
      'Class list must include border-red-500 on error',
    );
  });
});

describe('useValidationState — ARIA attributes', () => {
  it('sets aria-busy when field is validating', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'validating'),
    );

    assert.strictEqual(result.current.ariaAttributes['aria-busy'], true);
  });

  it('sets aria-invalid and aria-describedby when error exists and field is touched', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'error', 'Required field', true),
    );

    assert.strictEqual(result.current.ariaAttributes['aria-invalid'], true);
    assert.ok(
      'aria-describedby' in result.current.ariaAttributes,
      'Must set aria-describedby for error message target',
    );
  });
});

describe('useValidationState — memoization & reference stability', () => {
  it('maintains function reference (useCallback) for fieldClassName across re-renders when dependencies are unchanged', () => {
    const { result, rerender } = renderHook(
      ({ name, state }) => useValidationState(name, state),
      { initialProps: { name: 'email', state: 'idle' } },
    );

    const initialFieldClassName = result.current.fieldClassName;

    // Re-render with identical props
    rerender({ name: 'email', state: 'idle' });

    assert.strictEqual(
      result.current.fieldClassName,
      initialFieldClassName,
      'fieldClassName reference should be preserved via useCallback across re-renders with unchanged dependencies',
    );
  });
});