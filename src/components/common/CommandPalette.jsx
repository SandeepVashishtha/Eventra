import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  Command,

  Sun,
  Moon,
  MousePointer,
  HelpCircle,
  LogOut,
  Calendar,
  Layers,
  ArrowUp,
  ArrowDown,
  CornerDownLeft
} from "lucide-react";

const trendTags = ["AI", "Web3", "Hackathons", "Workshops", "Community", "Auth"];

export default function CommandPalette({
  isOpen,
  onClose,
  isDarkMode,
  toggleTheme,
  cursorEnabled,
  toggleCursor,
  isAuthenticated,
  handleLogoutClick
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Search Catalog containing navigations, quick system actions, events, and hackathons
  const searchCatalog = useMemo(() => [
    // ── Pages ────────────────────────────────────────────────────────────────
    { name: "Explore Events Portal", href: "/events", category: "Pages", type: "nav", icon: Calendar },
    { name: "Live Hackathons", href: "/hackathons", category: "Pages", type: "nav", icon: Sparkles },
    { name: "Platform Projects Hub", href: "/projects", category: "Pages", type: "nav", icon: Layers },
    { name: "Leaderboard Standings", href: "/leaderboard", category: "Pages", type: "nav", icon: Sparkles },
    { name: "Eventra Bookmarks", href: "/bookmarks", category: "Pages", type: "nav", icon: Calendar },
    { name: "Contribute & Open Source Guide", href: "/contributorguide", category: "Pages", type: "nav", icon: Layers },
    { name: "Platform Frequently Asked Questions (FAQ)", href: "/faq", category: "Pages", type: "nav", icon: HelpCircle },
    { name: "Contact Support Team", href: "/contact", category: "Pages", type: "nav", icon: HelpCircle },
    { name: "User Settings Dashboard", href: "/dashboard", category: "Pages", type: "nav", icon: Layers },
    { name: "Edit Account Profile", href: "/profile", category: "Pages", type: "nav", icon: Layers },

    // ── Quick Actions ────────────────────────────────────────────────────────
    {
      name: `Switch Theme to ${isDarkMode ? "Light Mode" : "Dark Mode"}`,
      action: "theme",
      category: "System Actions",
      type: "action",
      icon: isDarkMode ? Sun : Moon
    },
    {
      name: `Toggle Cursor to ${cursorEnabled ? "Static" : "Fluid Custom"}`,
      action: "cursor",
      category: "System Actions",
      type: "action",
      icon: MousePointer
    },
    ...(isAuthenticated ? [{
  name: "Sign Out / Logout of Account",
  action: "logout",
  category: "System Actions",
  type: "action",
  icon: LogOut
}] : []),

    // ── Sample Events ────────────────────────────────────────────────────────
    { name: "Web3 Buildathon 2026", href: "/hackathons", category: "Hackathons", type: "nav", icon: Sparkles },
    { name: "AI Innovations Summit", href: "/events", category: "Events", type: "nav", icon: Calendar },
    { name: "React Advanced Core Workshop", href: "/events", category: "Events", type: "nav", icon: Calendar },
    { name: "Next.js Fullstack Sprint", href: "/events", category: "Events", type: "nav", icon: Calendar },
    { name: "Global Open Source Hackfest", href: "/hackathons", category: "Hackathons", type: "nav", icon: Sparkles }
  ], [isDarkMode, cursorEnabled, isAuthenticated]);

  // Fuzzy match query ranking helper
  const getFuzzyScore = (text, queryStr) => {
    const t = text.toLowerCase();
    const q = queryStr.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 50;

    let score = 0;
    let qIdx = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === q[qIdx]) {
        qIdx++;
        score += 5;
        if (qIdx === q.length) break;
      }
    }
    return qIdx === q.length ? score : 0;
  };

  // Compute matched filter results
  const filteredItems = useMemo(() => {
    if (!query.trim()) return searchCatalog;

    return searchCatalog
      .map(item => ({
        ...item,
        score: Math.max(
          getFuzzyScore(item.name, query),
          getFuzzyScore(item.category, query)
        )
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [query, searchCatalog]);

  // Reset active index when query filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setActiveIndex(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle selected item action
  const handleSelect = useCallback((item) => {
    if (item.type === "nav") {
      navigate(item.href);
      onClose();
      return;
    }
    if (item.type === "action") {
      if (item.action === "theme") toggleTheme();
      else if (item.action === "cursor") toggleCursor();
      else if (item.action === "logout") handleLogoutClick();
      onClose();
    }
  }, [navigate, onClose, toggleTheme, toggleCursor, handleLogoutClick]);

  // Keyboard navigation controller
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          handleSelect(filteredItems[activeIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, activeIndex, handleSelect, onClose]);

  // Categorized index mapper helper
  const categorizedItems = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item, index) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push({ ...item, originalIndex: index });
    });
    return groups;
  }, [filteredItems]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-[10vh]">
        {/* Backdrop glass blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Command Panel Sheet */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[75vh]"
        >
          {/* Top Search bar */}
          <div className="relative border-b border-slate-200/50 dark:border-slate-800/40 p-4 flex items-center gap-3">
            <Search className="h-5 w-5 text-indigo-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search platform, pages, events, or actions..."
              className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 text-base"
            />
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/30 text-[10px] font-black text-slate-400">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </div>

          {/* Quick filter tags */}
          <div
            className="
    px-4 py-2
    border-b border-slate-200/30 dark:border-slate-800/20
    bg-slate-50/50 dark:bg-slate-950/20
    overflow-x-auto whitespace-nowrap
    scrollbar-none
    flex gap-2
    scroll-smooth
    snap-x snap-mandatory
    touch-pan-x
    overscroll-x-contain
    [-webkit-overflow-scrolling:touch]
  "
          >
            {trendTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  inputRef.current?.focus();
                }}
                className="
        snap-start shrink-0
        px-3 py-1 rounded-full text-xs font-bold
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-800
        text-slate-600 dark:text-slate-400
        hover:border-indigo-500 dark:hover:border-indigo-400
        transition-colors
      "
              >
                #{tag}
              </button>
            ))}
          </div>


          {/* Results container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" data-lenis-prevent>
            {filteredItems.length > 0 ? (
              Object.entries(categorizedItems).map(([category, items]) => (
                <div key={category} className="space-y-1.5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 px-2.5">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {items.map(({ name, icon: Icon, originalIndex }) => {
                      const active = activeIndex === originalIndex;
                      return (
                        <div
                          key={name}
                          onClick={() => handleSelect(filteredItems[originalIndex])}
                          onMouseEnter={() => setActiveIndex(originalIndex)}
                          className={`
                            group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none
                            ${active
                              ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20 translate-x-1"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"}`} />
                            <span className="text-sm font-semibold tracking-tight">{name}</span>
                          </div>
                          {active && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                              <span className="hidden sm:inline">Select</span>
                              <CornerDownLeft className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Search className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  No matching results
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                  Fuzzy query yielded no index hits. Try searching another workflow or query.
                </p>
              </div>
            )}
          </div>

          {/* Controller footer hint */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3.5 w-3.5" />
                <ArrowDown className="h-3.5 w-3.5" /> Navigate
              </span>
              <span className="flex items-center gap-1">
                <CornerDownLeft className="h-3 w-3" /> Action
              </span>
            </div>
            <span>Press Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
