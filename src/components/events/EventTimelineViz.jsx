
// import React from 'react';
import { motion } from 'framer-motion';

const EventTimelineViz = ({ events }) => {
  return (
    <div className="w-full overflow-x-auto py-8 hide-scrollbar">
      <div className="min-w-max flex items-center gap-4 px-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 rounded-full" />
        {events.map((event, i) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative z-10 flex flex-col items-center group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-gray-900 group-hover:scale-125 transition-transform" />
            <div className="absolute top-8 w-48 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="text-xs font-bold text-indigo-500 mb-1">{new Date(event.date).toLocaleDateString()}</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{event.title}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventTimelineViz;
