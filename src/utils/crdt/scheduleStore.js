/**
 * Schedule CRDT Store using Yjs
 * Conflict-Free Replicated Data Type store for collaborative event schedule building.
 * Uses Yjs library for real-time synchronization and automatic conflict resolution.
 */

// Dynamic import of Yjs to avoid build errors if not installed
let Y;

/**
 * Initialize Yjs dynamically
 * @returns {Promise<void>}
 */
async function initYjs() {
  if (!Y) {
    try {
      const yjsModule = await import('yjs');
      Y = yjsModule.default || yjsModule;
    } catch (error) {
      console.error('Yjs not available. Falling back to mock CRDT implementation.', error);
      // Fallback to simple Map-based implementation
      Y = {
        Doc: class Doc {
          constructor() {
            this.store = new Map();
          }
          getMap(name) {
            if (!this.store.has(name)) {
              this.store.set(name, new Map());
            }
            return this.store.get(name);
          }
        },
        Map: Map,
        WebsocketProvider: class WebsocketProvider {
          constructor(doc, url, roomName) {
            this.doc = doc;
            this.url = url;
            this.roomName = roomName;
            this.connected = false;
            this.on = () => {};
          }
          connect() {
            this.connected = true;
            return Promise.resolve();
          }
          disconnect() {
            this.connected = false;
          }
        }
      };
    }
  }
}

/**
 * Schedule CRDT Store class
 * Manages collaborative schedule data using Yjs CRDTs
 */
class ScheduleCRDTStore {
  /**
   * @param {string} roomId - Unique room identifier for the collaborative session
   * @param {string} websocketUrl - URL for WebSocket provider
   */
  constructor(roomId = 'eventra-schedule-crdt', websocketUrl = 'wss://localhost:1234') {
    this.roomId = roomId;
    this.websocketUrl = websocketUrl;
    this.doc = null;
    this.scheduleMap = null;
    this.cursorsMap = null;
    this.provider = null;
    this.initialized = false;
    this.organizers = new Map();
    this.cursorPositions = new Map();
  }

  /**
   * Initialize the Yjs document and provider
   * @returns {Promise<void>}
   */
  async init() {
    await initYjs();

    if (this.initialized) return;

    // Create Yjs document
    this.doc = new Y.Doc();

    // Create shared data structures
    this.scheduleMap = this.doc.getMap('schedule');
    this.cursorsMap = this.doc.getMap('cursors');
    this.organizersMap = this.doc.getMap('organizers');

    // Create WebSocket provider for real-time sync
    this.provider = new Y.WebsocketProvider(this.doc, this.websocketUrl, this.roomId);

    // Set up connection handlers
    this.provider.on('synced', () => {
      console.log('Yjs WebSocket provider synced');
      this.initialized = true;
    });

    this.provider.on('disconnected', () => {
      console.log('Yjs WebSocket provider disconnected');
      this.initialized = false;
    });

    // Load existing data
    this._loadFromYjsMap();

    // Set up change observers
    this._setupObservers();

    return new Promise((resolve) => {
      if (this.provider.connected) {
        this.initialized = true;
        resolve();
      } else {
        this.provider.once('synced', () => {
          this.initialized = true;
          resolve();
        });
      }
    });
  }

  /**
   * Load data from Yjs map into local state
   */
  _loadFromYjsMap() {
    if (!this.scheduleMap || !this.organizersMap) return;

    // Load organizers
    this.organizers.clear();
    this.scheduleMap.forEach((value, key) => {
      if (key.startsWith('organizer_')) {
        const organizerId = key.replace('organizer_', '');
        this.organizers.set(organizerId, value);
      }
    });

    // Load cursor positions
    this.cursorPositions.clear();
    this.cursorsMap.forEach((value, key) => {
      this.cursorPositions.set(key, value);
    });
  }

