import { Star, MessageSquare, Send, CheckCircle, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { fetchEventFeedback, submitEventFeedback } from "../../utils/feedbackUtils";

const EventFeedbackForm = ({ eventId, eventTitle = "this event" }) => {
  const { user, isAuthenticated } = useAuth();
  const authenticated = isAuthenticated();
  const userId = user?.id || user?.email || "";

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isActive = true;

    setSubmitted(false);
    setRating(0);
    setHoveredRating(0);
    setComment("");

    if (!eventId || !userId) {
      return () => {
        isActive = false;
      };
    }

    fetchEventFeedback(eventId)
      .then((data) => {
        if (isActive) {
          setSubmitted(Boolean(data?.submitted));
        }
      })
      .catch(() => {
        if (isActive) {
          setSubmitted(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [eventId, userId]);

  // Render a login prompt for unauthenticated visitors
  if (!authenticated) {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <LogIn className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Sign in to leave feedback
        </h3>
        <p className="mx-auto max-w-xs text-sm text-slate-500 dark:text-slate-400">
          Your feedback helps event organizers improve future events. Please log in to share your experience.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          <LogIn className="h-4 w-4" />
          Log in to submit feedback
        </Link>
      </div>
    );
  }

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
      await submitEventFeedback({
        eventId,
        rating,
        comment: comment.trim(),
      });

      setSubmitted(true);
      toast.success("Feedback submitted! Thank you for sharing your thoughts.");
    } catch (err) {
      const message = err?.data?.error || err?.message || "Failed to submit feedback. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl md:p-8 dark:border-slate-800 dark:bg-slate-900">
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
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
                    className="rounded-md p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                  <span className="ml-3 text-sm font-medium text-indigo-600 transition-opacity dark:text-indigo-400">
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
                <MessageSquare className="absolute top-3.5 left-3.5 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <textarea
                  id="feedback-comments"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  placeholder="What did you like? What can we do better?"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm transition-all placeholder:text-slate-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950/40 dark:placeholder:text-slate-600 dark:focus:ring-indigo-400"
                />
                <div className="mt-1 text-right text-xs text-slate-400">
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/15 transition-all hover:bg-indigo-700 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
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
            className="space-y-4 py-6 text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Thank you for your feedback!
              </h4>
              <p className="mx-auto mt-2.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
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
