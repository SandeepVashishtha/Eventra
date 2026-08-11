/**
 * Tests for src/hooks/useValidationState.js
 *
 * Verifies validation state management, custom i18n status messages, and hook contract specifications.
 */

import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { renderHook } from '@testing-library/react';
import useValidationStateDefault, {
  useValidationState,
} from '../src/hooks/useValidationState.js';

describe('useValidationState — exports contract', () => {
  it('exports useValidationState as named export', () => {
    assert.strictEqual(
      typeof useValidationState,
      'function',
      'Must export useValidationState as named function'
    );
  });

  it('exports useValidationState as default export', () => {
    assert.strictEqual(
      typeof useValidationStateDefault,
      'function',
      'Must export useValidationState as default export'
    );
  });

  it('ensures named and default exports reference the exact same hook', () => {
    assert.strictEqual(
      useValidationState,
      useValidationStateDefault,
      'Named and default exports must be identical'
    );
  });
});

describe('useValidationState — parameter signatures & defaults', () => {
  it('accepts positional parameters (fieldName, validationState, error, touched, messages)', () => {
    const { result } = renderHook(() =>
      useValidationState('Email', 'error', 'Invalid email address', true)
    );

    assert.strictEqual(result.current.validationState, 'error');
    assert.strictEqual(result.current.error, 'Invalid email address');
    assert.strictEqual(result.current.touched, true);
  });

  it('accepts single options object signature ({ fieldName, validationState, error, touched, messages })', () => {
    const { result } = renderHook(() =>
      useValidationState({
        fieldName: 'Email Address',
        validationState: 'error',
        error: 'Invalid format',
        touched: true,
      })
    );

    assert.strictEqual(result.current.validationState, 'error');
    assert.strictEqual(result.current.error, 'Invalid format');
    assert.strictEqual(result.current.touched, true);
  });

  it('applies default parameters when arguments are omitted', () => {
    const { result } = renderHook(() => useValidationState('Username'));

    assert.strictEqual(result.current.validationState, 'idle');
    assert.strictEqual(result.current.error, null);
    assert.strictEqual(result.current.touched, false);
  });

  it('handles edge cases gracefully (undefined inputs and empty field names)', () => {
    const { result } = renderHook(() =>
      useValidationState('', undefined, undefined, undefined)
    );

    assert.strictEqual(result.current.validationState, 'idle');
    assert.strictEqual(result.current.error, null);
    assert.strictEqual(result.current.touched, false);
  });
});

describe('useValidationState — return contract shape', () => {
  it('returns all required status fields, direct accessors, and utility functions', () => {
    const { result } = renderHook(() => useValidationState('Password'));

    const requiredKeys = [
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

    for (const key of requiredKeys) {
      assert.ok(
        key in result.current,
        `Returned hook object must contain key: "${key}"`
      );
    }

    assert.strictEqual(
      typeof result.current.fieldClassName,
      'function',
      'fieldClassName must be a function'
    );
    assert.strictEqual(
      typeof result.current.ariaAttributes,
      'object',
      'ariaAttributes must be an object'
    );
  });
});

describe('useValidationState — status indicators', () => {
  it('returns idle indicator when state is idle', () => {
    const { result } = renderHook(() => useValidationState('field', 'idle'));
    assert.strictEqual(result.current.statusIndicator, 'idle');
  });

  it('returns validating indicator when validating', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'validating')
    );
    assert.strictEqual(result.current.statusIndicator, 'validating');
    assert.strictEqual(result.current.isValidating, true);
  });

  it('returns success indicator when success', () => {
    const { result } = renderHook(() => useValidationState('field', 'success'));
    assert.strictEqual(result.current.statusIndicator, 'success');
    assert.strictEqual(result.current.isValid, true);
  });

  it('returns error indicator when in error state', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'error', 'Error text', true)
    );
    assert.strictEqual(result.current.statusIndicator, 'error');
    assert.strictEqual(result.current.isValid, false);
    assert.strictEqual(result.current.shouldShowError, true);
  });
});

