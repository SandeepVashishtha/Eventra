/**
 * api/_lib/rsvpLockManager.js
 *
 * Safe concurrency tracker for event registration locks.
 * Encapsulates the tracking of active locks and registration attempts per event.
 * Prevents memory leaks by automatically deleting tracking keys when active count reaches zero.
 */

export class RsvpLockManager {
  constructor() {
    this.counters = new Map();
  }

  /**
   * Increments the lock counter for an event.
   * @param {string} eventId - Unique event identifier
   * @returns {number} The updated counter value
   */
  increment(eventId) {
    if (!eventId) return 0;
    const count = this.counters.get(eventId) || 0;
    const nextCount = count + 1;
    this.counters.set(eventId, nextCount);
    return nextCount;
  }

  /**
   * Decrements the lock counter for an event.
   * Cleans up the map key if the counter drops to zero.
   * @param {string} eventId - Unique event identifier
   * @returns {number} The updated counter value (0 if key deleted)
   */
  decrement(eventId) {
    if (!eventId) return 0;
    const count = this.counters.get(eventId);
    if (count === undefined) return 0;
    
    if (count <= 1) {
      this.counters.delete(eventId);
      return 0;
    }
    
    const nextCount = count - 1;
    this.counters.set(eventId, nextCount);
    return nextCount;
  }

  /**
   * Gets the active lock counter for an event.
   * @param {string} eventId - Unique event identifier
   * @returns {number} The current counter value
   */
  getCount(eventId) {
    if (!eventId) return 0;
    return this.counters.get(eventId) || 0;
  }

  /**
   * Resets all lock counters (mainly for testing purposes).
   */
  reset() {
    this.counters.clear();
  }
}

// Global singleton instance
export const rsvpLockManager = new RsvpLockManager();
