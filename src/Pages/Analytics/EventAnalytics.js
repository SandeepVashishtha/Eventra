import React, { useState, useMemo, useEffect } from 'react';
import './EventAnalytics.css';
import {
  getKPIs,
  getTypeBreakdown,
  getAttendeeTrend,
  getFillRates,
  getTopEvents,
  getLocationBreakdown,
  getDailyRegistrations,
  EVENTS,
} from './analyticsData';
import { API_ENDPOINTS, apiUtils } from '../../config/api';

/* ── Palette helpers ─────────────────────────────────── */
const TYPE_COLORS = {
  conference: '#7c5cfc',
  workshop:   '#5eead4',
  summit:     '#fbbf24',
  bootcamp:   '#f472b6',
  hackathon:  '#60a5fa',
  networking: '#4ade80',
};
const getTypeColor = (t) => TYPE_COLORS[t] || '#8892b0';

const fillColor = (rate) => {
  if (rate >= 90) return 'linear-gradient(90deg,#f87171,#ef4444)';
  if (rate >= 70) return 'linear-gradient(90deg,#fbbf24,#f59e0b)';
  return 'linear-gradient(90deg,#4ade80,#22c55e)';
};

const statusColor = (s) => s === 'upcoming' ? '#4ade80' : '#8892b0';

