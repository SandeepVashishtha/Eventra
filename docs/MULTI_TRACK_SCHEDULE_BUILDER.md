# Multi-Track Event Schedule Builder

## Overview

The Multi-Track Event Schedule Builder is a comprehensive feature for managing events with multiple concurrent tracks or sessions. It provides real-time conflict detection, automatic session assignment, and detailed schedule visualization.

## Features

### Core Features

1. **Multi-Track Management**
   - Create and manage unlimited tracks/rooms/halls
   - Track capacity and utilization tracking
   - Track descriptions and metadata

2. **Session Management**
   - Add, edit, and remove sessions
   - Assign sessions to specific tracks
   - Define session duration, capacity, and speaker information
   - Support for session descriptions and materials

3. **Conflict Detection**
   - Real-time detection of track conflicts (overlapping sessions in same track)
   - Speaker conflict detection (same speaker with overlapping sessions)
   - Attendee conflict detection (attendees registered for overlapping sessions)
   - Detailed conflict reporting with severity levels

4. **Auto-Assignment**
   - Intelligent automatic session-to-track assignment
   - Greedy algorithm for optimal track distribution
   - Conflict-aware assignment

5. **Schedule Visualization**
   - Calendar grid view showing all tracks and time slots
   - List view with detailed session information
   - Conflict view highlighting scheduling issues
   - Statistics view with utilization metrics

6. **Schedule Validation**
   - Comprehensive schedule integrity checks
   - Detection of unassigned sessions
   - Validation of track references
   - Empty track detection

7. **Export & Reporting**
   - Export schedule as JSON
   - Export schedule as iCalendar format
   - PDF report generation
   - Track utilization statistics

## Usage

### Installation

The feature is built into the Eventra application. No additional installation is required.

### Basic Usage

#### React Component

```jsx
import MultiTrackScheduleBuilder from './components/events/MultiTrackScheduleBuilder';

function EventScheduler() {
  return (
    <MultiTrackScheduleBuilder
      eventId="event-123"
      eventStartTime={new Date('2024-01-15T08:00:00Z').toISOString()}
      eventEndTime={new Date('2024-01-15T18:00:00Z').toISOString()}
      initialTracks={[
        { id: 'track-1', name: 'Main Hall', description: 'Primary track' },
        { id: 'track-2', name: 'Room A', description: 'Secondary track' },
      ]}
      initialSessions={[]}
      onScheduleUpdate={(sessions, tracks) => {
        console.log('Schedule updated', sessions, tracks);
      }}
    />
  );
}
```

#### Using the Custom Hook

```jsx
import { useMultiTrackSchedule } from './hooks/useMultiTrackSchedule';

function ScheduleManager() {
  const {
    tracks,
    sessions,
    conflicts,
    validation,
    addTrack,
    addSession,
    autoAssign,
    saveSchedule,
  } = useMultiTrackSchedule('event-123');

  return (
    <div>
      <button onClick={() => addTrack({ name: 'New Track' })}>
        Add Track
      </button>
      <button onClick={() => addSession({ title: 'New Session', trackId: tracks[0]?.id })}>
        Add Session
      </button>
      <button onClick={autoAssign} disabled={sessions.length === 0}>
        Auto-Assign
      </button>
      <button onClick={saveSchedule}>Save</button>
      
      {conflicts.length > 0 && (
        <div className="alerts">
          Found {conflicts.length} conflict(s)
        </div>
      )}
    </div>
  );
}
```

### API Usage

#### Service Methods

```javascript
import scheduleService from './services/scheduleService';

// Create schedule
const schedule = await scheduleService.createSchedule('event-123', {
  tracks: [...],
  sessions: [...],
});

// Get schedule
const schedule = await scheduleService.getSchedule('event-123');

// Update schedule
await scheduleService.updateSchedule('event-123', {
  tracks: [...],
  sessions: [...],
});

// Add track
const track = await scheduleService.addTrack('event-123', {
  name: 'Main Hall',
  description: 'Primary track',
});

// Add session
const session = await scheduleService.addSession('event-123', {
  title: 'Keynote',
  trackId: 'track-1',
  startTime: '2024-01-15T09:00:00Z',
  endTime: '2024-01-15T10:00:00Z',
  speaker: 'John Doe',
  capacity: 100,
});

// Detect conflicts
const conflicts = await scheduleService.detectConflicts('event-123');

// Auto-assign sessions
const result = await scheduleService.autoAssignSessions('event-123');

// Get statistics
const stats = await scheduleService.getScheduleStats('event-123');

// Validate schedule
const validation = await scheduleService.validateSchedule('event-123');

// Publish schedule
await scheduleService.publishSchedule('event-123');

// Export schedule
const jsonData = await scheduleService.exportSchedule('event-123');
const icsData = await scheduleService.exportScheduleICS('event-123');
const pdfBlob = await scheduleService.generateSchedulePDF('event-123');
```

## Utilities Reference

### Conflict Detection Utilities

#### `detectSessionConflicts(sessions, tracks)`

Detects all types of conflicts in the schedule.

```javascript
import { detectSessionConflicts } from './utils/multiTrackScheduleUtils';

const result = detectSessionConflicts(sessions, tracks);
// Returns:
// {
//   hasConflicts: boolean,
//   conflicts: Array<ConflictData>,
//   conflictCount: number,
//   highSeverityCount: number,
//   warningCount: number
// }
```

#### `hasTimeOverlap(session1, session2)`

Checks if two sessions overlap in time.

