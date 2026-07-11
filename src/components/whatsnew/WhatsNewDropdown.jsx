// src/components/whatsnew/WhatsNewDropdown.jsx
import { Link } from "react-router-dom";
import WhatsNewItem from "./WhatsNewItem";

const MAX_PREVIEW_RELEASES = 2;

export default function WhatsNewDropdown({ entries, onClose }) {
  const previewEntries = entries.slice(0, MAX_PREVIEW_RELEASES);

  return (
    <div
      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-50"
      role="menu"
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          What's New ✨
        </h3>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {previewEntries.length === 0 ? (
          <p className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
            No updates yet.
          </p>
        ) : (
          previewEntries.map((entry) => (
            <WhatsNewItem key={entry.version} entry={entry} />
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/whats-new"
          onClick={onClose}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all updates →
        </Link>
      </div>
    </div>
  );
}