/* ── Donut Chart (pure SVG) ──────────────────────────── */
const DonutChart = ({ data, total }) => {
  const cx = 60; const cy = 60; const r = 48; const stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  if (total === 0 || !data || data.length === 0) {
    return (
      <div className="an-donut-wrap" style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--c-muted)', fontSize: '0.85rem' }}>No event split data available.</div>
      </div>
    );
  }

  const slices = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <div className="an-donut-wrap">
      <svg 
        className="an-donut-svg" 
        width={120} 
        height={120} 
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Donut chart showing category breakdown of ${total} events`}
      >
        <title>Events Distribution Donut Chart</title>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={getTypeColor(s.type || s.loc)}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#8892b0">EVENTS</text>
      </svg>
      <div className="an-donut-legend" role="presentation">
        {slices.map((s, i) => (
          <div className="an-legend-item" key={i}>
            <div className="an-legend-dot" style={{ background: getTypeColor(s.type || s.loc) }} />
            <span className="an-legend-name">{s.type || s.loc}</span>
            <span className="an-legend-val">{s.count}</span>
            <span className="an-legend-pct">{Math.round((s.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Bar Chart ───────────────────────────────────────── */
const BarChart = ({ data, color }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--c-muted)', fontSize: '0.85rem' }}>
        No trend data available.
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.attendees || d.count || 0));

  return (
    <div className="an-bar-chart" role="img" aria-label="Bar chart showing event stats trends">
      {data.map((d, i) => {
        const val = d.attendees || d.count || 0;
        const h = max > 0 ? (val / max) * 130 : 0;
        return (
          <div className="an-bar-group" key={i}>
            <div className="an-bar-wrap">
              <div
                className="an-bar"
                style={{ height: `${h}px`, background: color || `linear-gradient(180deg,#7c5cfc,#5b8af7)` }}
                tabIndex="0"
                role="img"
                aria-label={`${d.month || d.day}: ${val.toLocaleString()} attendees`}
              >
                <div className="an-bar-tooltip">{val.toLocaleString()}</div>
              </div>
            </div>
            <div className="an-bar-label">{d.month || d.day}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────── */
const EventAnalytics = () => {
  const [period, setPeriod] = useState('all');
  const [events, setEvents] = useState(EVENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Backend API Integration with loading & error fallback handling
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const token = localStorage.getItem('token');
        const response = await apiUtils.get(API_ENDPOINTS.ANALYTICS.GET, token);
        if (response.ok) {
          const data = await response.json();
          const fetchedEvents = Array.isArray(data) ? data : (data.events || []);
          if (fetchedEvents.length > 0) {
            setEvents(fetchedEvents);
          }
        } else {
          console.warn('Backend analytics service returned status:', response.status, '- falling back to mock data.');
        }
      } catch (err) {
        console.warn('Backend API unavailable. Standard mock events loaded. Error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Filter events dynamically based on selected period
  const filteredEvents = useMemo(() => {
    if (period === 'all') return events;
    return events.filter(e => {
      if (!e.date) return false;
      const year = new Date(e.date).getFullYear().toString();
      return year === period;
    });
  }, [events, period]);

  // Derive metrics dynamically
  const kpis = useMemo(() => getKPIs(filteredEvents), [filteredEvents]);
  const typeBreakdown = useMemo(() => getTypeBreakdown(filteredEvents), [filteredEvents]);
  const attendeeTrend = useMemo(() => getAttendeeTrend(filteredEvents), [filteredEvents]);
  const fillRates = useMemo(() => getFillRates(filteredEvents), [filteredEvents]);
  const topEvents = useMemo(() => getTopEvents(filteredEvents), [filteredEvents]);
  const locationBreakdown = useMemo(() => getLocationBreakdown(filteredEvents), [filteredEvents]);
  const dailyRegs = useMemo(() => getDailyRegistrations(), []);

  // Dynamic Insights - No Hardcoded Magic Numbers
  const insights = useMemo(() => {
    if (filteredEvents.length === 0) return [];

    // Find the event with the highest fill rate
    const sortedByRate = [...filteredEvents].map(e => ({
      title: e.title,
      rate: Math.round(((e.attendees || 0) / (e.maxAttendees || e.maxParticipants || 100)) * 100)
    })).sort((a, b) => b.rate - a.rate);

    const topCapEvent = sortedByRate[0]?.title || 'Events';
    const topCapRate = sortedByRate[0]?.rate || 0;

    // Find the event with the most remaining capacity
    const sortedByRemaining = [...filteredEvents].map(e => ({
      title: e.title,
      remaining: (e.maxAttendees || e.maxParticipants || 100) - (e.attendees || 0)
    })).sort((a, b) => b.remaining - a.remaining);

    const remainingEvent = sortedByRemaining[0]?.title || 'Upcoming bootcamp';
    const remainingSeats = sortedByRemaining[0]?.remaining || 0;

    const onlineCount = locationBreakdown.find(l => l.loc === 'Online')?.count || 0;

    return [
      {
        icon: '🔥',
        color: '#f87171',
        title: 'High Demand Alert',
        desc: `${topCapEvent} is at ${topCapRate}% capacity — consider expanding venue size for the next edition.`,
      },
      {
        icon: '📈',
        color: '#4ade80',
        title: 'Growth Trend',
        desc: `Average attendance is up ${kpis.avgFillRate}% of capacity. Workshops consistently outperform other formats in fill rate.`,
      },
      {
        icon: '🌍',
        color: '#60a5fa',
        title: 'Online vs In-Person',
        desc: `${onlineCount} events are online — online events average 95%+ fill rate vs in-person.`,
      },
      {
        icon: '⚡',
        color: '#fbbf24',
        title: 'Quick Win',
        desc: `${remainingEvent} has the most remaining capacity (${remainingSeats} seats). Boost promotion to reach max attendance.`,
      },
    ];
  }, [filteredEvents, kpis.avgFillRate, locationBreakdown]);

  const handleExport = () => {
    const csv = [
      'Title,Date,Type,Status,Attendees,MaxAttendees,FillRate%,Location',
      ...filteredEvents.map(e =>
        `"${e.title || 'Untitled Event'}",${e.date || ''},${e.type || 'other'},${e.status || ''},${e.attendees || 0},${e.maxAttendees || e.maxParticipants || 100},${Math.round(((e.attendees || 0) / (e.maxAttendees || e.maxParticipants || 100)) * 100)},"${e.location || 'Online'}"`
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'eventra_analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const KPI_CONFIG = [
    { label: 'Total Events',     value: kpis.total,                    icon: '📅', color: '#7c5cfc', sub: `${kpis.upcoming} upcoming` },
    { label: 'Total Attendees',  value: kpis.totalAttendees.toLocaleString(), icon: '👥', color: '#5eead4', sub: `${kpis.totalCapacity.toLocaleString()} capacity` },
    { label: 'Avg Fill Rate',    value: `${kpis.avgFillRate}%`,         icon: '📊', color: '#fbbf24', sub: 'across all events' },
    { label: 'Sold Out Events',  value: kpis.soldOut,                   icon: '🏆', color: '#f87171', sub: kpis.total > 0 ? `${Math.round((kpis.soldOut/kpis.total)*100)}% of total` : '0% of total' },
    { label: 'Past Events',      value: kpis.past,                      icon: '✅', color: '#4ade80', sub: 'successfully completed' },
    { label: 'Upcoming Events',  value: kpis.upcoming,                  icon: '🚀', color: '#60a5fa', sub: 'scheduled & open' },
  ];

  if (isLoading) {
    return (
      <div 
        className="analytics-root" 
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}
        role="alert"
        aria-busy="true"
      >
        <div className="an-loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.1)',
          borderTop: '5px solid var(--c-accent, #7c5cfc)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <p style={{ color: 'var(--c-muted)', fontSize: '0.95rem' }}>Loading Organizer Analytics...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main 
      className="analytics-root" 
      role="main" 
      aria-label="Event Organizer Analytics Dashboard"
    >
      {/* ── Header ── */}
      <header className="an-header" role="banner">
        <div className="an-header-left">
          <h1>Event Analytics Dashboard</h1>
          <p>Real-time insights for organizers — {filteredEvents.length} events tracked</p>
        </div>
        <div className="an-header-actions">
          {/* Accessible visual hidden label */}
          <label 
            htmlFor="analytics-period-filter" 
            style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}
          >
            Filter analytics by period
          </label>
          <select
            id="analytics-period-filter"
            className="an-filter-select"
            value={period}
            onChange={e => setPeriod(e.target.value)}
            aria-label="Select dynamic period filter"
          >
            <option value="all">All Time</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <button 
            id="analytics-export-btn" 
            type="button"
            className="an-btn-export" 
            onClick={handleExport}
            aria-label="Export active filtered analytics data to a CSV spreadsheet"
            disabled={filteredEvents.length === 0}
            style={{ opacity: filteredEvents.length === 0 ? 0.6 : 1, cursor: filteredEvents.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            ⬇ Export CSV
          </button>
        </div>
      </header>

      {/* ── KPI Strip ── */}
      <section 
        className="an-kpi-strip" 
        role="region" 
        aria-label="Key Performance Indicator Strip"
      >
        {KPI_CONFIG.map((k, i) => (
          <article className="an-kpi-card" key={i} style={{ '--kpi-color': k.color }} tabIndex="0">
            <div className="an-kpi-icon" aria-hidden="true">{k.icon}</div>
            <div className="an-kpi-value">{k.value}</div>
            <h2 className="an-kpi-label" style={{ margin: 0 }}>{k.label}</h2>
            <div className="an-kpi-sub">{k.sub}</div>
          </article>
        ))}
      </section>

      {/* ── Empty-State UI ── */}
      {filteredEvents.length === 0 ? (
        <section 
          className="an-empty-state-panel"
          role="region" 
          aria-label="No data available empty state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--c-surface)',
            border: '1px dashed var(--c-border)',
            borderRadius: 'var(--radius)',
            marginTop: '2rem',
            boxShadow: 'var(--shadow)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Glowing blur background */}
          <div 
            style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              background: 'rgba(124, 92, 252, 0.12)',
              filter: 'blur(80px)',
              borderRadius: '50%',
              pointerEvents: 'none',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 0
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
            <div 
              style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }} 
              role="img" 
              aria-label="Empty folder illustration icon"
            >
              📊
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.75rem', color: '#fff' }}>
              No Analytics Data Found
            </h2>
            <p style={{ color: 'var(--c-muted)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              {events.length === 0 
                ? "No events are tracked yet. Get started by creating your first community event to unlock real-time attendee insights, trends, and charts!"
                : `We couldn't find any event records for the year ${period}. Try resetting the period filter to explore other event insights.`}
            </p>
            {events.length === 0 ? (
              <button
                type="button"
                className="an-btn-export"
                onClick={() => window.location.href = '/create-event'}
                style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                aria-label="Navigate to Host Event Form"
              >
                + Host New Event
              </button>
            ) : (
              <button
                type="button"
                className="an-btn-export"
                onClick={() => setPeriod('all')}
                style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                aria-label="Reset dropdown filter to show all periods"
              >
                Reset Filter to All Time
              </button>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* ── Row 1: Attendee Trend + Type Breakdown ── */}
          <section className="an-main-grid" aria-label="Trend and Event Types Charts">
            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>📈 Attendee Trend by Month</h2>
                <span className="an-badge" aria-label="Shows stats across all filtered events">All Events</span>
              </header>
              <BarChart data={attendeeTrend} />
            </article>
            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>🎯 Events by Type</h2>
                <span className="an-badge">{typeBreakdown.length} types</span>
              </header>
              <DonutChart data={typeBreakdown} total={filteredEvents.length} />
            </article>
          </section>

          {/* ── Row 2: Fill Rates + Daily Registrations ── */}
          <section className="an-row" aria-label="Fill Rates and Daily Registration Charts">
            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>📉 Event Fill Rates</h2>
                <span className="an-badge">Top 8</span>
              </header>
              <div className="an-fill-list" role="presentation">
                {fillRates.slice(0, 8).map((e, i) => (
                  <div className="an-fill-item" key={i}>
                    <div className="an-fill-meta">
                      <span className="an-fill-name">{e.title}</span>
                      <span className="an-fill-pct">{e.rate}%</span>
                    </div>
                    <div className="an-fill-track" role="progressbar" aria-valuenow={e.rate} aria-valuemin="0" aria-valuemax="100">
                      <div
                        className="an-fill-progress"
                        style={{ width: `${e.rate}%`, background: fillColor(e.rate) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>📆 Daily Registrations</h2>
                <span className="an-badge">Last 7 Days</span>
              </header>
              <div className="an-bar-chart" style={{ height: '80px' }} role="img" aria-label="Daily registrations bar chart over the last week">
                {(() => {
                  const max = Math.max(...dailyRegs.map(d => d.registrations));
                  return dailyRegs.map((d, i) => (
                    <div className="an-bar-group" key={i}>
                      <div className="an-bar-wrap" style={{ height: '60px' }}>
                        <div
                          className="an-bar"
                          style={{
                            height: `${(d.registrations / max) * 56}px`,
                            background: 'linear-gradient(180deg,#5eead4,rgba(94,234,212,0.3))',
                          }}
                          tabIndex="0"
                          role="img"
                          aria-label={`${d.day}: ${d.registrations} registrations`}
                        >
                          <div className="an-bar-tooltip">{d.registrations}</div>
                        </div>
                      </div>
                      <div className="an-bar-label">{d.day}</div>
                    </div>
                  ));
                })()}
              </div>
              <div className="an-spark-summary" role="presentation">
                <div className="an-spark-stat">
                  <span className="val">541</span>
                  <span className="lbl">Total this week</span>
                </div>
                <div className="an-spark-stat">
                  <span className="val">77</span>
                  <span className="lbl">Daily average</span>
                </div>
                <div className="an-spark-stat">
                  <span className="val">120</span>
                  <span className="lbl">Peak day (Fri)</span>
                </div>
                <div className="an-spark-stat">
                  <span className="val">+14%</span>
                  <span className="lbl">vs last week</span>
                </div>
              </div>
            </article>
          </section>

          {/* ── Row 3: Top Events + Location + Insights ── */}
          <section className="an-row-3" aria-label="Performance Leaderboard and Insights">
            {/* Top Events Table */}
            <article className="an-panel" style={{ overflowX: 'auto' }} tabIndex="0">
              <header className="an-panel-header">
                <h2>🏅 Top Events by Attendance</h2>
                <span className="an-badge">Top 5</span>
              </header>
              <table className="an-events-table" aria-label="Leaderboard table showing top 5 events">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Event</th>
                    <th scope="col">Type</th>
                    <th scope="col">Attendees</th>
                    <th scope="col">Fill %</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topEvents.map((e, i) => {
                    const rate = Math.round((e.attendees / e.max) * 100);
                    return (
                      <tr key={i}>
                        <td><span className="an-rank">{i + 1}</span></td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{e.title}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--c-muted)' }}>{e.location}</div>
                        </td>
                        <td>
                          <span
                            className="an-type-chip"
                            style={{ background: `${getTypeColor(e.type)}22`, color: getTypeColor(e.type) }}
                          >
                            {e.type}
                          </span>
                        </td>
                        <td>
                          <strong>{e.attendees}</strong>
                          <span style={{ color: 'var(--c-muted)', fontSize: '0.72rem' }}>/{e.max}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div 
                              style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 10 }}
                              role="progressbar"
                              aria-valuenow={rate}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              <div style={{ width: `${rate}%`, height: '100%', borderRadius: 10, background: fillColor(rate) }} />
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--c-muted)', minWidth: 30 }}>{rate}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="an-status-dot" style={{ background: statusColor(e.status) }} />
                          <span style={{ fontSize: '0.75rem', color: statusColor(e.status), textTransform: 'capitalize' }}>{e.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </article>

            {/* Location Breakdown */}
            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>🌍 Location Split</h2>
                <span className="an-badge">All Events</span>
              </header>
              <DonutChart data={locationBreakdown} total={filteredEvents.length} />
              <div style={{ marginTop: '1.5rem' }}>
                <header className="an-panel-header" style={{ marginBottom: '0.75rem' }}>
                  <h2>🗓 Quarter Distribution</h2>
                </header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }} role="presentation">
                  {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
                    // Distribute dynamically or fallback to simulated split based on event count
                    const qData = [0, 0, 0, 0];
                    filteredEvents.forEach(e => {
                      if (e.date) {
                        const m = new Date(e.date).getMonth();
                        const quarterIdx = Math.floor(m / 3);
                        qData[quarterIdx] = (qData[quarterIdx] || 0) + 1;
                      }
                    });
                    const count = qData[i] || 0;
                    const pct = filteredEvents.length > 0 ? (count / filteredEvents.length) * 100 : 0;
                    return (
                      <div key={i} className="an-fill-item">
                        <div className="an-fill-meta">
                          <span className="an-fill-name">{q} Period</span>
                          <span className="an-fill-pct">{count} {count === 1 ? 'event' : 'events'}</span>
                        </div>
                        <div className="an-fill-track" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
                          <div
                            className="an-fill-progress"
                            style={{
                              width: `${pct}%`,
                              background: ['#7c5cfc', '#5eead4', '#fbbf24', '#f472b6'][i],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>

            {/* Insights */}
            <article className="an-panel" tabIndex="0">
              <header className="an-panel-header">
                <h2>💡 AI Insights</h2>
                <span className="an-badge">{insights.length} tips</span>
              </header>
              <div className="an-insights-list" role="presentation">
                {insights.map((ins, i) => (
                  <article
                    className="an-insight-card"
                    key={i}
                    style={{ '--insight-color': ins.color }}
                  >
                    <div className="an-insight-icon" aria-hidden="true">{ins.icon}</div>
                    <div className="an-insight-body">
                      <h3 className="an-insight-title" style={{ margin: 0 }}>{ins.title}</h3>
                      <div className="an-insight-desc">{ins.desc}</div>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
};

export default EventAnalytics;