  /**
   * Set up observers for Yjs map changes
   */
  _setupObservers() {
    if (!this.scheduleMap || !this.cursorsMap || !this.organizersMap) return;

    // Observe schedule changes
    this.scheduleMap.observe((event) => {
      event.target.forEach((value, key) => {
        if (key.startsWith('organizer_')) {
          const organizerId = key.replace('organizer_', '');
          this.organizers.set(organizerId, value);
        }
      });
    });

    // Observe cursor changes
    this.cursorsMap.observe((event) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'add' || change.action === 'update') {
          this.cursorPositions.set(key, this.cursorsMap.get(key));
        } else if (change.action === 'delete') {
          this.cursorPositions.delete(key);
        }
      });
    });
  }

  /**
   * Add or update a schedule slot
   * @param {string} slotId - Unique slot identifier
   * @param {Object} slotData - Slot data to store
   */
  updateSlot(slotId, slotData) {
    if (!this.scheduleMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    this.scheduleMap.set(slotId, {
      ...slotData,
      id: slotId,
      updatedAt: Date.now()
    });

    return true;
  }

  /**
   * Remove a schedule slot
   * @param {string} slotId - Slot identifier to remove
   */
  removeSlot(slotId) {
    if (!this.scheduleMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    this.scheduleMap.delete(slotId);
    return true;
  }

  /**
   * Get all schedule slots
   * @returns {Array} Array of all schedule slots
   */
  getAllSlots() {
    if (!this.scheduleMap) return [];

    const slots = [];
    this.scheduleMap.forEach((value, key) => {
      if (!key.startsWith('organizer_')) {
        slots.push(value);
      }
    });

    // Sort by startTime if available
    return slots.sort((a, b) => {
      const aTime = a.startTime || a.createdAt || 0;
      const bTime = b.startTime || b.createdAt || 0;
      return aTime - bTime;
    });
  }

  /**
   * Add or update organizer information
   * @param {string} organizerId - Organizer identifier
   * @param {Object} organizerData - Organizer data
   */
  updateOrganizer(organizerId, organizerData) {
    if (!this.scheduleMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    const key = `organizer_${organizerId}`;
    this.scheduleMap.set(key, {
      ...organizerData,
      id: organizerId,
      updatedAt: Date.now()
    });

    this.organizers.set(organizerId, organizerData);
    return true;
  }

  /**
   * Get all organizers
   * @returns {Array} Array of all organizers
   */
  getAllOrganizers() {
    return Array.from(this.organizers.values());
  }

  /**
   * Update cursor position for an organizer
   * @param {string} organizerId - Organizer identifier
   * @param {Object} position - Cursor position {x, y}
   */
  updateCursor(organizerId, position) {
    if (!this.cursorsMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    this.cursorsMap.set(organizerId, {
      ...position,
      updatedAt: Date.now()
    });

    this.cursorPositions.set(organizerId, position);
    return true;
  }

  /**
   * Get cursor position for an organizer
   * @param {string} organizerId - Organizer identifier
   * @returns {Object|null} Cursor position or null
   */
  getCursor(organizerId) {
    return this.cursorPositions.get(organizerId) || null;
  }

  /**
   * Get all cursor positions
   * @returns {Object} Map of organizerId to cursor position
   */
  getAllCursors() {
    return Object.fromEntries(this.cursorPositions);
  }

  /**
   * Remove organizer and their cursor
   * @param {string} organizerId - Organizer identifier
   */
  removeOrganizer(organizerId) {
    if (!this.scheduleMap || !this.cursorsMap) return false;

    const organizerKey = `organizer_${organizerId}`;
    this.scheduleMap.delete(organizerKey);
    this.cursorsMap.delete(organizerId);
    this.organizers.delete(organizerId);
    this.cursorPositions.delete(organizerId);

    return true;
  }

  /**
   * Bind schedule data to canvas coordinates
   * @param {string} slotId - Slot identifier
   * @param {Object} coordinates - Canvas coordinates {x, y, width, height}
   */
  bindToCanvas(slotId, coordinates) {
    if (!this.scheduleMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    const existingSlot = this.scheduleMap.get(slotId);
    this.scheduleMap.set(slotId, {
      ...existingSlot,
      canvas: {
        ...coordinates,
        updatedAt: Date.now()
      }
    });

    return true;
  }

  /**
   * Get canvas coordinates for a slot
   * @param {string} slotId - Slot identifier
   * @returns {Object|null} Canvas coordinates or null
   */
  getCanvasCoordinates(slotId) {
    if (!this.scheduleMap) return null;

    const slot = this.scheduleMap.get(slotId);
    return slot?.canvas || null;
  }

  /**
   * Merge remote state (for synchronization)
   * @param {Object} remoteState - Remote state to merge
   */
  mergeState(remoteState) {
    if (!this.scheduleMap || !this.initialized) {
      console.warn('ScheduleCRDTStore not initialized');
      return false;
    }

    // Yjs handles merging automatically through CRDT
    // This method is a fallback for manual merging if needed
    return true;
  }

  /**
   * Disconnect from the collaborative session
   */
  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }
    this.initialized = false;
  }

  /**
   * Get the Yjs document
   * @returns {Object|null} Yjs document
   */
  getDocument() {
    return this.doc;
  }

  /**
   * Check if store is connected and initialized
   * @returns {boolean}
   */
  isConnected() {
    return this.initialized && this.provider?.connected;
  }

  /**
   * Get sync status
   * @returns {string}
   */
  getSyncStatus() {
    if (!this.provider) return 'disconnected';
    if (this.provider.connected && this.initialized) return 'synced';
    if (this.provider.connected) return 'syncing';
    return 'disconnected';
  }
}

/**
 * Create a new ScheduleCRDTStore instance
 * @param {string} roomId - Room identifier
 * @param {string} websocketUrl - WebSocket URL
 * @returns {ScheduleCRDTStore}
 */
export function createScheduleStore(roomId, websocketUrl) {
  return new ScheduleCRDTStore(roomId, websocketUrl);
}

/**
 * Singleton instance for default room
 */
let defaultStore = null;

/**
 * Get or create the default schedule store
 * @param {string} roomId - Room identifier
 * @param {string} websocketUrl - WebSocket URL
 * @returns {ScheduleCRDTStore}
 */
export function getDefaultScheduleStore(roomId = 'eventra-schedule-crdt', websocketUrl = 'wss://localhost:1234') {
  if (!defaultStore) {
    defaultStore = new ScheduleCRDTStore(roomId, websocketUrl);
  }
  return defaultStore;
}

export { ScheduleCRDTStore };
export default ScheduleCRDTStore;
