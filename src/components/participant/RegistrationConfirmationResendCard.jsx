import React, { useState } from 'react';

export const RegistrationConfirmationResendCard = ({
  eventName = 'Global AI & Robotics Symposium 2026',
  registrationId = 10045,
  eventDateTime = '2026-09-10 10:00 AM',
  venueOrMeetingLink = 'Main Auditorium, Tech Hub / https://meet.eventra.com/global-ai',
  registrationStatus = 'CONFIRMED',
  participantEmail = 'jane.doe@example.com',
  onResendSubmit,
}) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = () => {
    setLoading(true);
    if (onResendSubmit) {
      onResendSubmit({ registrationId, participantEmail });
    }
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(`Confirmation email successfully resent to ${participantEmail}!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Registration Confirmation
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventName}</span>
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Registration ID</p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">#{registrationId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{registrationStatus}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{eventDateTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Venue / Link</p>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">{venueOrMeetingLink}</p>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
        >
          {loading ? 'Sending Confirmation...' : `Resend Confirmation to ${participantEmail}`}
        </button>
      </div>
    </div>
  );
};

export default RegistrationConfirmationResendCard;
