import React from "react";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Keyboard Shortcuts
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span>Open shortcuts help</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-zinc-700 rounded">
              Shift + /
            </kbd>
          </div>

          <div className="flex justify-between">
            <span>Close modal</span>
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-zinc-700 rounded">
              Esc
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;