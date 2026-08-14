/**
 * CoOrganizerPresenceBar Component
 * Displays presence information for co-organizers in a collaborative schedule building session.
 * Shows cursor positions and organizer information in real-time.
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * CoOrganizerPresenceBar - Displays presence bars for all co-organizers
 * 
 * @param {Object} props - Component props
 * @param {Array} props.organizers - Array of organizer objects
 * @param {Object} props.cursors - Map of organizerId to cursor position
 * @param {string} props.currentOrganizerId - Current user's organizer ID
 * @param {Function} props.onCursorUpdate - Callback when cursor is updated
 * @param {string} props.syncStatus - Current sync status ('disconnected', 'syncing', 'synced')
 * @param {boolean} props.isConnected - Whether the session is connected
 * @param {Object} props.style - Additional styles for the container
 */
const CoOrganizerPresenceBar = ({
  organizers = [],
  cursors = {},
  currentOrganizerId,
  onCursorUpdate,
  syncStatus = 'disconnected',
  isConnected = false,
  style = {}
}) => {
  const [expanded, setExpanded] = useState(false);
  const [lastActivity, setLastActivity] = useState({});

  // Update last activity timestamp when cursors change
  useEffect(() => {
    const newActivity = {};
    Object.keys(cursors).forEach(orgId => {
      newActivity[orgId] = Date.now();
    });
    setLastActivity(newActivity);
  }, [cursors]);

  // Handle cursor position update
  const handleCursorUpdate = useCallback((organizerId, position) => {
    if (onCursorUpdate) {
      onCursorUpdate(organizerId, position);
    }
  }, [onCursorUpdate]);

  // Get organizer color (consistent based on ID)
  const getOrganizerColor = (organizerId) => {
    const colors = [
      'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
      'bg-rose-500', 'bg-red-500', 'bg-orange-500',
      'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
      'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
      'bg-violet-500'
    ];
    
    // Simple hash to get consistent color
    let hash = 0;
    for (let i = 0; i < organizerId.length; i++) {
      hash = organizerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get cursor color (lighter version of organizer color)
  const getCursorColor = (organizerId) => {
    const baseColor = getOrganizerColor(organizerId);
    return baseColor.replace('500', '300');
  };

  // Format time since last activity
  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Get status indicator color
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-emerald-500';
      case 'syncing':
        return 'bg-amber-500';
      case 'disconnected':
      default:
        return 'bg-rose-500';
    }
  };

  // Get organizer initials
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get cursor position display
  const getCursorDisplay = (cursor) => {
    if (!cursor || (!cursor.x && !cursor.y)) return 'Inactive';
    return `(${Math.round(cursor.x)}, ${Math.round(cursor.y)})`;
  };

  return (
    <div 
      className="co-organizer-presence-bar fixed bottom-4 left-4 z-50 flex flex-col gap-2"
      style={style}
    >
      {/* Collapsed view - shows sync status and count */}
      <div 
        className={`flex items-center gap-2 p-2 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
          expanded ? 'bg-white' : 'bg-white/90 backdrop-blur-sm hover:bg-white'
        }`}
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Collapse' : 'Expand presence panel'}
      >
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
        
        <span className="text-sm font-bold text-slate-700">
          {isConnected ? 'Live' : 'Offline'}
        </span>
        
        <span className="text-xs text-slate-500 font-mono">
          {organizers.filter(o => o.id !== currentOrganizerId).length + 1} Organizers
        </span>
        
        {expanded ? (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>

      {/* Expanded view - shows all organizers */}
      {expanded && (
        <div className="bg-white rounded-xl shadow-xl p-3 w-64 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Collaborative Session
            </h3>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {syncStatus}
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {organizers.map((organizer) => {
              const isCurrent = organizer.id === currentOrganizerId;
              const cursor = cursors[organizer.id];
              const activityTime = lastActivity[organizer.id];
              const colorClass = getOrganizerColor(organizer.id);
              const cursorColorClass = getCursorColor(organizer.id);

              return (
                <div 
                  key={organizer.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                    isCurrent 
                      ? 'bg-indigo-50 border border-indigo-200' 
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Organizer avatar with initials */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${colorClass}`}
                    title={organizer.name || `Organizer ${organizer.id}`}
                  >
                    {getInitials(organizer.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">
                      {organizer.name || `Organizer ${organizer.id}`}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {cursor ? getCursorDisplay(cursor) : 'Inactive'}
                    </div>
                  </div>

                  {/* Cursor indicator */}
                  {cursor && !isCurrent && (
                    <div 
                      className={`w-2 h-2 rounded-full ${cursorColorClass} animate-pulse`}
                      title={`Active ${formatTimeSince(activityTime)}`}
                    />
                  )}

                  {/* Current user indicator */}
                  {isCurrent && (
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">
                      You
                    </span>
                  )}

                  {/* Activity timestamp */}
                  {!isCurrent && activityTime && (
                    <span className="text-[10px] text-slate-400">
                      {formatTimeSince(activityTime)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Connection info */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">
              Room: {currentOrganizerId}
            </span>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              <span className="text-[10px] text-slate-400 uppercase">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default CoOrganizerPresenceBar;
