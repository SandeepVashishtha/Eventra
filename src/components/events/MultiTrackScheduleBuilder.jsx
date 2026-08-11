/**
 * Multi-Track Event Schedule Builder Component
 * Provides UI for creating and managing multi-track event schedules
 * with real-time conflict detection and visualization
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Clock, AlertCircle, CheckCircle, Plus, Trash2, Settings, Download } from 'lucide-react';
import {
  detectSessionConflicts,
  autoAssignSessionsToTracks,
  getAvailableTimeSlots,
  calculateTrackUtilization,
  generateScheduleSummary,
  validateScheduleIntegrity,
} from '../../utils/multiTrackScheduleUtils';
import '../styles/MultiTrackScheduleBuilder.css';

const MultiTrackScheduleBuilder = ({
  eventId,
  eventStartTime,
  eventEndTime,
  onScheduleUpdate,
  initialSessions = [],
  initialTracks = [],
}) => {
  const [sessions, setSessions] = useState(initialSessions);
  const [tracks, setTracks] = useState(initialTracks);
  const [selectedView, setSelectedView] = useState('calendar');
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [newTrackName, setNewTrackName] = useState('');
  const [slotDuration, setSlotDuration] = useState(60);
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);

  // Calculate conflicts
  const conflictData = useMemo(
    () => detectSessionConflicts(sessions, tracks),
    [sessions, tracks]
  );

  // Calculate utilization
  const utilization = useMemo(
    () => calculateTrackUtilization(sessions, tracks, eventStartTime, eventEndTime),
    [sessions, tracks, eventStartTime, eventEndTime]
  );

  // Validate schedule
  const validation = useMemo(
    () => validateScheduleIntegrity(sessions, tracks),
    [sessions, tracks]
  );

  // Generate schedule summary
  const scheduleSummary = useMemo(
    () => generateScheduleSummary(sessions, tracks),
    [sessions, tracks]
  );

  const handleAddTrack = useCallback(() => {
    if (!newTrackName.trim()) return;

    const newTrack = {
      id: `track-${Date.now()}`,
      name: newTrackName,
      description: '',
      capacity: 'unlimited',
      createdAt: new Date().toISOString(),
    };

    setTracks([...tracks, newTrack]);
    setNewTrackName('');
  }, [newTrackName, tracks]);

  const handleRemoveTrack = useCallback((trackId) => {
    const trackSessions = sessions.filter(s => s.trackId === trackId);
    if (trackSessions.length > 0) {
      alert(`Cannot remove track with ${trackSessions.length} session(s). Remove sessions first.`);
      return;
    }
    setTracks(tracks.filter(t => t.id !== trackId));
  }, [sessions, tracks]);

  const handleAddSession = useCallback(() => {
    const newSession = {
      id: `session-${Date.now()}`,
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

    setSessions([...sessions, newSession]);
    setEditingSession(newSession.id);
  }, [sessions, tracks, eventStartTime]);

  const handleUpdateSession = useCallback((sessionId, updates) => {
    setSessions(sessions.map(s =>
      s.id === sessionId ? { ...s, ...updates } : s
    ));
    onScheduleUpdate?.(sessions.map(s =>
      s.id === sessionId ? { ...s, ...updates } : s
    ), tracks);
  }, [sessions, tracks, onScheduleUpdate]);

  const handleRemoveSession = useCallback((sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  }, [sessions]);

  const handleAutoAssign = useCallback(() => {
    const unassignedSessions = sessions.filter(s => !s.trackId);
    if (unassignedSessions.length === 0) {
      alert('All sessions are already assigned to tracks.');
      return;
    }

    const assigned = autoAssignSessionsToTracks(unassignedSessions, tracks);
    const updatedSessions = sessions.map(s => {
      const assignedSession = assigned.find(a => a.id === s.id);
      return assignedSession || s;
    });

    setSessions(updatedSessions);
    onScheduleUpdate?.(updatedSessions, tracks);
  }, [sessions, tracks, onScheduleUpdate]);

  const handleDownloadSchedule = useCallback(() => {
    const scheduleData = {
      eventId,
      eventStartTime,
      eventEndTime,
      generatedAt: new Date().toISOString(),
      tracks,
      sessions,
      summary: scheduleSummary,
      utilization,
      validation,
    };

    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `event-schedule-${eventId}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [eventId, eventStartTime, eventEndTime, tracks, sessions, scheduleSummary, utilization, validation]);

  return (
    <div className="multi-track-schedule-builder">
      <div className="mtb-header">
        <div className="mtb-title-section">
          <h2>Multi-Track Schedule Builder</h2>
          <p className="mtb-subtitle">Manage sessions across multiple tracks with conflict detection</p>
        </div>

        <div className="mtb-header-actions">
          <button
            className="mtb-button mtb-button-primary"
            onClick={handleDownloadSchedule}
            title="Download schedule as JSON"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="mtb-status-cards">
        <div className={`mtb-status-card ${conflictData.hasConflicts ? 'alert' : 'success'}`}>
          {conflictData.hasConflicts ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <div>
            <p className="mtb-status-label">Conflicts Detected</p>
            <p className="mtb-status-value">{conflictData.conflictCount}</p>
          </div>
        </div>

        <div className="mtb-status-card">
          <Clock size={20} />
          <div>
            <p className="mtb-status-label">Tracks</p>
            <p className="mtb-status-value">{tracks.length}</p>
          </div>
        </div>

        <div className="mtb-status-card">
          <Plus size={20} />
          <div>
            <p className="mtb-status-label">Sessions</p>
            <p className="mtb-status-value">{sessions.length}</p>
          </div>
        </div>

        <div className="mtb-status-card">
          <Settings size={20} />
          <div>
            <p className="mtb-status-label">Overall Utilization</p>
            <p className="mtb-status-value">{utilization.overallUtilization}</p>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="mtb-view-selector">
        <button
          className={`mtb-view-button ${selectedView === 'calendar' ? 'active' : ''}`}
          onClick={() => setSelectedView('calendar')}
        >
          Calendar View
        </button>
        <button
          className={`mtb-view-button ${selectedView === 'list' ? 'active' : ''}`}
          onClick={() => setSelectedView('list')}
        >
          List View
        </button>
        <button
          className={`mtb-view-button ${selectedView === 'conflicts' ? 'active' : ''}`}
          onClick={() => setSelectedView('conflicts')}
        >
          Conflicts
        </button>
        <button
          className={`mtb-view-button ${selectedView === 'stats' ? 'active' : ''}`}
          onClick={() => setSelectedView('stats')}
        >
          Statistics
        </button>
      </div>

      <div className="mtb-content">
        {/* Tracks Management */}
        <div className="mtb-panel mtb-tracks-panel">
          <h3>Tracks</h3>
          <div className="mtb-add-track">
            <input
              type="text"
              placeholder="Track name (e.g., Main Hall, Room A)"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              className="mtb-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTrack()}
            />
            <button
              className="mtb-button mtb-button-secondary"
              onClick={handleAddTrack}
            >
              <Plus size={16} />
              Add Track
            </button>
          </div>

          <div className="mtb-tracks-list">
            {tracks.map(track => {
              const trackSessions = sessions.filter(s => s.trackId === track.id);
              const trackUtil = utilization.trackUtilization[track.id];
              return (
                <div key={track.id} className="mtb-track-card">
                  <div className="mtb-track-info">
                    <p className="mtb-track-name">{track.name}</p>
                    <p className="mtb-track-sessions">{trackSessions.length} sessions</p>
                    {trackUtil && (
                      <p className="mtb-track-utilization">
                        Utilization: {trackUtil.utilization}
                      </p>
                    )}
                  </div>
                  <button
                    className="mtb-button mtb-button-danger mtb-button-small"
                    onClick={() => handleRemoveTrack(track.id)}
                    title="Remove track"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mtb-main-panel">
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

          {selectedView === 'conflicts' && (
            <ConflictsView
              conflicts={conflictData.conflicts}
              sessions={sessions}
              validation={validation}
            />
          )}

          {selectedView === 'stats' && (
            <StatsView
              utilization={utilization}
              tracks={tracks}
              sessions={sessions}
              validation={validation}
            />
          )}
        </div>

        {/* Session Editor */}
        {editingSession && (
          <SessionEditor
            session={sessions.find(s => s.id === editingSession)}
            tracks={tracks}
            onUpdate={handleUpdateSession}
            onClose={() => setEditingSession(null)}
            allSessions={sessions}
          />
        )}
      </div>

      {/* Action Bar */}
      <div className="mtb-action-bar">
        <button
          className="mtb-button mtb-button-primary"
          onClick={handleAddSession}
        >
          <Plus size={18} />
          Add Session
        </button>

        <button
          className="mtb-button mtb-button-secondary"
          onClick={handleAutoAssign}
          disabled={sessions.filter(s => !s.trackId).length === 0}
        >
          Auto-Assign Sessions
        </button>

        <div className="mtb-status-info">
          {validation.isValid ? (
            <span className="mtb-valid">✓ Schedule is valid</span>
          ) : (
            <span className="mtb-invalid">✗ {validation.totalIssues} issue(s) found</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Calendar View Component - Shows schedule in calendar grid format
 */
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
  const hours = generateHourSlots(eventStartTime, eventEndTime);

  return (
    <div className="mtb-calendar-view">
      <div className="mtb-calendar-grid">
        <div className="mtb-calendar-header">
          <div className="mtb-time-column">Time</div>
          {tracks.map(track => (
            <div key={track.id} className="mtb-track-column-header">
              {track.name}
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div key={hour} className="mtb-calendar-row">
            <div className="mtb-time-slot">{new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            {tracks.map(track => (
              <div
                key={`${track.id}-${hour}`}
                className="mtb-track-time-slot"
              >
                {sessions
                  .filter(s => s.trackId === track.id &&
                    new Date(s.startTime) <= new Date(hour) &&
                    new Date(s.endTime) > new Date(hour)
                  )
                  .map(session => (
                    <div
                      key={session.id}
                      className={`mtb-session-block ${editingSessionId === session.id ? 'editing' : ''}`}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <p className="mtb-session-title">{session.title}</p>
                      <p className="mtb-session-speaker">{session.speaker}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * List View Component - Shows sessions in table format
 */
const ListView = ({
  sessions,
  tracks,
  onSessionUpdate,
  onSessionRemove,
  editingSessionId,
  onSelectSession,
}) => {
  return (
    <div className="mtb-list-view">
      <table className="mtb-sessions-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Track</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Speaker</th>
            <th>Capacity</th>
            <th>Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const track = tracks.find(t => t.id === session.trackId);
            return (
              <tr
                key={session.id}
                className={editingSessionId === session.id ? 'editing' : ''}
                onClick={() => onSelectSession(session.id)}
              >
                <td className="mtb-title-cell">{session.title}</td>
                <td>{track?.name || 'Unassigned'}</td>
                <td>{new Date(session.startTime).toLocaleString()}</td>
                <td>{new Date(session.endTime).toLocaleString()}</td>
                <td>{session.speaker}</td>
                <td>{session.capacity}</td>
                <td>{session.attendeeIds?.length || 0}</td>
                <td>
                  <button
                    className="mtb-button mtb-button-danger mtb-button-small"
                    onClick={() => onSessionRemove(session.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Conflicts View Component - Shows scheduling conflicts
 */
const ConflictsView = ({ conflicts, sessions, validation }) => {
  return (
    <div className="mtb-conflicts-view">
      <div className="mtb-validation-section">
        <h3>Schedule Validation</h3>
        {validation.issues.length > 0 && (
          <div className="mtb-issues-list">
            <h4 className="mtb-issues-title">Issues ({validation.issues.length})</h4>
            {validation.issues.map((issue, idx) => (
              <div key={idx} className="mtb-issue-item mtb-issue-error">
                <AlertCircle size={16} />
                <p>{issue}</p>
              </div>
            ))}
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="mtb-warnings-list">
            <h4 className="mtb-warnings-title">Warnings ({validation.warnings.length})</h4>
            {validation.warnings.map((warning, idx) => (
              <div key={idx} className="mtb-warning-item">
                <AlertCircle size={16} />
                <p>{warning}</p>
              </div>
            ))}
          </div>
        )}

        {validation.issues.length === 0 && validation.warnings.length === 0 && (
          <div className="mtb-success-message">
            <CheckCircle size={20} />
            <p>Schedule is valid with no issues or warnings</p>
          </div>
        )}
      </div>

      {conflicts.length > 0 && (
        <div className="mtb-conflicts-section">
          <h3>Detected Conflicts</h3>
          <div className="mtb-conflicts-list">
            {conflicts.map((conflict, idx) => {
              const session1 = sessions.find(s => s.id === conflict.session1Id);
              const session2 = sessions.find(s => s.id === conflict.session2Id);
              return (
                <div key={idx} className={`mtb-conflict-item mtb-conflict-${conflict.severity.toLowerCase()}`}>
                  <div className="mtb-conflict-header">
                    <span className="mtb-conflict-type">{conflict.type}</span>
                    <span className="mtb-conflict-severity">{conflict.severity}</span>
                  </div>
                  <p className="mtb-conflict-message">{conflict.message}</p>
                  <div className="mtb-conflict-details">
                    <p>Session 1: {session1?.title}</p>
                    <p>Session 2: {session2?.title}</p>
                    <p>Overlap: {conflict.overlapMinutes} minutes</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Statistics View Component - Shows schedule statistics
 */
const StatsView = ({ utilization, tracks, sessions, validation }) => {
  return (
    <div className="mtb-stats-view">
      <div className="mtb-stats-grid">
        <div className="mtb-stat-card">
          <h4>Overall Utilization</h4>
          <p className="mtb-stat-large">{utilization.overallUtilization}</p>
        </div>

        <div className="mtb-stat-card">
          <h4>Total Sessions</h4>
          <p className="mtb-stat-large">{sessions.length}</p>
        </div>

        <div className="mtb-stat-card">
          <h4>Total Tracks</h4>
          <p className="mtb-stat-large">{tracks.length}</p>
        </div>

        <div className="mtb-stat-card">
          <h4>Total Session Minutes</h4>
          <p className="mtb-stat-large">{Math.round(utilization.totalSessionMinutes)}</p>
        </div>
      </div>

      <div className="mtb-track-stats">
        <h3>Track Statistics</h3>
        {Object.entries(utilization.trackUtilization).map(([trackId, stats]) => (
          <div key={trackId} className="mtb-track-stat">
            <p className="mtb-track-stat-name">{stats.trackName}</p>
            <div className="mtb-track-stat-details">
              <span>Sessions: {stats.sessionCount}</span>
              <span>Used: {stats.usedMinutes} / {stats.totalMinutes} minutes</span>
              <span>Utilization: {stats.utilization}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Session Editor Component - Edit session details
 */
const SessionEditor = ({ session, tracks, onUpdate, onClose, allSessions }) => {
  const [formData, setFormData] = useState(session);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onUpdate(session.id, formData);
    onClose();
  };

  if (!session) return null;

  return (
    <div className="mtb-editor-overlay" onClick={onClose}>
      <div className="mtb-editor-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Edit Session</h3>

        <div className="mtb-form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="mtb-input"
          />
        </div>

        <div className="mtb-form-group">
          <label>Track</label>
          <select
            value={formData.trackId || ''}
            onChange={(e) => handleChange('trackId', e.target.value || null)}
            className="mtb-input"
          >
            <option value="">Unassigned</option>
            {tracks.map(track => (
              <option key={track.id} value={track.id}>
                {track.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mtb-form-group">
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={new Date(formData.startTime).toISOString().slice(0, 16)}
            onChange={(e) => handleChange('startTime', new Date(e.target.value).toISOString())}
            className="mtb-input"
          />
        </div>

        <div className="mtb-form-group">
          <label>End Time</label>
          <input
            type="datetime-local"
            value={new Date(formData.endTime).toISOString().slice(0, 16)}
            onChange={(e) => handleChange('endTime', new Date(e.target.value).toISOString())}
            className="mtb-input"
          />
        </div>

        <div className="mtb-form-group">
          <label>Speaker</label>
          <input
            type="text"
            value={formData.speaker}
            onChange={(e) => handleChange('speaker', e.target.value)}
            className="mtb-input"
          />
        </div>

        <div className="mtb-form-group">
          <label>Capacity</label>
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
            className="mtb-input"
          />
        </div>

        <div className="mtb-form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="mtb-input mtb-textarea"
            rows="3"
          />
        </div>

        <div className="mtb-editor-actions">
          <button className="mtb-button mtb-button-primary" onClick={handleSave}>
            Save Changes
          </button>
          <button className="mtb-button mtb-button-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to generate hourly time slots
 */
function generateHourSlots(startTime, endTime) {
  const slots = [];
  let currentTime = new Date(startTime);
  const end = new Date(endTime);

  while (currentTime <= end) {
    slots.push(currentTime.toISOString());
    currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
  }

  return slots;
}

export default MultiTrackScheduleBuilder;
