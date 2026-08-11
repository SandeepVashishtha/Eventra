import React, { useState, useMemo, useEffect } from 'react';
import { X, CheckCircle, Users, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getGroupMembers,
  getGroupPrimary,
  getGroupName,
  isEntireGroupCheckedIn,
  recordGroupCheckIns,
} from '../utils/checkInUtils';

/**
 * GroupCheckInModal Component
 * Modal for bulk check-in of group/party members
 * 
 * @param {Object} props
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 * @param {Object} primaryRegistration - The primary buyer's registration
 * @param {Array} registrations - All registrations for the event
 * @param {Array} existingCheckIns - Already recorded check-ins
 * @param {Function} onCheckIn - Callback when check-ins are recorded
 * @param {string} eventId - Current event ID
 */
const GroupCheckInModal = ({
  isOpen,
  onClose,
  primaryRegistration,
  registrations = [],
  existingCheckIns = [],
  onCheckIn,
  eventId,
}) => {
  // State for individual selections
  const [selectedMembers, setSelectedMembers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Get group information
  const groupId = primaryRegistration?.groupId;
  const groupMembers = useMemo(
    () => getGroupMembers(groupId, registrations),
    [groupId, registrations]
  );
  const primary = useMemo(
    () => getGroupPrimary(groupMembers),
    [groupMembers]
  );
  const groupName = useMemo(
    () => getGroupName(primaryRegistration || primary),
    [primaryRegistration, primary]
  );

  // Already checked in members
  const checkedInIds = useMemo(
    () => new Set(existingCheckIns.map((c) => c.registrationId)),
    [existingCheckIns]
  );

  // Initialize all members as selected (except those already checked in)
  useEffect(() => {
    if (isOpen && groupMembers.length > 0) {
      const initialSelections = {};
      groupMembers.forEach((member) => {
        // Skip already checked-in members
        if (!checkedInIds.has(member.id)) {
          initialSelections[member.id] = true;
        }
      });
      setSelectedMembers(initialSelections);
    }
  }, [isOpen, groupMembers, checkedInIds]);

  // Count selected members
  const selectedCount = useMemo(
    () => Object.values(selectedMembers).filter((v) => v).length,
    [selectedMembers]
  );

  // Total group size
  const groupSize = groupMembers.length;

  // Members not yet checked in
  const checkableMembers = useMemo(
    () => groupMembers.filter((m) => !checkedInIds.has(m.id)),
    [groupMembers, checkedInIds]
  );

  // All checkable members selected
  const allSelected = useMemo(
    () => checkableMembers.length > 0 && checkableMembers.every((m) => selectedMembers[m.id]),
    [checkableMembers, selectedMembers]
  );

  // Toggle individual member selection
  const toggleMember = (memberId) => {
    setSelectedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }));
  };

  // Toggle all members
  const toggleAll = () => {
    const newValue = !allSelected;
    const newSelections = {};
    checkableMembers.forEach((member) => {
      newSelections[member.id] = newValue;
    });
    setSelectedMembers(newSelections);
  };

  // Handle bulk check-in
  const handleBulkCheckIn = async () => {
    if (isProcessing) return;

    const membersToCheckIn = groupMembers.filter(
      (m) => selectedMembers[m.id] && !checkedInIds.has(m.id)
    );

    if (membersToCheckIn.length === 0) {
      toast.warning('No members selected for check-in');
      return;
    }

    setIsProcessing(true);

    try {
      // Record check-ins for selected members
      const newCheckIns = recordGroupCheckIns(
        membersToCheckIn,
        'bulk-group-check-in',
        existingCheckIns
      );

      // Call parent callback
      if (onCheckIn && newCheckIns.length > 0) {
        newCheckIns.forEach((checkIn) => {
          onCheckIn(checkIn, { registrationId: checkIn.registrationId, eventId });
        });

        toast.success(
          `✓ ${newCheckIns.length} member(s) checked in from ${groupName}`
        );
        onClose();
      }
    } catch (err) {
      console.error('Bulk check-in error:', err);
      toast.error('Failed to check in group members');
    } finally {
      setIsProcessing(false);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !groupId || groupMembers.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="group-checkin-title"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2
                id="group-checkin-title"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Group Check-In
              </h2>
              <p className="text-gray-600 dark:text-gray-200">
                {groupName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Summary */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                  Group Size
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {groupSize}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                  Already Checked In
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {groupMembers.filter((m) => checkedInIds.has(m.id)).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 font-medium">
                  Selected to Check In
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedCount}
                </p>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button
                onClick={toggleAll}
                className={`p-2 rounded-lg border-2 transition-colors ${
                  allSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
                aria-label={allSelected ? 'Deselect all' : 'Select all'}
              >
                {allSelected ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {allSelected ? 'All members selected' : 'Select all members'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-200">
                  {checkableMembers.length} members available for check-in
                </p>
              </div>
            </div>

            {/* Primary buyer (already checked in or not) */}
            {primary && (
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {primary.name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {primary.name || 'Primary Buyer'}
                      {primary.isGroupPrimary && (
                        <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-200">
                      {primary.email}
                    </p>
                  </div>
                  {checkedInIds.has(primary.id) ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Checked In</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-200">
                        Not yet checked in
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other group members */}
            <div className="space-y-2">
              {groupMembers
                .filter((m) => m.id !== primary?.id)
                .map((member) => {
                  const isCheckedIn = checkedInIds.has(member.id);
                  const isSelected = selectedMembers[member.id];

                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        isCheckedIn
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 opacity-60'
                          : isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleMember(member.id)}
                          disabled={isCheckedIn}
                          className={`p-2 rounded-lg transition-colors ${
                            isCheckedIn
                              ? 'bg-green-100 dark:bg-green-900/30 cursor-not-allowed'
                              : isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                          aria-label={isCheckedIn ? 'Already checked in' : isSelected ? 'Deselect for check-in' : 'Select for check-in'}
                        >
                          {isCheckedIn ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : isSelected ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {member.name || `Attendee ${member.id}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-200 truncate">
                            {member.email}
                          </p>
                        </div>
                        {isCheckedIn && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Checked In
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkCheckIn}
              disabled={isProcessing || selectedCount === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Check In Selected ({selectedCount})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCheckInModal;
