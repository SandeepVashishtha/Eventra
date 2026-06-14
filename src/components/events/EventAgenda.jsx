import React, { useState, useEffect } from 'react';
import { Bookmark, Clock, User, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const SessionCard = ({ session, isBookmarked, toggleBookmark }) => (
  <div 
    className="group relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all duration-200 pl-12"
  >
    <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="flex justify-between items-start gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {session.time || 'TBA'}
          </span>
          {session.track && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-medium">
              {session.track}
            </span>
          )}
        </div>
        
        <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{session.title}</h5>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {session.speaker && (
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-gray-400" /> {session.speaker}
            </span>
          )}
        </div>
      </div>
      
      <button
        onClick={() => toggleBookmark(session)}
        className={`p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 ${
          isBookmarked 
            ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' 
            : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-gray-500 dark:hover:bg-slate-700 dark:hover:text-indigo-400'
        }`}
        aria-label={isBookmarked ? "Remove from itinerary" : "Add to itinerary"}
        title={isBookmarked ? "Remove from itinerary" : "Add to itinerary"}
      >
        <Bookmark size={20} className={isBookmarked ? "fill-current" : ""} />
      </button>
    </div>
  </div>
);

const SessionGroup = ({ date, sessions, bookmarkedSessions, toggleBookmark }) => (
  <div>
    <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
      {date === 'To be announced' ? date : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
    </h4>
    
    <div className="space-y-4">
      {sessions
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
        .map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            isBookmarked={bookmarkedSessions.some(s => s.id === session.id)}
            toggleBookmark={toggleBookmark}
          />
        ))}
    </div>
  </div>
);
export default function EventAgenda({ sessions = [] }) {
  const [bookmarkedSessions, setBookmarkedSessions] = useState(() => {
    try {
      const saved = localStorage.getItem('my_itinerary_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('my_itinerary_sessions', JSON.stringify(bookmarkedSessions));
  }, [bookmarkedSessions]);

  const toggleBookmark = (session) => {
    const isBookmarked = bookmarkedSessions.some(s => s.id === session.id);
    if (isBookmarked) {
      setBookmarkedSessions(prev => prev.filter(s => s.id !== session.id));
      toast.info("Removed from your itinerary");
    } else {
      setBookmarkedSessions(prev => [...prev, session]);
      toast.success("Added to your itinerary");
    }
  };

  if (!sessions || sessions.length === 0) {
    return null;
  }

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = session.date || 'To be announced';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => {
    if (a === 'To be announced') return 1;
    if (b === 'To be announced') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Event Agenda</h3>
      
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <SessionGroup
            key={date}
            date={date}
            sessions={groupedSessions[date]}
            bookmarkedSessions={bookmarkedSessions}
            toggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </div>
  );
}
