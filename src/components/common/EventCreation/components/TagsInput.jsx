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
      <div className="mb-2 flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
      </div>
      <div className="mb-3 flex gap-2">
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
          className="flex-1 rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={onAdd}
          className="flex transform items-center justify-center gap-2 rounded-3xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-zinc-800 hover:shadow-lg focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 active:scale-[0.97]"
          aria-label="button"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
          >
            #{tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="ml-1 font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </motion.div>
  );
}