describe('useValidationState — status messages & custom i18n support', () => {
  it('returns default validating message', () => {
    const { result } = renderHook(() =>
      useValidationState('Username', 'validating')
    );
    assert.strictEqual(
      result.current.statusMessage,
      'Username is being validated'
    );
  });

  it('returns default success message', () => {
    const { result } = renderHook(() =>
      useValidationState('Username', 'success')
    );
    assert.strictEqual(result.current.statusMessage, 'Username is valid');
  });

  it('returns default error message', () => {
    const { result } = renderHook(() =>
      useValidationState('Username', 'error', 'Already taken', true)
    );
    assert.strictEqual(
      result.current.statusMessage,
      'Username has an error: Already taken'
    );
  });

  it('uses custom string templates for custom status messages', () => {
    const { result } = renderHook(() =>
      useValidationState({
        fieldName: 'Email Address',
        validationState: 'validating',
        messages: {
          validating: 'Checking availability...',
          success: 'Looks good!',
        },
      })
    );
    assert.strictEqual(
      result.current.statusMessage,
      'Checking availability...'
    );
  });

  it('uses custom function formatters for status messages (i18n support)', () => {
    const { result } = renderHook(() =>
      useValidationState({
        fieldName: 'Email Address',
        validationState: 'error',
        error: 'Invalid format',
        messages: {
          error: (fieldName, error) => `${fieldName}: ${error}`,
        },
      })
    );
    assert.strictEqual(
      result.current.statusMessage,
      'Email Address: Invalid format'
    );
  });

  it('falls back to default message copy when a custom message key is missing', () => {
    const { result } = renderHook(() =>
      useValidationState({
        fieldName: 'Password',
        validationState: 'success',
        messages: {
          validating: 'Checking strength...',
        },
      })
    );
    assert.strictEqual(result.current.statusMessage, 'Password is valid');
  });
});

describe('useValidationState — field class names', () => {
  it('does not apply state border classes when untouched', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'error', 'Error text', false)
    );
    const classes = result.current.fieldClassName('input-base');
    assert.strictEqual(classes, 'input-base');
  });

  it('applies green border class for success state when touched', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'success', null, true)
    );
    const classes = result.current.fieldClassName('input-base');
    assert.ok(
      classes.includes('border-green-500'),
      'Must include border-green-500'
    );
  });

  it('applies red border class for error state when touched', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'error', 'Error', true)
    );
    const classes = result.current.fieldClassName('input-base');
    assert.ok(
      classes.includes('border-red-500'),
      'Must include border-red-500'
    );
  });

  it('applies blue border class for validating state when touched', () => {
    const { result } = renderHook(() =>
      useValidationState('field', 'validating', null, true)
    );
    const classes = result.current.fieldClassName('input-base');
    assert.ok(
      classes.includes('border-blue-500'),
      'Must include border-blue-500'
    );
  });
});

describe('useValidationState — ARIA attributes', () => {
  it('sets aria-busy when field is validating', () => {
    const { result } = renderHook(() =>
      useValidationState('email', 'validating')
    );
    assert.strictEqual(result.current.ariaAttributes['aria-busy'], 'true');
  });

  it('sets aria-invalid and aria-describedby for error state when touched', () => {
    const { result } = renderHook(() =>
      useValidationState('email', 'error', 'Invalid email', true)
    );
    assert.strictEqual(result.current.ariaAttributes['aria-invalid'], 'true');
    assert.strictEqual(
      result.current.ariaAttributes['aria-describedby'],
      'email-error'
    );
  });

  it('sets aria-describedby for success state when valid', () => {
    const { result } = renderHook(() =>
      useValidationState('email', 'success', null, true)
    );
    assert.strictEqual(
      result.current.ariaAttributes['aria-describedby'],
      'email-success'
    );
  });
});

describe('useValidationState — memoization & callback stability', () => {
  it('maintains reference stability (useCallback) for fieldClassName across re-renders when dependencies are unchanged', () => {
    const { result, rerender } = renderHook(
      ({ fieldName, state }) =>
        useValidationState({ fieldName, validationState: state }),
      { initialProps: { fieldName: 'email', state: 'idle' } }
    );

    const initialFieldClassName = result.current.fieldClassName;

    // Re-render with identical props
    rerender({ fieldName: 'email', state: 'idle' });

    assert.strictEqual(
      result.current.fieldClassName,
      initialFieldClassName,
      'fieldClassName reference must be preserved via useCallback across re-renders'
    );
  });
});