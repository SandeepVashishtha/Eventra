# Multi-Tab Session Synchronization

A **Shared Worker**-based solution for synchronizing real-time events and WebSocket connections across multiple browser tabs in Eventra.

## Problem

Opening multiple Eventra tabs creates:
- Multiple WebSocket connections to the server
- Duplicate notifications being delivered to each tab
- Wasted server resources managing redundant connections
- Inconsistent state across tabs

## Solution

This implementation uses **Shared Workers** to create a single WebSocket connection that is shared across all open tabs. Tabs communicate with the worker via `MessagePort` objects, and all server traffic is routed through this centralized worker.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Tab 1                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  React Component │───▶│ MessageChannel   │───▶│ SharedWorker │ │
│  └─────────────────┘    └─────────────────┘    └────────┬────┘ │
└─────────────────────────────────────────────────────────────────┘
                                                   ▲
                                                   │
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Tab 2                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  React Component │───▶│ MessageChannel   │───▶│             │ │
│  └─────────────────┘    └─────────────────┘    │             │ │
└─────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                                           ┌───────────────────┐
                                           │   WebSocket       │
                                           │   Connection      │
                                           │   (Single)        │
                                           └────────┬──────────┘
                                                    │
                                                    ▼
                                           ┌───────────────────┐
                                           │   Eventra Server  │
                                           └───────────────────┘
```

## Files

### Core Implementation

| File | Purpose |
|------|---------|
| [`sharedEnclaveWorker.js`](./sharedEnclaveWorker.js) | The Shared Worker that runs in a separate thread |
| [`sharedWorkerManager.js`](./sharedWorkerManager.js) | Client-side API for communicating with the worker |

### React Integration

| File | Purpose |
|------|---------|
| [`useSharedWorker.js`](../../hooks/useSharedWorker.js) | React hook for easy integration |
| [`ActiveSessionOverlay.jsx`](../../components/session/ActiveSessionOverlay.jsx) | UI component for displaying sync status |

## Usage

### Basic Setup

1. **Start the Shared Worker** in your application entry point:

```javascript
// In App.jsx or main.jsx
import { startSharedWorker } from 'utils/worker/sharedWorkerManager';

// Start the worker with your WebSocket URL
startSharedWorker('wss://your-eventra-server.com/socket');
```

2. **Use the hook** in your components:

```javascript
import useSharedWorker from 'hooks/useSharedWorker';

function MyComponent() {
  const { 
    send, 
    onMessage, 
    isConnected, 
    isConnecting,
    error 
  } = useSharedWorker('wss://your-eventra-server.com/socket');

  // Send a message through the shared connection
  const sendNotification = () => {
    send({ 
      type: 'NOTIFICATION', 
      payload: { text: 'Hello from all tabs!' } 
    });
  };

  // Subscribe to incoming messages
  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      console.log('Received:', message);
    });
    return unsubscribe;
  }, [onMessage]);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendNotification} disabled={!isConnected}>
        Send to All Tabs
      </button>
    </div>
  );
}
```

### With Session Synchronization

```javascript
import { useSessionSync } from 'hooks/useSharedWorker';

function SessionAwareComponent() {
  const { 
    broadcastSessionState, 
    activeTabCount, 
    isConnected 
  } = useSessionSync('wss://your-server.com/socket');

  // Broadcast current session state to all tabs
  const syncState = () => {
    broadcastSessionState({
      userId: currentUser.id,
      preferences: userPreferences,
      lastAction: 'UPDATE_PREFERENCES'
    });
  };

  return (
    <div>
      <p>Connected tabs: {activeTabCount}</p>
      <p>Sync status: {isConnected ? 'Active' : 'Inactive'}</p>
      <button onClick={syncState}>Sync Preferences</button>
    </div>
  );
}
```

### With UI Component

```javascript
import { ActiveSessionOverlay, SessionSyncIndicator } from 'components/session';

