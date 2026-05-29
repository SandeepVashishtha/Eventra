import React from 'react';
import { motion } from 'framer-motion';

const BookmarkButton = ({ event, isBookmarked, onToggle }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => { e.stopPropagation(); onToggle(event); }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.4rem',
        padding: '4px'
      }}
      title={isBookmarked ? 'Remove bookmark' : 'Save event'}
    >
      <motion.span
        animate={{ color: isBookmarked ? '#f59e0b' : '#9ca3af' }}
        transition={{ duration: 0.2 }}
      >
        {isBookmarked ? '⭐' : '🔖'}
      </motion.span>
    </motion.button>
  );
};

export default BookmarkButton;