# Low Bandwidth Mode Implementation

**Feature Request:** #11924 - "Low Bandwidth Mode" toggle for crowded festival environments

## Overview

This implementation adds a comprehensive "Low Bandwidth Mode" toggle to the Eventra application, specifically designed for large music festivals where cellular towers become overwhelmed. When enabled, the system optimizes bandwidth usage by:

1. **Replacing images with CSS placeholders** - No image requests are made, saving significant bandwidth
2. **Downgrading WebSockets to long-polling** - More reliable on poor connections with less overhead
3. **Aggressive JSON caching** - All JSON API responses are heavily cached via service workers

## Implementation Details

### 1. Core State Management

#### Files Modified:
- **`src/hooks/useUserPreferences.js`**
  - Added `lowBandwidthMode: false` to `GLOBAL_DEFAULTS` schema
  - This provides centralized state management with cross-tab sync

#### New Files Created:
- **`src/hooks/useLowBandwidthMode.js`**
  - Custom hook for easy access to low bandwidth mode state
  - Provides `isEnabled`, `toggle()`, `enable()`, `disable()` functions
  - Automatically dispatches custom events and notifies service worker

- **`src/utils/lowBandwidthMode.js`**
  - Utility functions for non-React contexts
  - `initializeLowBandwidthMode()` - Sync with service worker on app load
  - `isLowBandwidthModeEnabled()` - Direct localStorage check
  - `setLowBandwidthMode(enabled)` - Manual control

### 2. User Interface

#### Files Modified:
- **`src/Pages/Settings.js`**
  - Added Low Bandwidth Mode toggle section with Wifi/WifiOff icons
  - Integrated with existing preferences system
  - Added descriptive text explaining the feature

#### New Components:
- **`src/components/common/LowBandwidthImage.jsx`**
  - Smart image component that respects low bandwidth mode
  - When enabled: renders pure CSS placeholders with context-aware gradients
  - When disabled: falls back to LazyImage for normal operation
  - Features intelligent placeholder icons based on image type (speaker, event, sponsor, etc.)
  - Includes visual "Low BW" indicator

- **`src/styles/low-bandwidth-image.css`**
  - Complete styling for CSS placeholders
  - Dark mode support
  - Responsive design
  - Animated low bandwidth indicator

#### Modified Components:
- **`src/components/common/LazyImage.jsx`**
  - Added low bandwidth mode support
  - Automatically renders CSS placeholders when mode is enabled
  - Maintains all existing functionality when mode is disabled

- **`src/styles/lazy-image.css`**
  - Added `.lbw-active` styles for low bandwidth mode

### 3. Service Worker Integration

#### Files Modified:
- **`public/service-worker.js`**
  - Added `LOW_BANDWIDTH_CACHE_NAME` - Dedicated cache for low bandwidth mode
  - Added `LOW_BANDWIDTH_TTL` - 24-hour cache TTL for JSON payloads
  - Added message listener for low bandwidth mode changes from client
  - Added `handleLowBandwidthJsonFetch()` - Aggressive caching strategy for JSON
  - Modified fetch event listener to prioritize low bandwidth JSON caching
  - Automatic cache cleanup when low bandwidth mode is disabled

### 4. WebSocket Long-Polling Fallback

#### New Files Created:
- **`src/utils/WebSocketWithLongPolling.js`**
  - Enhanced WebSocket connection manager with automatic fallback
  - `WebSocketWithLongPolling` class with:
    - Automatic mode detection based on preferences
    - Seamless failover between WebSocket and long-polling
    - Message buffering when connection is down
    - Exponential backoff for reconnection
    - Memory leak prevention

- **`src/hooks/useWebSocketWithLongPolling.js`**
  - React hook wrapper for the WebSocketWithLongPolling class
  - Provides familiar hook interface: `send()`, `lastMessage`, `isConnected`, etc.
  - Automatic status updates when mode changes

### 5. Application Integration

#### Files Modified:
- **`src/App.jsx`**
  - Added `initializeLowBandwidthMode()` call on app mount
  - Ensures service worker is synchronized with current mode

### 6. Tests

#### New Test Files:
- **`src/hooks/useLowBandwidthMode.test.js`**
  - Tests for the useLowBandwidthMode hook
  - Covers toggle, enable, disable functionality
  - Tests event dispatching