function App() {
  return (
    <>
      {/* Full overlay with sync management UI */}
      <ActiveSessionOverlay 
        websocketUrl="wss://your-server.com/socket"
        onTabCountChange={(count) => console.log(`Tabs: ${count}`)}
        position="bottom-right"
      />

      {/* Or just a simple indicator */}
      <SessionSyncIndicator 
        websocketUrl="wss://your-server.com/socket"
      />
    </>
  );
}
```

## API Reference

### Shared Worker Manager (`sharedWorkerManager.js`)

#### `isSharedWorkerSupported()`
Check if the browser supports SharedWorker API.

```javascript
if (isSharedWorkerSupported()) {
  // Safe to use Shared Worker
}
```

#### `startSharedWorker(url, options)`
Initialize the Shared Worker with a WebSocket URL.

**Parameters:**
- `url` (string): WebSocket server URL
- `options` (object): Configuration options
  - `maxReconnectAttempts` (number): Maximum reconnection attempts (default: 5)
  - `baseDelayMs` (number): Base delay for exponential backoff (default: 1000)
  - `maxDelayMs` (number): Maximum delay between reconnections (default: 30000)
  - `pingIntervalMs` (number): Ping interval for connection health (default: 30000)
  - `pongTimeoutMs` (number): Timeout for pong response (default: 10000)

**Returns:** Promise<SharedWorker>

#### `sendToWorker(message, queueIfNotReady)`
Send a message to the Shared Worker.

**Parameters:**
- `message` (object): Message to send
- `queueIfNotReady` (boolean): Whether to queue if worker not ready (default: true)

**Returns:** Promise<boolean>

#### `subscribeToWorker(callback)`
Subscribe to messages from the Shared Worker.

**Parameters:**
- `callback` (function): Function to receive messages

**Returns:** Function to unsubscribe

#### `getWorkerStatus()`
Get current worker and connection status.

**Returns:** Object with:
- `isInitialized`: Whether worker is initialized
- `isSupported`: Whether SharedWorker is supported
- `hasWorker`: Whether worker instance exists
- `config`: Current configuration
- `listenerCount`: Number of message listeners
- `queuedMessageCount`: Number of queued messages

#### `getConnectionStatus()`
Get connection status from the worker.

**Returns:** Promise<Object> with:
- `isConnected`: Whether WebSocket is connected
- `isConnecting`: Whether connection is in progress
- `reconnectAttempts`: Number of reconnection attempts
- `messageQueueLength`: Number of queued messages in worker
- `clientCount`: Number of connected client tabs
- `subscriptionChannels`: Array of subscribed channels
- `lastPongTime`: Timestamp of last pong response

#### `subscribeToChannel(channel)`
Subscribe to a message channel.

**Parameters:**
- `channel` (string): Channel name to subscribe to

**Returns:** Promise<boolean>

#### `unsubscribeFromChannel(channel)`
Unsubscribe from a message channel.

**Parameters:**
- `channel` (string): Channel name to unsubscribe from

**Returns:** Promise<boolean>

#### `disconnectWorker()`
Disconnect and terminate the Shared Worker.

**Returns:** Promise<boolean>

#### `reconnectWorker()`
Reconnect the WebSocket connection.

**Returns:** Promise<boolean>

#### `setWorkerUrl(url)`
Set the URL for the Shared Worker script (useful for testing).

**Parameters:**
- `url` (string): Worker script URL

### React Hook (`useSharedWorker`)

```javascript
const {
  send,
  onMessage,
  subscribe,
  unsubscribe,
  isConnected,
  isConnecting,
  isSupported,
  error,
  status,
  subscribedChannels,
  messageQueue,
  disconnect,
  onConnect,
} = useSharedWorker(url, options);
```

**Properties:**
- `send(message)`: Send a message through the worker
- `onMessage(callback)`: Subscribe to incoming messages, returns unsubscribe function
- `subscribe(channel)`: Subscribe to a channel
- `unsubscribe(channel)`: Unsubscribe from a channel
- `isConnected`: Whether WebSocket is connected
- `isConnecting`: Whether connection is in progress
- `isSupported`: Whether SharedWorker is supported
- `error`: Current error (if any)
- `status`: Full status object
- `subscribedChannels`: Array of subscribed channels
- `messageQueue`: Array of recent messages
- `disconnect()`: Disconnect the worker
- `onConnect(callback)`: Subscribe to connection status changes

### Session Sync Hook (`useSessionSync`)

```javascript
const {
  send,
  onMessage,
  isConnected,
  isConnecting,
  error,
  disconnect,
  activeSessions,
  activeTabCount,
  broadcastSessionState,
  requestSessionState,
  subscribe,
  unsubscribe,
} = useSessionSync(url, options);
```

**Additional Properties:**
- `activeSessions`: Map of active sessions across tabs
- `activeTabCount`: Number of connected tabs
- `broadcastSessionState(state)`: Broadcast state to all tabs
- `requestSessionState()`: Request current state from worker

## Message Types

The Shared Worker supports the following message types:

### Client → Worker
- `CONFIGURE`: Configure worker settings
- `CONNECT`: Establish WebSocket connection
- `DISCONNECT`: Close WebSocket connection
- `SEND`: Send message to server
- `SUBSCRIBE`: Subscribe to a channel
- `UNSUBSCRIBE`: Unsubscribe from a channel
- `GET_STATUS`: Request connection status
- `PING`: Test connectivity

### Worker → Client
- `WORKER_INIT`: Worker initialized, sending current state
- `CONNECTED`: WebSocket connection established
- `DISCONNECTED`: WebSocket connection closed
- `ERROR`: Error occurred
- `MESSAGE`: Message received from server
- `SUBSCRIPTIONS_UPDATED`: Channel subscriptions changed
- `STATUS`: Current connection status
- `PONG`: Response to PING

## Features

### ✅ Single WebSocket Connection
All tabs share a single WebSocket connection to the server, reducing resource usage.

### ✅ Real-Time Synchronization
State changes in one tab are immediately broadcast to all other connected tabs.

### ✅ Automatic Reconnection
Exponential backoff reconnection with configurable retry limits.

### ✅ Message Buffering
Messages are queued when the connection is down and sent automatically when reconnected.

### ✅ Connection Health Monitoring
Ping/pong mechanism to detect dead connections.

### ✅ Channel Subscription
Subscribe to specific message channels for targeted message routing.

### ✅ Graceful Cleanup
Proper cleanup of resources when tabs are closed or worker is terminated.

### ✅ Browser Compatibility
Falls back gracefully when SharedWorker is not supported.

## Configuration

### Setting Worker URL

In production, you may need to configure the worker URL:

```javascript
// In your build configuration or entry file
import { setWorkerUrl } from 'utils/worker/sharedWorkerManager';

