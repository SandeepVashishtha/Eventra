/**
 * eventAnalyticsUtils.js
 * Utilities for computing event analytics metrics including registration trends,
 * attendance rates, demographic breakdowns, and engagement metrics.
 */

/**
 * Computes daily registration trends for an event
 * @param {Array} registrations - Array of registration objects with createdAt timestamps
 * @param {Date} startDate - Start date for range
 * @param {Date} endDate - End date for range
 * @returns {Array} Array of {date, count, cumulative} objects
 */
export const computeDailyRegistrationTrends = (registrations = [], startDate, endDate) => {
  const trends = {};
  let cumulative = 0;

  // Initialize all dates in range with 0
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    trends[dateKey] = { count: 0, date: new Date(d) };
  }

  // Count registrations per day
  registrations.forEach((reg) => {
    if (!reg.createdAt) return;
    const regDate = new Date(reg.createdAt).toISOString().split('T')[0];
    if (trends[regDate]) {
      trends[regDate].count += 1;
    }
  });

  // Convert to array and calculate cumulative
  return Object.entries(trends)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, data]) => {
      cumulative += data.count;
      return {
        date: data.date.toLocaleDateString(),
        count: data.count,
        cumulative,
      };
    });
};

/**
 * Computes demographic breakdown of registrations
 * @param {Array} registrations - Array of registration objects
 * @returns {Object} Demographic breakdown {ageGroups, genders, institutions}
 */
export const computeDemographicBreakdown = (registrations = []) => {
  const ageGroups = {
    '13-17': 0,
    '18-25': 0,
    '26-35': 0,
    '36-50': 0,
    '50+': 0,
  };

  const genders = {
    Male: 0,
    Female: 0,
    Other: 0,
    Prefer_not_to_say: 0,
  };

  const institutions = {};

  registrations.forEach((reg) => {
    // Age group calculation
    if (reg.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(reg.dateOfBirth).getFullYear();
      if (age >= 13 && age <= 17) ageGroups['13-17']++;
      else if (age >= 18 && age <= 25) ageGroups['18-25']++;
      else if (age >= 26 && age <= 35) ageGroups['26-35']++;
      else if (age >= 36 && age <= 50) ageGroups['36-50']++;
      else if (age > 50) ageGroups['50+']++;
    }

    // Gender distribution
    if (reg.gender && genders[reg.gender] !== undefined) {
      genders[reg.gender]++;
    } else if (reg.gender) {
      genders.Other++;
    }

    // Institution distribution
    if (reg.institution) {
      institutions[reg.institution] = (institutions[reg.institution] || 0) + 1;
    }
  });

  return {
    ageGroups,
    genders,
    institutions: Object.entries(institutions)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10), // Top 10 institutions
  };
};

/**
 * Computes attendance and engagement metrics
 * @param {Array} registrations - Array of registration objects
 * @param {Array} checkIns - Array of check-in objects with userId/registrationId
 * @returns {Object} Metrics {totalRegistrations, checkIns, checkInRate, cancellations, cancellationRate}
 */
export const computeAttendanceMetrics = (registrations = [], checkIns = []) => {
  const totalRegistrations = registrations.length;
  const cancellations = registrations.filter((r) => r.status === 'cancelled').length;
  const activeRegistrations = totalRegistrations - cancellations;
  const registrationCheckIns = new Set(
    checkIns.map((c) => c.registrationId || c.userId)
  ).size;

  const checkInRate =
    activeRegistrations > 0 ? (registrationCheckIns / activeRegistrations) * 100 : 0;
  const cancellationRate =
    totalRegistrations > 0 ? (cancellations / totalRegistrations) * 100 : 0;

  return {
    totalRegistrations,
    activeRegistrations,
    checkIns: registrationCheckIns,
    checkInRate: Math.round(checkInRate * 100) / 100,
    cancellations,
    cancellationRate: Math.round(cancellationRate * 100) / 100,
  };
};

/**
 * Computes session attendance for multi-track events
 * @param {Array} sessions - Array of session objects
 * @param {Array} checkIns - Array of check-in objects with sessionId
 * @returns {Object} Session attendance data {sessionAttendance, averageSessionAttendance}
 */
