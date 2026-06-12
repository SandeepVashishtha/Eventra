import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Eye, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { DashboardStatCardSkeleton } from "../common/SkeletonLoaders";

const MOCK_REGISTRATION_DATA = [
  { name: "Mon", registrations: 12 },
  { name: "Tue", registrations: 19 },
  { name: "Wed", registrations: 15 },
  { name: "Thu", registrations: 25 },
  { name: "Fri", registrations: 32 },
  { name: "Sat", registrations: 45 },
  { name: "Sun", registrations: 38 },
];

const MOCK_PAGE_VIEWS = [
  { name: "Week 1", views: 400 },
  { name: "Week 2", views: 600 },
  { name: "Week 3", views: 850 },
  { name: "Week 4", views: 1200 },
];

const MOCK_DEMOGRAPHICS = [
  { name: "Students", value: 65 },
  { name: "Professionals", value: 25 },
  { name: "Academics", value: 10 },
];

const COLORS = ["#6366f1", "#ec4899", "#8b5cf6", "#10b981"];

export default function AnalyticsTab({ loading }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="ud-stats-grid">
          {[...Array(3)].map((_, i) => (
            <DashboardStatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organizer Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your event performance and audience insights.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Registrations
            </p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,245</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
              <TrendingUp size={12} /> +12% this week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl bg-pink-50 p-3 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">8,432</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
              <TrendingUp size={12} /> +24% this week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <CalendarIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Events</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">12</h3>
            <p className="mt-1 text-xs text-gray-400">Across 3 categories</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-200">
            Registration Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REGISTRATION_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="registrations" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-200">
            Page Views over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PAGE_VIEWS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:flex-row lg:col-span-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="w-full flex-1">
            <h3 className="mb-4 text-sm font-bold text-gray-800 dark:text-gray-200">
              Audience Demographics
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Understand who is attending your events. Most of your audience consists of students.
            </p>
            <div className="space-y-3">
              {MOCK_DEMOGRAPHICS.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_DEMOGRAPHICS}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MOCK_DEMOGRAPHICS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
