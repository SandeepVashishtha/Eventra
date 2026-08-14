/**
 * lowBandwidthMode.test.js
 *
 * Tests for low bandwidth mode utility functions
 */

import {
  initializeLowBandwidthMode,
  isLowBandwidthModeEnabled,
  setLowBandwidthMode,
} from '../src/utils/lowBandwidthMode';

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Mock window.serviceWorker
global.window = {
  serviceWorker: {
    controller: {
      postMessage: jest.fn(),
    },
    addEventListener: jest.fn(),
  },
  addEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

describe('lowBandwidthMode utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isLowBandwidthModeEnabled', () => {
    it('should return false when localStorage is empty', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = isLowBandwidthModeEnabled();
      expect(result).toBe(false);
    });

    it('should return false when localStorage has no lowBandwidthMode', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ theme: 'dark' }));
      
      const result = isLowBandwidthModeEnabled();
      expect(result).toBe(false);
    });

    it('should return true when lowBandwidthMode is true in localStorage', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ lowBandwidthMode: true }));
      
      const result = isLowBandwidthModeEnabled();
      expect(result).toBe(true);
    });

    it('should return false when lowBandwidthMode is false in localStorage', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ lowBandwidthMode: false }));
      
      const result = isLowBandwidthModeEnabled();
      expect(result).toBe(false);
    });

    it('should return false when localStorage has invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      const result = isLowBandwidthModeEnabled();
      expect(result).toBe(false);
    });
  });

  describe('setLowBandwidthMode', () => {
    it('should enable low bandwidth mode and update localStorage', () => {
      setLowBandwidthMode(true);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'eventra:prefs',
        JSON.stringify({ lowBandwidthMode: true })
      );
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

    it('should disable low bandwidth mode and update localStorage', () => {
      // First set some existing prefs
      localStorage.getItem.mockReturnValue(JSON.stringify({ theme: 'dark' }));
      
      setLowBandwidthMode(false);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'eventra:prefs',
        JSON.stringify({ theme: 'dark', lowBandwidthMode: false })
      );
    });

    it('should merge with existing preferences', () => {
      localStorage.getItem.mockReturnValue(
        JSON.stringify({ theme: 'dark', fontSize: 'large' })
      );
      
      setLowBandwidthMode(true);
      
      const expectedPrefs = { theme: 'dark', fontSize: 'large', lowBandwidthMode: true };
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'eventra:prefs',
        JSON.stringify(expectedPrefs)
      );
    });
  });

  describe('initializeLowBandwidthMode', () => {
    it('should do nothing in non-browser environment', () => {
      const originalWindow = global.window;
      delete global.window;
      
      initializeLowBandwidthMode();
      
      // Should not throw and should not call anything
      expect(localStorage.getItem).not.toHaveBeenCalled();
      
      global.window = originalWindow;
    });

    it('should read current low bandwidth mode from localStorage and notify service worker', () => {
      localStorage.getItem.mockReturnValue(JSON.stringify({ lowBandwidthMode: true }));
      
      initializeLowBandwidthMode();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('eventra:prefs');
      expect(window.serviceWorker.controller.postMessage).toHaveBeenCalledWith({
        type: 'LOW_BANDWIDTH_MODE_CHANGED',
        enabled: true,
      });
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      initializeLowBandwidthMode();
      
      expect(window.serviceWorker.controller.postMessage).toHaveBeenCalledWith({
        type: 'LOW_BANDWIDTH_MODE_CHANGED',
        enabled: false,
      });
    });

    it('should handle empty localStorage gracefully', () => {
      localStorage.getItem.mockReturnValue(null);
      
      initializeLowBandwidthMode();
      
      expect(window.serviceWorker.controller.postMessage).toHaveBeenCalledWith({
        type: 'LOW_BANDWIDTH_MODE_CHANGED',
        enabled: false,
      });
    });
  });
});