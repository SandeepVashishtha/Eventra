export default function EmptySearchState({ query = "", onClear }) {
  return (
    <div className="px-6 py-20 text-center">
      {/* 🔥 FIX: Wrapped emoji to hide it from screen readers, improving accessibility */}
      <span className="mb-5 block text-7xl" role="img" aria-hidden="true">🔍</span>
      
      {/* 🔥 FIX: Added 'break-words max-w-2xl mx-auto' to prevent long spam queries from destroying the layout */}
      <h3 className="mx-auto mb-3 max-w-2xl text-2xl font-semibold break-words text-gray-700 dark:text-gray-200">
        No results for &ldquo;{query}&rdquo;
      </h3>
      
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        Try different keywords or clear the search to see all events.
      </p>
      
      <button
        type="button" // 🔥 FIX: Explicit button type to prevent unintended form submissions
        onClick={() => onClear?.()} // 🔥 FIX: Optional chaining prevents fatal TypeErrors if prop is missing
        className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Clear search filters"
      >
        ✕ Clear Search
      </button>
    </div>
  );
}