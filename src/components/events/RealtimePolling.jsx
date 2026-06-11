
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RealtimePolling = ({ eventId }) => {
  const [activePoll, setActivePoll] = useState(null);

  useEffect(() => {
    // Simulated SSE connection for active polls
    const evtSource = new EventSource(`/api/events/${eventId}/polls/stream`);
    evtSource.onmessage = (event) => {
      setActivePoll(JSON.parse(event.data));
    };
    return () => evtSource.close();
  }, [eventId]);

  if (!activePoll) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/30 p-5 z-50"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Live Poll</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-4">{activePoll.question}</p>
        <div className="space-y-2">
          {activePoll.options.map((opt, i) => (
            <button key={i} className="w-full text-left px-4 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-900/40 border border-gray-200 dark:border-gray-700 transition-colors text-sm font-medium">
              {opt.text}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealtimePolling;
