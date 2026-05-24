import React from "react";
import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

const EmptyState = ({
  title = "No results found",
  message = "Nothing matched your search or filter.",
  ctaLabel,
  ctaLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">

      {/* Icon / Illustration */}
      <div className="mb-6 flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
        <SearchX
          size={48}
          className="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Message */}
      <p className="mt-3 max-w-xl text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-7">
        {message}
      </p>

      {/* CTA Button */}
      {ctaLabel && ctaLink && (
        <Link
          to={ctaLink}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;