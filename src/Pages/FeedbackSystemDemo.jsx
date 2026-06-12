import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Download, Trash2 } from "lucide-react";
import {
  EventFeedbackModal,
  FeedbackButton,
  FeedbackSummary,
  StarRating,
} from "../../components/feedback";
import {
  getEventFeedback,
  getAverageRating,
  getRecommendationStats,
  getTagStats,
  exportFeedbackAsCSV,
  clearAllFeedback,
  saveFeedback,
} from "../../utils/feedbackUtils";

// Demo event definition moved outside the component for a stable reference
const demoEvent = {
  id: "demo-event-001",
  title: "React Best Practices Workshop",
  date: new Date(Date.now() - 86400000).toISOString(), // Yesterday (past event)
  description: "Learn advanced React patterns and hooks",
};

/**
 * FeedbackSystemDemo
 * Demonstration page for the post-event feedback system
 *
 * This page showcases all feedback components and utilities
 * Remove this file after confirming the feature works in production
 */
const FeedbackSystemDemo = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);

  const loadFeedback = useCallback(() => {
    const allFeedback = getEventFeedback(demoEvent.id);
    const averageStats = getAverageRating(demoEvent.id);
    setFeedback(allFeedback);
    setStats(averageStats);
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const generateDemoUserId = () => {
    const bytes = new Uint32Array(1);
    window.crypto.getRandomValues(bytes);
    return `demo-user-${bytes[0].toString(16)}`;
  };

  const handleAddSampleFeedback = () => {
    const samples = [
      {
        rating: 5,
        comment: "Excellent workshop! Very practical and well-organized.",
        tags: ["Great Speaker", "Well Organized"],
        recommend: true,
        userId: generateDemoUserId(),
      },
      {
        rating: 4,
        comment: "Good content but could use more hands-on exercises.",
        tags: ["Good Food", "Needs More Time"],
        recommend: true,
        userId: generateDemoUserId(),
      },
      {
        rating: 5,
        comment: "Perfect balance of theory and practice!",
        tags: ["Great Speaker", "Networking"],
        recommend: true,
        userId: generateDemoUserId(),
      },
      {
        rating: 3,
        comment: "Venue was a bit cold, but content was solid.",
        tags: ["Better Venue"],
        recommend: true,
        userId: generateDemoUserId(),
      },
      {
        rating: 4,
        comment: "Great networking opportunities!",
        tags: ["Networking", "Great Speaker"],
        recommend: true,
        userId: generateDemoUserId(),
      },
    ];

    samples.forEach((sample) => {
      saveFeedback(demoEvent.id, sample);
    });

    loadFeedback();
  };

  const handleExportCSV = () => {
    const csv = exportFeedbackAsCSV(demoEvent.id);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `feedback-${demoEvent.id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all feedback? This cannot be undone.")) {
      clearAllFeedback();
      loadFeedback();
    }
  };

  const recommendationStats = getRecommendationStats(demoEvent.id);
  const tagStats = getTagStats(demoEvent.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="mb-2 text-4xl font-bold text-white">📋 Feedback System Demo</h1>
          <p className="text-gray-400">Showcase of the post-event feedback MVP implementation</p>
        </motion.div>

        {/* Demo Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="mb-2 text-2xl font-bold">{demoEvent.title}</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{demoEvent.description}</p>
          <p className="mb-6 text-sm text-gray-500">
            📅 {new Date(demoEvent.date).toLocaleDateString()}
          </p>

          {/* Action Buttons */}
          <div className="mb-6 flex flex-wrap gap-3">
            <FeedbackButton event={demoEvent} />
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              Open Modal Directly
            </button>
            <button
              onClick={handleAddSampleFeedback}
              className="rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            >
              ➕ Add Sample Feedback
            </button>
          </div>

          {/* Feedback Summary */}
          {feedback.length > 0 && <FeedbackSummary eventId={demoEvent.id} />}

          {feedback.length === 0 && (
            <div className="rounded-lg bg-gray-100 p-4 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              No feedback yet. Add sample feedback to get started!
            </div>
          )}
        </motion.div>

        {/* Stats Section */}
        {feedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {/* Average Rating */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Average Rating
              </h3>
              <div className="text-3xl font-bold text-indigo-600">{stats?.average.toFixed(1)}</div>
              <p className="mt-2 text-xs text-gray-500">based on {stats?.count} reviews</p>
            </div>

            {/* Recommendation */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Would Recommend
              </h3>
              <div className="text-3xl font-bold text-green-600">
                {recommendationStats?.percentage}%
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {recommendationStats?.recommendCount} of {recommendationStats?.total} respondents
              </p>
            </div>

            {/* Total Feedback */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                Total Responses
              </h3>
              <div className="text-3xl font-bold text-blue-600">{feedback.length}</div>
              <p className="mt-2 text-xs text-gray-500">feedback submissions</p>
            </div>
          </motion.div>
        )}

        {/* Feedback List */}
        {feedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Feedback Responses ({feedback.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadFeedback}
                  className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Refresh"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Export CSV"
                >
                  <Download className="h-5 w-5" />
                </button>
                <button
                  onClick={handleClearAll}
                  className="rounded-lg p-2 text-red-600 transition hover:bg-red-100 dark:hover:bg-red-900/30"
                  title="Clear all"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {feedback.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < item.rating ? "⭐" : "☆"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {item.comment && (
                    <p className="mb-2 text-gray-700 dark:text-gray-300">
                      &quot;{item.comment}&quot;
                    </p>
                  )}

                  <div className="mb-2 flex flex-wrap gap-2">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {item.recommend !== undefined && (
                    <p className="text-xs text-gray-500">
                      Would recommend: {item.recommend ? "✅ Yes" : "❌ No"}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Star Rating Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="mb-6 text-2xl font-bold">Component Showcase</h2>

          <div className="space-y-12">
            {/* Star Rating Sizes */}
            <div>
              <h3 className="mb-6 font-semibold text-gray-700 dark:text-gray-300">
                Star Rating - Different Sizes
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                {["sm", "md", "lg", "xl"].map((size) => (
                  <div key={size} className="text-center">
                    <StarRating
                      rating={selectedRating}
                      onRatingChange={setSelectedRating}
                      size={size}
                    />
                    <p className="mt-4 text-xs text-gray-500">{size}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tag Cloud */}
            {Object.keys(tagStats).length > 0 && (
              <div>
                <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-300">
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(tagStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tag, count]) => (
                      <div
                        key={tag}
                        className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md"
                      >
                        {tag} ×{count}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <EventFeedbackModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          loadFeedback();
        }}
        event={demoEvent}
      />
    </div>
  );
};

export default FeedbackSystemDemo;
