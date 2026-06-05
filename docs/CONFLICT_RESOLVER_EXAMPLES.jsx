/**
 * EventConflictResolver - Real-World Usage Examples
 *
 * These are drop-in examples showing how to integrate conflict detection
 * in your event components. Copy/paste and adapt to your needs.
 */

// ============================================================================
// Example 1: Simple Event Card with Inline Conflict Check
// ============================================================================

import { useState } from 'react';
import { checkRegistrationConflict } from '../utils/conflictDetection';
import { useMyEvents } from '../context/MyEventsContext';
import { AlertTriangle } from 'lucide-react';

export function SimpleEventCard({ event }) {
  const { myEvents } = useMyEvents();
  
  // Quick check: does this event conflict?
  const { hasConflict } = checkRegistrationConflict(event, myEvents);

  return (
    <div className="border rounded-lg p-4">
      <h3>{event.title}</h3>
      
      {hasConflict && (
        <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Conflicts with existing registration</span>
        </div>
      )}
      
      <button 
        disabled={hasConflict}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {hasConflict ? 'Cannot Register' : 'Register Now'}
      </button>
    </div>
  );
}

// ============================================================================
// Example 2: Full Registration Flow with Modal
// ============================================================================

import EventConflictModal from '../components/EventConflictModal';
import { suggestAlternativeEvents } from '../utils/conflictDetection';
import { API_ENDPOINTS, apiUtils } from '../config/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function RegistrationFormWithConflictHandling({ event, onSuccess }) {
  const navigate = useNavigate();
  const { myEvents } = useMyEvents();
  
  const [showModal, setShowModal] = useState(false);
  const [conflictData, setConflictData] = useState({ conflicts: [], suggestions: [] });

  const handleSubmit = async (formData) => {
    // Check for conflicts BEFORE submitting
    const check = checkRegistrationConflict(event, myEvents);
    
    if (check.hasConflict) {
      // Fetch alternatives
      try {
        const res = await apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
        const suggestions = suggestAlternativeEvents(event, res.data, myEvents);
        setConflictData({ conflicts: check.conflicts, suggestions });
      } catch (err) {
        setConflictData({ conflicts: check.conflicts, suggestions: [] });
      }
      
      setShowModal(true);
      return;  // Stop here
    }

    // No conflicts - proceed
    submitRegistration(formData);
  };

  const submitRegistration = async (formData) => {
    try {
      await apiUtils.post(`/api/events/${event.id}/register`, formData);
      toast.success('Registration successful!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.target));
      }}>
        {/* Your form fields here */}
        <button type="submit">Register</button>
      </form>

      <EventConflictModal
        isOpen={showModal}
        newEvent={event}
        conflictingEvents={conflictData.conflicts}
        suggestedEvents={conflictData.suggestions}
        onCancel={() => setShowModal(false)}
        onProceed={() => {
          setShowModal(false);
          submitRegistration({});
        }}
        onSelectAlternative={(alt) => {
          setShowModal(false);
          navigate(`/events/${alt.id}/register`);
        }}
      />
    </>
  );
}

// ============================================================================
// Example 3: Batch Check Multiple Events
// ============================================================================

export function EventBatchConflictChecker({ events }) {
  const { myEvents } = useMyEvents();
  
  const checkAll = events.map(event => ({
    ...event,
    conflict: checkRegistrationConflict(event, myEvents),
  }));

  return (
    <div className="space-y-2">
      {checkAll.map(({ event, conflict }) => (
        <div key={event.id} className="flex items-center justify-between p-2 border rounded">
          <span>{event.title}</span>
          <span className={conflict.hasConflict ? 'text-red-600' : 'text-green-600'}>
            {conflict.hasConflict ? '❌ Conflict' : '✅ OK'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example 4: Smart Alternative Finder
// ============================================================================

export function AlternativeEventFinder({ targetEvent, allEvents }) {
  const { myEvents } = useMyEvents();
  const { hasConflict } = checkRegistrationConflict(targetEvent, myEvents);

  if (!hasConflict) {
    return <div className="text-green-600">✅ No conflicts! You can register.</div>;
  }

  const alternatives = suggestAlternativeEvents(
    targetEvent,
    allEvents,
    myEvents,
    60,  // fallback duration
    5    // show 5 suggestions
  );

  return (
    <div>
      <p className="text-amber-600 mb-4">
        ⚠️ This conflicts with your schedule. Here are alternatives:
      </p>
      
      <div className="space-y-2">
        {alternatives.length > 0 ? (
          alternatives.map(alt => (
            <button
              key={alt.id}
              onClick={() => console.log('Switch to', alt.title)}
              className="w-full text-left p-3 border rounded hover:bg-gray-50"
            >
              <p className="font-semibold">{alt.title}</p>
              <p className="text-sm text-gray-600">
                {alt.date} at {alt.time}
              </p>
            </button>
          ))
        ) : (
          <p className="text-gray-600">No alternatives available</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Calendar-Style Conflict Highlighting
// ============================================================================

export function ConflictHighlightedEventList({ events }) {
  const { myEvents } = useMyEvents();

  return (
    <div className="space-y-2">
      {events.map(event => {
        const conflicts = checkRegistrationConflict(event, myEvents).conflicts;
        const hasConflict = conflicts.length > 0;

        return (
          <div
            key={event.id}
            className={`p-3 rounded border-2 ${
              hasConflict
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
            }`}
          >
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm">
              {event.date} {event.time}
            </p>
            {hasConflict && (
              <p className="text-sm text-red-600 mt-1">
                Conflicts with: {conflicts.map(c => c.title).join(', ')}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
