import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Pencil,
  Trash2,
  Bookmark,
} from "lucide-react";

const SavedFiltersModal = ({
  isOpen,
  onClose,
  savedFilters = [],
  onApplyFilter,
  onRenameFilter,
  onDeleteFilter,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  if (!isOpen) return null;

  const handleRename = (filter) => {
    setEditingId(filter.id);
    setNewName(filter.name);
  };

  const saveRename = () => {
    if (!newName.trim()) return;

    onRenameFilter(editingId, newName);

    setEditingId(null);
    setNewName("");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-center items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
          initial={{ scale: .9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: .9, opacity: 0 }}
        >
          {/* Header */}

          <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 px-6 py-5">
            <div className="flex items-center gap-3">
              <Bookmark className="text-indigo-500" size={22} />
              <h2 className="text-xl font-bold">
                Saved Search Filters
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}

          <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">

            {savedFilters.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No saved filters found.
              </div>
            )}

            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="border rounded-2xl p-4 bg-gray-50 dark:bg-slate-800"
              >
                {editingId === filter.id ? (
                  <div className="flex gap-3">

                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border dark:bg-slate-900"
                    />

                    <button
                      onClick={saveRename}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white"
                    >
                      Save
                    </button>

                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center">

                      <div>

                        <h3 className="font-bold text-lg">
                          {filter.name}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Search:
                          {" "}
                          {filter.filters.searchQuery || "None"}
                        </p>

                        <p className="text-sm text-gray-500">
                          Category:
                          {" "}
                          {filter.filters.categoryFilter}
                        </p>

                        <p className="text-sm text-gray-500">
                          Sort:
                          {" "}
                          {filter.filters.sortType}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <button
                          onClick={() => onApplyFilter(filter)}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Check size={16} />
                          Apply
                        </button>

                        <button
                          onClick={() => handleRename(filter)}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                        >
                          <Pencil size={16} />
                          Rename
                        </button>

                        <button
                          onClick={() => onDeleteFilter(filter.id)}
                          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>

                      </div>

                    </div>
                  </>
                )}
              </div>
            ))}

          </div>

          {/* Footer */}

          <div className="border-t border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-end">

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              Close
            </button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SavedFiltersModal;