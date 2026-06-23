import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * TemplateNamePrompt Component
 *
 * Modal for collecting template name from user before saving.
 */
export default function TemplateNamePrompt({
  isOpen,
  onSave,
  onCancel,
  loading = false,
}) {
  const [templateName, setTemplateName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus and select input when modal opens
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName);
      setTemplateName("");
    }
  };

  const handleCancel = () => {
    setTemplateName("");
    onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={handleCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Save as Template
            </h2>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Give your template a descriptive name (e.g., &ldquo;Workshop Template&rdquo;, &ldquo;Meetup 2026&rdquo;)
            </p>

            <input
              ref={inputRef}
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter template name..."
              maxLength={100}
              disabled={loading}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 transition focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />

            <div className="mt-8 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Cancel"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!templateName.trim() || loading}
                className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Save template"
              >
                {loading ? "Saving..." : "Save"}
              </motion.button>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {templateName.length > 0 && (
                <p>{templateName.length}/100 characters</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
