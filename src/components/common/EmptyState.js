import React from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCcw } from 'lucide-react';

const EmptyState = ({ message, onClear, onExplore }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-xl backdrop-blur-sm"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10 rounded-full" />
      
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-8"
      >
        <Search className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
      </motion.div>

      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
        No results found
      </h3>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onClear && (
          <button
            onClick={onClear}
            className="group relative flex items-center gap-2 px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <RefreshCcw className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            Clear All Filters
          </button>
        )}
        
        {onExplore && (
          <button
            onClick={onExplore}
            className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            Explore All
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
