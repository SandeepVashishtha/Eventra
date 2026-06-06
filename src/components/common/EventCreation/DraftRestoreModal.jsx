import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, History, Trash2, ArrowRight } from "lucide-react";

const DraftRestoreModal = ({ show, onRestore, onDiscard }) => {
  const modalRef = useRef(null);

  // Deep Fix 1: Safe Body Scroll Lock
  useEffect(() => {
    if (!show) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [show]);

  // Deep Fix 2: Global Escape Listener & Strict Focus Trap
  useEffect(() => {
    if (!show) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onDiscard(); // Default safe action for destructive modals
      }
      
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Auto-focus modal on open for screen readers
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [show, onDiscard]);

  // Prevent SSR hydration mismatch for Portals
  if (typeof window === "undefined") return null;

  const modalContent = (
    <AnimatePresence>
      {show && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="draft-modal-title"
          aria-describedby="draft-modal-desc"
        >
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden outline-none"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <History className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 id="draft-modal-title" className="text-xl font-bold">Unfinished Draft Found</h3>
              </div>
              
              <p id="draft-modal-desc" className="text-gray-600 dark:text-gray-400 leading-relaxed">
                It looks like you were in the middle of creating an event. Would you like to restore your progress or start fresh?
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={onRestore}
                  className="flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5" aria-hidden="true" />
                    <span className="font-semibold">Restore Draft</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                
                <button
                  onClick={onDiscard}
                  className="flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  <Trash2 className="w-5 h-5 text-red-500" aria-hidden="true" />
                  <span className="font-semibold">Discard and Start Fresh</span>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>Restoring will overwrite any current changes.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  // Deep Fix 3: React Portal to escape DOM parent clipping
  return createPortal(modalContent, document.body);
};

export default DraftRestoreModal;