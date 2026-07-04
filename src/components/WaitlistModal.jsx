import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { joinWaitlist, leaveWaitlist, getQueuePosition } from '../utils/waitlistUtils.js';
import { useAuth } from '../context/AuthContext';

/**
 * WaitlistModal Component
 * Allows users to join or leave the waitlist for a full event
 */
const WaitlistModal = ({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  isUserOnWaitlist = false,
  queuePosition = -1,
  onJoinSuccess,
  onLeaveSuccess,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
  });

  if (!isOpen) return null;

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error('Please log in to join the waitlist');
      return;
    }

    setIsLoading(true);
    try {
      await joinWaitlist(eventId, user, {
        phone: formData.phone,
        eventTitle,
      });

      toast.success('Successfully joined the waitlist!');
      setFormData({ phone: '' });

      if (onJoinSuccess) {
        onJoinSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.message || 'Failed to join waitlist';
      toast.error(errorMsg);
      console.error('Join waitlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      await leaveWaitlist(eventId, user.id);

      toast.success('You have left the waitlist');
      setFormData({ phone: '' });

      if (onLeaveSuccess) {
        onLeaveSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMsg = error.message || 'Failed to leave waitlist';
      toast.error(errorMsg);
      console.error('Leave waitlist error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isUserOnWaitlist ? 'Waitlist Information' : 'Join Waitlist'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isUserOnWaitlist ? (
            // User is on waitlist
            <>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You are currently on the waitlist for:
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {eventTitle}
                </p>

                {queuePosition > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Queue Position: <span className="text-2xl font-bold">{queuePosition}</span>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      You will be notified if a spot opens up and you get promoted.
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If spots become available or attendees cancel, we'll automatically promote you to
                  confirmed registration and send you a notification.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleLeaveWaitlist}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isLoading ? 'Leaving...' : 'Leave Waitlist'}
                </button>
              </div>
            </>
          ) : (
            // User is not on waitlist
            <>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  This event is currently full, but you can join the waitlist. If a spot opens up,
                  we'll automatically promote you to a confirmed registration!
                </p>

                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {eventTitle}
                </p>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We'll use this to contact you when a spot opens up
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✓ Waitlist Benefits
                  </h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Automatic promotion when spots open up</li>
                    <li>• Real-time notifications</li>
                    <li>• No need to keep checking</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinWaitlist}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
