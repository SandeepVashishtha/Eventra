import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  ctaText, 
  ctaTo,
  className = "" 
}) => {
  return (
    <motion.div 
      className={`empty-state-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="empty-state-icon-wrapper">
        <div className="empty-state-icon-bg" />
        {Icon && <Icon className="empty-state-icon" size={48} />}
      </div>
      
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      
      {ctaText && ctaTo && (
        <Link to={ctaTo} className="empty-state-cta">
          {ctaText}
          <ChevronRight size={16} />
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
