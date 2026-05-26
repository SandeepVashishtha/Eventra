import React from "react";

const highlightMatch = (
  text,
  query
) => {
  if (!query) return text;

  const regex = new RegExp(
    `(${query})`,
    "gi"
  );

  const parts = text.split(regex);

  return parts.map(
    (part, index) =>
      part.toLowerCase() ===
      query.toLowerCase() ? (
        <span
          key={index}
          className="
            bg-yellow-200
            dark:bg-yellow-500/30
            text-black
            dark:text-yellow-100
            px-1
            rounded
            font-medium
          "
        >
          {part}
        </span>
      ) : (
        part
      )
  );
};

export default highlightMatch;