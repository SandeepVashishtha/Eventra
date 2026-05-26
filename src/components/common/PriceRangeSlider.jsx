import React, { useState, useEffect } from "react";

/**
 * PriceRangeSlider Component
 * Allows users to select a price range with dual sliders
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

  useEffect(() => {
    if (onRangeChange) {
      onRangeChange({ min, max });
    }
  }, [min, max, onRangeChange]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), max - 1);
    setMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), min + 1);
    setMax(value);
  };

  const minPercent = ((min - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((max - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="space-y-4">
      <div className="relative pt-2">
        {/* Track background */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

        {/* Range track */}
        <div
          className="absolute h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full top-2"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        ></div>

        {/* Min slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={min}
          onChange={handleMinChange}
          disabled={disabled}
          className="absolute w-full h-2 top-2 rounded-full appearance-none cursor-pointer bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md disabled:opacity-50"
        />

        {/* Max slider */}
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={max}
          onChange={handleMaxChange}
          disabled={disabled}
          className="absolute w-full h-2 top-2 rounded-full appearance-none cursor-pointer bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md disabled:opacity-50"
        />
      </div>

      {/* Price display */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Min:</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            ${min.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Max:</span>
          <span className="text-purple-600 dark:text-purple-400 font-semibold">
            ${max.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
