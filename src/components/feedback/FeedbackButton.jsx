import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEventStatus } from '../../utils/eventUtils';
import { hasUserSubmittedFeedback } from '../../utils/feedbackUtils';
import EventFeedbackModal from './EventFeedbackModal';

/**
 * FeedbackButton Component
 * Shows feedback button for past events
 * Only visible if event has ended
 */
const FeedbackButton = ({ event, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const isPastEvent = ['past', 'ended'].includes(getEventStatus(event));

  useEffect(() => {
    if (isPastEvent) {
      setHasFeedback(hasUserSubmittedFeedback(event.id));
    }
  }, [event.id, isPastEvent]);

  if (!isPastEvent) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          hasFeedback
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50'
        } ${className}`}
        title={hasFeedback ? 'Edit your feedback' : 'Leave feedback for this event'}
      >
        <MessageSquare size={14} />
        <span>{hasFeedback ? 'Edit Feedback' : 'Leave Feedback'}</span>
      </motion.button>

      <EventFeedbackModal isOpen={showModal} onClose={() => setShowModal(false)} event={event} />
    </>
  );
};

export default FeedbackButton;
