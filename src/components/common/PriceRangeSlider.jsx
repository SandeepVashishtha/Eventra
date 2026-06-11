import { useCallback, useEffect, useState } from "react";

/**
 * PriceRangeSlider Component
 * Allows users to select a price range with dual sliders.
 *
 * Performance note: onChange only updates local visual state so the track and
 * price labels stay in sync while the user is dragging. The parent's
 * onRangeChange callback is intentionally fired only on mouseup/touchend so
 * the costly event-list filter recalculation runs once per drag, not on every
 * individual slider tick.
 */
const PriceRangeSlider = ({
  minPrice = 0,
  maxPrice = 1500,
  minLimit = 0,
  maxLimit = 2000,
  onRangeChange,
  disabled = false,
}) => {
  const [min, setMin] = useState(minPrice);
  const [max, setMax] = useState(maxPrice);

  // Sync external prop changes (e.g. filter reset from parent) into local state.
  useEffect(() => {
    setMin(minPrice);
    setMax(maxPrice);
  }, [minPrice, maxPrice]);

  // Visual-only handlers — update local state on every tick for smooth UI.
  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), max - 1);
    setMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), min + 1);
    setMax(value);
  };

  // Commit handler — fires the parent callback once the user releases the handle.
  // This prevents triggering expensive re-renders on every slider tick.
  const commitRange = useCallback(() => {
    if (onRangeChange) {
      onRangeChange({ min, max });
    }
  }, [min, max, onRangeChange]);

  const minPercent = ((min - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((max - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="space-y-4">
      <div className="relative pt-2">
        {/* Track background */}
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>

        {/* Active range track */}
        <div
          className="absolute top-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>

        {/* Min slider — visual updates on onChange, parent notified on release */}
        <input
          type="range"
          aria-label="Minimum Price"
          min={minLimit}
          max={maxLimit}
          value={min}
          onChange={handleMinChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          disabled={disabled}
          className="pointer-events-none absolute top-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent disabled:opacity-50 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        />

        {/* Max slider — visual updates on onChange, parent notified on release */}
        <input
          type="range"
          aria-label="Maximum Price"
          min={minLimit}
          max={maxLimit}
          value={max}
          onChange={handleMaxChange}
          onMouseUp={commitRange}
          onTouchEnd={commitRange}
          onKeyUp={commitRange}
          disabled={disabled}
          className="pointer-events-none absolute top-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent disabled:opacity-50 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>

      {/* Price display — always reflects current drag position instantly */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Min:</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            ${min.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Max:</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            ${max.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
