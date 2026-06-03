import { motion } from "framer-motion";
import { TagIcon } from "@heroicons/react/24/outline";
import { Plus } from "lucide-react";

export default function TagsInput({ tags, newTag, onNewTagChange, onAdd, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 1.0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <TagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
      </div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newTag}
          onChange={(e) => onNewTagChange(e.target.value)}
          placeholder="Add a tag"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-3xl font-semibold text-white bg-black shadow-md hover:shadow-lg hover:bg-zinc-800 transform hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 text-sm"
          aria-label="button"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </motion.div>
  );
}
