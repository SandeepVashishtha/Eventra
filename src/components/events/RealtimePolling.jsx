import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        className="fixed right-6 bottom-6 z-50 w-80 rounded-2xl border border-indigo-100 bg-white p-5 shadow-2xl dark:border-indigo-900/30 dark:bg-gray-900"
      >
        <div className="mb-4 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
          </span>
          <h3 className="text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-white">
            Live Poll
          </h3>
        </div>
        <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          {activePoll.question}
        </p>
        <div className="space-y-2">
          {activePoll.options.map((opt, i) => (
            <button
              key={i}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-indigo-900/40"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RealtimePolling;
