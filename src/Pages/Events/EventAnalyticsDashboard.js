import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import eventsData from './eventsMockData.json';
import './EventAnalyticsDashboard.css';

const registrationTrends = [
  { month: 'Oct', registrations: 75 },
  { month: 'Nov', registrations: 95 },
  { month: 'Dec', registrations: 400 },
  { month: 'Jan', registrations: 60 },
  { month: 'Feb', registrations: 120 },
  { month: 'Mar', registrations: 250 },
  { month: 'Apr', registrations: 80 },
  { month: 'May', registrations: 65 },
  { month: 'Jun', registrations: 180 },
  { month: 'Jul', registrations: 220 },
  { month: 'Aug', registrations: 150 },
  { month: 'Sep', registrations: 240 },
];

const feedbackData = [
  { event: 'React Conf', rating: 4.8, responses: 210 },
  { event: 'AI Workshop', rating: 4.6, responses: 98 },
  { event: 'DevOps Summit', rating: 4.9, responses: 380 },
  { event: 'Blockchain', rating: 4.2, responses: 60 },
  { event: 'UX Master', rating: 4.7, responses: 55 },
];

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const TABS = ['overview', 'registrations', 'demographics', 'feedback'];

const getChartTheme = (isDarkMode) => ({
  grid: isDarkMode ? '#334155' : '#e5e7eb',
  axis: isDarkMode ? '#cbd5e1' : '#475569',
  tooltipBg: isDarkMode ? '#0f172a' : '#ffffff',
  tooltipText: isDarkMode ? '#f8fafc' : '#1e293b',
  tooltipBorder: isDarkMode ? '#475569' : '#cbd5e1',
  legend: isDarkMode ? '#e2e8f0' : '#374151',
  primary: isDarkMode ? '#818cf8' : '#6366f1',
  secondary: isDarkMode ? '#38bdf8' : '#c7d2fe',
});

const chartTooltipProps = (chartTheme) => ({
  contentStyle: {
    backgroundColor: chartTheme.tooltipBg,
    borderColor: chartTheme.tooltipBorder,
    borderRadius: 12,
    color: chartTheme.tooltipText,
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
  },
  labelStyle: { color: chartTheme.tooltipText, fontWeight: 700 },
  itemStyle: { color: chartTheme.tooltipText },
});

const axisTick = (chartTheme, fontSize = 12) => ({
  fill: chartTheme.axis,
  fontSize,
});

const renderPieLabel = (chartTheme) => ({ name, percent, x, y, textAnchor }) => (
  <text x={x} y={y} fill={chartTheme.axis} fontSize={12} fontWeight={600} textAnchor={textAnchor} dominantBaseline="central">
    {`${name} ${(percent * 100).toFixed(0)}%`}
  </text>
);

// --- Subcomponents (Now accepting props instead of using global scope) ---

