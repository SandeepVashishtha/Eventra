import { Folder, Edit2, Trash2, Calendar, Eye } from "lucide-react";

const BookmarkCollectionCard = ({
  collection,
  expanded = false,
  onRename,
  onDelete,
  onView,
}) => {
  if (!collection) return null;

  const eventCount = collection.events?.length || 0;
  const visibleEvents = expanded
    ? collection.events
    : collection.events.slice(0, 3);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6">

      {/* Header */}

      <div className="flex justify-between items-start">

        <div className="flex items-center gap-3">

          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Folder
              size={28}
              className="text-indigo-600"
            />
          </div>

          <div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {collection.name}
            </h3>

            <p className="text-sm text-slate-500">
              {eventCount} Saved Event{eventCount !== 1 ? "s" : ""}
            </p>

          </div>

        </div>

      </div>

      {/* Information */}

      <div className="mt-5 space-y-3">

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">

          <Calendar size={16} />

          <span className="text-sm">
            Created{" "}
            {collection.createdAt
              ? new Date(collection.createdAt).toLocaleDateString()
              : "Recently"}
          </span>

        </div>

      </div>

      {/* Actions */}

      <div className="mt-6 flex flex-wrap gap-3">

        <button
          onClick={() => onView?.(collection)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 transition"
        >
          <Eye size={18} />
          {expanded ? "Hide" : "View"}
        </button>

        <button
          onClick={() => onRename?.(collection)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Edit2 size={18} />
          Rename
        </button>

        <button
          onClick={() => onDelete?.(collection.id)}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 px-4 py-2.5 transition"
        >
          <Trash2 size={18} />
          Delete
        </button>

      </div>

      {/* Preview */}

      {eventCount > 0 && (
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">

          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Recent Events
          </h4>

          <div className="space-y-2">

            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className="flex justify-between items-center rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {event.title}
                </span>

                {event.date && (
                  <span className="text-xs text-slate-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}

            {!expanded && eventCount > 3 && (
              <p className="text-xs text-slate-500 text-center">
                +{eventCount - 3} more event{eventCount - 3 > 1 ? "s" : ""}
              </p>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default BookmarkCollectionCard;