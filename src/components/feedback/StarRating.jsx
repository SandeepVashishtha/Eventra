import React from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * Interactive star rating selector with hover effects
 */
const StarRating = ({ rating, onRatingChange, disabled = false, size = 'lg' }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const sizeClass = sizeMap[size] || sizeMap.lg;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => !disabled && onRatingChange(star)}
            disabled={disabled}
            className={`transition-all duration-200 transform ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`${sizeClass} transition-colors duration-200 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 stroke-yellow-500'
                  : 'fill-gray-300 stroke-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating} of 5 stars
        </span>
      )}
    </div>
  );
};

export default StarRating;
