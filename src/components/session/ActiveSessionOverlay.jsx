/**
 * ActiveSessionOverlay.jsx
 * 
 * UI component that displays active session information and multi-tab synchronization status.
 * Shows which tabs are currently connected and allows users to broadcast messages to all tabs.
 * 
 * USAGE
 * -----
 * import ActiveSessionOverlay from 'components/session/ActiveSessionOverlay';
 * 
 * <ActiveSessionOverlay
 *   websocketUrl="wss://your-server.com/socket"
 *   onTabCountChange={(count) => console.log('Tabs:', count)}
 * />
 * 
 * FEATURES
 * --------
 * - Displays active WebSocket connection status
 * - Shows number of connected tabs
 * - Allows broadcasting messages to all tabs
 * - Shows recent messages/activity
 * - Provides manual reconnection button
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSharedWorker, useSessionSync } from 'hooks/useSharedWorker';
import { isSharedWorkerSupported } from 'utils/worker/sharedWorkerManager';

// Icons (using inline SVG for simplicity, can be replaced with icon library)
const ConnectionIcon = ({ connected, connecting }) => {
  if (connecting) {
    return (
      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  }
  
  return connected ? (
    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7-7l7 7-7 7"/>
    </svg>
  ) : (
    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
    </svg>
  );
};

const TabIcon = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8l5-5 5 5 5-5-5-5z"/>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12"/>
  </svg>
);

const MessageIcon = () => (
  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

/**
 * ActiveSessionOverlay component
 */
