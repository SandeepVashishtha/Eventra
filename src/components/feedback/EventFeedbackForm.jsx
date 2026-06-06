import { Star, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const EventFeedbackForm = ({ eventId, eventTitle = "this event" }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Synchronize and reset form states cleanly whenever switching to a new event context
  useEffect(() => {
    const key = `feedback-submitted-${eventId}`;
    if (localStorage.getItem(key)) {
      setSubmitted(true);
    } else {
      setSubmitted(false);
      // 🔥 FIX: Reset the form state when navigating to a new, unreviewed event
      setSubmitted(false);
      setRating(0);
      setHoveredRating(0);
      setComment("");
    }
    
    // Wipe out state properties from the preceding event
    setRating(0);
    setHoveredRating(0);
    setComment("");
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a rating from 1 to 5 stars");
      return;
    }
    if (comment.trim().length < 5) {
      toast.error("Please write a short comment about your experience");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      localStorage.setItem(`feedback-submitted-${eventId}`, "true");
      setSubmitted(true);
      toast.success("Feedback submitted! Thank you for sharing your thoughts.");
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="feedback-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Share Your Feedback
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Help us improve by rating your experience attending {eventTitle}.
              </p>
            </div>

            {/* Star Rating Matrix */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Rate this Event <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.92 }}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md p-0.5"
                    aria-label={`Rate ${star} Star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors duration-150 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-current"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </motion.button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-opacity">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent!"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment Section */}
            <div className="space-y-2">
              <label
                htmlFor="feedback-comments"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Comments & Suggestions <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 w-5 h-5" />
                <textarea
                  id="feedback-comments"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  placeholder="What did you like? What can we do better?"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {comment.length} / 1000 characters
                </div>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/15 disabled:opacity-75 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="feedback-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Thank you for your feedback!
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2.5">
                We&apos;ve received your submission. Your rating and comments have been shared with the event organizers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFeedbackForm;