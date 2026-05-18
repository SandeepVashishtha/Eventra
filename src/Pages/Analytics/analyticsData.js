import eventsData from '../Events/eventsMockData.json';

// ── Derived from real events mock data ──────────────────────────
export const EVENTS = eventsData;

export const getKPIs = (events = EVENTS) => {
  const total = events.length;
  if (total === 0) {
    return { total: 0, upcoming: 0, past: 0, totalAttendees: 0, totalCapacity: 0, avgFillRate: 0, soldOut: 0 };
  }
  const upcoming = events.filter(e => e.status === 'upcoming').length;
  const past = events.filter(e => e.status === 'past').length;
  const totalAttendees = events.reduce((s, e) => s + (e.attendees || 0), 0);
  const totalCapacity = events.reduce((s, e) => s + (e.maxAttendees || e.maxParticipants || 100), 0);
  const avgFillRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 0;
  const soldOut = events.filter(e => (e.attendees || 0) >= (e.maxAttendees || e.maxParticipants || 100)).length;

  return { total, upcoming, past, totalAttendees, totalCapacity, avgFillRate, soldOut };
};

export const getTypeBreakdown = (events = EVENTS) => {
  if (!events || events.length === 0) return [];
  const map = {};
  events.forEach(e => { 
    if (e.type) {
      map[e.type] = (map[e.type] || 0) + 1; 
    }
  });
  return Object.entries(map).map(([type, count]) => ({ type, count }));
};

export const getAttendeeTrend = (events = EVENTS) => {
  if (!events || events.length === 0) return [];
  // Monthly attendee totals (grouped by month from event date)
  const map = {};
  events.forEach(e => {
    if (e.date) {
      const month = new Date(e.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      map[month] = (map[month] || 0) + (e.attendees || 0);
    }
  });
  return Object.entries(map)
    .sort((a, b) => new Date('1 ' + a[0]) - new Date('1 ' + b[0]))
    .map(([month, attendees]) => ({ month, attendees }));
};

export const getFillRates = (events = EVENTS) => {
  if (!events || events.length === 0) return [];
  return events.map(e => ({
    title: e.title && e.title.length > 22 ? e.title.slice(0, 20) + '…' : (e.title || 'Untitled Event'),
    rate: Math.round(((e.attendees || 0) / (e.maxAttendees || e.maxParticipants || 100)) * 100),
    status: e.status || 'active',
    type: e.type || 'other',
  })).sort((a, b) => b.rate - a.rate);
};

export const getTopEvents = (events = EVENTS) => {
  if (!events || events.length === 0) return [];
  return [...events]
    .sort((a, b) => (b.attendees || 0) - (a.attendees || 0))
    .slice(0, 5)
    .map(e => ({
      title: e.title || 'Untitled Event',
      attendees: e.attendees || 0,
      max: e.maxAttendees || e.maxParticipants || 100,
      type: e.type || 'other',
      status: e.status || 'active',
      location: e.location || 'Unknown',
      date: e.date || '',
    }));
};

export const getLocationBreakdown = (events = EVENTS) => {
  if (!events || events.length === 0) return [];
  const map = {};
  events.forEach(e => {
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

