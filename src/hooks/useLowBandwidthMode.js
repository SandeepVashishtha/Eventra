/**
 * useLowBandwidthMode.js
 *
 * Custom hook for accessing and managing Low Bandwidth Mode preference.
 * This hook provides easy access to the low bandwidth mode state and
 * automatically dispatches custom events when the mode changes.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * At large music festivals, cellular towers become completely overwhelmed.
 * Attendees trying to load the Eventra schedule or map often face infinite
 * loading spinners because the app is trying to fetch high-res speaker headshots
 * and sponsor logos.
 *
 * This hook provides a centralized way to:
 * - Check if low bandwidth mode is enabled
 * - Toggle low bandwidth mode
 * - Be notified when low bandwidth mode changes
 *
 * FEATURES
 * --------
 *  1. Easy access to low bandwidth mode state
 *  2. Toggle functionality with automatic event dispatch
 *  3. Cross-tab synchronization via useUserPreferences
 *  4. Custom event dispatching for global state changes
 *
 * USAGE
 * -----
 *   import useLowBandwidthMode from 'hooks/useLowBandwidthMode';
 *
 *   const { isEnabled, toggle, enable, disable } = useLowBandwidthMode();
 *
 *   // Check if enabled
 *   if (isEnabled) {
 *     // Use low bandwidth optimizations
 *   }
 *
 *   // Toggle the mode
 *   <button onClick={toggle}>Toggle Low Bandwidth Mode</button>
 *
 *   // Enable/disable explicitly
 *   <button onClick={enable}>Enable Low Bandwidth Mode</button>
 *   <button onClick={disable}>Disable Low Bandwidth Mode</button>
 */

import useUserPreferences from "./useUserPreferences";

/**
 * Custom hook for managing Low Bandwidth Mode preference.
 *
 * @returns {{
 *   isEnabled: boolean,
 *   toggle: () => void,
 *   enable: () => void,
 *   disable: () => void,
 * }}
 */
const useLowBandwidthMode = () => {
  const { preferences, setPreference } = useUserPreferences();
  const isEnabled = preferences.lowBandwidthMode || false;

  /**
   * Notify service worker about low bandwidth mode change
   */
  const notifyServiceWorker = (enabled) => {
    // Check if service worker is available and ready
    if ('serviceWorker' in navigator && navigator.serviceWorker?.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'LOW_BANDWIDTH_MODE_CHANGED',
          enabled: enabled,
        });
      } catch {
        // Service worker might not be ready, that's okay
      }
    }
  };

  /**
   * Toggle low bandwidth mode on/off and dispatch custom events.
   */
  const toggle = () => {
    const newValue = !isEnabled;
    setPreference("lowBandwidthMode", newValue);
    
    // Dispatch custom event for global state management
    window.dispatchEvent(
      new CustomEvent("lowBandwidthModeChanged", {
        detail: { enabled: newValue },
      })
    );
    
    // Notify service worker
    notifyServiceWorker(newValue);
  };

  /**
   * Enable low bandwidth mode and dispatch custom events.
   */
  const enable = () => {
    if (!isEnabled) {
      setPreference("lowBandwidthMode", true);
      window.dispatchEvent(
        new CustomEvent("lowBandwidthModeChanged", {
          detail: { enabled: true },
        })
      );
      
      // Notify service worker
      notifyServiceWorker(true);
    }
  };

  /**
   * Disable low bandwidth mode and dispatch custom events.
   */
  const disable = () => {
    if (isEnabled) {
      setPreference("lowBandwidthMode", false);
      window.dispatchEvent(
        new CustomEvent("lowBandwidthModeChanged", {
          detail: { enabled: false },
        })
      );
      
      // Notify service worker
      notifyServiceWorker(false);
    }
  };

  return {
    isEnabled,
    toggle,
    enable,
    disable,
  };
};

export default useLowBandwidthMode;