import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import EventCheckInScanner from './EventCheckInScanner';
import {
  computeCheckInStats,
  computeSessionCheckInStats,
  generateCheckInCSV,
  exportCheckInAsCSV,
  getCheckInHistory,
} from '../utils/checkInUtils.js';

/**
 * OrganizerCheckIn Component
 * Main page for event organizers to manage check-ins
 * Displays scanner, statistics, and check-in history
 */
const OrganizerCheckIn = ({ eventId, eventName, sessions = [], registrations = [] }) => {
  const [checkIns, setCheckIns] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessionStats, setSessionStats] = useState({});
  const [selectedSession, setSelectedSession] = useState('all');
  const [viewMode, setViewMode] = useState('scanner'); // 'scanner' or 'history'
  const [attendanceLogs, setAttendanceLogs] = useState([]);

  // Update statistics when check-ins change
  useEffect(() => {
    const newStats = computeCheckInStats(registrations, checkIns);
    setStats(newStats);

    if (sessions.length > 0) {
      const sessionStats = computeSessionCheckInStats(sessions, attendanceLogs, checkIns);
      setSessionStats(sessionStats);
    }
  }, [checkIns, registrations, sessions, attendanceLogs]);

  // Handle new check-in
  const handleCheckIn = (checkInRecord, qrData) => {
    setCheckIns((prev) => [...prev, checkInRecord]);

    // Add attendance log for session tracking
    if (selectedSession !== 'all') {
      setAttendanceLogs((prev) => [
        ...prev,
        {
          sessionId: selectedSession,
          registrationId: qrData.registrationId,
        },
      ]);
    }
  };

  // Get filtered check-ins based on selected session
  const getFilteredCheckIns = () => {
    if (selectedSession === 'all' || sessions.length === 0) {
      return checkIns;
    }

    const sessionAttendees = attendanceLogs
      .filter((a) => a.sessionId === selectedSession)
      .map((a) => a.registrationId);

    return checkIns.filter((c) => sessionAttendees.includes(c.registrationId));
  };

  // Export check-in data
  const handleExportCSV = () => {
    if (!stats || checkIns.length === 0) {
      toast.error('No check-in data to export');
      return;
    }

    try {
      // Filter based on selected session
      const filteredCheckIns = getFilteredCheckIns();
      generateCheckInCSV(stats, registrations, filteredCheckIns);
      toast.success('Check-in data copied to clipboard');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export check-in data');
    }
  };

  // Download CSV file
  const handleDownloadCSV = () => {
    if (!stats || checkIns.length === 0) {
      toast.error('No check-in data to download');
      return;
    }

    try {
      const filteredCheckIns = getFilteredCheckIns();
      const csv = generateCheckInCSV(stats, registrations, filteredCheckIns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `${eventName || 'event'}-check-ins-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Check-in data downloaded!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download check-in data');
    }
  };

  if (!stats) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  const filteredCheckIns = getFilteredCheckIns();
  const currentSessionStats = selectedSession !== 'all' ? sessionStats[selectedSession] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Event Check-In Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {eventName || 'Event'} - Manage attendee check-ins
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('scanner')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'scanner'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            Scanner
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
            }`}
          >
            History
          </button>
        </div>

        {/* Session Filter */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Session:
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.track || 'Main'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {viewMode === 'scanner' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner */}
            <div className="lg:col-span-1">
              <EventCheckInScanner
                eventId={eventId}
                onCheckIn={handleCheckIn}
                existingCheckIns={checkIns}
                registrations={registrations}
              />
            </div>

            {/* Statistics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Registered
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {currentSessionStats?.totalAttendees || stats.activeRegistrations}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Checked In
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {currentSessionStats?.checkedIn || stats.checkedIn}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Not Checked In
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                    {currentSessionStats?.notCheckedIn || stats.notCheckedIn}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Check-In Rate
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                    {currentSessionStats?.checkInRate || stats.checkInRate}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Check-In Progress
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>
                      {currentSessionStats?.checkedIn || stats.checkedIn} /{' '}
                      {currentSessionStats?.totalAttendees || stats.activeRegistrations}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${currentSessionStats?.checkInRate || stats.checkInRate}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Export Data
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Copy CSV
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* History View */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Check-In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Scanned By
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCheckIns.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No check-ins yet
                      </td>
                    </tr>
                  ) : (
                    filteredCheckIns
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((checkIn) => {
                        const reg = registrations.find((r) => r.id === checkIn.registrationId);
                        return (
                          <tr key={checkIn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              {reg?.name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {reg?.email || 'unknown@example.com'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {new Date(checkIn.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {checkIn.scannedBy}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerCheckIn;
