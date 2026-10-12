import React from 'react';

export const ParticipantAttendanceCard = ({
  participantName = 'Jane Doe',
  totalSessions = 10,
  sessionsAttended = 8,
  minRequiredPercentage = 75.0,
}) => {
  const attendancePercentage = totalSessions > 0 ? ((sessionsAttended / totalSessions) * 100).toFixed(1) : 0;
  const isEligible = parseFloat(attendancePercentage) >= minRequiredPercentage;

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {participantName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Multi-Session Attendance Tracking
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Sessions</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalSessions}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400">Sessions Attended</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{sessionsAttended}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-700 dark:text-gray-300">Attendance Percentage</span>
          <span className="text-blue-600 dark:text-blue-400">{attendancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="pt-2">
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          isEligible
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-300'
        }`}>
          <span className="text-sm font-semibold">Certificate Eligibility</span>
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white dark:bg-gray-800 shadow-sm">
            {isEligible ? 'Eligible' : 'Not Eligible (Min: ' + minRequiredPercentage + '%)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantAttendanceCard;
