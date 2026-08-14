/**
 * CoOrganizerPresenceBar - Collaborative Yjs-based Multi-Track Event Scheduler (#17674)
 * Displays real-time presence information for co-organizers editing the schedule.
 * Shows cursor positions, user names, and status indicators.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Users, Clock, Activity, X, User, MousePointer } from 'lucide-react';

/**
 * CoOrganizerPresenceBar component
 * Displays presence information for all connected co-organizers
 * 
 * @param {object} props - Component props
 * @param {Array} props.presence - Array of presence objects from CRDT store
 * @param {string} props.currentUserId - ID of the current user
 * @param {object} props.cursorPositions - Map of user IDs to cursor positions
 * @param {Function} props.onDisconnect - Callback when disconnect button is clicked
 * @param {string} props.roomId - Current room/document identifier
 */
const CoOrganizerPresenceBar = ({
  presence = [],
  currentUserId,
  cursorPositions = {},
  onDisconnect,
  roomId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastActivity, setLastActivity] = useState({});

  // Generate a unique color for each user
  const getUserColor = (userId) => {
    const colors = [
      '#ef4444', // red
      '#f97316', // orange
      '#f59e0b', // amber
      '#84cc16', // lime
      '#22c55e', // green
      '#10b981', // emerald
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#0ea5e9', // sky
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#a855f7', // purple
      '#ec4899', // pink
      '#f43f5e', // rose
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Update last activity times
  useEffect(() => {
    const interval = setInterval(() => {
      setLastActivity(prev => {
        const newActivity = { ...prev };
        presence.forEach(user => {
          newActivity[user.userId] = Date.now();
        });
        return newActivity;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [presence]);

  // Sort presence by last seen (most recent first)
  const sortedPresence = useMemo(() => {
    return [...presence]
      .filter(user => user.userId !== currentUserId)
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  }, [presence, currentUserId]);

  // Get active cursor count
  const activeCursorCount = useMemo(() => {
    return Object.keys(cursorPositions).length;
  }, [cursorPositions]);

  // Check if user is active (has recent cursor movement)
  const isUserActive = (userId) => {
    const cursor = cursorPositions[userId];
    if (!cursor) return false;
    
    const lastMove = lastActivity[userId];
    if (!lastMove) return false;
    
    // Consider user active if cursor moved in the last 10 seconds
    return Date.now() - lastMove < 10000;
  };

  // Format time since last activity
  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (!presence || presence.length === 0) {
    return null;
  }

  return (
    <div className="coorganizer-presence-bar fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Compact view (always visible) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors w-full text-left"
        >
          <div className="flex items-center mr-3">
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {sortedPresence.length} co-organizer{sortedPresence.length !== 1 ? 's' : ''}
          </span>
          {activeCursorCount > 0 && (
            <div className="flex items-center ml-3">
              <MousePointer className="w-3.5 h-3.5 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500 font-medium">
                {activeCursorCount} active
              </span>
            </div>
          )}
          <div className="ml-auto flex items-center">
            <div className="flex -mr-2">
              {sortedPresence.slice(0, 3).map((user) => (
                <div
                  key={user.userId}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800"
                  style={{
                    backgroundColor: getUserColor(user.userId),
                  }}
                  title={user.name || `User ${user.userId.slice(0, 4)}`}
                />
              ))}
              {sortedPresence.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                  +{sortedPresence.length - 3}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className={`ml-2 p-1 rounded transition-colors ${
                isExpanded 
                  ? 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isExpanded ? (
                <X className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              ) : (
                <Activity className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              )}
            </button>
          </div>
        </button>

        {/* Expanded view */}
        {isExpanded && (
          <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-slate-50 dark:bg-slate-700/50">
            <div className="space-y-2">
              {/* Current user info */}
              <div className="flex items-center px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  You
                </span>
                <span className="ml-auto text-xs text-blue-500">
                  Current session
                </span>
              </div>

              {/* Room info */}
              <div className="text-xs text-slate-400 px-2">
                Room: {roomId || 'default'}
              </div>

              {/* Other users */}
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 pt-2">
                Co-Organizers
              </div>

              {sortedPresence.length > 0 ? (
                sortedPresence.map((user) => {
                  const userColor = getUserColor(user.userId);
                  const isActive = isUserActive(user.userId);
                  const hasCursor = cursorPositions[user.userId];

                  return (
                    <div
                      key={user.userId}
                      className={`flex items-center px-2 py-1.5 rounded transition-colors ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: userColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {user.name || `User ${user.userId.slice(0, 6)}`}
                        </div>
                        <div className="text-xs text-slate-400">
                          {user.status || 'Editing'}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        {hasCursor && (
                          <>
                            <MousePointer className="w-3 h-3 mr-1" />
                            <span className="font-mono">
                              ({Math.round(cursorPositions[user.userId]?.x || 0)}, 
                              {Math.round(cursorPositions[user.userId]?.y || 0)})
                            </span>
                          </>
                        )}
                        {isActive ? (
                          <Activity className="w-3 h-3 text-emerald-500 ml-2" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400 ml-2" />
                        )}
                        <span className="ml-1">
                          {isActive ? 'Active' : formatTimeSince(user.lastSeen)}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500 text-center py-2">
                  No other co-organizers connected
                </div>
              )}

              {/* Disconnect button */}
              {onDisconnect && (
                <button
                  onClick={onDisconnect}
                  className="w-full flex items-center justify-center px-2 py-1.5 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to track cursor position for presence sharing
 * 
 * @param {object} options - Hook options
 * @param {string} options.userId - Current user ID
 * @param {Function} options.onCursorChange - Callback when cursor changes
 * @param {number} options.throttleDelay - Throttle delay in ms (default: 50)
 * @returns {object} Handlers for mouse events
 */
export const useCursorTracking = ({ userId, onCursorChange, throttleDelay = 50 }) => {
  const throttleRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      onCursorChange?.(userId, { x, y });
    }, throttleDelay);
  }, [userId, onCursorChange, throttleDelay]);

  const handleMouseLeave = useCallback(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }
    onCursorChange?.(userId, null);
  }, [userId, onCursorChange]);

  useEffect(() => {
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, []);

  return {
    handleMouseMove,
    handleMouseLeave,
  };
};

export default CoOrganizerPresenceBar;