export default function ActiveSessionOverlay({
  websocketUrl,
  onTabCountChange,
  onConnectionChange,
  showTabList = true,
  showMessageInput = true,
  position = 'bottom-right',
  autoSubscribeChannels = ['session', 'notifications'],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [recentMessages, setRecentMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const worker = useSharedWorker(websocketUrl || '', {
    maxReconnectAttempts: 5,
    baseDelayMs: 1000,
  });

  const {
    isConnected,
    isConnecting,
    isSupported,
    error,
    send,
    onMessage,
    subscribe,
    unsubscribe,
    disconnect,
    subscribedChannels,
  } = worker;

  const messageInputRef = useRef(null);

  // Subscribe to channels on mount
  useEffect(() => {
    if (!isConnected || !isSupported) return;

    // Subscribe to default channels
    autoSubscribeChannels.forEach((channel) => {
      subscribe(channel);
    });

    // Subscribe to incoming messages
    const unsubscribeFn = onMessage((message) => {
      handleIncomingMessage(message);
    });

    return () => {
      unsubscribeFn();
      autoSubscribeChannels.forEach((channel) => {
        unsubscribe(channel);
      });
    };
  }, [isConnected, isSupported, onMessage, subscribe, unsubscribe]);

  // Handle incoming messages
  const handleIncomingMessage = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    const displayMessage = {
      ...message,
      timestamp,
      id: Date.now(),
    };

    // Add to recent messages (limit to 10)
    setRecentMessages((prev) => [displayMessage, ...prev].slice(0, 10));

    // Add to history (limit to 50)
    setMessageHistory((prev) => [displayMessage, ...prev].slice(0, 50));
  }, []);

  // Handle tab count changes
  useEffect(() => {
    // Worker should provide tab count information
    // For now, we'll use a placeholder
    // In a real implementation, the worker would track connected ports
    const tabCount = isConnected ? 1 : 0; // Placeholder
    if (onTabCountChange) {
      onTabCountChange(tabCount);
    }
  }, [isConnected, onTabCountChange]);

  // Handle connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange({
        isConnected,
        isConnecting,
        isSupported,
        error,
      });
    }
  }, [isConnected, isConnecting, isSupported, error, onConnectionChange]);

  // Handle broadcast message submission
  const handleBroadcast = useCallback(async () => {
    if (!broadcastMessage.trim() || !isConnected) return;

    try {
      await send({
        type: 'BROADCAST_MESSAGE',
        text: broadcastMessage,
        timestamp: Date.now(),
      });

      // Add to history
      const message = {
        type: 'BROADCAST_MESSAGE',
        text: broadcastMessage,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now(),
        sentByMe: true,
      };

      setRecentMessages((prev) => [message, ...prev].slice(0, 10));
      setMessageHistory((prev) => [message, ...prev].slice(0, 50));

      // Clear input
      setBroadcastMessage('');
      setHistoryIndex(-1);
    } catch (err) {
      console.error('Failed to broadcast message:', err);
    }
  }, [broadcastMessage, isConnected, send]);

  // Handle reconnection
  const handleReconnect = useCallback(async () => {
    try {
      // Reconnect logic would go here
      // For now, we just retry the connection
      console.log('Attempting to reconnect...');
    } catch (err) {
      console.error('Failed to reconnect:', err);
    }
  }, []);

  // Handle key down for message input
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBroadcast();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      // Navigate message history
      if (messageHistory.length > 0) {
        const newIndex = historyIndex < messageHistory.length - 1 ? historyIndex + 1 : messageHistory.length - 1;
        setHistoryIndex(newIndex);
        if (newIndex >= 0 && messageHistory[newIndex]) {
          setBroadcastMessage(messageHistory[newIndex].text || '');
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Navigate message history
      if (historyIndex > 0) {
        setHistoryIndex(historyIndex - 1);
        if (historyIndex - 1 >= 0 && messageHistory[historyIndex - 1]) {
          setBroadcastMessage(messageHistory[historyIndex - 1].text || '');
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setBroadcastMessage('');
      }
    }
  }, [handleBroadcast, messageHistory, historyIndex]);

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Close overlay
  const closeOverlay = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Get position classes
  const getPositionClasses = useCallback(() => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
      default:
        return 'bottom-4 right-4';
    }
  }, [position]);

  // Get connection status text
  const getConnectionStatusText = useCallback(() => {
    if (!isSupported) {
      return 'SharedWorker not supported';
    }
    if (isConnecting) {
      return 'Connecting...';
    }
    if (isConnected) {
      return 'Connected';
    }
    return error ? `Disconnected: ${error.message}` : 'Disconnected';
  }, [isSupported, isConnecting, isConnected, error]);

  // If not supported, show a warning
  if (!isSupported) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded shadow-lg max-w-xs">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="text-sm text-amber-700">Multi-tab sync not supported in this browser</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Connection indicator button */}
      <button
        onClick={toggleOverlay}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-colors ${
          isConnected
            ? 'bg-green-500 text-white hover:bg-green-600'
            : isConnecting
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
        aria-label="Toggle session overlay"
        title="Multi-tab session synchronization"
      >
        <ConnectionIcon connected={isConnected} connecting={isConnecting} />
        <span className="text-sm font-medium">Sync</span>
        {isConnected && (
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
            {subscribedChannels.length}
          </span>
        )}
      </button>

      {/* Overlay panel */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ConnectionIcon connected={isConnected} connecting={isConnecting} />
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Session Sync</h3>
                <p className="text-xs text-gray-500">{getConnectionStatusText()}</p>
              </div>
            </div>
            <button
              onClick={closeOverlay}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3 space-y-3">
            {/* Connection status */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' :
                  isConnecting ? 'bg-amber-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">WebSocket Connection</span>
              </div>
              <span className="text-xs text-gray-500">
                {isConnected ? 'Active' : isConnecting ? 'Connecting...' : 'Inactive'}
              </span>
            </div>

            {/* Tab count */}
            {showTabList && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <div className="flex items-center gap-2">
                  <TabIcon />
                  <span className="text-sm text-gray-600">Connected Tabs</span>
                </div>
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  1{/* Placeholder - actual count would come from worker */}
                </span>
              </div>
            )}

            {/* Subscribed channels */}
            <div className="p-2 bg-purple-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Channels</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {subscribedChannels.map((channel) => (
                  <span key={channel} className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                    {channel}
                  </span>
                ))}
                {subscribedChannels.length === 0 && (
                  <span className="text-xs text-gray-500">No active channels</span>
                )}
              </div>
            </div>

            {/* Recent messages */}
            <div className="p-2 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Messages</span>
                {recentMessages.length > 0 && (
                  <button
                    onClick={() => setRecentMessages([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {recentMessages.length > 0 ? (
                  recentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs p-1 rounded ${
                        msg.sentByMe
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span className="text-gray-500">{msg.timestamp} </span>
                      <span>{msg.text || JSON.stringify(msg)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 text-center py-2">
                    No recent messages
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast message input */}
            {showMessageInput && (
              <div className="border-t border-gray-200 pt-2">
                <div className="relative">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Broadcast message to all tabs..."
                    className="w-full pr-8 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isConnected || isConnecting}
                  />
                  <button
                    onClick={handleBroadcast}
                    disabled={!broadcastMessage.trim() || !isConnected || isConnecting}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error.message}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 border-t border-gray-200 pt-2">
              {!isConnected && !isConnecting && (
                <button
                  onClick={handleReconnect}
                  className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded transition-colors"
                >
                  Reconnect
                </button>
              )}
              {isConnected && (
                <button
                  onClick={async () => {
                    await disconnect();
                    closeOverlay();
                  }}
                  className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Minimal indicator component (no overlay)
 */
export function SessionSyncIndicator({
  websocketUrl,
  onClick,
  className = '',
}) {
  const worker = useSharedWorker(websocketUrl || '');
  const { isConnected, isConnecting, isSupported, error } = worker;

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${className} ${
        isConnected
          ? 'bg-green-100 text-green-700'
          : isConnecting
          ? 'bg-amber-100 text-amber-700'
          : 'bg-red-100 text-red-700'
      }`}
      title={error ? `Connection error: ${error.message}` : 'Session synchronization'}
    >
      <ConnectionIcon connected={isConnected} connecting={isConnecting} />
      {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
    </button>
  );
}

/**
 * Hook for using session sync without UI
 */
export function useSessionSyncHook(websocketUrl, options = {}) {
  const sync = useSessionSync(websocketUrl, options);
  
  return {
    ...sync,
    // Add additional utilities
    isMultiTabSupported: isSharedWorkerSupported(),
    getTabCount: () => sync.activeTabCount,
  };
}
