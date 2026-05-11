import React, { useState, useMemo } from 'react';
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
      <svg className="an-donut-svg" width={120} height={120} viewBox="0 0 120 120">
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
      <div className="an-donut-legend">
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
  const max = Math.max(...data.map(d => d.attendees || d.count || 0));
  return (
    <div className="an-bar-chart">
      {data.map((d, i) => {
        const val = d.attendees || d.count || 0;
        const h = max > 0 ? (val / max) * 130 : 0;
        return (
          <div className="an-bar-group" key={i}>
            <div className="an-bar-wrap">
              <div
                className="an-bar"
                style={{ height: `${h}px`, background: color || `linear-gradient(180deg,#7c5cfc,#5b8af7)` }}
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

  const kpis = useMemo(() => getKPIs(), []);
  const typeBreakdown = useMemo(() => getTypeBreakdown(), []);
  const attendeeTrend = useMemo(() => getAttendeeTrend(), []);
  const fillRates = useMemo(() => getFillRates(), []);
  const topEvents = useMemo(() => getTopEvents(), []);
  const locationBreakdown = useMemo(() => getLocationBreakdown(), []);
  const dailyRegs = useMemo(() => getDailyRegistrations(), []);

  const insights = [
    {
      icon: '🔥',
      color: '#f87171',
      title: 'High Demand Alert',
      desc: `DevOps Summit & React Conference are at 100% capacity — consider expanding venue size for next edition.`,
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
      desc: `${locationBreakdown.find(l => l.loc === 'Online')?.count || 0} events are online — online events average 95%+ fill rate vs in-person.`,
    },
    {
      icon: '⚡',
      color: '#fbbf24',
      title: 'Quick Win',
      desc: `Game Development Bootcamp has the most remaining capacity (${50-40} seats). Boost promotion to reach max attendance.`,
    },
  ];

  const handleExport = () => {
    const csv = [
      'Title,Date,Type,Status,Attendees,MaxAttendees,FillRate%,Location',
      ...EVENTS.map(e =>
        `"${e.title}",${e.date},${e.type},${e.status},${e.attendees},${e.maxAttendees},${Math.round((e.attendees/e.maxAttendees)*100)},"${e.location}"`
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
    { label: 'Sold Out Events',  value: kpis.soldOut,                   icon: '🏆', color: '#f87171', sub: `${Math.round((kpis.soldOut/kpis.total)*100)}% of total` },
    { label: 'Past Events',      value: kpis.past,                      icon: '✅', color: '#4ade80', sub: 'successfully completed' },
    { label: 'Upcoming Events',  value: kpis.upcoming,                  icon: '🚀', color: '#60a5fa', sub: 'scheduled & open' },
  ];

  return (
    <div className="analytics-root">

      {/* ── Header ── */}
      <div className="an-header">
        <div className="an-header-left">
          <h1>Event Analytics Dashboard</h1>
          <p>Real-time insights for organizers — {EVENTS.length} events tracked</p>
        </div>
        <div className="an-header-actions">
          <select
            id="analytics-period-filter"
            className="an-filter-select"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <button id="analytics-export-btn" className="an-btn-export" onClick={handleExport}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="an-kpi-strip">
        {KPI_CONFIG.map((k, i) => (
          <div className="an-kpi-card" key={i} style={{ '--kpi-color': k.color }}>
            <div className="an-kpi-icon">{k.icon}</div>
            <div className="an-kpi-value">{k.value}</div>
            <div className="an-kpi-label">{k.label}</div>
            <div className="an-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Attendee Trend + Type Breakdown ── */}
      <div className="an-main-grid">
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>📈 Attendee Trend by Month</h2>
            <span className="an-badge">All Events</span>
          </div>
          <BarChart data={attendeeTrend} />
        </div>
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>🎯 Events by Type</h2>
            <span className="an-badge">{typeBreakdown.length} types</span>
          </div>
          <DonutChart data={typeBreakdown} total={EVENTS.length} />
        </div>
      </div>

      {/* ── Row 2: Fill Rates + Daily Registrations ── */}
      <div className="an-row">
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>📉 Event Fill Rates</h2>
            <span className="an-badge">Top 8</span>
          </div>
          <div className="an-fill-list">
            {fillRates.slice(0, 8).map((e, i) => (
              <div className="an-fill-item" key={i}>
                <div className="an-fill-meta">
                  <span className="an-fill-name">{e.title}</span>
                  <span className="an-fill-pct">{e.rate}%</span>
                </div>
                <div className="an-fill-track">
                  <div
                    className="an-fill-progress"
                    style={{ width: `${e.rate}%`, background: fillColor(e.rate) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="an-panel">
          <div className="an-panel-header">
            <h2>📆 Daily Registrations</h2>
            <span className="an-badge">Last 7 Days</span>
          </div>
          <div className="an-bar-chart" style={{ height: '80px' }}>
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
                    >
                      <div className="an-bar-tooltip">{d.registrations}</div>
                    </div>
                  </div>
                  <div className="an-bar-label">{d.day}</div>
                </div>
              ));
            })()}
          </div>
          <div className="an-spark-summary">
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
        </div>
      </div>

      {/* ── Row 3: Top Events + Location + Insights ── */}
      <div className="an-row-3">
        {/* Top Events Table */}
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>🏅 Top Events by Attendance</h2>
            <span className="an-badge">Top 5</span>
          </div>
          <table className="an-events-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Event</th>
                <th>Type</th>
                <th>Attendees</th>
                <th>Fill %</th>
                <th>Status</th>
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
                        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 10 }}>
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
        </div>

        {/* Location Breakdown */}
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>🌍 Location Split</h2>
            <span className="an-badge">All Events</span>
          </div>
          <DonutChart data={locationBreakdown} total={EVENTS.length} />
          <div style={{ marginTop: '1.5rem' }}>
            <div className="an-panel-header" style={{ marginBottom: '0.75rem' }}>
              <h2>🗓 Month Distribution</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map((q, i) => {
                const vals = [3, 3, 4, 4];
                return (
                  <div key={i} className="an-fill-item">
                    <div className="an-fill-meta">
                      <span className="an-fill-name">{q}</span>
                      <span className="an-fill-pct">{vals[i]} events</span>
                    </div>
                    <div className="an-fill-track">
                      <div
                        className="an-fill-progress"
                        style={{
                          width: `${(vals[i] / 5) * 100}%`,
                          background: ['#7c5cfc', '#5eead4', '#fbbf24', '#f472b6'][i],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="an-panel">
          <div className="an-panel-header">
            <h2>💡 AI Insights</h2>
            <span className="an-badge">{insights.length} tips</span>
          </div>
          <div className="an-insights-list">
            {insights.map((ins, i) => (
              <div
                className="an-insight-card"
                key={i}
                style={{ '--insight-color': ins.color }}
              >
                <div className="an-insight-icon">{ins.icon}</div>
                <div className="an-insight-body">
                  <div className="an-insight-title">{ins.title}</div>
                  <div className="an-insight-desc">{ins.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default EventAnalytics;
