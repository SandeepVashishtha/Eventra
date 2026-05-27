import React from "react";

const variants = {
  success:
    "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",

  warning:
    "bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",

  error:
    "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",

  info:
    "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",

  neutral:
    "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

const Badge = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-1
        rounded-full
        text-xs
        font-medium
        transition-colors
        duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;