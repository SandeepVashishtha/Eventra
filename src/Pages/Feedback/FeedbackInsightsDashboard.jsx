import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, Users, ThumbsUp, Download, BarChart3 } from 'lucide-react';
import {
  getEventFeedback,
  getAverageRating,
  getRatingBreakdown,
  getRecommendationStats,
  getTagStats,
  exportFeedbackAsCSV,
} from '../../utils/feedbackUtils';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];

const MOCK_EVENTS = [
  { id: 'evt-1', title: 'Tech Summit 2025' },
  { id: 'evt-2', title: 'Design Conference' },
  { id: 'evt-3', title: 'Startup Expo' },
];

// Seed mock feedback for demo
const seedMockFeedback = (eventId) => {
  const key = 'eventra_feedback';
  const existing = JSON.parse(localStorage.getItem(key) || '{}');
  if (existing[eventId]?.length > 0) return;
  const comments = ['Great event!', 'Very informative', 'Well organized', 'Loved the speakers', 'Will attend again'];
  const tags = [['Networking', 'Speakers'], ['Content', 'Organization'], ['Venue', 'Speakers'], ['Content'], ['Networking']];
  existing[eventId] = Array.from({ length: 12 }, (_, i) => ({
    userId: `user-${i}`,
    rating: [5, 4, 5, 3, 4, 5, 4, 5, 3, 4, 5, 4][i],
    comment: comments[i % comments.length],
    tags: tags[i % tags.length],
    recommend: i % 5 !== 0,
    submittedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
  }));
  localStorage.setItem(key, JSON.stringify(existing));
};

export default function FeedbackInsightsDashboard() {
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);

  // Seed demo data
  MOCK_EVENTS.forEach(e => seedMockFeedback(e.id));

  const feedback = getEventFeedback(selectedEvent);
  const avgRating = getAverageRating(selectedEvent);
  const ratingBreakdown = getRatingBreakdown(selectedEvent);
  const recStats = getRecommendationStats(selectedEvent);
  const tagStats = getTagStats(selectedEvent);

  const satisfactionScore = useMemo(() => {
    if (!avgRating.count) return 0;
    return Math.round((avgRating.average / 5) * 100);
  }, [avgRating]);

  const ratingChartData = useMemo(() =>
    [5, 4, 3, 2, 1].map(star => ({
      name: `${star}★`,
      count: ratingBreakdown[star] || 0,
    })), [ratingBreakdown]);

  const tagChartData = useMemo(() =>
    Object.entries(tagStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag, count]) => ({ name: tag, count })),
    [tagStats]);

  const trendData = useMemo(() => {
    const byDate = {};
    feedback.forEach(f => {
      const date = new Date(f.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!byDate[date]) byDate[date] = { date, count: 0, totalRating: 0 };
      byDate[date].count++;
      byDate[date].totalRating += f.rating || 0;
    });
    return Object.values(byDate)
      .map(d => ({ ...d, avgRating: +(d.totalRating / d.count).toFixed(1) }))
      .slice(-7);
  }, [feedback]);

  const pieData = [
    { name: 'Would Recommend', value: recStats.recommendCount },
    { name: "Wouldn't Recommend", value: recStats.notRecommendCount },
  ];

  const handleExport = () => {
    const csv = exportFeedbackAsCSV(selectedEvent);
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${selectedEvent}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback & Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Post-event attendee satisfaction analytics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedEvent}
            onChange={e => setSelectedEvent(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200"
          >
            {MOCK_EVENTS.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating.average || '—'}</p>
          <p className="text-xs text-gray-400">{avgRating.count} responses</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{satisfactionScore}%</p>
          <p className="text-xs text-gray-400">out of 100</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Recommend</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recStats.percentage}%</p>
          <p className="text-xs text-gray-400">{recStats.recommendCount} of {recStats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-pink-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Responses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{feedback.length}</p>
          <p className="text-xs text-gray-400">total submissions</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Rating Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ratingChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={30} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recommendation Split</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Feedback Trend (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="avgRating" stroke="#6366f1" strokeWidth={2} name="Avg Rating" dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} name="Responses" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Feedback Categories</h2>
          {tagChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tagChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Mentions">
                  {tagChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-gray-400 text-sm">No category data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}