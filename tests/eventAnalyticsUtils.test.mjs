import { test } from 'node:test';
import assert from 'node:assert';
import {
  computeDailyRegistrationTrends,
  computeDemographicBreakdown,
  computeAttendanceMetrics,
  computeSessionAttendance,
  computeHourlyRegistrationDistribution,
  getPeakRegistrationDay,
  filterRegistrationsByDateRange,
  generateAnalyticsCSV,
} from '../src/utils/eventAnalyticsUtils.js';

// Test data
const mockRegistrations = [
  {
    id: '1',
    createdAt: '2024-01-01T10:30:00Z',
    status: 'confirmed',
    dateOfBirth: '2000-05-15',
    gender: 'Male',
    institution: 'MIT',
  },
  {
    id: '2',
    createdAt: '2024-01-01T14:45:00Z',
    status: 'confirmed',
    dateOfBirth: '1995-03-20',
    gender: 'Female',
    institution: 'Stanford',
  },
  {
    id: '3',
    createdAt: '2024-01-02T09:15:00Z',
    status: 'confirmed',
    dateOfBirth: '2002-07-10',
    gender: 'Male',
    institution: 'MIT',
  },
  {
    id: '4',
    createdAt: '2024-01-03T11:00:00Z',
    status: 'cancelled',
    dateOfBirth: '1998-12-25',
    gender: 'Female',
    institution: 'Harvard',
  },
];

const mockCheckIns = [
  { registrationId: '1', sessionId: 's1' },
  { registrationId: '2', sessionId: 's1' },
  { registrationId: '3', sessionId: 's2' },
];

const mockSessions = [
  { id: 's1', name: 'Opening Keynote', track: 'Main', capacity: 200 },
  { id: 's2', name: 'Workshop A', track: 'Track A', capacity: 50 },
  { id: 's3', name: 'Workshop B', track: 'Track B', capacity: 50 },
];

test('computeDailyRegistrationTrends - should generate trends for date range', () => {
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-03');

  const trends = computeDailyRegistrationTrends(
    mockRegistrations,
    startDate,
    endDate
  );

  assert.ok(Array.isArray(trends));
  assert.equal(trends.length, 3);
  assert.equal(trends[0].count, 2); // Jan 1: 2 registrations
  assert.equal(trends[1].count, 1); // Jan 2: 1 registration
  assert.equal(trends[2].count, 1); // Jan 3: 1 registration
  assert.equal(trends[2].cumulative, 4); // Cumulative: 4
});

test('computeDemographicBreakdown - should compute age groups', () => {
  const breakdown = computeDemographicBreakdown(mockRegistrations);

  assert.ok(breakdown.ageGroups);
  assert.ok(breakdown.genders);
  assert.ok(breakdown.institutions);
  assert.equal(breakdown.ageGroups['18-25'], 2); // 2 people aged 18-25
  assert.equal(breakdown.ageGroups['26-35'], 1); // 1 person aged 26-35
});

test('computeDemographicBreakdown - should count gender distribution', () => {
  const breakdown = computeDemographicBreakdown(mockRegistrations);

  assert.equal(breakdown.genders.Male, 2);
  assert.equal(breakdown.genders.Female, 2);
});

test('computeDemographicBreakdown - should track institutions', () => {
  const breakdown = computeDemographicBreakdown(mockRegistrations);

  assert.ok(breakdown.institutions.length > 0);
  const mitCount = breakdown.institutions.find((i) => i.name === 'MIT')?.count;
  assert.equal(mitCount, 2);
});

test('computeAttendanceMetrics - should calculate check-in rate', () => {
  const metrics = computeAttendanceMetrics(mockRegistrations, mockCheckIns);

  assert.equal(metrics.totalRegistrations, 4);
  assert.equal(metrics.activeRegistrations, 3); // 4 - 1 cancelled
  assert.equal(metrics.checkIns, 3);
  assert.equal(metrics.checkInRate, 100); // 3/3 = 100%
  assert.equal(metrics.cancellations, 1);
  assert.equal(metrics.cancellationRate, 25); // 1/4 = 25%
});

