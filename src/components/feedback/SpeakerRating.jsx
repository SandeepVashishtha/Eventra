import React, { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import "./speaker-rating.css";

export default function SpeakerRating({ speakerName = "Dr. Mehta" }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Rating of ${rating} stars submitted for ${speakerName}!`);
    setRating(0);
    setComment("");
  };

  return (
    <div className="speaker-rating p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-sm mx-auto my-8">
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
        Rate Speaker Session
      </h3>
      <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 uppercase">{speakerName}</span>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        {/* Star Rating Row */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform active:scale-95"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-500 fill-current"
                    : "text-slate-200 dark:text-slate-800"
                }`}
              />
            </button>
          ))}
        </div>

        <textarea
          placeholder="Leave a short comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
        />

        <button
          type="submit"
          disabled={rating === 0}
          className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/20 disabled:opacity-50"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
