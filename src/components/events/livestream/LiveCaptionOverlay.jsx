import React, { useState } from "react";
import { Languages, Type, FileText } from "lucide-react";
import { SUPPORTED_LANGUAGES, translateCaption } from "../../../utils/speechTranslation/captionTranslator";
import StreamTranscriptDrawer from "./StreamTranscriptDrawer";

export default function LiveCaptionOverlay({
  currentCaption = "Welcome to the Eventra keynote presentation session!",
  history = [],
}) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("medium"); // 'small' | 'medium' | 'large'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const translatedText = translateCaption(currentCaption, selectedLanguage);

  const fontSizeClass =
    fontSize === "large" ? "text-lg md:text-xl" : fontSize === "small" ? "text-xs md:text-sm" : "text-sm md:text-base";

  return (
    <div className="relative w-full space-y-3">
      {/* Floating Caption Box */}
      <div className="relative overflow-hidden rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-4 md:p-6 shadow-2xl text-center space-y-3">
        {/* Caption Text Banner */}
        <p className={`font-semibold text-white tracking-wide transition-all ${fontSizeClass}`}>
          {translatedText}
        </p>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg border border-gray-700">
            <Type className="w-3.5 h-3.5 text-gray-400 ml-1" />
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-all ${
                  fontSize === size
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {size[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Transcript History Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg transition-colors border border-indigo-500/30"
          >
            <FileText className="w-3.5 h-3.5" />
            View Full Transcript
          </button>
        </div>
      </div>

      {/* Transcript History Drawer */}
      <StreamTranscriptDrawer
        transcriptList={history}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
