import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 1. IMPORT YOUR GLOBAL DASHBOARD LAYOUT ELEMENT
import DashboardLayout from "../../components/Layout/DashboardLayout";

const eventsData = [
  { name: "Tech Summit", registrations: 320, attendance: 280, engagement: 87, category: "Tech" },
  { name: "Design Conf", registrations: 210, attendance: 175, engagement: 72, category: "Design" },
  {
    name: "Startup Expo",
    registrations: 450,
    attendance: 390,
    engagement: 91,
    category: "Business",
  },
  { name: "AI Hackathon", registrations: 380, attendance: 310, engagement: 83, category: "Tech" },
  { name: "UX Workshop", registrations: 150, attendance: 130, engagement: 78, category: "Design" },
];

const growthData = [
  { month: "Jan", events: 2, registrations: 180 },
  { month: "Feb", events: 3, registrations: 260 },
  { month: "Mar", events: 4, registrations: 410 },
  { month: "Apr", events: 5, registrations: 530 },
  { month: "May", events: 6, registrations: 700 },
];

export default function ComparativeAnalyticsDashboard() {
  const [selected, setSelected] = useState(eventsData.map((e) => e.name));
  const filtered = eventsData.filter((e) => selected.includes(e.name));
  const best = [...eventsData].sort((a, b) => b.engagement - a.engagement)[0];
  const avgAttendance = Math.round(
    filtered.reduce((s, e) => s + (e.attendance / e.registrations) * 100, 0) /
      (filtered.length || 1)
  );
  const toggle = (name) =>
    setSelected((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    // 2. ENCLOSE YOUR PAGE CODE IN THE WRAPPER ELEMENT
    <DashboardLayout>
      {/* Note: I removed bg-gray-50 min-h-screen to let the component adopt the skin base */}
      <div className="w-full space-y-8 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Comparative Event Analytics
          </h1>
          <p className="mt-1 text-gray-500">Compare performance across multiple events</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {eventsData.map((e) => (
            <button
              key={e.name}
              onClick={() => toggle(e.name)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                selected.includes(e.name)
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Best Performing
            </p>
            <p className="mt-1 text-xl font-bold text-green-800 dark:text-green-200">{best.name}</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {best.engagement}% engagement
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Registrations
            </p>
            <p className="mt-1 text-xl font-bold text-blue-800 dark:text-blue-200">
              {filtered.reduce((s, e) => s + e.registrations, 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900/50 dark:bg-purple-950/20">
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Avg Attendance Rate
            </p>
            <p className="mt-1 text-xl font-bold text-purple-800 dark:text-purple-200">
              {avgAttendance}%
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Registrations vs Attendance
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filtered}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-gray-500" />
              <YAxis className="fill-gray-500" />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="registrations"
                fill="#6366f1"
                name="Registrations"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="attendance" fill="#22c55e" name="Attendance" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Engagement Rate (%)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filtered}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-gray-500" />
              <YAxis domain={[50, 100]} className="fill-gray-500" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Growth Trends Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={growthData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <XAxis dataKey="month" className="fill-gray-500" />
              <YAxis yAxisId="left" className="fill-gray-500" />
              <YAxis yAxisId="right" orientation="right" className="fill-gray-500" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="registrations"
                stroke="#6366f1"
                strokeWidth={2}
                name="Registrations"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="events"
                stroke="#ec4899"
                strokeWidth={2}
                name="Events Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
