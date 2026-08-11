/**
 * Schedule Management Service
 * Handles API operations for multi-track event schedules
 */

import { apiUtils, API_ENDPOINTS } from '../config/api';

export const scheduleService = {
  /**
   * Create a new multi-track schedule for an event
   * @param {string} eventId - Event ID
   * @param {Object} scheduleData - Schedule data with tracks and sessions
   * @returns {Promise} Schedule creation response
   */
  createSchedule: async (eventId, scheduleData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule`;
    return apiUtils.post(endpoint, {
      ...scheduleData,
      createdAt: new Date().toISOString(),
    });
  },

  /**
   * Get existing schedule for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} Schedule data
   */
  getSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule`;
    return apiUtils.get(endpoint);
  },

  /**
   * Update event schedule
   * @param {string} eventId - Event ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Promise} Update response
   */
  updateSchedule: async (eventId, scheduleData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule`;
    return apiUtils.put(endpoint, {
      ...scheduleData,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Delete schedule for an event
   * @param {string} eventId - Event ID
   * @returns {Promise} Deletion response
   */
  deleteSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule`;
    return apiUtils.delete(endpoint);
  },

  /**
   * Get all tracks for an event schedule
   * @param {string} eventId - Event ID
   * @returns {Promise} Array of tracks
   */
  getTracks: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks`;
    return apiUtils.get(endpoint);
  },

  /**
   * Add a new track to event schedule
   * @param {string} eventId - Event ID
   * @param {Object} trackData - Track data
   * @returns {Promise} Created track
   */
  addTrack: async (eventId, trackData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks`;
    return apiUtils.post(endpoint, trackData);
  },

  /**
   * Update track information
   * @param {string} eventId - Event ID
   * @param {string} trackId - Track ID
   * @param {Object} trackData - Updated track data
   * @returns {Promise} Updated track
   */
  updateTrack: async (eventId, trackId, trackData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks/${trackId}`;
    return apiUtils.put(endpoint, trackData);
  },

  /**
   * Remove track from schedule
   * @param {string} eventId - Event ID
   * @param {string} trackId - Track ID
   * @returns {Promise} Deletion response
   */
  removeTrack: async (eventId, trackId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks/${trackId}`;
    return apiUtils.delete(endpoint);
  },

  /**
   * Get all sessions in event schedule
   * @param {string} eventId - Event ID
   * @returns {Promise} Array of sessions
   */
  getSessions: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions`;
    return apiUtils.get(endpoint);
  },

  /**
   * Get sessions for a specific track
   * @param {string} eventId - Event ID
   * @param {string} trackId - Track ID
   * @returns {Promise} Array of sessions in track
   */
  getTrackSessions: async (eventId, trackId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks/${trackId}/sessions`;
    return apiUtils.get(endpoint);
  },

  /**
   * Add session to schedule
   * @param {string} eventId - Event ID
   * @param {Object} sessionData - Session data
   * @returns {Promise} Created session
   */
  addSession: async (eventId, sessionData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions`;
    return apiUtils.post(endpoint, sessionData);
  },

  /**
   * Update session information
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise} Updated session
   */
  updateSession: async (eventId, sessionId, sessionData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}`;
    return apiUtils.put(endpoint, sessionData);
  },

  /**
   * Remove session from schedule
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @returns {Promise} Deletion response
   */
  removeSession: async (eventId, sessionId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}`;
    return apiUtils.delete(endpoint);
  },

  /**
   * Assign session to track
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @param {string} trackId - Track ID to assign to
   * @returns {Promise} Session assignment response
   */
  assignSessionToTrack: async (eventId, sessionId, trackId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}/assign`;
    return apiUtils.post(endpoint, { trackId });
  },

  /**
   * Detect conflicts in schedule
   * @param {string} eventId - Event ID
   * @returns {Promise} Conflict detection results
   */
  detectConflicts: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/conflicts`;
    return apiUtils.get(endpoint);
  },

  /**
   * Auto-assign sessions to tracks
   * @param {string} eventId - Event ID
   * @returns {Promise} Auto-assignment results
   */
  autoAssignSessions: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/auto-assign`;
    return apiUtils.post(endpoint);
  },

  /**
   * Get schedule statistics
   * @param {string} eventId - Event ID
   * @returns {Promise} Schedule statistics
   */
  getScheduleStats: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/stats`;
    return apiUtils.get(endpoint);
  },

  /**
   * Validate schedule integrity
   * @param {string} eventId - Event ID
   * @returns {Promise} Validation results
   */
  validateSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/validate`;
    return apiUtils.get(endpoint);
  },

  /**
   * Export schedule in JSON format
   * @param {string} eventId - Event ID
   * @returns {Promise} Schedule JSON data
   */
  exportSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/export`;
    return apiUtils.get(endpoint);
  },

  /**
   * Export schedule as iCalendar format
   * @param {string} eventId - Event ID
   * @returns {Promise} iCalendar formatted schedule
   */
  exportScheduleICS: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/export/ics`;
    return apiUtils.get(endpoint);
  },

  /**
   * Generate schedule PDF report
   * @param {string} eventId - Event ID
   * @returns {Promise} PDF report blob
   */
  generateSchedulePDF: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/report/pdf`;
    return apiUtils.get(endpoint, { responseType: 'blob' });
  },

  /**
   * Register attendee for session
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @param {Object} attendeeData - Attendee information
   * @returns {Promise} Registration response
   */
  registerForSession: async (eventId, sessionId, attendeeData) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}/register`;
    return apiUtils.post(endpoint, attendeeData);
  },

  /**
   * Unregister attendee from session
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @param {string} attendeeId - Attendee ID
   * @returns {Promise} Unregistration response
   */
  unregisterFromSession: async (eventId, sessionId, attendeeId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}/unregister/${attendeeId}`;
    return apiUtils.delete(endpoint);
  },

  /**
   * Get session registrations
   * @param {string} eventId - Event ID
   * @param {string} sessionId - Session ID
   * @returns {Promise} List of session registrations
   */
  getSessionRegistrations: async (eventId, sessionId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/sessions/${sessionId}/registrations`;
    return apiUtils.get(endpoint);
  },

  /**
   * Get available time slots for scheduling
   * @param {string} eventId - Event ID
   * @param {string} trackId - Track ID
   * @param {Object} options - Query options (duration, date range, etc.)
   * @returns {Promise} Available time slots
   */
  getAvailableTimeSlots: async (eventId, trackId, options = {}) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/tracks/${trackId}/slots`;
    return apiUtils.get(endpoint, { params: options });
  },

  /**
   * Publish schedule (make it visible to attendees)
   * @param {string} eventId - Event ID
   * @returns {Promise} Publication response
   */
  publishSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/publish`;
    return apiUtils.post(endpoint);
  },

  /**
   * Unpublish schedule (hide from attendees)
   * @param {string} eventId - Event ID
   * @returns {Promise} Unpublication response
   */
  unpublishSchedule: async (eventId) => {
    const endpoint = `${API_ENDPOINTS.EVENTS.DETAIL(eventId)}/schedule/unpublish`;
    return apiUtils.post(endpoint);
  },
};

export default scheduleService;