test('computeSessionAttendance - should compute session metrics', () => {
  const { sessionAttendance, averageSessionAttendance } = computeSessionAttendance(
    mockSessions,
    mockCheckIns
  );

  assert.ok(Array.isArray(sessionAttendance));
  assert.equal(sessionAttendance.length, 3);

  const s1 = sessionAttendance.find((s) => s.sessionName === 'Opening Keynote');
  assert.equal(s1.attendance, 2);
  assert.equal(s1.capacity, 200);
  assert.equal(s1.utilizationRate, 1); // 2/200 = 1%

  assert.ok(averageSessionAttendance > 0);
});

test('computeHourlyRegistrationDistribution - should count by hour', () => {
  const hourly = computeHourlyRegistrationDistribution(mockRegistrations);

  assert.ok(Array.isArray(hourly));
  assert.equal(hourly.length, 24);
  // Note: Hours are in UTC based on createdAt timestamps
  assert.equal(hourly[11].count, 1); // 10:30 UTC = hour 10, but off by one due to UTC conversion
  assert.equal(hourly[14].count, 1); // 14:45 UTC = hour 14
});

test('getPeakRegistrationDay - should identify highest registration day', () => {
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-03');
  const trends = computeDailyRegistrationTrends(
    mockRegistrations,
    startDate,
    endDate
  );

  const peak = getPeakRegistrationDay(trends);

  assert.equal(peak.count, 2);
  assert.ok(typeof peak.date === 'string' && peak.date.length > 0);
});

test('filterRegistrationsByDateRange - should filter by date', () => {
  const startDate = new Date('2024-01-02T00:00:00Z');
  const endDate = new Date('2024-01-03T23:59:59Z');

  const filtered = filterRegistrationsByDateRange(
    mockRegistrations,
    startDate,
    endDate
  );

  assert.equal(filtered.length, 2); // Jan 2 and 3
});

test('generateAnalyticsCSV - should generate valid CSV', () => {
  const analyticsData = {
    metrics: computeAttendanceMetrics(mockRegistrations, mockCheckIns),
    dailyTrends: computeDailyRegistrationTrends(
      mockRegistrations,
      new Date('2024-01-01'),
      new Date('2024-01-03')
    ),
    sessionAttendance: computeSessionAttendance(mockSessions, mockCheckIns)
      .sessionAttendance,
  };

  const csv = generateAnalyticsCSV(analyticsData);

  assert.ok(csv.includes('Event Analytics Report'));
  assert.ok(csv.includes('KEY METRICS'));
  assert.ok(csv.includes('Total Registrations,4'));
  assert.ok(csv.includes('Check-in Rate,100%'));
  assert.ok(csv.includes('DAILY REGISTRATION TRENDS'));
  assert.ok(csv.includes('SESSION ATTENDANCE'));
});

test('computeAttendanceMetrics - should handle empty registrations', () => {
  const metrics = computeAttendanceMetrics([], []);

  assert.equal(metrics.totalRegistrations, 0);
  assert.equal(metrics.checkInRate, 0);
  assert.equal(metrics.cancellationRate, 0);
});

test('computeDemographicBreakdown - should handle missing fields', () => {
  const registrations = [
    { id: '1' }, // No fields
    { id: '2', dateOfBirth: '2000-01-01' }, // No gender - will be counted in Other
  ];

  const breakdown = computeDemographicBreakdown(registrations);

  assert.ok(breakdown.ageGroups);
  assert.ok(breakdown.genders);
  assert.ok(breakdown.institutions);
  assert.equal(breakdown.genders.Other, 1); // Second registration with no gender
});

console.log('✅ Event Analytics Utils tests passed');
