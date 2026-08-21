import React, { useState } from 'react';

export const FeedbackForm = ({
  eventTitle = 'Annual Tech Conference 2026',
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setRating((prev) => Math.min(prev + 1, 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setRating((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    if (onSubmitFeedback) {
      onSubmitFeedback({ rating, comment });
    }
    setSuccessMsg('Thank you! Your feedback has been submitted successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
          Event Feedback
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Event: <span className="font-semibold text-gray-700 dark:text-gray-300">{eventTitle}</span>
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-semibold">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Overall Rating
          </label>
          <div
            tabIndex="0"
            onKeyDown={handleKeyDown}
            aria-label="Star Rating Selector"
            className="flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 w-fit"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl focus:outline-none transition transform hover:scale-110"
                >
                  <span className={active ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}>
                    ★
                  </span>
                </button>
              );
            })}
            <span className="ml-3 text-xs font-bold text-gray-600 dark:text-gray-400">
              {rating > 0 ? `${rating} / 5 Stars` : 'Select rating'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Comments & Feedback (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400 dark:disabled:bg-gray-700"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;
