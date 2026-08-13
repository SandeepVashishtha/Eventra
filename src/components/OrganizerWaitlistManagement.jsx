import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from 'context/AuthContext';
import { API_ENDPOINTS, apiUtils } from '../config/api';
import {
  syncWaitlistFromServer,
  organizerRemoveUser,
  promoteNextUser,
  handleCapacityIncrease,
  getWaitlistAnalytics,
  importCsvWaitlist,
} from '../utils/waitlistUtils.js';

/**
 * OrganizerWaitlistManagement Component
 * Provides organizers with tools to manage event waitlists and auto-promotions
 */
const OrganizerWaitlistManagement = ({ eventId, eventName, currentAttendees = 0, maxAttendees = 0 }) => {
  const { user } = useAuth();
  const [waitlist, setWaitlist] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCapacityForm, setShowCapacityForm] = useState(false);
  const [newCapacity, setNewCapacity] = useState(maxAttendees);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // CSV Import state
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importErrors, setImportErrors] = useState([]);
  const fileInputRef = useRef(null);


  const loadWaitlistData = useCallback(async () => {
    try {
      const data = await syncWaitlistFromServer(eventId, user?.id);
      setWaitlist(data);

      const analyticsData = await getWaitlistAnalytics(eventId, user?.id);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load waitlist data:', error);
      toast.error('Failed to load waitlist data');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, user?.id]);

  // Load waitlist data
  useEffect(() => {
    loadWaitlistData();
    const interval = setInterval(loadWaitlistData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [loadWaitlistData]);

  // Promote the next user manually
  const handlePromoteNext = async () => {
    if (waitlist.length === 0) {
      toast.error('No users on waitlist to promote');
      return;
    }

    setIsProcessing(true);
    try {
      const event = { id: eventId, title: eventName };
      const promoted = await promoteNextUser(eventId, event, user?.id);

      if (promoted) {
        toast.success(`${promoted.userName} has been promoted from the waitlist!`);
        loadWaitlistData();
      } else {
        toast.error('Failed to promote user from waitlist');
      }
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error('Failed to promote user');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle capacity increase and auto-promote
  const handleCapacityChange = async () => {
    if (!newCapacity || newCapacity <= maxAttendees) {
      toast.error('New capacity must be greater than current capacity');
      return;
    }

    setIsProcessing(true);
    try {
      // Persist capacity via organizer update endpoint before promoting.
      const detailResponse = await apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
      const current = detailResponse.data || {};
      const eventDate = current.eventDate;
      const normalizedEventDate =
        typeof eventDate === 'string'
          ? eventDate.replace(/\.\d{3}Z$/, '').replace(/Z$/, '').slice(0, 19)
          : eventDate;

      await apiUtils.put(API_ENDPOINTS.EVENTS.DETAIL(eventId), {
        title: current.title || eventName,
        description: current.description || '',
        location: current.location || '',
        eventDate: normalizedEventDate,
        capacity: Number(newCapacity),
        isPublic: current.public ?? current.isPublic,
        category: current.category,
        ...(current.imageUrl ? { imageUrl: current.imageUrl } : {}),
        ...(current.tags ? { tags: current.tags } : {}),
      });

      const event = {
        id: eventId,
        title: eventName,
        attendees: currentAttendees,
        maxAttendees: Number(newCapacity),
        capacity: Number(newCapacity),
      };

      const promotedCount = await handleCapacityIncrease(event, Number(newCapacity), user?.id);

      if (promotedCount > 0) {
        toast.success(`${promotedCount} user(s) promoted from waitlist!`);
        loadWaitlistData();
      } else {
        toast.info('No users to promote from waitlist');
      }

      setShowCapacityForm(false);
      setNewCapacity(maxAttendees);
    } catch (error) {
      console.error('Capacity change error:', error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to update capacity and promote users');
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove user from waitlist
  const handleRemoveUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from the waitlist?`)) {
      return;
    }

    try {
      await organizerRemoveUser(eventId, userId, user?.id);
      toast.success(`${userName} has been removed from the waitlist`);
      loadWaitlistData();
    } catch (error) {
      console.error('Remove user error:', error);
      toast.error('Failed to remove user from waitlist');
    }
  };

  // CSV Import handlers
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvText(text);
      
      // Preview first few lines to validate format
      const lines = text.split('\n');
      if (lines.length > 0) {
        const header = lines[0].toLowerCase();
        if (!header.includes('name') || !header.includes('email') || !header.includes('timestamp')) {
          toast.warning('CSV should contain Name, Email, and Timestamp columns');
        }
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read CSV file');
    };
    reader.readAsText(file);
  };

  const handleCsvTextChange = (e) => {
    setCsvText(e.target.value);
  };

  const handleClearCsv = () => {
    setCsvText('');
    setImportErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) {
      toast.error('Please paste CSV data or upload a CSV file');
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    setImportProgress({ current: 0, total: 0 });

    try {
      const result = await importCsvWaitlist(eventId, csvText, user?.id);
      
      if (result.success) {
        toast.success(result.message);
        loadWaitlistData(); // Refresh the waitlist
        setShowCsvImport(false);
        handleClearCsv();
      } else {
        toast.error(result.message);
        if (result.errors && result.errors.length > 0) {
          setImportErrors(result.errors);
        }
      }
    } catch (error) {
      console.error('CSV import error:', error);
      toast.error(error.message || 'Failed to import CSV data');
      if (error.errors) {
        setImportErrors(error.errors);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadCsvTemplate = () => {
    const template = `Name,Email,Timestamp
John Doe,john@example.com,2024-01-15T10:30:00Z
Jane Smith,jane@example.com,2024-01-16T14:45:00Z
Bob Johnson,bob@example.com,2024-01-17T09:15:00Z`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'waitlist_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading waitlist data...</div>;
  }

  const spotsAvailable = maxAttendees - currentAttendees;
  const canAutoPromote = spotsAvailable > 0 && waitlist.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Waitlist Management
          </h1>
          <p className="text-gray-600 dark:text-gray-200">
            {eventName || 'Event'} - Manage waitlist and auto-promotions
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Capacity Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-gray-600 dark:text-gray-200 text-sm font-medium mb-2">
                Current Capacity
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentAttendees} / {maxAttendees}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200 mt-2">
                {spotsAvailable} spots available
              </div>
            </div>

            {/* Waitlist Count */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-gray-600 dark:text-gray-200 text-sm font-medium mb-2">
                Waitlist
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {analytics.waiting}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200 mt-2">
                {analytics.totalWaitlisted} total recorded
              </div>
            </div>

            {/* Promoted Users */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-gray-600 dark:text-gray-200 text-sm font-medium mb-2">
                Promoted
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analytics.promoted}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200 mt-2">
                {analytics.promotionRate}% promotion rate
              </div>
            </div>

            {/* Avg Wait Time */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="text-gray-600 dark:text-gray-200 text-sm font-medium mb-2">
                Avg Wait Time
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.averageWaitTime}h
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200 mt-2">
                Hours until promotion
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={handlePromoteNext}
            disabled={!canAutoPromote || isProcessing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Promote Next User'}
          </button>

          <button
            onClick={() => setShowCapacityForm(!showCapacityForm)}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Increase Capacity
          </button>

          <button
            onClick={() => setShowCsvImport(true)}
            disabled={isProcessing}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Import CSV Waitlist
          </button>
        </div>

        {/* Capacity Increase Form */}
        {showCapacityForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Increase Event Capacity
            </h3>
            <p className="text-gray-600 dark:text-gray-200 mb-4">
              When you increase the capacity, waitlisted users will automatically be promoted to fill
              the new spots.
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Capacity
                </label>
                <input
                  type="number"
                  value={maxAttendees}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 opacity-50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Capacity
                </label>
                <input
                  type="number"
                  min={maxAttendees + 1}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 0)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleCapacityChange}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Update Capacity'}
              </button>
              <button
                onClick={() => {
                  setShowCapacityForm(false);
                  setNewCapacity(maxAttendees);
                }}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showCsvImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Import Legacy Waitlist Data
                </h3>
                <button
                  onClick={() => {
                    setShowCsvImport(false);
                    handleClearCsv();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-200">
                  Import existing waitlist data from legacy systems (like Eventbrite) into Eventra. 
                  The CSV file should contain <strong>Name, Email, Timestamp</strong> columns.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                  Users will be mapped to existing Eventra accounts by email. Entries will be sorted by timestamp to maintain fair queuing.
                </p>
              </div>

              {/* CSV Upload Options */}
              <div className="mb-4">
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📁 Upload CSV File</span>
                  </button>
                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📄 Download Template</span>
                  </button>
                  <button
                    onClick={handleClearCsv}
                    disabled={!csvText}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>

                {/* File input (hidden) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvFileChange}
                  accept=".csv,text/csv"
                  className="hidden"
                />
              </div>

              {/* CSV Text Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CSV Data
                </label>
                <textarea
                  value={csvText}
                  onChange={handleCsvTextChange}
                  placeholder="Name,Email,Timestamp&#10;John Doe,john@example.com,2024-01-15T10:30:00Z&#10;Jane Smith,jane@example.com,2024-01-16T14:45:00Z"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-200 font-mono text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={8}
                />
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                  Format: CSV with Name, Email, Timestamp columns. Timestamps should be in ISO format (e.g., 2024-01-15T10:30:00Z)
                </p>
              </div>

              {/* Import Errors */}
              {importErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Errors found:
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {importErrors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importErrors.length > 10 && (
                      <li>... and {importErrors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCsvImport}
                  disabled={isImporting || !csvText.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isImporting ? 'Importing...' : 'Import CSV Data'}
                </button>
                <button
                  onClick={() => {
                    setShowCsvImport(false);
                    handleClearCsv();
                  }}
                  disabled={isImporting}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Progress indicator */}
              {isImporting && importProgress.total > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
                    {importProgress.current} of {importProgress.total} entries processed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Waitlist Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {waitlist.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-200">
                      No users on waitlist
                    </td>
                  </tr>
                ) : (
                  waitlist.map((user, index) => (
                    <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {user.userName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-200">
                        {user.userEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-200">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-200">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleRemoveUser(user.userId, user.userName)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            ℹ️ How Auto-Promotion Works
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>
              • When an attendee cancels, the first user on the waitlist is automatically promoted
            </li>
            <li>
              • When you increase event capacity, users are automatically promoted to fill the new
              spots
            </li>
            <li>• Users receive notifications when they are promoted</li>
            <li>• You can manually promote the next user or remove users from the waitlist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrganizerWaitlistManagement;

