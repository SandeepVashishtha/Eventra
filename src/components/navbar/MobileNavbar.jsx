import React, { useEffect, useCallback } from 'react';

export const MobileNav = ({ isOpen, onClose, children }) => {
  const handleClose = useCallback(() => {
    document.body.style.overflow = '';
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer Panel */}
      <div className="relative z-10 w-4/5 max-w-sm bg-white dark:bg-gray-900 h-full p-6 shadow-xl flex flex-col">
        <button
          type="button"
          className="self-end p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={handleClose}
          aria-label="Close navigation"
        >
          ✕
        </button>
        <div className="mt-4 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
