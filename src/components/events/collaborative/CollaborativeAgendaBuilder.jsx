/**
 * CollaborativeAgendaBuilder - Yjs-based Multi-Track Event Scheduler (#17674)
 * Real-time collaborative schedule builder using Yjs CRDTs.
 * Multiple co-organizers can edit the schedule simultaneously with automatic
 * conflict resolution and cursor presence tracking.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Settings, 
  Download,
  Users,
  Wifi,
  WifiOff,
  MousePointer,
  Grid3X3,
  List,
  Calendar,
  Undo2,
  Redo2,
  Save
} from 'lucide-react';
import { AgendaCRDTStore, getDocumentName } from '../../../../utils/crdt/agendaCrdtStore';
import CoOrganizerPresenceBar, { useCursorTracking } from './CoOrganizerPresenceBar';
import '../styles/CollaborativeAgendaBuilder.css';

/**
 * CollaborativeAgendaBuilder component
 * Main component for collaborative schedule building
 * 
 * @param {object} props - Component props
 * @param {string} props.eventId - Unique event identifier
 * @param {string} props.eventStartTime - ISO start time for the event
 * @param {string} props.eventEndTime - ISO end time for the event
 * @param {string} props.userId - Current user identifier
 * @param {string} props.userName - Current user display name
 * @param {string} props.roomId - Room/document identifier for collaboration
 * @param {Array} props.initialSessions - Initial sessions to load
 * @param {Array} props.initialTracks - Initial tracks to load
 * @param {Function} props.onSave - Callback when schedule is saved
 * @param {Function} props.onClose - Callback when component is closed
 */
