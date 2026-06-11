import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

export default function LanguageSelector({ className = "", compact = false }) {
  const { language, changeLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentLang = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = async (code) => {
    if (code !== language) {
      await changeLanguage(code);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("language.switch")}
        className={`
          flex items-center gap-1.5 rounded-lg border border-border bg-navbar
          text-text-light hover:text-text hover:bg-bg-secondary
          transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
          ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}
        `}
      >
        <Globe className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
        <span className="font-medium">{currentLang.nativeLabel}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="listbox"
            aria-label={t("language.switch")}
            className="absolute right-0 z-[300] mt-2 min-w-[10rem] origin-top-right rounded-xl border border-border bg-navbar p-1.5 shadow-lg"
          >
            {supportedLanguages.map((lang) => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(lang.code)}
                  className={`
                    flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm
                    transition-colors duration-150
                    ${isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-text-light hover:bg-bg-secondary hover:text-text"
                    }
                  `}
                >
                  <span>{lang.nativeLabel}</span>
                  {isActive && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
