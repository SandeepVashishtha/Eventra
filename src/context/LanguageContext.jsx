import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "eventra_language";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", rtl: false },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", rtl: false },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", rtl: false },
  { code: "es", label: "Spanish", nativeLabel: "Español", rtl: false },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", rtl: true },
];

// Fast lookup set of RTL language codes, kept in sync with SUPPORTED_LANGUAGES.
const RTL_LANGUAGE_CODES = new Set(
  SUPPORTED_LANGUAGES.filter((lang) => lang.rtl).map((lang) => lang.code)
);

const isLanguageRTL = (code) => RTL_LANGUAGE_CODES.has(code?.split("-")[0]);

const applyDocumentDirection = (code) => {
  if (typeof document === "undefined") return;
  const normalized = code?.split("-")[0] || "en";
  document.documentElement.lang = normalized;
  document.documentElement.dir = isLanguageRTL(normalized) ? "rtl" : "ltr";
};

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
      applyDocumentDirection(normalized);
    },
    [i18n]
  );

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      const normalized = lng.split("-")[0];
      setLanguage(normalized);
      applyDocumentDirection(normalized);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    applyDocumentDirection(i18n.language);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const value = useMemo(
    () => ({
      language,
      changeLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      isRTL: isLanguageRTL(language),
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