- **`tests/lowBandwidthMode.test.js`**
  - Tests for utility functions
  - Covers initialization, state management, error handling

## Usage Examples

### Basic Image Usage
```jsx
import LowBandwidthImage from 'components/common/LowBandwidthImage';

// Automatic low bandwidth mode detection
<LowBandwidthImage 
  src="/path/to/speaker-headshot.jpg" 
  alt="Speaker headshot" 
  width={200} 
  height={200}
/>
```

### WebSocket with Long-Polling
```jsx
import useWebSocketWithLongPolling from 'hooks/useWebSocketWithLongPolling';

const { send, lastMessage, isConnected, isUsingLongPolling } = 
  useWebSocketWithLongPolling({
    url: 'wss://api.eventra.com/live-updates',
    longPollUrl: '/api/live-updates/poll',
  });

// Send message - automatically uses correct transport
send({ type: 'subscribe', eventId: 123 });

// Display connection info
<div>Connected: {isConnected ? 'Yes' : 'No'}</div>
<div>Using long-polling: {isUsingLongPolling ? 'Yes' : 'No'}</div>
```

### Direct Mode Control
```jsx
import useLowBandwidthMode from 'hooks/useLowBandwidthMode';

const { isEnabled, toggle, enable, disable } = useLowBandwidthMode();

// Toggle button
<button onClick={toggle}>
  {isEnabled ? 'Disable Low Bandwidth Mode' : 'Enable Low Bandwidth Mode'}
</button>

// Or explicit control
<button onClick={enable}>Enable Low Bandwidth Mode</button>
<button onClick={disable}>Disable Low Bandwidth Mode</button>
```

## Technical Features

### Bandwidth Optimization
- **Image Suppression**: All `<img>` tags are replaced with CSS-only placeholders when enabled
- **JSON Caching**: Aggressive 24-hour caching of all JSON API responses via service worker
- **WebSocket Fallback**: Automatic downgrade to long-polling with 5-second intervals

### User Experience
- **Visual Indicators**: "Low BW" badges on placeholders
- **Context-Aware Placeholders**: Different gradients/icons based on image type
- **Seamless Transition**: Automatic switching between modes
- **Cross-Tab Sync**: Preferences are synchronized across all browser tabs

### Performance Considerations
- **Service Worker Caching**: Dedicated cache prevents mixing with regular assets
- **Memory Management**: Proper cleanup of WebSocket and polling connections
- **Error Resilience**: Graceful fallback when service worker is not available
- **Offline Support**: Works in offline mode with cached JSON data

### Security
- **Sensitive Data**: Sensitive API endpoints are never cached (existing behavior maintained)
- **Cache Isolation**: Low bandwidth cache is separate from regular caches
- **Cache Invalidation**: Cache is automatically cleared when low bandwidth mode is disabled

## Migration Path

The implementation is fully backward compatible. Existing code will continue to work unchanged:

1. **Images**: Existing `<img>` and `LazyImage` components continue to work
2. **API Calls**: All existing API calls work normally
3. **WebSockets**: Existing WebSocket code continues to function
4. **Preferences**: New preference is added with default value of `false`

To take advantage of low bandwidth mode:
- Replace critical images with `LowBandwidthImage` component
- Replace WebSocket connections with `WebSocketWithLongPolling` or `useWebSocketWithLongPolling`
- Service worker JSON caching is automatic for all API endpoints

## Testing

The implementation includes comprehensive test coverage:
- Hook functionality tests
- Utility function tests
- Error handling tests
- State management tests
- Event dispatching tests

All tests follow existing patterns and can be run with the standard test suite.

## Browser Compatibility

- **Service Worker**: Available in all modern browsers
- **WebSocket**: Fallback to long-polling on unsupported browsers
- **localStorage**: Widely supported, with graceful fallbacks
- **Network Information API**: Used for detection but not required

## Future Enhancements

Potential areas for future improvement:
1. **Automatic Detection**: Use Network Information API to auto-enable when on slow connections
2. **Image Preloading**: Preload critical images when connection improves
3. **Delta Updates**: Request only changed data instead of full JSON payloads
4. **Compression**: Enable gzip/brotli compression for JSON responses
5. **Prefetch Control**: Disable prefetching of non-critical resources in low bandwidth mode