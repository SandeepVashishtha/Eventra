import React, { useState, useEffect } from 'react';
import { Clock, Trash2, Calendar as CalendarIcon, User, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../common/EmptyState';

export default function MyItinerary() {
  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('my_itinerary_sessions');
      if (saved) {
        setItinerary(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load itinerary", e);
    }
  }, []);

  const removeSession = (sessionId) => {
    const newItinerary = itinerary.filter(s => s.id !== sessionId);
    setItinerary(newItinerary);
    localStorage.setItem('my_itinerary_sessions', JSON.stringify(newItinerary));
  };

  if (itinerary.length === 0) {
    return (
      <EmptyState
        icon={<CalendarIcon size={48} className="text-indigo-400" />}
        title="Your Itinerary is Empty"
        message="You haven't bookmarked any sessions yet. Browse event agendas and bookmark sessions to build your personalized schedule."
      />
    );
  }

  // Group by date
  const groupedSessions = itinerary.reduce((acc, session) => {
    const date = session.date || 'To be announced';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSessions).sort((a, b) => {
    if (a === 'To be announced') return 1;
    if (b === 'To be announced') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">My Personal Itinerary</h2>
        <p className="text-indigo-100 max-w-2xl">
          Here are all the sessions you've bookmarked across events. Use this timeline to navigate your day efficiently.
        </p>
      </div>

      <div className="space-y-10">
        {sortedDates.map((date) => (
          <div key={date} className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[39px] top-10 bottom-0 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="hidden sm:flex w-[80px] h-10 items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-sm">
                Day
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {date === 'To be announced' ? date : new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>

            <div className="space-y-6 sm:pl-[80px]">
              {groupedSessions[date]
                .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                .map((session, index) => (
                  <div key={session.id} className="relative group">
                    {/* Timeline Node */}
                    <div className="absolute -left-[45px] top-6 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-950 hidden sm:block"></div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold">
                              <Clock size={14} /> {session.time || 'TBA'}
                            </span>
                            {session.track && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium">
                                {session.track}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{session.title}</h4>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            {session.speaker && (
                              <span className="flex items-center gap-1.5">
                                <User size={14} /> {session.speaker}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:self-start">
                          <button
                            onClick={() => removeSession(session.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Remove from itinerary"
                            aria-label="Remove from itinerary"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
