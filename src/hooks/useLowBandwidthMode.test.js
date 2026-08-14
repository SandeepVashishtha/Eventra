/**
 * useLowBandwidthMode.test.js
 *
 * Tests for the useLowBandwidthMode hook
 */

import { renderHook, act } from '@testing-library/react';
import useLowBandwidthMode from './useLowBandwidthMode';
import useUserPreferences from './useUserPreferences';

// Mock useUserPreferences
jest.mock('./useUserPreferences');

// Mock window.dispatchEvent
global.window = {
  dispatchEvent: jest.fn(),
  serviceWorker: {
    controller: {
      postMessage: jest.fn(),
    },
  },
};

describe('useLowBandwidthMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isEnabled as false by default', () => {
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: false },
      setPreference: jest.fn(),
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    expect(result.current.isEnabled).toBe(false);
  });

  it('should return isEnabled as true when preference is set', () => {
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: true },
      setPreference: jest.fn(),
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    expect(result.current.isEnabled).toBe(true);
  });

  it('should toggle low bandwidth mode and dispatch events', () => {
    const mockSetPreference = jest.fn();
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: false },
      setPreference: mockSetPreference,
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(mockSetPreference).toHaveBeenCalledWith('lowBandwidthMode', true);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lowBandwidthModeChanged',
        detail: { enabled: true },
      })
    );
    expect(window.serviceWorker.controller.postMessage).toHaveBeenCalledWith({
      type: 'LOW_BANDWIDTH_MODE_CHANGED',
      enabled: true,
    });
  });

  it('should enable low bandwidth mode and dispatch events', () => {
    const mockSetPreference = jest.fn();
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: false },
      setPreference: mockSetPreference,
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    act(() => {
      result.current.enable();
    });
    
    expect(mockSetPreference).toHaveBeenCalledWith('lowBandwidthMode', true);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lowBandwidthModeChanged',
        detail: { enabled: true },
      })
    );
  });

  it('should disable low bandwidth mode and dispatch events', () => {
    const mockSetPreference = jest.fn();
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: true },
      setPreference: mockSetPreference,
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    act(() => {
      result.current.disable();
    });
    
    expect(mockSetPreference).toHaveBeenCalledWith('lowBandwidthMode', false);
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'lowBandwidthModeChanged',
        detail: { enabled: false },
      })
    );
  });

  it('should not call setPreference if mode is already enabled', () => {
    const mockSetPreference = jest.fn();
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: true },
      setPreference: mockSetPreference,
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    act(() => {
      result.current.enable();
    });
    
    expect(mockSetPreference).not.toHaveBeenCalled();
  });

  it('should not call setPreference if mode is already disabled', () => {
    const mockSetPreference = jest.fn();
    useUserPreferences.mockReturnValue({
      preferences: { lowBandwidthMode: false },
      setPreference: mockSetPreference,
    });

    const { result } = renderHook(() => useLowBandwidthMode());
    
    act(() => {
      result.current.disable();
    });
    
    expect(mockSetPreference).not.toHaveBeenCalled();
  });
});