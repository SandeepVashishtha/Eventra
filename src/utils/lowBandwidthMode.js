/**
 * lowBandwidthMode.js
 *
 * Utility functions for Low Bandwidth Mode that can be used throughout the app.
 * This includes service worker initialization and synchronization.
 */

/**
 * Initialize service worker with current low bandwidth mode setting.
 * Call this when your app loads to ensure service worker is aware of the current mode.
 */
export function initializeLowBandwidthMode() {
  if (typeof window === 'undefined') return;
  
  try {
    // Read current low bandwidth mode from localStorage
    const prefsRaw = localStorage.getItem('eventra:prefs');
    let isEnabled = false;
    
    if (prefsRaw) {
      try {
        const prefs = JSON.parse(prefsRaw);
        isEnabled = prefs.lowBandwidthMode || false;
      } catch {
        isEnabled = false;
      }
    }
    
    // Notify service worker of current state
    if ('serviceWorker' in navigator && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'LOW_BANDWIDTH_MODE_CHANGED',
        enabled: isEnabled,
      }).catch(() => {
        // Service worker might not be ready yet
      });
    }
    
    // Also set up a listener for when service worker becomes available
    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'LOW_BANDWIDTH_MODE_CHANGED',
          enabled: isEnabled,
        }).catch(() => {});
      }
    });
  } catch {
    // Ignore any errors during initialization
  }
}

/**
 * Check if low bandwidth mode is currently enabled.
 * Uses localStorage directly for cases where we can't use the React hook.
 */
export function isLowBandwidthModeEnabled() {
  if (typeof window === 'undefined') return false;
  
  try {
    const prefsRaw = localStorage.getItem('eventra:prefs');
    if (prefsRaw) {
      const prefs = JSON.parse(prefsRaw);
      return prefs.lowBandwidthMode || false;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Manually set low bandwidth mode and notify service worker.
 * Useful for non-React contexts.
 */
export function setLowBandwidthMode(enabled) {
  if (typeof window === 'undefined') return;
  
  try {
    // Update localStorage
    const prefsRaw = localStorage.getItem('eventra:prefs');
    let prefs = { lowBandwidthMode: enabled };
    
    if (prefsRaw) {
      try {
        prefs = { ...JSON.parse(prefsRaw), lowBandwidthMode: enabled };
      } catch {
        prefs = { lowBandwidthMode: enabled };
      }
    }
    
    localStorage.setItem('eventra:prefs', JSON.stringify(prefs));
    
    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent("lowBandwidthModeChanged", {
        detail: { enabled },
      })
    );
    
    // Notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'LOW_BANDWIDTH_MODE_CHANGED',
        enabled: enabled,
      }).catch(() => {});
    }
  } catch {
    // Ignore any errors
  }
}