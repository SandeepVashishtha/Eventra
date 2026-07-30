export default function EmptySearchState({ query = "", onClear }) {
  return (
    <div className="text-center py-20 px-6">
      {/* 🔥 FIX: Wrapped emoji to hide it from screen readers, improving accessibility */}
      <span className="text-7xl mb-5 block" role="img" aria-hidden="true">🔍</span>
      
      {/* 🔥 FIX: Added 'break-words max-w-2xl mx-auto' to prevent long spam queries from destroying the layout */}
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3 break-words max-w-2xl mx-auto">
        No results for &ldquo;{query}&rdquo;
      </h3>
      
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Try different keywords or clear the search to see all events.
      </p>
      
      <button
        type="button" // 🔥 FIX: Explicit button type to prevent unintended form submissions
        onClick={() => onClear?.()} // 🔥 FIX: Optional chaining prevents fatal TypeErrors if prop is missing
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        aria-label="Clear search filters"
      >
        ✕ Clear Search
      </button>
    </div>
  );
}