import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const eventsData = [
  { name: 'Tech Summit', registrations: 320, attendance: 280, engagement: 87, category: 'Tech' },
  { name: 'Design Conf', registrations: 210, attendance: 175, engagement: 72, category: 'Design' },
  { name: 'Startup Expo', registrations: 450, attendance: 390, engagement: 91, category: 'Business' },
  { name: 'AI Hackathon', registrations: 380, attendance: 310, engagement: 83, category: 'Tech' },
  { name: 'UX Workshop', registrations: 150, attendance: 130, engagement: 78, category: 'Design' },
];

const growthData = [
  { month: 'Jan', events: 2, registrations: 180 },
  { month: 'Feb', events: 3, registrations: 260 },
  { month: 'Mar', events: 4, registrations: 410 },
  { month: 'Apr', events: 5, registrations: 530 },
  { month: 'May', events: 6, registrations: 700 },
];

export default function ComparativeAnalyticsDashboard() {
  const [selected, setSelected] = useState(eventsData.map(e => e.name));
  const filtered = eventsData.filter(e => selected.includes(e.name));
  const best = [...eventsData].sort((a, b) => b.engagement - a.engagement)[0];
  const avgAttendance = Math.round(
    filtered.reduce((s, e) => s + (e.attendance / e.registrations) * 100, 0) / (filtered.length || 1)
  );
  const toggle = (name) =>
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comparative Event Analytics</h1>
        <p className="text-gray-500 mt-1">Compare performance across multiple events</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {eventsData.map(e => (
          <button key={e.name} onClick={() => toggle(e.name)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected.includes(e.name)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-500 border-gray-300'
            }`}>
            {e.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm font-medium text-green-600">Best Performing</p>
          <p className="text-xl font-bold text-green-800 mt-1">{best.name}</p>
          <p className="text-sm text-green-600">{best.engagement}% engagement</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="text-sm font-medium text-blue-600">Total Registrations</p>
          <p className="text-xl font-bold text-blue-800 mt-1">
            {filtered.reduce((s, e) => s + e.registrations, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <p className="text-sm font-medium text-purple-600">Avg Attendance Rate</p>
          <p className="text-xl font-bold text-purple-800 mt-1">{avgAttendance}%</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Registrations vs Attendance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="registrations" fill="#6366f1" name="Registrations" radius={[4,4,0,0]} />
            <Bar dataKey="attendance" fill="#22c55e" name="Attendance" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Engagement Rate (%)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[50, 100]} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="engagement" stroke="#f59e0b" strokeWidth={2} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Growth Trends Over Time</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2} name="Registrations" />
            <Line yAxisId="right" type="monotone" dataKey="events" stroke="#ec4899" strokeWidth={2} name="Events Count" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
