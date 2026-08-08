/**
 * Hook for managing multi-track event schedules
 * Provides schedule state management and API integration
 */

import { useState, useCallback, useEffect, useReducer } from 'react';
import scheduleService from '../services/scheduleService';
import {
  detectSessionConflicts,
  validateScheduleIntegrity,
  autoAssignSessionsToTracks,
} from '../utils/multiTrackScheduleUtils';

const initialState = {
  tracks: [],
  sessions: [],
  conflicts: [],
  validation: { isValid: true, issues: [], warnings: [] },
  loading: false,
  error: null,
  published: false,
};

const scheduleReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRACKS':
      return { ...state, tracks: action.payload };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [...state.tracks, action.payload],
      };
    case 'UPDATE_TRACK':
      return {
        ...state,
        tracks: state.tracks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'REMOVE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter(t => t.id !== action.payload),
      };
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };
    case 'REMOVE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.payload),
      };
    case 'SET_CONFLICTS':
      return { ...state, conflicts: action.payload };
    case 'SET_VALIDATION':
      return { ...state, validation: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PUBLISHED':
      return { ...state, published: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const useMultiTrackSchedule = (eventId) => {
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  /**
   * Load schedule from server
   */
  const loadSchedule = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const schedule = await scheduleService.getSchedule(eventId);
      dispatch({ type: 'SET_TRACKS', payload: schedule.tracks || [] });
      dispatch({ type: 'SET_SESSIONS', payload: schedule.sessions || [] });
      dispatch({ type: 'SET_PUBLISHED', payload: schedule.published || false });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Update conflicts and validation
      updateConflicts(schedule.tracks, schedule.sessions);
      updateValidation(schedule.tracks, schedule.sessions);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [eventId]);

  /**
   * Save schedule to server
   */
  const saveSchedule = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const scheduleData = {
        tracks: state.tracks,
        sessions: state.sessions,
        published: state.published,
      };
      await scheduleService.updateSchedule(eventId, scheduleData);
      dispatch({ type: 'SET_ERROR', payload: null });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [eventId, state.tracks, state.sessions, state.published]);

  /**
   * Add new track
   */
  const addTrack = useCallback(async (trackData) => {
    try {
      const newTrack = {
        id: `track-${Date.now()}`,
        ...trackData,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TRACK', payload: newTrack });
      
      // Save to server
      await scheduleService.addTrack(eventId, trackData);
      
      return newTrack;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId]);

  /**
   * Update track information
   */
  const updateTrack = useCallback(async (trackId, updates) => {
    try {
      dispatch({ type: 'UPDATE_TRACK', payload: { id: trackId, updates } });
      
      // Save to server
      await scheduleService.updateTrack(eventId, trackId, updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId]);

  /**
   * Remove track
   */
  const removeTrack = useCallback(async (trackId) => {
    try {
      // Check if track has sessions
      const trackSessions = state.sessions.filter(s => s.trackId === trackId);
      if (trackSessions.length > 0) {
        throw new Error(`Cannot remove track with ${trackSessions.length} session(s)`);
      }

      dispatch({ type: 'REMOVE_TRACK', payload: trackId });
      
      // Delete from server
      await scheduleService.removeTrack(eventId, trackId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId, state.sessions]);

  /**
   * Add session to schedule
   */
  const addSession = useCallback(async (sessionData) => {
    try {
      const newSession = {
        id: `session-${Date.now()}`,
        ...sessionData,
        createdAt: new Date().toISOString(),
        attendeeIds: [],
      };
      dispatch({ type: 'ADD_SESSION', payload: newSession });
      
      // Update conflicts and validation
      updateConflicts([...state.tracks], [...state.sessions, newSession]);
      updateValidation([...state.tracks], [...state.sessions, newSession]);
      
      // Save to server
      await scheduleService.addSession(eventId, sessionData);
      
      return newSession;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId, state.tracks, state.sessions]);

  /**
   * Update session information
   */
  const updateSession = useCallback(async (sessionId, updates) => {
    try {
      dispatch({ type: 'UPDATE_SESSION', payload: { id: sessionId, updates } });
      
      // Update conflicts and validation
      const updatedSessions = state.sessions.map(s =>
        s.id === sessionId ? { ...s, ...updates } : s
      );
      updateConflicts([...state.tracks], updatedSessions);
      updateValidation([...state.tracks], updatedSessions);
      
      // Save to server
      await scheduleService.updateSession(eventId, sessionId, updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId, state.tracks, state.sessions]);

  /**
   * Remove session from schedule
   */
  const removeSession = useCallback(async (sessionId) => {
    try {
      dispatch({ type: 'REMOVE_SESSION', payload: sessionId });
      
      // Update conflicts and validation
      const updatedSessions = state.sessions.filter(s => s.id !== sessionId);
      updateConflicts([...state.tracks], updatedSessions);
      updateValidation([...state.tracks], updatedSessions);
      
      // Delete from server
      await scheduleService.removeSession(eventId, sessionId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId, state.tracks, state.sessions]);

  /**
   * Auto-assign sessions to tracks
   */
  const autoAssign = useCallback(async () => {
    try {
      const unassignedSessions = state.sessions.filter(s => !s.trackId);
      if (unassignedSessions.length === 0) {
        throw new Error('All sessions are already assigned');
      }

      const assigned = autoAssignSessionsToTracks(unassignedSessions, state.tracks);
      const updatedSessions = state.sessions.map(s => {
        const assignedSession = assigned.find(a => a.id === s.id);
        return assignedSession || s;
      });

      dispatch({ type: 'SET_SESSIONS', payload: updatedSessions });
      
      // Update conflicts and validation
      updateConflicts([...state.tracks], updatedSessions);
      updateValidation([...state.tracks], updatedSessions);
      
      // Save to server
      await scheduleService.updateSchedule(eventId, {
        tracks: state.tracks,
        sessions: updatedSessions,
      });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId, state.tracks, state.sessions]);

  /**
   * Detect schedule conflicts
   */
  const updateConflicts = useCallback((tracks, sessions) => {
    const conflictData = detectSessionConflicts(sessions, tracks);
    dispatch({ type: 'SET_CONFLICTS', payload: conflictData.conflicts });
  }, []);

  /**
   * Validate schedule integrity
   */
  const updateValidation = useCallback((tracks, sessions) => {
    const validationData = validateScheduleIntegrity(sessions, tracks);
    dispatch({ type: 'SET_VALIDATION', payload: validationData });
  }, []);

  /**
   * Publish schedule
   */
  const publishSchedule = useCallback(async () => {
    try {
      await scheduleService.publishSchedule(eventId);
      dispatch({ type: 'SET_PUBLISHED', payload: true });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId]);

  /**
   * Unpublish schedule
   */
  const unpublishSchedule = useCallback(async () => {
    try {
      await scheduleService.unpublishSchedule(eventId);
      dispatch({ type: 'SET_PUBLISHED', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId]);

  /**
   * Export schedule
   */
  const exportSchedule = useCallback(async (format = 'json') => {
    try {
      if (format === 'json') {
        return await scheduleService.exportSchedule(eventId);
      } else if (format === 'ics') {
        return await scheduleService.exportScheduleICS(eventId);
      } else if (format === 'pdf') {
        return await scheduleService.generateSchedulePDF(eventId);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [eventId]);

  /**
   * Clear errors
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * Reset schedule
   */
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Load schedule on mount
  useEffect(() => {
    if (eventId) {
      loadSchedule();
    }
  }, [eventId, loadSchedule]);

  return {
    // State
    tracks: state.tracks,
    sessions: state.sessions,
    conflicts: state.conflicts,
    validation: state.validation,
    loading: state.loading,
    error: state.error,
    published: state.published,

    // Actions
    loadSchedule,
    saveSchedule,
    addTrack,
    updateTrack,
    removeTrack,
    addSession,
    updateSession,
    removeSession,
    autoAssign,
    publishSchedule,
    unpublishSchedule,
    exportSchedule,
    clearError,
    reset,
  };
};

export default useMultiTrackSchedule;
