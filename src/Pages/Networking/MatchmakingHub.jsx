import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchRecommendedConnections } from "../../utils/aiMatchmaking";
import { Calendar, MessageSquare, Zap, Star } from "lucide-react";
import { toast } from "react-toastify";

// 1. IMPORT THE MASTER SKIN LAYOUT SHELL
import DashboardLayout from "../../components/Layout/DashboardLayout";

const MatchmakingHub = () => {
  const { eventId = "networking-hub" } = useParams();
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      const results = await fetchRecommendedConnections(user || {}, eventId);
      setConnections(results);
      setLoading(false);
    };
    loadMatches();
  }, [eventId, user]);

  const handleSchedule = (connection) => {
    toast.success(`Meeting request sent to ${connection.name}!`);
  };

  return (
    // 2. WRAP EVERYTHING INSIDE THE LAYOUT SHELL
    <DashboardLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
            <Zap className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Matchmaking Hub</h1>
            <p className="text-gray-500">
              Smart networking recommendations based on your profile and event history.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex h-full flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={conn.avatar}
                      alt={conn.name}
                      className="h-14 w-14 rounded-full border-2 border-indigo-100 dark:border-indigo-900"
                    />
                    <div>
                      <h3 className="text-lg font-bold dark:text-white">{conn.name}</h3>
                      <p className="text-sm text-gray-500">{conn.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Star className="h-3 w-3" /> {conn.matchScore}%
                  </div>
                </div>

                <div className="mb-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-900/10 dark:text-indigo-300">
                  <span className="mb-1 block font-semibold">Why you match:</span>
                  {conn.matchReason}
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {conn.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => handleSchedule(conn)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    <Calendar className="h-4 w-4" /> Meet
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <MessageSquare className="h-4 w-4" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MatchmakingHub;
