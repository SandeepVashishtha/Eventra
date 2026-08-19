import React, { useState } from 'react';

export const EventFinancialSummaryCard = ({
  eventTitle = 'Annual Tech Summit 2026',
  initialData = {
    totalRegistrations: 150,
    grossRevenue: 7500.00,
    refunds: 300.00,
    estimatedExpenses: 2500.00,
  },
  onDownloadReport,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const netRevenue = initialData.grossRevenue - initialData.refunds;
  const revenuePerParticipant = initialData.totalRegistrations > 0 ? (netRevenue / initialData.totalRegistrations).toFixed(2) : '0.00';
  const profitOrLoss = netRevenue - initialData.estimatedExpenses;

  const handleDownload = () => {
    if (onDownloadReport) {
      onDownloadReport({ startDate, endDate, netRevenue, estimatedExpenses: initialData.estimatedExpenses });
    }
    setDownloadSuccess('Financial report downloaded successfully.');
    setTimeout(() => setDownloadSuccess(''), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Financial Summary
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition"
        >
          Download Report
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm">
          {downloadSuccess}
        </div>
      )}

      {/* Date Filter Section */}
      <div className="flex flex-wrap gap-4 items-end bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Start Date Filter
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
            End Date Filter
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Registrations</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{initialData.totalRegistrations}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Registration Revenue</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${initialData.grossRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Refunds Issued</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">-${initialData.refunds.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Net Revenue</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">${netRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Expenses</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">${initialData.estimatedExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">Revenue per Participant</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">${revenuePerParticipant}</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-500 rounded-xl flex justify-between items-center">
        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">Estimated Event Balance (Profit/Loss)</span>
        <span className={`text-lg font-bold ${profitOrLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {profitOrLoss >= 0 ? `+$${profitOrLoss.toFixed(2)}` : `-$${Math.abs(profitOrLoss).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
};

export default EventFinancialSummaryCard;