const CollaborativeAgendaBuilder = ({
  eventId = 'default',
  eventStartTime = new Date().toISOString(),
  eventEndTime = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  userId = `user_${Math.random().toString(36).substr(2, 9)}`,
  userName = 'Organizer',
  roomId,
  initialSessions = [],
  initialTracks = [],
  onSave,
  onClose,
}) => {
  // Yjs CRDT store for collaborative state
  const crdtStore = useMemo(() => {
    const docName = roomId || getDocumentName(eventId);
    return new AgendaCRDTStore(docName);
  }, [eventId, roomId]);

  // Local state for UI
  const [selectedView, setSelectedView] = useState('calendar');
  const [editingSession, setEditingSession] = useState(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [cursorPositions, setCursorPositions] = useState({});
  const [localCursorPosition, setLocalCursorPosition] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Refs
  const scheduleContainerRef = useRef(null);
  const websocketRef = useRef(null);
  const yDocRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    // Load initial data into CRDT store
    initialTracks.forEach(track => {
      crdtStore.updateTrack(track.id, track);
    });
    
    initialSessions.forEach(session => {
      crdtStore.updateSession(session.id, session);
    });

    // Update presence with current user
    crdtStore.updatePresence(userId, {
      name: userName,
      status: 'active',
      color: getUserColor(userId),
    });

    // Set up Yjs document reference
    yDocRef.current = crdtStore.getYDoc();

    // Set up change listener
    const unsubscribe = crdtStore.onChange((change) => {
      // Update last updated timestamp
      setSyncStatus('synced');
    });

    return () => {
      unsubscribe();
      crdtStore.removePresence(userId);
    };
  }, [crdtStore, initialSessions, initialTracks, userId, userName]);

  // Set up WebSocket connection for Yjs synchronization
  useEffect(() => {
    // In production, this would connect to a Yjs WebSocket provider
    // For now, we'll simulate the connection
    const connectWebSocket = () => {
      try {
        // This is a mock implementation
        // In a real app, you would use y-websocket or similar
        console.log('[CollaborativeAgendaBuilder] Connecting to WebSocket...');
        
        // Simulate connection delay
        setTimeout(() => {
          setIsConnected(true);
          setSyncStatus('synced');
          console.log('[CollaborativeAgendaBuilder] Connected to WebSocket');
          
          // Simulate receiving updates from other users
          // In reality, Yjs would handle this automatically
        }, 1000);

        return () => {
          console.log('[CollaborativeAgendaBuilder] Disconnecting from WebSocket');
          setIsConnected(false);
          setSyncStatus('disconnected');
        };
      } catch (error) {
        console.error('[CollaborativeAgendaBuilder] WebSocket connection error:', error);
        setIsConnected(false);
        setSyncStatus('error');
      }
    };

    const disconnect = connectWebSocket();
    return disconnect;
  }, [roomId]);

  // Cursor tracking for presence
  const cursorHandlers = useCursorTracking({
    userId,
    onCursorChange: (userId, position) => {
      setLocalCursorPosition(position);
      crdtStore.updatePresence(userId, {
        name: userName,
        status: 'active',
        color: getUserColor(userId),
        cursor: position,
      });
      setCursorPositions(prev => ({ ...prev, [userId]: position }));
    },
    throttleDelay: 50,
  });

  // Update other users' cursor positions from CRDT store
  useEffect(() => {
    const unsubscribe = crdtStore.onPresenceChange((change) => {
      const presence = crdtStore.getAllPresence();
      const newCursorPositions = {};
      
      presence.forEach(user => {
        if (user.cursor && user.userId !== userId) {
          newCursorPositions[user.userId] = user.cursor;
        }
      });
      
      setCursorPositions(prev => ({ ...prev, ...newCursorPositions }));
    });

    return () => unsubscribe();
  }, [crdtStore, userId]);

  // Get current state from CRDT store
  const sessions = crdtStore.getAllSessions();
  const tracks = crdtStore.getAllTracks();
  const presence = crdtStore.getAllPresence();
  const stats = crdtStore.getStats();

  // Generate unique color for user
  const getUserColor = (userId) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
      '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
    ];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Calculate conflicts
  const conflictData = useMemo(() => {
    const conflicts = [];
    
    // Check for overlapping sessions in the same track
    const trackSessions = {};
    tracks.forEach(track => {
      trackSessions[track.id] = crdtStore.getSessionsForTrack(track.id);
    });

    Object.entries(trackSessions).forEach(([trackId, trackSessionsList]) => {
      for (let i = 0; i < trackSessionsList.length; i++) {
        for (let j = i + 1; j < trackSessionsList.length; j++) {
          const s1 = trackSessionsList[i];
          const s2 = trackSessionsList[j];
          
          const start1 = new Date(s1.startTime).getTime();
          const end1 = new Date(s1.endTime).getTime();
          const start2 = new Date(s2.startTime).getTime();
          const end2 = new Date(s2.endTime).getTime();
          
          // Check for overlap
          if (start1 < end2 && start2 < end1) {
            const overlap = Math.min(end1, end2) - Math.max(start1, start2);
            conflicts.push({
              session1Id: s1.id,
              session2Id: s2.id,
              overlapMinutes: Math.floor(overlap / 60000),
              type: 'Time Overlap',
              severity: 'HIGH',
              message: `${s1.title} and ${s2.title} overlap in ${tracks.find(t => t.id === trackId)?.name || 'unknown track'}`,
            });
          }
        }
      }
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflictCount: conflicts.length,
      conflicts,
    };
  }, [sessions, tracks]);

  // Calculate utilization
  const utilization = useMemo(() => {
    const eventDuration = new Date(eventEndTime).getTime() - new Date(eventStartTime).getTime();
    const totalSessionDuration = sessions.reduce((sum, session) => {
      return sum + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
    }, 0);

    const trackUtilization = {};
    tracks.forEach(track => {
      const trackSessions = crdtStore.getSessionsForTrack(track.id);
      const trackDuration = trackSessions.reduce((sum, session) => {
        return sum + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
      }, 0);
      
      trackUtilization[track.id] = {
        trackName: track.name,
        sessionCount: trackSessions.length,
        usedMinutes: Math.floor(trackDuration / 60000),
        totalMinutes: Math.floor(eventDuration / 60000),
        utilization: trackSessions.length > 0 
          ? `${Math.round((trackDuration / eventDuration) * 100)}%`
          : '0%',
      };
    });

    return {
      overallUtilization: eventDuration > 0 
        ? `${Math.round((totalSessionDuration / eventDuration) * 100)}%`
        : '0%',
      totalSessionMinutes: Math.floor(totalSessionDuration / 60000),
      trackUtilization,
    };
  }, [sessions, tracks, eventStartTime, eventEndTime]);

  // Handlers
  const handleAddTrack = useCallback(() => {
    if (!newTrackName.trim()) return;

    const newTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: newTrackName,
      description: '',
      capacity: 'unlimited',
      createdAt: new Date().toISOString(),
    };

    // Save to undo stack
    setUndoStack(prev => [...prev, { type: 'add_track', track: null, timestamp: Date.now() }]);
    setRedoStack([]);

    crdtStore.updateTrack(newTrack.id, newTrack);
    setNewTrackName('');
  }, [newTrackName, crdtStore]);

  const handleRemoveTrack = useCallback((trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const trackSessions = sessions.filter(s => s.trackId === trackId);
    if (trackSessions.length > 0) {
      alert(`Cannot remove track with ${trackSessions.length} session(s). Remove sessions first.`);
      return;
    }

    // Save to undo stack
    setUndoStack(prev => [...prev, { type: 'remove_track', track, timestamp: Date.now() }]);
    setRedoStack([]);

    crdtStore.removeTrack(trackId);
  }, [sessions, tracks, crdtStore]);

  const handleAddSession = useCallback(() => {
    const newSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: 'New Session',
      startTime: eventStartTime,
      endTime: new Date(new Date(eventStartTime).getTime() + 60 * 60 * 1000).toISOString(),
      trackId: tracks[0]?.id || null,
      speaker: '',
      speakerId: null,
      capacity: 100,
      attendeeIds: [],
      description: '',
      createdAt: new Date().toISOString(),
    };

    // Save to undo stack
    setUndoStack(prev => [...prev, { type: 'add_session', session: null, timestamp: Date.now() }]);
    setRedoStack([]);

    crdtStore.updateSession(newSession.id, newSession);
    setEditingSession(newSession.id);
  }, [sessions, tracks, eventStartTime, crdtStore]);

  const handleUpdateSession = useCallback((sessionId, updates) => {
    const oldSession = sessions.find(s => s.id === sessionId);
    
    // Save to undo stack
    setUndoStack(prev => [...prev, { 
      type: 'update_session', 
      session: oldSession, 
      timestamp: Date.now() 
    }]);
    setRedoStack([]);

    crdtStore.updateSession(sessionId, updates);
    onSave?.(crdtStore.getAllSessions(), crdtStore.getAllTracks());
  }, [sessions, crdtStore, onSave]);

  const handleRemoveSession = useCallback((sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Save to undo stack
    setUndoStack(prev => [...prev, { type: 'remove_session', session, timestamp: Date.now() }]);
    setRedoStack([]);

    crdtStore.removeSession(sessionId);
  }, [sessions, crdtStore]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    
    switch (lastAction.type) {
      case 'add_session':
        if (lastAction.session) {
          crdtStore.removeSession(lastAction.session.id);
        }
        break;
      case 'remove_session':
        if (lastAction.session) {
          crdtStore.updateSession(lastAction.session.id, lastAction.session);
        }
        break;
      case 'add_track':
        if (lastAction.track) {
          crdtStore.removeTrack(lastAction.track.id);
        }
        break;
      case 'remove_track':
        if (lastAction.track) {
          crdtStore.updateTrack(lastAction.track.id, lastAction.track);
        }
        break;
      case 'update_session':
        if (lastAction.session) {
          crdtStore.updateSession(lastAction.session.id, lastAction.session);
        }
        break;
    }

    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, crdtStore]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextAction = redoStack[redoStack.length - 1];
    
    switch (nextAction.type) {
      case 'add_session':
        if (nextAction.session) {
          crdtStore.updateSession(nextAction.session.id, nextAction.session);
        }
        break;
      case 'remove_session':
        if (nextAction.session) {
          crdtStore.removeSession(nextAction.session.id);
        }
        break;
      case 'add_track':
        if (nextAction.track) {
          crdtStore.updateTrack(nextAction.track.id, nextAction.track);
        }
        break;
      case 'remove_track':
        if (nextAction.track) {
          crdtStore.removeTrack(nextAction.track.id);
        }
        break;
      case 'update_session':
        if (nextAction.session) {
          crdtStore.updateSession(nextAction.session.id, nextAction.session);
        }
        break;
    }

    setUndoStack(prev => [...prev, nextAction]);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, crdtStore]);

  const handleSave = useCallback(() => {
    onSave?.(sessions, tracks);
  }, [sessions, tracks, onSave]);

  const handleDownloadSchedule = useCallback(() => {
    const scheduleData = {
      eventId,
      eventStartTime,
      eventEndTime,
      generatedAt: new Date().toISOString(),
      tracks: tracks.map(t => ({ ...t })),
      sessions: sessions.map(s => ({ ...s })),
      stats,
      utilization,
      conflictData,
    };

    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-schedule-${eventId}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [eventId, eventStartTime, eventEndTime, tracks, sessions, stats, utilization, conflictData]);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setSyncStatus('disconnected');
    crdtStore.removePresence(userId);
    onSave?.(sessions, tracks);
  }, [crdtStore, userId, sessions, tracks, onSave]);

  // Editing session data
  const editingSessionData = sessions.find(s => s.id === editingSession);

  return (
    <div 
      className="collaborative-agenda-builder h-full flex flex-col"
      ref={scheduleContainerRef}
      {...cursorHandlers}
    >
      {/* Header */}
      <div className="cab-header border-b border-slate-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Collaborative Scheduler
          </h2>
          <span className="ml-2 px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            CRDT Enabled
          </span>
          
          <div className="ml-4 flex items-center">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-1 text-xs font-medium ${
              isConnected 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {syncStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className={`p-1 rounded transition-colors ${
              selectedView === 'calendar' 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setSelectedView('calendar')}
            title="Calendar View"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            className={`p-1 rounded transition-colors ${
              selectedView === 'list' 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setSelectedView('list')}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            className={`p-1 rounded transition-colors ${
              selectedView === 'grid' 
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            onClick={() => setSelectedView('grid')}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            onClick={handleSave}
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            onClick={handleDownloadSchedule}
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="cab-status-bar border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-6 text-sm">
          <div className={`flex items-center ${
            conflictData.hasConflicts 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {conflictData.hasConflicts ? (
              <AlertCircle className="w-4 h-4 mr-1" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-1" />
            )}
            <span>
              {conflictData.conflictCount} conflict{conflictData.conflictCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Settings className="w-4 h-4 mr-1" />
            <span>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Plus className="w-4 h-4 mr-1" />
            <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>Utilization: {utilization.overallUtilization}</span>
          </div>

          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Users className="w-4 h-4 mr-1" />
            <span>{presence.length} organizer{presence.length !== 1 ? 's' : ''} online</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="cab-content flex-1 flex overflow-hidden">
        <div className="cab-sidebar w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 overflow-y-auto">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-3 uppercase tracking-wider">
            Tracks
          </h3>

          <div className="mb-3">
            <input
              type="text"
              placeholder="Track name..."
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTrack()}
              className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTrack}
              disabled={!newTrackName.trim()}
              className="w-full mt-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Track
            </button>
          </div>

          <div className="space-y-2">
            {tracks.map(track => {
              const trackSessions = crdtStore.getSessionsForTrack(track.id);
              const trackUtil = utilization.trackUtilization[track.id];
              
              return (
                <div 
                  key={track.id} 
                  className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {track.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {trackSessions.length} session{trackSessions.length !== 1 ? 's' : ''}
                      </div>
                      {trackUtil && (
                        <div className="text-xs text-slate-400">
                          {trackUtil.utilization}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {tracks.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-4">
                No tracks yet. Add one to get started!
              </div>
            )}
          </div>
        </div>

        <div className="cab-main flex-1 overflow-auto p-4">
          {selectedView === 'calendar' && (
            <CalendarView
              sessions={sessions}
              tracks={tracks}
              eventStartTime={eventStartTime}
              eventEndTime={eventEndTime}
              onSessionUpdate={handleUpdateSession}
              onSessionRemove={handleRemoveSession}
              editingSessionId={editingSession}
              onSelectSession={setEditingSession}
            />
          )}

          {selectedView === 'list' && (
            <ListView
              sessions={sessions}
              tracks={tracks}
              onSessionUpdate={handleUpdateSession}
              onSessionRemove={handleRemoveSession}
              editingSessionId={editingSession}
              onSelectSession={setEditingSession}
            />
          )}

          {selectedView === 'grid' && (
            <GridView
              sessions={sessions}
              tracks={tracks}
              onSessionUpdate={handleUpdateSession}
              onSelectSession={setEditingSession}
            />
          )}
        </div>
      </div>

      {editingSession && editingSessionData && (
        <SessionEditor
          session={editingSessionData}
          tracks={tracks}
          onUpdate={(updates) => {
            handleUpdateSession(editingSession, updates);
            setEditingSession(null);
          }}
          onCancel={() => setEditingSession(null)}
        />
      )}

      <CoOrganizerPresenceBar
        presence={presence}
        currentUserId={userId}
        cursorPositions={cursorPositions}
        onDisconnect={handleDisconnect}
        roomId={roomId || eventId}
      />
    </div>
  );
};

const CalendarView = ({
  sessions,
  tracks,
  eventStartTime,
  eventEndTime,
  onSessionUpdate,
  onSessionRemove,
  editingSessionId,
  onSelectSession,
}) => {
  const hours = useMemo(() => {
    const slots = [];
    let currentTime = new Date(eventStartTime);
    const end = new Date(eventEndTime);

    while (currentTime <= end) {
      slots.push(currentTime.toISOString());
      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    }

    return slots;
  }, [eventStartTime, eventEndTime]);

  return (
    <div className="grid grid-cols-[auto_repeat(auto-fit,minmax(200px,1fr))] gap-1 h-full min-w-full">
      <div className="text-xs text-slate-500 p-2 text-right font-medium">
        Time
      </div>
      {tracks.map(track => (
        <div 
          key={track.id} 
          className="text-xs text-slate-500 p-2 font-medium text-center truncate border-l border-slate-200 dark:border-slate-700"
        >
          {track.name}
        </div>
      ))}

      {hours.map((hour, hourIndex) => (
        <div key={hour} className="contents">
          <div className="text-xs text-slate-400 p-2 text-right border-t border-slate-200 dark:border-slate-700">
            {new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          {tracks.map(track => {
            const trackSessions = sessions.filter(s => s.trackId === track.id);
            
            return (
              <div 
                key={`${track.id}-${hour}`}
                className="relative h-16 border-t border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
              >
                {trackSessions
                  .filter(s => {
                    const sessionStart = new Date(s.startTime);
                    const sessionEnd = new Date(s.endTime);
                    const hourDate = new Date(hour);
                    return sessionStart <= hourDate && sessionEnd > hourDate;
                  })
                  .map(session => {
                    const isEditing = editingSessionId === session.id;
                    
                    return (
                      <div
                        key={session.id}
                        className={`absolute p-2 rounded cursor-pointer transition-all ${
                          isEditing 
                            ? 'bg-blue-200 dark:bg-blue-700 border-2 border-blue-400' 
                            : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                        }`}
                        onClick={() => onSelectSession(session.id)}
                        title={`${session.title} - ${session.speaker || 'No speaker'}`}
                      >
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                          {session.title}
                        </div>
                        {session.speaker && (
                          <div className="text-xs text-slate-500 truncate">
                            {session.speaker}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ListView = ({
  sessions,
  tracks,
  onSessionUpdate,
  onSessionRemove,
  editingSessionId,
  onSelectSession,
}) => {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left p-2 font-semibold text-slate-600 dark:text-slate-300">Title</th>
            <th className="text-left p-2 font-semibold text-slate-600 dark:text-slate-300">Track</th>
            <th className="text-left p-2 font-semibold text-slate-600 dark:text-slate-300">Start</th>
            <th className="text-left p-2 font-semibold text-slate-600 dark:text-slate-300">End</th>
            <th className="text-left p-2 font-semibold text-slate-600 dark:text-slate-300">Speaker</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const track = tracks.find(t => t.id === session.trackId);
            const isEditing = editingSessionId === session.id;
            
            return (
              <tr
                key={session.id}
                className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <td className="p-2">
                  <div className="font-medium text-slate-700 dark:text-slate-200">
                    {session.title}
                  </div>
                </td>
                <td className="p-2 text-slate-600 dark:text-slate-400">
                  {track?.name || 'Unassigned'}
                </td>
                <td className="p-2 text-slate-500">
                  {new Date(session.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
                <td className="p-2 text-slate-500">
                  {new Date(session.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
                <td className="p-2 text-slate-600 dark:text-slate-400">
                  {session.speaker || '-'}
                </td>
                <td className="p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionRemove(session.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {sessions.length === 0 && (
        <div className="text-center text-slate-400 py-8">
          No sessions yet
        </div>
      )}
    </div>
  );
};

const GridView = ({
  sessions,
  tracks,
  onSessionUpdate,
  onSelectSession,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {sessions.map(session => {
        const track = tracks.find(t => t.id === session.trackId);
        const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (60 * 60 * 1000);
        
        return (
          <div
            key={session.id}
            className="p-3 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            onClick={() => onSelectSession(session.id)}
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {session.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {track?.name || 'Unassigned'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(session.startTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - 
                {new Date(session.endTime).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false })} ({duration.toFixed(1)}h)
              </p>
              {session.speaker && (
                <p className="text-xs text-slate-400 mt-1">
                  Speaker: {session.speaker}
                </p>
              )}
            </div>
          </div>
        );
      })}
      {sessions.length === 0 && (
        <div className="col-span-full text-center text-slate-400 py-8">
          No sessions yet
        </div>
      )}
    </div>
  );
};

const SessionEditor = ({ session, tracks, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({ ...session });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
            Edit Session
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Track
              </label>
              <select
                value={formData.trackId || ''}
                onChange={(e) => handleChange('trackId', e.target.value || null)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={new Date(formData.startTime).toISOString().slice(0, 16)}
                  onChange={(e) => handleChange('startTime', new Date(e.target.value).toISOString())}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={new Date(formData.endTime).toISOString().slice(0, 16)}
                  onChange={(e) => handleChange('endTime', new Date(e.target.value).toISOString())}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Speaker
              </label>
              <input
                type="text"
                value={formData.speaker}
                onChange={(e) => handleChange('speaker', e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Speaker name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Session description..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollaborativeAgendaBuilder;
