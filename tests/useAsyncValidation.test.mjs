/**
 * useAsyncValidation.test.mjs
 *
 * Tests for the new useAsyncValidation hook introduced to fix async validator
 * support in useFormValidation (previously returned raw Promise as error string).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAsyncValidation from '../../src/hooks/useAsyncValidation';

// Use fake timers so debounce is testable without real delays
beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────

describe('useAsyncValidation — initial state', () => {
  it('returns empty error/loading state on mount', () => {
    const { result } = renderHook(() =>
      useAsyncValidation({ email: async () => null })
    );
    expect(result.current.asyncErrors).toEqual({});
    expect(result.current.isAsyncValidating).toEqual({});
    expect(result.current.hasAsyncErrors).toBe(false);
    expect(result.current.isAnyAsyncValidating).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('useAsyncValidation — validateAsync', () => {
  it('sets loading state immediately then clears it after resolution', async () => {
    const validator = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 200 })
    );

    act(() => { result.current.validateAsync('email', 'test@example.com'); });

    // Loading should be true immediately
    expect(result.current.isAsyncValidating.email).toBe(true);

    // Advance past debounce
    await act(async () => { vi.advanceTimersByTime(200); });
    await act(async () => {});

    expect(result.current.isAsyncValidating.email).toBe(false);
    expect(result.current.asyncErrors.email).toBe(null);
  });

  it('sets asyncErrors when validator returns an error string', async () => {
    const validator = vi.fn().mockResolvedValue('Email already taken');
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 200 })
    );

    act(() => { result.current.validateAsync('email', 'taken@example.com'); });
    await act(async () => { vi.advanceTimersByTime(200); });
    await act(async () => {});

    expect(result.current.asyncErrors.email).toBe('Email already taken');
    expect(result.current.hasAsyncErrors).toBe(true);
  });

  it('debounces rapid calls — only fires once for multiple quick calls', async () => {
    const validator = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 300 })
    );

    act(() => {
      result.current.validateAsync('email', 'a@b.com');
      result.current.validateAsync('email', 'ab@b.com');
      result.current.validateAsync('email', 'abc@b.com');
    });

    await act(async () => { vi.advanceTimersByTime(300); });
    await act(async () => {});

    // Validator should only have been called once (last debounce wins)
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith('abc@b.com', expect.any(AbortSignal));
  });

  it('aborts previous request when a new one fires', async () => {
    let firstSignal;
    const validator = vi.fn().mockImplementation(async (_, signal) => {
      firstSignal = signal;
      return null;
    });

    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 100 })
    );

    act(() => { result.current.validateAsync('email', 'first@b.com'); });
    await act(async () => { vi.advanceTimersByTime(100); });

    act(() => { result.current.validateAsync('email', 'second@b.com'); });
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => {});

    expect(firstSignal.aborted).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('useAsyncValidation — clearAsyncError', () => {
  it('clears error and touched state for a field', async () => {
    const validator = vi.fn().mockResolvedValue('Taken');
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 100 })
    );

    act(() => { result.current.validateAsync('email', 'taken@b.com'); });
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => {});

    expect(result.current.asyncErrors.email).toBe('Taken');

    act(() => { result.current.clearAsyncError('email'); });

    expect(result.current.asyncErrors.email).toBe(null);
    expect(result.current.asyncTouched.email).toBe(false);
    expect(result.current.hasAsyncErrors).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('useAsyncValidation — network error handling', () => {
  it('sets a generic error message on unexpected rejection', async () => {
    const validator = vi.fn().mockRejectedValue(new Error('Network failure'));
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 100 })
    );

    act(() => { result.current.validateAsync('email', 'test@b.com'); });
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => {});

    expect(result.current.asyncErrors.email).toBe(
      'Could not validate this field. Please try again.'
    );
  });

  it('does not set error on AbortError', async () => {
    const validator = vi.fn().mockRejectedValue(
      Object.assign(new Error('Aborted'), { name: 'AbortError' })
    );
    const { result } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 100 })
    );

    act(() => { result.current.validateAsync('email', 'test@b.com'); });
    await act(async () => { vi.advanceTimersByTime(100); });
    await act(async () => {});

    expect(result.current.asyncErrors.email).toBe(null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('useAsyncValidation — cleanup', () => {
  it('aborts all in-flight requests and clears timers on cleanup', async () => {
    const validator = vi.fn().mockResolvedValue(null);
    const { result, unmount } = renderHook(() =>
      useAsyncValidation({ email: validator }, { debounceMs: 500 })
    );

    act(() => { result.current.validateAsync('email', 'test@b.com'); });

    // Unmount before debounce fires
    unmount();

    // Advancing timers after unmount should not throw or update state
    await act(async () => { vi.advanceTimersByTime(500); });
    await act(async () => {});

    // Validator should never have been called since component unmounted
    expect(validator).not.toHaveBeenCalled();
  });
});
