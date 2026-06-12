export default function EmptySearchState({ query, onClear }) {
  return (
    <div className="text-center py-20 px-6">
      <div className="text-7xl mb-5">🔍</div>
      <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
        No results for &ldquo;{query}&rdquo;
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Try different keywords or clear the search to see all events.
      </p>
      <button
        onClick={onClear}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        ✕ Clear Search
      </button>
    </div>
  );
}
