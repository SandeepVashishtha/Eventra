import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "eventra_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || i18n.language?.split("-")[0] || "en";
    } catch {
      return "en";
    }
  });

  const changeLanguage = useCallback(
    async (code) => {
      const normalized = code.split("-")[0];
      await i18n.changeLanguage(normalized);
      setLanguage(normalized);
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        // localStorage may be unavailable
      }
      document.documentElement.lang = normalized;
    },
    [i18n]
  );

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      const normalized = lng.split("-")[0];
      setLanguage(normalized);
      document.documentElement.lang = normalized;
    };

    i18n.on("languageChanged", handleLanguageChanged);
    document.documentElement.lang = i18n.language?.split("-")[0] || "en";

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isRTL: false,
    }),
    [language, changeLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
