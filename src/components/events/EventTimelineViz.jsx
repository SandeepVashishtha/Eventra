import React from "react";
import { motion } from "framer-motion";

const EventTimelineViz = ({ events }) => {
  return (
    <div className="hide-scrollbar w-full overflow-x-auto py-8">
      <div className="relative flex min-w-max items-center gap-4 px-4">
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-gray-200 dark:bg-gray-800" />
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative z-10 flex cursor-pointer flex-col items-center"
          >
            <div className="h-4 w-4 rounded-full bg-indigo-500 ring-4 ring-white transition-transform group-hover:scale-125 dark:ring-gray-900" />
            <div className="pointer-events-none absolute top-8 w-48 rounded-xl border border-gray-100 bg-white p-4 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-1 text-xs font-bold text-indigo-500">
                {new Date(event.date).toLocaleDateString()}
              </p>
              <h4 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                {event.title}
              </h4>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EventTimelineViz;