setWorkerUrl('/static/sharedEnclaveWorker.js');
```

Or via window global:

```javascript
window.SHARED_WORKER_URL = '/static/sharedEnclaveWorker.js';
```

### Environment Detection

The worker automatically detects if it's running in a supported environment and falls back gracefully when SharedWorker is not available.

## Testing

Run the test suite:

```bash
npm test -- src/utils/worker/sharedEnclaveWorker.test.js
```

## Browser Support

SharedWorker is supported in:
- Chrome 4+ 
- Edge 12+
- Firefox 11+
- Safari 6+
- Opera 10.6+

Note: Safari has some limitations with SharedWorker in certain contexts.

## Performance Considerations

- **Memory**: The Shared Worker runs in a separate thread and has its own memory space
- **Connection**: Only one WebSocket connection is maintained regardless of tab count
- **Message Routing**: Messages are broadcast to all tabs with minimal overhead
- **Serialization**: All messages are serialized/deserialized when passing between tabs and worker

## Security

- **Origin Policy**: Shared Workers can only be accessed by pages from the same origin
- **Message Validation**: All incoming messages are parsed and validated
- **Error Isolation**: Errors in one tab's message handler don't affect other tabs

## Troubleshooting

### Worker not starting
- Check that the worker script is served at the correct URL
- Verify SharedWorker is supported in your browser
- Check for JavaScript errors in the console

### Connection issues
- Verify the WebSocket URL is correct
- Check that the server supports WebSocket connections
- Ensure CORS headers are properly configured

### Messages not received
- Verify both the client and server are using the same message format
- Check that channel subscriptions match
- Look for errors in the console

## License

This code is part of Eventra and is licensed under the same terms as the parent project.
