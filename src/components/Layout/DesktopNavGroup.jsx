import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

const DesktopNavGroup = ({ item, isActive, isOpen, onToggle, setOpenDropdown }) => {
  const location = useLocation();
  const menuId = `desktop-nav-menu-${item.name.toLowerCase().replace(/\s+/g, "-")}`;
  const btnRef = useRef(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [isOpen]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(event);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpenDropdown(null);
    }
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        className={`relative group flex items-center gap-1 text-[12px] xl:text-[13px] font-medium transition-all duration-200 whitespace-nowrap px-2.5 py-1.5 rounded-lg ${
          isActive || isOpen
            ? "text-indigo-600 dark:text-indigo-400 font-semibold"
            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50"
        }`}
      >
        <span className="relative z-10 flex items-center gap-1">
          {item.name}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>

        {(isActive || isOpen) && (
          <>
            <motion.span
              layoutId="activeBox"
              className="absolute inset-0 bg-indigo-100/60 dark:bg-indigo-500/20 border border-indigo-200/80 dark:border-indigo-500/50 rounded-lg -z-0"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
            <motion.span
              layoutId="activeBoxGlow"
              className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 dark:via-indigo-400 blur-[1.5px] -z-0"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <motion.div
            id={menuId}
            role="menu"
            aria-label={`${item.name} navigation`}
            key={`dd-${item.name}`}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: 'fixed',
              top: `${dropPos.top}px`,
              left: `${dropPos.left}px`,
              transform: 'translateX(-50%)',
              zIndex: 9999,
            }}
            className="w-60 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(99,102,241,0.1)] rounded-2xl border border-white/40 dark:border-zinc-700/40 p-2 overflow-hidden"
          >
            {item.subItems.map((sub) => (
              <Link
                key={sub.name}
                to={sub.href}
                onClick={() => setOpenDropdown(null)}
                role="menuitem"
                className={`group flex items-center gap-3 w-full px-3 py-2.5 text-[15px] font-medium rounded-lg transition-all duration-200 border ${
                  location.pathname.startsWith(sub.href)
                    ? "bg-indigo-100/60 dark:bg-indigo-500/20 border-indigo-200/80 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-transparent"
                }`}
              >
                {React.cloneElement(sub.icon, {
                  className: `w-5 h-5 transition-colors ${
                    location.pathname.startsWith(sub.href)
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  }`,
                })}
                {sub.name}
              </Link>
            ))}
          </motion.div>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesktopNavGroup;
