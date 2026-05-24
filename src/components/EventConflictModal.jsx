import React from 'react';
import { AlertTriangle, Clock, Calendar, X, ArrowRight } from 'lucide-react';
import { formatTimeRange } from '../../utils/conflictDetection';

/**
 * EventConflictModal
 * 
 * A modal component that displays a warning when a user tries to register
 * for an event that conflicts with their existing registrations.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {object} props.newEvent - The event the user is trying to register for
 * @param {Array} props.conflictingEvents - Array of events that conflict
 * @param {Array} props.suggestedEvents - Array of alternative event suggestions
 * @param {Function} props.onCancel - Callback when user cancels registration
 * @param {Function} props.onProceed - Callback when user proceeds despite conflict
 * @param {Function} props.onSelectAlternative - Callback when user selects an alternative event
 * @param {boolean} props.strictMode - If true, blocks registration (no proceed option)
 */
const EventConflictModal = ({
  isOpen,
  newEvent,
  conflictingEvents = [],
  suggestedEvents = [],
  onCancel,
  onProceed,
  onSelectAlternative,
  strictMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Scheduling Conflict Detected
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                This event overlaps with one or more events you've already registered for.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* New Event Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Event You're Trying to Register For
            </h3>
            <div className="text-blue-800 dark:text-blue-200">
              <p className="font-medium text-lg">{newEvent?.title}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(newEvent?.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeRange(newEvent?.time)}
                </span>
              </div>
            </div>
          </div>

          {/* Conflicting Events */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Conflicting Event{conflictingEvents.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-3">
              {conflictingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800"
                >
                  <p className="font-medium text-red-900 dark:text-red-100">{event.title}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-red-700 dark:text-red-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeRange(event.time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Suggestions */}
          {suggestedEvents.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Suggested Alternatives
              </h3>
              <div className="space-y-3">
                {suggestedEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectAlternative?.(event)}
                    className="w-full text-left bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100 group-hover:text-green-800 dark:group-hover:text-green-200">
                          {event.title}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-green-700 dark:text-green-300">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeRange(event.time)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel Registration
          </button>
          {!strictMode && (
            <button
              onClick={onProceed}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              Proceed Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventConflictModal;
