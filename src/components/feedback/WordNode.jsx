import React from "react";

export default function WordNode({ word }) {
  // Determine sizing depending on occurrences value
  const getFontSize = (val) => {
    if (val >= 40) return "text-2xl font-black";
    if (val >= 30) return "text-xl font-bold";
    if (val >= 20) return "text-base font-semibold";
    return "text-xs font-medium";
  };

  const getColor = (sentiment) => {
    if (sentiment === "positive") return "text-indigo-600 dark:text-indigo-400";
    if (sentiment === "negative") return "text-red-500 dark:text-red-400";
    return "text-slate-500";
  };

  return (
    <span className={`cursor-pointer hover:scale-110 active:scale-95 transition-all select-none ${getFontSize(word.value)} ${getColor(word.sentiment)}`}>
      {word.text}
    </span>
  );
}
