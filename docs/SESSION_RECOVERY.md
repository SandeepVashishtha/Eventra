# Session Recovery & Reconnect System

## Overview

The Session Recovery & Reconnect System allows users to seamlessly resume their activity after network interruptions, accidental tab closures, or page refreshes. This feature ensures that user sessions are resilient and can recover gracefully without losing progress.

**For comprehensive context, see:** [Architecture & Roles: Real-Time & Offline Features](docs/ARCHITECTURE_AND_ROLES.md#-real-time--offline-features)

## Features

- **Automatic Session Persistence**: Session state is automatically saved to localStorage with debouncing
- **Network Connectivity Detection**: Real-time detection of online/offline status with visual feedback
- **Session Restoration**: Users can restore their previous session when returning to the app
- **Inactivity Timeout**: Sessions automatically expire after 30 minutes of inactivity
- **UI Feedback**: Clear visual indicators for network status and session recovery prompts

## Architecture

### Components

#### 1. SessionRecoveryContext (`src/context/SessionRecoveryContext.js`)

Core context provider that manages:
- Session state persistence to localStorage
- Network connectivity monitoring
- Session timeout handling
- Activity tracking

**Key Functions:**
- `saveSession(state)`: Saves session state with 1-second debounce
- `clearSession()`: Clears saved session data
- `restoreSession()`: Returns saved session data
- `dismissRecoveryPrompt()`: Hides the recovery prompt

#### 2. SessionRecovery Component (`src/components/SessionRecovery.js`)

UI component that displays:
- Offline status indicator (red)
- Reconnecting status indicator (yellow)
- Back online notification (green)
- Session restoration prompt with restore/dismiss options

#### 3. Integration in App.js

The system is integrated at the app level:
```jsx
<SessionRecoveryProvider>
  {/* App content */}
  <SessionRecovery />
</SessionRecoveryProvider>
```

## Usage

### Basic Integration

To add session recovery to any component:

```jsx
import { useSessionRecovery } from '../context/SessionRecoveryContext';

const MyComponent = () => {
  const { saveSession, clearSession } = useSessionRecovery();
  
  // Save session state when data changes
  useEffect(() => {
    saveSession({
      page: 'my-page',
      // Your component state here
    });
  }, [yourState, saveSession]);
  
  // Clear session after completion
  const handleComplete = () => {
    clearSession();
    // ... other logic
  };
};
```

### Session Restoration

To restore session data when the user clicks "Restore Session":

```jsx
useEffect(() => {
  const handleSessionRestored = (event) => {
    const restoredData = event.detail;
    if (restoredData?.page === 'my-page') {
      // Restore your component state
      setYourState(restoredData.yourState);
    }
  };

  window.addEventListener('sessionRestored', handleSessionRestored);
  return () => window.removeEventListener('sessionRestored', handleSessionRestored);
}, []);
```

## Example Implementation

See `src/Pages/Events/EventRegistration.js` for a complete example of:
- Saving form data as user types
- Restoring form data on session recovery
- Clearing session after successful submission

## Configuration

### Session Timeout

Default timeout is 30 minutes. To change this, modify `SESSION_TIMEOUT` in `SessionRecoveryContext.js`:

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
```

### Debounce Delay

Default save debounce is 1 second. To change this, modify the timeout in `saveSession`:

```javascript
saveTimeoutRef.current = setTimeout(() => {
  // ... save logic
}, 1000); // Change to desired milliseconds
```

## Storage

Session data is stored in localStorage under the key `eventra_session_state`. The stored object includes:

```javascript
{
  page: string,           // Page identifier
  // ... your custom fields
  timestamp: number,      // When session was saved
  lastActivity: number,   // Last user activity timestamp
}
```

## Network Status

The system automatically detects network changes:
- **Offline**: Shows red indicator with "You're offline" message
- **Reconnecting**: Shows yellow indicator with spinning refresh icon
- **Online**: Shows green indicator with "You're back online" message

## Best Practices

1. **Identify Your Pages**: Always include a `page` field in your session data to identify which component should restore it
2. **Clear on Completion**: Always call `clearSession()` after successful completion of a workflow
3. **Validate Restored Data**: Always validate restored data before applying it to your state
4. **Minimal State**: Only save essential state data to avoid localStorage quota issues
5. **User Feedback**: Provide clear feedback when session is restored (e.g., toast notification)

## Troubleshooting

### Session Not Saving

- Check browser localStorage is enabled
- Verify localStorage quota is not exceeded
- Check console for errors

### Session Not Restoring

- Ensure component is listening for `sessionRestored` event
- Verify `page` field matches in save and restore logic
- Check session hasn't expired (30-minute timeout)

### Network Status Not Updating

- Verify browser supports online/offline events
- Check if other extensions are interfering
- Test by actually disconnecting network

## Future Enhancements

Potential improvements:
- Backend session persistence for cross-device sync
- Multiple session support (e.g., multiple forms)
- Session export/import functionality
- More granular timeout settings per page
- Session analytics and reporting

## License

This feature is part of the Eventra project and follows the same license.
