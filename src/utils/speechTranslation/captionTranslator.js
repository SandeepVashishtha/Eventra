/**
 * Real-Time Multilingual Caption Translator Utility
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English (US)" },
  { code: "es", label: "Spanish (Español)" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "zh", label: "Chinese (中文)" },
];

const TRANSLATION_MAPS = {
  es: {
    "welcome to eventra": "bienvenido a eventra",
    "live keynote session": "sesión magistral en vivo",
    "hackathon presentation": "presentación del hackathon",
  },
  hi: {
    "welcome to eventra": "इवेंट्रा में आपका स्वागत है",
    "live keynote session": "लाइव मुख्य सत्र",
  },
  fr: {
    "welcome to eventra": "bienvenue sur eventra",
  },
};

export function translateCaption(text, targetLang = "en") {
  if (!text || targetLang === "en") return text;

  const lower = text.toLowerCase().trim();
  const dict = TRANSLATION_MAPS[targetLang];

  if (dict && dict[lower]) {
    return dict[lower];
  }

  // Language prefix simulation
  return `[${targetLang.toUpperCase()}] ${text}`;
}
