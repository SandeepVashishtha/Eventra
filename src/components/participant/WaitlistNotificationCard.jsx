import React, { useState } from 'react';

export const WaitlistNotificationCard = ({
  eventTitle = 'AI & Future Tech Conference 2026',
  initialPreviousPosition = 8,
  initialCurrentPosition = 4,
  statusUpdateType = 'POSITION_IMPROVED',
  confirmationDeadline = '2026-08-15T18:00',
  onConfirmSeat,
}) => {
  const [confirmed, setConfirmed] = useState(false);

  const getStatusBadge = () => {
    switch (statusUpdateType) {
      case 'POSITION_IMPROVED':
        return { text: `Your waitlist position changed from #${initialPreviousPosition} to #${initialCurrentPosition}.`, color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' };
      case 'SEAT_AVAILABLE':
        return { text: 'A seat has opened up for you! Please claim your spot.', color: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300' };
      case 'PROMOTED':
        return { text: 'You have been promoted from the waitlist to registered participants!', color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300' };
      case 'CONFIRMATION_DEADLINE_APPROACHING':
        return { text: `Confirmation deadline approaching: ${confirmationDeadline}. Act quickly!`, color: 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-300' };
      default:
        return { text: `Waitlist position: #${initialCurrentPosition}`, color: 'bg-gray-50 dark:bg-gray-900 border-gray-300 text-gray-700 dark:text-gray-300' };
    }
  };

  const badge = getStatusBadge();

  const handleConfirm = () => {
    setConfirmed(true);
    if (onConfirmSeat) {
      onConfirmSeat({ eventTitle, currentPosition: initialCurrentPosition });
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Waitlist Status Update
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
        </p>
      </div>

      <div className={`p-4 rounded-xl border ${badge.color}`}>
        <p className="text-sm font-semibold">{badge.text}</p>
      </div>

      {confirmed ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold text-center">
          Seat successfully confirmed and secured!
        </div>
      ) : (
        (statusUpdateType === 'SEAT_AVAILABLE' || statusUpdateType === 'PROMOTED') && (
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Confirm & Claim Seat
          </button>
        )
      )}
    </div>
  );
};

export default WaitlistNotificationCard;