export const computeSessionAttendance = (sessions = [], checkIns = []) => {
  const sessionAttendance = {};
  let totalAttendance = 0;

  sessions.forEach((session) => {
    const sessionCheckIns = checkIns.filter((c) => c.sessionId === session.id).length;
    const capacity = session.capacity || 100;
    const utilizationRate = (sessionCheckIns / capacity) * 100;

    sessionAttendance[session.id] = {
      sessionName: session.name,
      sessionTrack: session.track,
      capacity,
      attendance: sessionCheckIns,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
    };

    totalAttendance += sessionCheckIns;
  });

  const averageSessionAttendance =
    Object.keys(sessionAttendance).length > 0
      ? totalAttendance / Object.keys(sessionAttendance).length
      : 0;

  return {
    sessionAttendance: Object.values(sessionAttendance),
    averageSessionAttendance: Math.round(averageSessionAttendance * 100) / 100,
  };
};

/**
 * Computes hourly registration distribution
 * @param {Array} registrations - Array of registration objects
 * @returns {Array} Array of {hour, count} objects
 */
export const computeHourlyRegistrationDistribution = (registrations = []) => {
  const hourly = {};

  for (let i = 0; i < 24; i++) {
    hourly[i] = 0;
  }

  registrations.forEach((reg) => {
    if (reg.createdAt) {
      const hour = new Date(reg.createdAt).getHours();
      hourly[hour]++;
    }
  });

  return Object.entries(hourly).map(([hour, count]) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    count,
  }));
};

/**
 * Identifies peak registration day
 * @param {Array} dailyTrends - Result from computeDailyRegistrationTrends
 * @returns {Object} {date, count}
 */
export const getPeakRegistrationDay = (dailyTrends = []) => {
  if (dailyTrends.length === 0) return { date: 'N/A', count: 0 };

  return dailyTrends.reduce((peak, current) =>
    current.count > peak.count ? current : peak
  );
};

/**
 * Filters registrations by date range
 * @param {Array} registrations - Array of registration objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered registrations
 */
export const filterRegistrationsByDateRange = (
  registrations = [],
  startDate,
  endDate
) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return registrations.filter((reg) => {
    if (!reg.createdAt) return false;
    const regTime = new Date(reg.createdAt).getTime();
    return regTime >= start && regTime <= end;
  });
};

/**
 * Generates CSV content from analytics data
 * @param {Object} analyticsData - Analytics data including metrics, trends, etc.
 * @returns {string} CSV content
 */
export const generateAnalyticsCSV = (analyticsData) => {
  const { metrics, dailyTrends, sessionAttendance, demographics } = analyticsData;

  let csv = 'Event Analytics Report\n\n';

  // Metrics section
  csv += 'KEY METRICS\n';
  csv += 'Metric,Value\n';
  if (metrics) {
    csv += `Total Registrations,${metrics.totalRegistrations}\n`;
    csv += `Active Registrations,${metrics.activeRegistrations}\n`;
    csv += `Check-ins,${metrics.checkIns}\n`;
    csv += `Check-in Rate,${metrics.checkInRate}%\n`;
    csv += `Cancellations,${metrics.cancellations}\n`;
    csv += `Cancellation Rate,${metrics.cancellationRate}%\n\n`;
  }

  // Daily trends section
  if (dailyTrends && dailyTrends.length > 0) {
    csv += 'DAILY REGISTRATION TRENDS\n';
    csv += 'Date,Daily Registrations,Cumulative\n';
    dailyTrends.forEach((trend) => {
      csv += `${trend.date},${trend.count},${trend.cumulative}\n`;
    });
    csv += '\n';
  }

  // Session attendance section
  if (sessionAttendance && sessionAttendance.length > 0) {
    csv += 'SESSION ATTENDANCE\n';
    csv += 'Session Name,Track,Capacity,Attendance,Utilization Rate (%)\n';
    sessionAttendance.forEach((session) => {
      csv += `${session.sessionName},${session.sessionTrack},${session.capacity},${session.attendance},${session.utilizationRate}\n`;
    });
    csv += '\n';
  }

  return csv;
};

/**
 * Exports analytics data as CSV file
 * @param {Object} analyticsData - Analytics data
 * @param {string} eventName - Name of the event (for filename)
 */
export const exportAnalyticsAsCSV = (analyticsData, eventName = 'event-analytics') => {
  const csv = generateAnalyticsCSV(analyticsData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${eventName}-analytics-${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
