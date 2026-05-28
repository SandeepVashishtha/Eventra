import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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

// --- Subcomponents (Now accepting props instead of using global scope) ---

const RegistrationLineChart = ({ height = 260, showLegend = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={registrationTrends}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} />
      <Tooltip />
      {showLegend && <Legend />}
      <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} dot={{ r: showLegend ? 6 : 5, fill: '#6366f1' }} activeDot={{ r: 7 }} name="Registrations" />
    </LineChart>
  </ResponsiveContainer>
);

const AttendanceBarChart = ({ data, height = 260, layout = 'horizontal', showLegend = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout={layout}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      {layout === 'vertical' ? (
        <>
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
        </>
      ) : (
        <>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis />
        </>
      )}
      <Tooltip />
      {showLegend && <Legend />}
      <Bar dataKey="attendees" fill="#6366f1" radius={layout === 'vertical' ? [0, 6, 6, 0] : [6, 6, 0, 0]} name="Attendees" />
      <Bar dataKey="capacity" fill="#c7d2fe" radius={layout === 'vertical' ? [0, 6, 6, 0] : [6, 6, 0, 0]} name="Capacity" />
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

const OverviewTab = ({ topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">📈 Registrations Over Time</h2>
      <RegistrationLineChart height={260} />
    </div>
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">🏆 Top Performing Events</h2>
      <AttendanceBarChart data={topEvents} height={260} layout="vertical" />
    </div>
  </div>
);

const RegistrationsTab = ({ topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📅 Monthly Registration Trends</h2>
      <RegistrationLineChart height={320} showLegend />
    </div>
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📊 All Events — Attendance vs Capacity</h2>
      <AttendanceBarChart data={topEvents} height={320} />
    </div>
  </div>
);

const DemographicsTab = ({ typeData, locationData }) => (
  <div className="ead-grid">
    <div className="ead-card">
      <h2 className="ead-card-title">🎯 Attendees by Event Type</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="ead-card">
      <h2 className="ead-card-title">📍 Attendees by Region</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={locationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const FeedbackTab = () => (
  <div className="ead-grid">
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">⭐ Average Ratings by Event</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={feedbackData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="event" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="rating" fill="#6366f1" radius={[6, 6, 0, 0]} name="Avg Rating" />
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
        {activeTab === 'overview' && <OverviewTab topEvents={topEvents} />}
        {activeTab === 'registrations' && <RegistrationsTab topEvents={topEvents} />}
        {activeTab === 'demographics' && <DemographicsTab typeData={typeData} locationData={locationData} />}
        {activeTab === 'feedback' && <FeedbackTab />}
      </div>
    </div>
  );
};

export default EventAnalyticsDashboard;