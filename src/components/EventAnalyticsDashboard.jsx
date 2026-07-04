import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';
import {
  computeDailyRegistrationTrends,
  computeDemographicBreakdown,
  computeAttendanceMetrics,
  computeSessionAttendance,
  computeHourlyRegistrationDistribution,
  getPeakRegistrationDay,
  filterRegistrationsByDateRange,
  exportAnalyticsAsCSV,
} from '../utils/eventAnalyticsUtils.js';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * EventAnalyticsDashboard component
 * Displays comprehensive event analytics including registration trends, attendance metrics,
 * demographic breakdown, and session attendance data
 */
export const EventAnalyticsDashboard = ({
  event,
  registrations = [],
  checkIns = [],
  sessions = [],
}) => {
  const [startDate, setStartDate] = useState(
    event?.eventDate
      ? new Date(event.eventDate)
      : new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(
    event?.eventEndDate ? new Date(event.eventEndDate) : new Date()
  );

  // Filter registrations by date range
  const filteredRegistrations = useMemo(
    () => filterRegistrationsByDateRange(registrations, startDate, endDate),
    [registrations, startDate, endDate]
  );

  // Compute analytics metrics
  const metrics = useMemo(
    () => computeAttendanceMetrics(filteredRegistrations, checkIns),
    [filteredRegistrations, checkIns]
  );

  const dailyTrends = useMemo(
    () => computeDailyRegistrationTrends(filteredRegistrations, startDate, endDate),
    [filteredRegistrations, startDate, endDate]
  );

  const demographics = useMemo(
    () => computeDemographicBreakdown(filteredRegistrations),
    [filteredRegistrations]
  );

  const { sessionAttendance, averageSessionAttendance } = useMemo(
    () => computeSessionAttendance(sessions, checkIns),
    [sessions, checkIns]
  );

  const hourlyDistribution = useMemo(
    () => computeHourlyRegistrationDistribution(filteredRegistrations),
    [filteredRegistrations]
  );

  const peakDay = useMemo(() => getPeakRegistrationDay(dailyTrends), [dailyTrends]);

  // Prepare demographic data for charts
  const ageGroupData = useMemo(
    () =>
      Object.entries(demographics.ageGroups).map(([ageGroup, count]) => ({
        name: ageGroup,
        count,
      })),
    [demographics.ageGroups]
  );

  const genderData = useMemo(
    () =>
      Object.entries(demographics.genders).map(([gender, count]) => ({
        name: gender,
        count,
      })),
    [demographics.genders]
  );

  // Export analytics
  const handleExport = () => {
    const analyticsData = {
      metrics,
      dailyTrends,
      sessionAttendance,
      demographics,
    };
    exportAnalyticsAsCSV(analyticsData, event?.name || 'event-analytics');
  };

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold mt-2" style={{ color }}>
        {value}
      </p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
            <p className="text-gray-600 mt-1">{event?.name || 'Event'} - Dashboard</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={20} />
            Export CSV
          </button>
        </div>

        {/* Date Range Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-2" />
              End Date
            </label>
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Registrations"
            value={metrics.totalRegistrations}
            color="#3b82f6"
          />
          <MetricCard
            title="Check-in Rate"
            value={`${metrics.checkInRate}%`}
            subtitle={`${metrics.checkIns} check-ins`}
            color="#10b981"
          />
          <MetricCard
            title="Peak Registration Day"
            value={peakDay.count}
            subtitle={peakDay.date}
            color="#f59e0b"
          />
          <MetricCard
            title="Active Registrations"
            value={metrics.activeRegistrations}
            color="#8b5cf6"
          />
          <MetricCard
            title="Cancellations"
            value={metrics.cancellations}
            subtitle={`${metrics.cancellationRate}% rate`}
            color="#ef4444"
          />
          <MetricCard
            title="Avg Session Attendance"
            value={Math.round(averageSessionAttendance)}
            color="#ec4899"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Registration Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Daily Registration Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  name="Daily Registrations"
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Hourly Registration Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Registrations by Age Group
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ageGroupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Registrations by Gender
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Attendance Table */}
        {sessionAttendance.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Session Attendance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Session Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Track
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Capacity
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Attendance
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-900">
                      Utilization
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessionAttendance.map((session) => (
                    <tr key={session.sessionName} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{session.sessionName}</td>
                      <td className="py-3 px-4 text-gray-600">{session.sessionTrack}</td>
                      <td className="py-3 px-4 text-center text-gray-900">
                        {session.capacity}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-900">
                        {session.attendance}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {session.utilizationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Institutions */}
        {demographics.institutions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Institutions</h2>
            <div className="space-y-2">
              {demographics.institutions.map((institution) => (
                <div
                  key={institution.name}
                  className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded"
                >
                  <span className="font-medium text-gray-900">{institution.name}</span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {institution.count} registrations
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;
