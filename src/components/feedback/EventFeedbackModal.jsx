import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import StarRating from "./StarRating";
import { saveFeedback, getUserFeedback } from "../../utils/feedbackUtils";
import { toast } from "react-toastify";

/**
 * EventFeedbackModal Component
 * Allows users to submit feedback for past events
 */
const EventFeedbackModal = ({ isOpen, onClose, event }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const FEEDBACK_TAGS = [
    "Well Organized",
    "Great Speaker",
    "Networking",
    "Hands-on",
    "Beginner Friendly",
    "Too Fast",
    "Too Long",
  ];

  // Load existing feedback if editing
  useEffect(() => {
    if (isOpen && event) {
      const existingFeedback = getUserFeedback(event.id);
      if (existingFeedback) {
        setRating(existingFeedback.rating || 0);
        setComment(existingFeedback.comment || "");
        setRecommend(existingFeedback.recommend || null);
        setSelectedTags(existingFeedback.tags || []);
        setIsEditing(true);
      }
    }
  }, [isOpen, event]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.warning("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        recommend,
        userId: `user_${Date.now()}`, // Simple user identification
      };

      const success = saveFeedback(event.id, feedbackData);

      if (success) {
        toast.success(isEditing ? "Feedback updated!" : "Thank you for your feedback!", {
          icon: <CheckCircle className="h-5 w-5" />,
        });

        // Reset form
        setTimeout(() => {
          setRating(0);
          setComment("");
          setRecommend(null);
          setSelectedTags([]);
          setIsEditing(false);
          onClose();
        }, 1500);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setComment("");
    setRecommend(null);
    setSelectedTags([]);
    setIsEditing(false);
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Share Your Feedback
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
          {/* Star Rating */}
          <div className="text-center">
            <label className="mb-4 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              How would you rate this event?
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="xl" />
          </div>

          {/* Recommendation */}
          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Would you recommend this event?
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setRecommend(true)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                  recommend === true
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                Yes
              </button>
              <button
                onClick={() => setRecommend(false)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
                  recommend === false
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <ThumbsDown className="h-5 w-5" />
                No
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              What stood out? (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think... What could we improve?"
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              rows="4"
              maxLength="500"
            />
            <p className="mt-2 text-right text-xs text-gray-500 dark:text-gray-400">
              {comment.length}/500
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 p-6 dark:border-gray-800">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : isEditing ? "Update Feedback" : "Submit Feedback"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EventFeedbackModal;
