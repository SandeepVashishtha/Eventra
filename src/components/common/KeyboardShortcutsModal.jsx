import React from "react";

const ShortcutRow = ({ action, shortcut }) => (
  <div
    className="flex items-center justify-between py-3 border-b border-gray-200"
  >
    <span className="font-medium">
      {action}
    </span>

    <kbd className="px-3 py-1 rounded-lg bg-gray-100 border text-sm font-semibold">
      {shortcut}
    </kbd>
  </div>
);

const KeyboardShortcutsModal = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Keyboard Shortcuts
            </h2>

            <p className="text-gray-500 mt-1">
              Navigate Eventra faster
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-100 text-xl"
          >
            ✕
          </button>
        </div>

        <ShortcutRow
          action="Open shortcuts help"
          shortcut="Shift + /"
        />

        <ShortcutRow
          action="Close modal"
          shortcut="Esc"
        />

        <ShortcutRow
          action="Go to Home"
          shortcut="g + h"
        />

        <ShortcutRow
          action="Go to Login"
          shortcut="g + l"
        />

        <ShortcutRow
          action="Go to Signup"
          shortcut="g + s"
        />
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;