/**
 * Yjs-based CRDT Agenda Store (#17674)
 * Conflict-Free Replicated Data Type store for collaborative event scheduling.
 * Uses Yjs to enable real-time multi-user editing with automatic conflict resolution.
 * 
 * Note: This implementation uses Yjs CRDT library. In production, you would also need
 * a WebSocket provider (like y-websocket) to synchronize documents across clients.
 */

import * as Y from 'yjs';

/**
 * AgendaCRDTStore - Yjs-based collaborative schedule store
 * Manages shared schedule data with automatic conflict resolution
 */
export class AgendaCRDTStore {
  /**
   * Create a new AgendaCRDTStore instance
   * @param {string} documentName - Unique name for the Yjs document
   * @param {object} options - Configuration options
   * @param {boolean} options.autoLoad - Whether to auto-load from existing data
   */
  constructor(documentName = 'eventra_agenda_crdt', options = {}) {
    this.documentName = documentName;
    this.yDoc = new Y.Doc();
    this.options = options;
    
    // Create shared data structures
    this.sessions = this.yDoc.getMap('sessions');
    this.tracks = this.yDoc.getMap('tracks');
    this.settings = this.yDoc.getMap('settings');
    this.presence = this.yDoc.getMap('presence');
    
    // Initialize default settings
    if (this.settings.size === 0) {
      this.settings.set('version', 1);
      this.settings.set('lastUpdated', Date.now());
      this.settings.set('conflictResolutionStrategy', 'lww');
    }
    
    // Event listeners for local changes
    this.changeListeners = new Set();
    this.presenceListeners = new Set();
    
    // Set up change observers
    this.setupObservers();
  }

  /**
   * Set up Yjs observers for data changes
   */
  setupObservers() {
    // Observe changes to sessions
    this.sessions.observeDeep((changes) => {
      this.notifyChangeListeners('sessions', changes);
      this.settings.set('lastUpdated', Date.now());
    });

    // Observe changes to tracks
    this.tracks.observeDeep((changes) => {
      this.notifyChangeListeners('tracks', changes);
      this.settings.set('lastUpdated', Date.now());
    });

    // Observe changes to settings
    this.settings.observeDeep((changes) => {
      this.notifyChangeListeners('settings', changes);
    });

    // Observe presence changes
    this.presence.observeDeep((changes) => {
      this.notifyPresenceListeners(changes);
    });
  }

  /**
   * Notify all change listeners
   * @param {string} type - Type of change ('sessions', 'tracks', 'settings')
   * @param {Array} changes - Array of Yjs change events
   */
  notifyChangeListeners(type, changes) {
    this.changeListeners.forEach((listener) => {
      try {
        listener({ type, changes, timestamp: Date.now() });
      } catch (error) {
        console.error('[AgendaCRDT] Error in change listener:', error);
      }
    });
  }

  /**
   * Notify all presence listeners
   * @param {Array} changes - Array of Yjs change events
   */
  notifyPresenceListeners(changes) {
    this.presenceListeners.forEach((listener) => {
      try {
        listener({ changes, timestamp: Date.now() });
      } catch (error) {
        console.error('[AgendaCRDT] Error in presence listener:', error);
      }
    });
  }