```javascript
const overlaps = hasTimeOverlap(session1, session2);
```

#### `calculateOverlapMinutes(session1, session2)`

Calculates the duration of overlap between two sessions.

```javascript
const minutes = calculateOverlapMinutes(session1, session2); // Returns number
```

### Session Assignment Utilities

#### `autoAssignSessionsToTracks(sessions, tracks)`

Automatically assigns unassigned sessions to tracks using a greedy algorithm.

```javascript
const assigned = autoAssignSessionsToTracks(unassignedSessions, tracks);
```

### Schedule Analysis Utilities

#### `calculateTrackUtilization(sessions, tracks, eventStart, eventEnd)`

Calculates track utilization statistics.

```javascript
const utilization = calculateTrackUtilization(sessions, tracks, eventStart, eventEnd);
// Returns:
// {
//   trackUtilization: {
//     'track-id': {
//       trackName: string,
//       usedMinutes: number,
//       totalMinutes: number,
//       utilization: string (percentage),
//       sessionCount: number
//     }
//   },
//   overallUtilization: string,
//   totalSessionMinutes: number,
//   averageUtilization: number
// }
```

#### `generateScheduleSummary(sessions, tracks)`

Generates a summary of the schedule organized by track.

```javascript
const summary = generateScheduleSummary(sessions, tracks);
```

#### `validateScheduleIntegrity(sessions, tracks)`

Validates the schedule for integrity issues.

```javascript
const validation = validateScheduleIntegrity(sessions, tracks);
// Returns:
// {
//   isValid: boolean,
//   issues: Array<string>,
//   warnings: Array<string>,
//   totalIssues: number,
//   totalWarnings: number
// }
```

## Conflict Types

### Track Conflicts
- **Severity**: HIGH
- **Description**: Two or more sessions assigned to the same track have overlapping times
- **Impact**: Attendees cannot attend both sessions

### Speaker Conflicts
- **Severity**: HIGH
- **Description**: Same speaker is scheduled for multiple sessions with overlapping times
- **Impact**: Speaker cannot be in two places at once

### Attendee Conflicts
- **Severity**: WARNING
- **Description**: Attendee registered for multiple sessions with overlapping times
- **Impact**: Attendee may miss one session

## Data Structures

### Track Object

```javascript
{
  id: string,           // Unique track identifier
  name: string,         // Display name
  description: string,  // Optional description
  capacity: string,     // "unlimited" or number
  createdAt: string,    // ISO timestamp
}
```

### Session Object

```javascript
{
  id: string,           // Unique session identifier
  title: string,        // Session title
  startTime: string,    // ISO timestamp
  endTime: string,      // ISO timestamp
  trackId: string,      // Reference to track (nullable for unassigned)
  speaker: string,      // Speaker name
  speakerId: string,    // Speaker ID (optional)
  capacity: number,     // Maximum attendees
  attendeeIds: Array,   // List of registered attendee IDs
  description: string,  // Session description
  createdAt: string,    // ISO timestamp
}
```

### Conflict Object

```javascript
{
  type: string,         // TRACK_CONFLICT | SPEAKER_CONFLICT | ATTENDEE_CONFLICT
  severity: string,     // HIGH | WARNING
  session1Id: string,   // First conflicting session
  session2Id: string,   // Second conflicting session
  trackId?: string,     // For track conflicts
  speakerId?: string,   // For speaker conflicts
  attendeeId?: string,  // For attendee conflicts
  message: string,      // Human-readable conflict description
  overlapMinutes: number, // Duration of overlap in minutes
}
```

## Best Practices

### Managing Large Schedules

1. **Use Auto-Assign for Complex Schedules**
   - Automatically distribute sessions to minimize conflicts
   - Review results before publication

2. **Regular Validation**
   - Validate schedule integrity frequently
   - Address issues before publishing

3. **Export Regularly**
   - Keep backups of schedule data
   - Export to multiple formats for compatibility

### Handling Conflicts

1. **Monitor for Speaker Conflicts**
   - Review speaker schedules for overlaps
   - Adjust timing or assign to backup speakers

2. **Optimize Track Usage**
   - Review utilization statistics
   - Consolidate sessions to fewer tracks if possible

3. **Attendee Management**
   - Alert attendees to scheduling conflicts
   - Provide alternative session times

## Performance Considerations

- Conflict detection is O(n²) where n is the number of sessions
- Auto-assignment uses a greedy algorithm (O(n*m) where m is number of tracks)
- Suitable for events with up to ~1000 sessions

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Error Handling

All service methods may throw errors:

```javascript
try {
  await scheduleService.saveSchedule(eventId, scheduleData);
} catch (error) {
  console.error('Save failed:', error.message);
}
```

## Testing

Run tests for schedule utilities:

```bash
npm test -- multiTrackScheduleUtils.test.js
```

## Contributing

When extending this feature:

1. Update utilities if adding new conflict types
2. Update service layer for new API endpoints
3. Add component features to the builder UI
4. Write tests for new functionality
5. Update documentation

## Future Enhancements

- [ ] Room constraint management
- [ ] Attendee preference scoring
- [ ] Session repeat/series support
- [ ] Automatic schedule optimization algorithms
- [ ] Mobile-optimized UI
- [ ] Schedule comparison/versioning
- [ ] Import from external schedule tools
- [ ] Real-time collaboration features

## Support

For issues or questions, refer to:
- Issue tracker: #9981
- Documentation: See this file
- Code examples: See src/utils/multiTrackScheduleUtils.test.js
