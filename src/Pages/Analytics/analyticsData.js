import eventsData from '../Events/eventsMockData.json';

// ── Derived from real events mock data ──────────────────────────
export const EVENTS = eventsData;

export const getKPIs = () => {
  const total = EVENTS.length;
  const upcoming = EVENTS.filter(e => e.status === 'upcoming').length;
  const past = EVENTS.filter(e => e.status === 'past').length;
  const totalAttendees = EVENTS.reduce((s, e) => s + e.attendees, 0);
  const totalCapacity = EVENTS.reduce((s, e) => s + e.maxAttendees, 0);
  const avgFillRate = Math.round((totalAttendees / totalCapacity) * 100);
  const soldOut = EVENTS.filter(e => e.attendees >= e.maxAttendees).length;

  return { total, upcoming, past, totalAttendees, totalCapacity, avgFillRate, soldOut };
};

export const getTypeBreakdown = () => {
  const map = {};
  EVENTS.forEach(e => { map[e.type] = (map[e.type] || 0) + 1; });
  return Object.entries(map).map(([type, count]) => ({ type, count }));
};

export const getAttendeeTrend = () => {
  // Monthly attendee totals (grouped by month from event date)
  const map = {};
  EVENTS.forEach(e => {
    const month = new Date(e.date).toLocaleString('default', { month: 'short', year: '2-digit' });
    map[month] = (map[month] || 0) + e.attendees;
  });
  return Object.entries(map)
    .sort((a, b) => new Date('1 ' + a[0]) - new Date('1 ' + b[0]))
    .map(([month, attendees]) => ({ month, attendees }));
};

export const getFillRates = () =>
  EVENTS.map(e => ({
    title: e.title.length > 22 ? e.title.slice(0, 20) + '…' : e.title,
    rate: Math.round((e.attendees / e.maxAttendees) * 100),
    status: e.status,
    type: e.type,
  })).sort((a, b) => b.rate - a.rate);

export const getTopEvents = () =>
  [...EVENTS]
    .sort((a, b) => b.attendees - a.attendees)
    .slice(0, 5)
    .map(e => ({
      title: e.title,
      attendees: e.attendees,
      max: e.maxAttendees,
      type: e.type,
      status: e.status,
      location: e.location,
      date: e.date,
    }));

export const getLocationBreakdown = () => {
  const map = {};
  EVENTS.forEach(e => {
    const loc = e.location === 'Online' ? 'Online' : 'In-Person';
    map[loc] = (map[loc] || 0) + 1;
  });
  return Object.entries(map).map(([loc, count]) => ({ loc, count }));
};

// Simulated registration-over-time for a sparkline (last 7 days)
export const getDailyRegistrations = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const values = [42, 67, 55, 89, 120, 95, 73];
  return days.map((day, i) => ({ day, registrations: values[i] }));
};
