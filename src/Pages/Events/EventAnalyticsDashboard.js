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

const totalRegistrations = eventsData.reduce((sum, e) => sum + e.attendees, 0);
const totalCapacity = eventsData.reduce((sum, e) => sum + e.maxAttendees, 0);
const fillRate = Math.round((totalRegistrations / totalCapacity) * 100);
const avgRating = (feedbackData.reduce((s, f) => s + f.rating, 0) / feedbackData.length).toFixed(1);

const OverviewTab = ({ topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">📈 Registrations Over Time</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={registrationTrends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} dot={{ r: 5, fill: '#6366f1' }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="ead-card ead-card--wide">
      <h2 className="ead-card-title">🏆 Top Performing Events</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={topEvents} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
          <Tooltip />
          <Legend />
          <Bar dataKey="attendees" fill="#6366f1" radius={[0, 6, 6, 0]} name="Attendees" />
          <Bar dataKey="capacity" fill="#c7d2fe" radius={[0, 6, 6, 0]} name="Capacity" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const RegistrationsTab = ({ topEvents }) => (
  <div className="ead-grid">
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📅 Monthly Registration Trends</h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={registrationTrends}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: '#6366f1' }} name="Registrations" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="ead-card ead-card--full">
      <h2 className="ead-card-title">📊 All Events — Attendance vs Capacity</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={topEvents}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="attendees" fill="#6366f1" name="Attendees" radius={[6, 6, 0, 0]} />
          <Bar dataKey="capacity" fill="#c7d2fe" name="Capacity" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
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

  const topEvents = useMemo(() =>
    [...eventsData].sort((a, b) => b.attendees - a.attendees).slice(0, 6)
      .map(e => ({ name: e.title.length > 18 ? e.title.slice(0, 18) + '…' : e.title, attendees: e.attendees, capacity: e.maxAttendees })),
    []
  );

  const typeData = useMemo(() => {
    const map = {};
    eventsData.forEach(e => { map[e.type] = (map[e.type] || 0) + e.attendees; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  const locationData = useMemo(() => {
    const map = {};
    eventsData.forEach(e => {
      const loc = e.location === 'Online' ? 'Online' : e.location.split(',')[1]?.trim() || e.location;
      map[loc] = (map[loc] || 0) + e.attendees;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, []);

  return (
    <div className="ead-root">
      <div className="ead-header">
        <div className="ead-header-left">
          <span className="ead-badge">Organizer View</span>
          <h1 className="ead-title">Event Analytics</h1>
          <p className="ead-subtitle">Data-driven insights for smarter decisions</p>
        </div>
        <div className="ead-header-right">
          <div className="ead-kpi">
            <span className="ead-kpi-val">{eventsData.length}</span>
            <span className="ead-kpi-label">Total Events</span>
          </div>
          <div className="ead-kpi">
            <span className="ead-kpi-val">{totalRegistrations.toLocaleString()}</span>
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

      <div className="ead-tabs">
        {['overview', 'registrations', 'demographics', 'feedback'].map(tab => (
          <button
            key={tab}
            className={`ead-tab ${activeTab === tab ? 'ead-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab topEvents={topEvents} />}
      {activeTab === 'registrations' && <RegistrationsTab topEvents={topEvents} />}
      {activeTab === 'demographics' && <DemographicsTab typeData={typeData} locationData={locationData} />}
      {activeTab === 'feedback' && <FeedbackTab />}
    </div>
  );
};

export default EventAnalyticsDashboard;