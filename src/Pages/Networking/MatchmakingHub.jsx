import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchRecommendedConnections } from "../../utils/aiMatchmaking";
import { Calendar, MessageSquare, Zap, Star } from "lucide-react";
import toast from 'react-hot-toast';

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
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Matchmaking Hub</h1>
            <p className="text-gray-500">Smart networking recommendations based on your profile and event history.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((conn) => (
              <div key={conn.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img src={conn.avatar} alt={conn.name} className="w-14 h-14 rounded-full border-2 border-indigo-100 dark:border-indigo-900" />
                    <div>
                      <h3 className="font-bold text-lg dark:text-white">{conn.name}</h3>
                      <p className="text-sm text-gray-500">{conn.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3" /> {conn.matchScore}%
                  </div>
                </div>
                
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl mb-4 text-sm text-indigo-800 dark:text-indigo-300">
                  <span className="font-semibold block mb-1">Why you match:</span>
                  {conn.matchReason}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {conn.skills.map(skill => (
                    <span key={skill} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => handleSchedule(conn)}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" /> Meet
                  </button>
                  <button className="flex-1 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Message
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
