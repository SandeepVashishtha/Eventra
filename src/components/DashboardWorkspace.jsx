import React from 'react';
import ErrorBoundary from './ErrorBoundary';

// Example dashboard widgets
const AnalyticsWidget = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h3 className="font-semibold mb-2">Analytics Overview</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300">Real-time attendee metrics and registrations.</p>
  </div>
);

const CalendarWidget = () => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <h3 className="font-semibold mb-2">Event Schedule</h3>
    <p className="text-sm text-gray-600 dark:text-gray-300">Upcoming hackathon timelines and milestones.</p>
  </div>
);

export const DashboardWorkspace = () => {
  return (
    <div className="dashboard-workspace grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <ErrorBoundary widgetName="Analytics Widget">
        <AnalyticsWidget />
      </ErrorBoundary>

      <ErrorBoundary widgetName="Calendar Widget">
        <CalendarWidget />
      </ErrorBoundary>
    </div>
  );
};

export default DashboardWorkspace;
