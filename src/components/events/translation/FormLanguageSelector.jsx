import React, { useState } from "react";
import { Languages, Globe } from "lucide-react";
import { getTranslationWorkerSource } from "../../../utils/ai/translate/translationWorker";
import TranslationFeedbackOverlay from "./TranslationFeedbackOverlay";

export default function FormLanguageSelector({ onTranslate = () => {} }) {
  const [lang, setLang] = useState("es");
  const [translating, setTranslating] = useState(false);

  const triggerTranslationWorker = () => {
    setTranslating(true);
    try {
      const code = getTranslationWorkerSource();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        onTranslate(e.data.translatedText);
        setTranslating(false);
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      worker.postMessage({ text: "Full Name", targetLang: lang });
    } catch (e) {
      console.error(e);
      setTranslating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">On-Device Form Localization</span>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="p-1 border border-gray-200 dark:border-gray-800 bg-transparent rounded-xl cursor-pointer"
          >
            <option value="es">Spanish (ES)</option>
            <option value="fr">French (FR)</option>
          </select>
          
          <button
            onClick={triggerTranslationWorker}
            disabled={translating}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Languages className="w-3.5 h-3.5" /> Translate
          </button>
        </div>
      </div>

      {translating && <TranslationFeedbackOverlay />}
    </div>
  );
}
