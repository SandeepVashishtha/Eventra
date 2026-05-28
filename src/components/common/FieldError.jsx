import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FieldError = ({ id, message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        id={id}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        role="alert"
        className="text-red-500 text-xs mt-1 flex items-center gap-1"
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

export default FieldError;