  /**
   * Subscribe to data changes
   * @param {Function} listener - Callback function for changes
   * @returns {Function} Unsubscribe function
   */
  onChange(listener) {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Subscribe to presence changes
   * @param {Function} listener - Callback function for presence changes
   * @returns {Function} Unsubscribe function
   */
  onPresenceChange(listener) {
    this.presenceListeners.add(listener);
    return () => this.presenceListeners.delete(listener);
  }

  /**
   * Add or update a session in the schedule
   * @param {string} sessionId - Unique session identifier
   * @param {object} sessionData - Session data
   * @param {string} sessionData.title - Session title
   * @param {string} sessionData.startTime - ISO start time
   * @param {string} sessionData.endTime - ISO end time
   * @param {string} sessionData.trackId - Track identifier
   * @param {string} sessionData.speaker - Speaker name
   * @param {number} sessionData.capacity - Maximum capacity
   * @param {string} sessionData.description - Session description
   * @param {number} timestamp - Optional timestamp for LWW resolution
   */
  updateSession(sessionId, sessionData, timestamp = Date.now()) {
    const existingSession = this.sessions.get(sessionId);
    
    if (!existingSession || timestamp >= (existingSession?.timestamp || 0)) {
      this.sessions.set(sessionId, {
        ...sessionData,
        id: sessionId,
        timestamp,
        updatedAt: Date.now(),
        version: (existingSession?.version || 0) + 1,
      });
      return true;
    }
    return false; // Rejected older write
  }

  /**
   * Remove a session from the schedule
   * @param {string} sessionId - Session identifier to remove
   */
  removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Add or update a track
   * @param {string} trackId - Unique track identifier
   * @param {object} trackData - Track data
   */
  updateTrack(trackId, trackData, timestamp = Date.now()) {
    const existingTrack = this.tracks.get(trackId);
    
    if (!existingTrack || timestamp >= (existingTrack?.timestamp || 0)) {
      this.tracks.set(trackId, {
        ...trackData,
        id: trackId,
        timestamp,
        updatedAt: Date.now(),
        version: (existingTrack?.version || 0) + 1,
      });
      return true;
    }
    return false; // Rejected older write
  }

  /**
   * Remove a track from the schedule
   * @param {string} trackId - Track identifier to remove
   */
  removeTrack(trackId) {
    // Remove all sessions in this track first
    this.sessions.forEach((session, sessionId) => {
      if (session.trackId === trackId) {
        this.sessions.delete(sessionId);
      }
    });
    this.tracks.delete(trackId);
  }

  /**
   * Get all sessions sorted by start time
   * @returns {Array} Array of session objects
   */
  getAllSessions() {
    const sessionsArray = Array.from(this.sessions.values());
    return sessionsArray.sort((a, b) => 
      new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime()
    );
  }

  /**
   * Get all tracks
   * @returns {Array} Array of track objects
   */
  getAllTracks() {
    return Array.from(this.tracks.values());
  }

  /**
   * Get sessions for a specific track
   * @param {string} trackId - Track identifier
   * @returns {Array} Array of session objects
   */
  getSessionsForTrack(trackId) {
    const sessionsArray = this.getAllSessions();
    return sessionsArray.filter(session => session.trackId === trackId);
  }

  /**
   * Update user presence information
   * @param {string} userId - User identifier
   * @param {object} presenceData - Presence data
   * @param {string} presenceData.name - User display name
   * @param {string} presenceData.color - User color (for cursor)
   * @param {object} presenceData.cursor - Cursor position {x, y}
   * @param {string} presenceData.status - User status (e.g., 'active', 'idle')
   */
  updatePresence(userId, presenceData) {
    this.presence.set(userId, {
      ...presenceData,
      userId,
      lastSeen: Date.now(),
    });
  }

  /**
   * Remove user presence
   * @param {string} userId - User identifier
   */
  removePresence(userId) {
    this.presence.delete(userId);
  }

  /**
   * Get all active presence information
   * @returns {Array} Array of presence objects
   */
  getAllPresence() {
    return Array.from(this.presence.values());
  }

  /**
   * Get the underlying Yjs document
   * @returns {Y.Doc} Yjs document instance
   */
  getYDoc() {
    return this.yDoc;
  }

  /**
   * Get the Yjs document as binary update
   * @returns {Uint8Array} Binary update data
   */
  getUpdate() {
    return Y.encodeStateAsUpdate(this.yDoc);
  }

  /**
   * Apply a binary update to the document
   * @param {Uint8Array} update - Binary update data
   */
  applyUpdate(update) {
    Y.applyUpdate(this.yDoc, update);
  }

  /**
   * Merge state from another AgendaCRDTStore
   * @param {AgendaCRDTStore} remoteStore - Remote store to merge with
   */
  mergeState(remoteStore) {
    const remoteUpdate = remoteStore.getUpdate();
    this.applyUpdate(remoteUpdate);
  }

  /**
   * Get document statistics
   * @returns {object} Statistics object
   */
  getStats() {
    return {
      sessionCount: this.sessions.size,
      trackCount: this.tracks.size,
      presenceCount: this.presence.size,
      lastUpdated: this.settings.get('lastUpdated'),
      version: this.settings.get('version'),
      documentSize: Y.encodeStateAsUpdate(this.yDoc).length,
    };
  }

  /**
   * Clear all data from the store
   */
  clear() {
    this.yDoc.destroy();
    this.yDoc = new Y.Doc();
    this.sessions = this.yDoc.getMap('sessions');
    this.tracks = this.yDoc.getMap('tracks');
    this.settings = this.yDoc.getMap('settings');
    this.presence = this.yDoc.getMap('presence');
    this.setupObservers();
  }

  /**
   * Destroy the store and clean up
   */
  destroy() {
    this.changeListeners.clear();
    this.presenceListeners.clear();
    this.yDoc.destroy();
  }
}

/**
 * Create a new AgendaCRDTStore instance with default settings
 * @param {string} documentName - Unique name for the document
 * @returns {AgendaCRDTStore} New store instance
 */
export function createAgendaCRDTStore(documentName) {
  return new AgendaCRDTStore(documentName);
}

/**
 * Generate a unique document name for an event
 * @param {string} eventId - Event identifier
 * @returns {string} Unique document name
 */
export function getDocumentName(eventId) {
  return `eventra_agenda_${eventId}`;
}

export default AgendaCRDTStore;