const RegistrationLineChart = ({ chartTheme, height = 260, showLegend = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={registrationTrends}>
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
      <XAxis dataKey="month" tick={axisTick(chartTheme)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
      <YAxis tick={axisTick(chartTheme)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
      <Tooltip {...chartTooltipProps(chartTheme)} />
      {showLegend && <Legend wrapperStyle={{ color: chartTheme.legend }} />}
      <Line type="monotone" dataKey="registrations" stroke={chartTheme.primary} strokeWidth={3} dot={{ r: showLegend ? 6 : 5, fill: chartTheme.primary, stroke: chartTheme.tooltipBg, strokeWidth: 2 }} activeDot={{ r: 7 }} name="Registrations" />
    </LineChart>
  </ResponsiveContainer>
);

const AttendanceBarChart = ({ chartTheme, data, height = 260, layout = 'horizontal', showLegend = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout={layout}>
      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
      {layout === 'vertical' ? (
        <>
          <XAxis type="number" tick={axisTick(chartTheme, 11)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
          <YAxis dataKey="name" type="category" tick={axisTick(chartTheme, 11)} width={110} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" tick={axisTick(chartTheme, 11)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
          <YAxis tick={axisTick(chartTheme)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
        </>
      )}
      <Tooltip {...chartTooltipProps(chartTheme)} />
      {showLegend && <Legend wrapperStyle={{ color: chartTheme.legend }} />}
      <Bar dataKey="attendees" fill={chartTheme.primary} radius={layout === 'vertical' ? [0, 6, 6, 0] : [6, 6, 0, 0]} name="Attendees" />
      <Bar dataKey="capacity" fill={chartTheme.secondary} radius={layout === 'vertical' ? [0, 6, 6, 0] : [6, 6, 0, 0]} name="Capacity" />
    </BarChart>
  </ResponsiveContainer>
);

const KPIHeader = ({ totalEvents, registrations, fillRate, avgRating }) => (
  <div className="ead-header">
    <div className="ead-header-left">
      <span className="sb-badge sb-hosted">Organizer View</span>
      <h1 className="ead-title">Event Analytics</h1>
      <p className="ead-subtitle">Data-driven insights for smarter decisions</p>
    </div>
    <div className="ead-header-right">
      <div className="ead-kpi">
        <span className="ead-kpi-val">{totalEvents}</span>
        <span className="ead-kpi-label">Total Events</span>
      </div>
      <div className="ead-kpi">
        <span className="ead-kpi-val">{registrations.toLocaleString()}</span>
        <span className="ead-kpi-label">Registrations</span>
      </div>
      <div className="ead-kpi">
        <span className="ead-kpi-val">{fillRate}%</span>
        <span className="ead-kpi-label">Fill Rate</span>
      </div>
      <div className="ead-kpi">
        <span className="ead-kpi-val">⭐ {avgRating}</span>
        <span className="ead-kpi-label">Avg Rating</span>
      </div>
    </div>
  </div>
);

const OverviewTab = ({ chartTheme, topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">📈 Registrations Over Time</h2>
      <RegistrationLineChart chartTheme={chartTheme} height={260} />
    </div>
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">🏆 Top Performing Events</h2>
      <AttendanceBarChart chartTheme={chartTheme} data={topEvents} height={260} layout="vertical" />
    </div>
  </div>
);

const RegistrationsTab = ({ chartTheme, topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📅 Monthly Registration Trends</h2>
      <RegistrationLineChart chartTheme={chartTheme} height={320} showLegend />
    </div>
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📊 All Events — Attendance vs Capacity</h2>
      <AttendanceBarChart chartTheme={chartTheme} data={topEvents} height={320} />
    </div>
  </div>
);

const DemographicsTab = ({ chartTheme, typeData, locationData }) => (
  <div className="ead-grid">
    <div className="ead-card">
      <h2 className="ead-card-title">🎯 Attendees by Event Type</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderPieLabel(chartTheme)} labelLine={{ stroke: chartTheme.axis }}>
            {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip {...chartTooltipProps(chartTheme)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="ead-card">
      <h2 className="ead-card-title">📍 Attendees by Region</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={locationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={renderPieLabel(chartTheme)} labelLine={{ stroke: chartTheme.axis }}>
            {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip {...chartTooltipProps(chartTheme)} />
          <Legend wrapperStyle={{ color: chartTheme.legend }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const FeedbackTab = ({ chartTheme }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">⭐ Average Ratings by Event</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={feedbackData}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="event" tick={axisTick(chartTheme)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
          <YAxis domain={[0, 5]} tick={axisTick(chartTheme)} axisLine={{ stroke: chartTheme.grid }} tickLine={{ stroke: chartTheme.grid }} />
          <Tooltip {...chartTooltipProps(chartTheme)} />
          <Bar dataKey="rating" fill={chartTheme.primary} radius={[6, 6, 0, 0]} name="Avg Rating" />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">💬 Feedback Summary</h2>
      <div className="ead-feedback-list">
        {feedbackData.map((f, i) => (
          <div key={i} className="ead-feedback-row">
            <span className="ead-feedback-event">{f.event}</span>
            <div className="ead-feedback-bar-wrap">
              <div className="ead-feedback-bar" style={{ width: `${(f.rating / 5) * 100}%` }} />
            </div>
            <span className="ead-feedback-rating">⭐ {f.rating}</span>
            <span className="ead-feedback-responses">{f.responses} responses</span>
          </div>
        ))}
      </div>
      <div className="ead-sentiment">
        <div className="ead-sentiment-item ead-sentiment--positive">
          <span>😊 Positive</span><strong>78%</strong>
        </div>
        <div className="ead-sentiment-item ead-sentiment--neutral">
          <span>😐 Neutral</span><strong>15%</strong>
        </div>
        <div className="ead-sentiment-item ead-sentiment--negative">
          <span>😞 Negative</span><strong>7%</strong>
        </div>
      </div>
    </div>
  </div>
);

const EventAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { isDarkMode } = useTheme();
  const chartTheme = useMemo(() => getChartTheme(isDarkMode), [isDarkMode]);

  // 🔥 THE ALGO FIX: Single O(N) pass utilizing Hash Maps and useMemo 🔥
  const memoizedEventData = useMemo(() => {
    let registrations = 0;
    let capacity = 0;
    const typeMap = {};
    const locMap = {};

    // 1. Single iteration pass combining the 3 previous separate loops
    eventsData.forEach(e => {
      registrations += e.attendees;
      capacity += e.maxAttendees;
      
      typeMap[e.type] = (typeMap[e.type] || 0) + e.attendees;
      
      const loc = e.location === 'Online' ? 'Online' : e.location.split(',')[1]?.trim() || e.location;
      locMap[loc] = (locMap[loc] || 0) + e.attendees;
    });

    const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    const locationData = Object.entries(locMap).map(([name, value]) => ({ name, value }));
    const fillRate = capacity ? Math.round((registrations / capacity) * 100) : 0;

    // 2. Isolated Sort — top 6 events by attendees
    const topEvents = [...eventsData]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 6)
      .map(e => ({ name: e.title?.slice(0, 20) || e.name, attendees: e.attendees, capacity: e.maxAttendees }));

    const avgRating = (
      feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
    ).toFixed(1);

    return { registrations, capacity, fillRate, typeData, locationData, topEvents, avgRating };
  }, []);

  const { registrations, fillRate, typeData, locationData, topEvents, avgRating } = memoizedEventData;
  const totalEvents = eventsData.length;

  return (
    <div className="ead-root">
      <KPIHeader
        totalEvents={totalEvents}
        registrations={registrations}
        fillRate={fillRate}
        avgRating={avgRating}
      />

      {/* TABS */}
      <div className="ead-tabs" role="tablist" aria-label="Analytics sections">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`ead-tab ${activeTab === tab ? 'ead-tab--active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div role="tabpanel">
        {activeTab === 'overview' && <OverviewTab chartTheme={chartTheme} topEvents={topEvents} />}
        {activeTab === 'registrations' && <RegistrationsTab chartTheme={chartTheme} topEvents={topEvents} />}
        {activeTab === 'demographics' && <DemographicsTab chartTheme={chartTheme} typeData={typeData} locationData={locationData} />}
        {activeTab === 'feedback' && <FeedbackTab chartTheme={chartTheme} />}
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;
