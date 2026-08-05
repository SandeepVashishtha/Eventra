import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Star, ChevronRight, Calendar } from "lucide-react";
import { buildPersonalizedRecommendations } from "../../utils/recommendationEngine";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import useBookmarks from "../../hooks/useBookmarks";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";
import { getSmartDateLabel } from "../../utils/relativeTime";

const DashboardRecommendedEvents = ({ allEvents = [], prefersReducedMotion = false }) => {
  const { user } = useAuth();
  const { myEvents } = useMyEvents();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");
  const navigate = useNavigate();

  const recommendations = useMemo(() => {
    const registeredEvents = Array.isArray(myEvents) ? myEvents : [];
    const bookmarkedEvents = Array.isArray(bookmarks) ? bookmarks.map(b => ({ event: b })) : [];
    
    // Explicit user profile interests if they exist
    const userProfile = {
      interests: user?.interests || [],
      eventTypes: user?.eventTypes || [],
    };

    return buildPersonalizedRecommendations({
      events: allEvents,
      userProfile,
      registeredEvents,
      bookmarkedEvents,
      limit: 4
    });
  }, [allEvents, user, myEvents, bookmarks]);

  return (
    <motion.section 
      className="ud-card backdrop-blur-md bg-white/10 border border-indigo-500/30 shadow-lg mt-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      <div className="ud-card-head mb-4 border-b border-white/10 pb-4">
        <span className="ud-card-icon" style={{ background: "#8b5cf618", color: "#8b5cf6" }}>
          <Star size={18} />
        </span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recommended for You</h3>
        <Link to="/events" className="ud-card-link text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          Browse all <ChevronRight size={14} />
        </Link>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          compact={true}
          icon={<Star size={32} className="text-purple-500" />}
          title="No Recommendations Yet"
          message="Engage with more events to get personalized recommendations."
          onBrowseAll={() => navigate("/events")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {recommendations.map((event) => (
            <Link 
              key={event.id} 
              to={event.type === 'Hackathon' ? `/hackathons/${event.id}` : `/events/${event.id}`} 
              className="group flex flex-col justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 transition-all p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={16} className="text-indigo-500" />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2" title={event.title}>
                  {event.title}
                </h4>
                
                {event.recommendationReasons && event.recommendationReasons.length > 0 && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3 line-clamp-1">
                    {event.recommendationReasons[0]}
                  </p>
                )}
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1.5 mb-2">
                  <Calendar size={13} />
                  <span>{getSmartDateLabel(event.date)}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                  {event.recommendationScore}% Match
                </span>
                <StatusBadge status={event.status || 'Upcoming'} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default DashboardRecommendedEvents;
