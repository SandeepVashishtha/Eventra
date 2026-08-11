import React, { useState, useEffect } from "react";
import { Mic, MicOff, Radio, Sparkles } from "lucide-react";
import SpeechRecognitionEngine from "../../../utils/speechTranslation/speechRecognitionEngine";

export default function SpeakerSpeechBroadcaster({ onBroadcastCaption = () => {} }) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [engine, setEngine] = useState(null);
  const [lastSpeech, setLastSpeech] = useState("");

  useEffect(() => {
    const speechEngine = new SpeechRecognitionEngine((result) => {
      if (result.finalText || result.interimText) {
        const activeText = result.finalText || result.interimText;
        setLastSpeech(activeText);
        onBroadcastCaption({
          id: `caption-${Date.now()}`,
          text: activeText,
          timestamp: result.timestamp,
        });
      }
    });

    setEngine(speechEngine);
    return () => speechEngine.stop();
  }, [onBroadcastCaption]);

  const toggleBroadcasting = () => {
    if (!engine) return;
    if (isBroadcasting) {
      engine.stop();
      setIsBroadcasting(false);
    } else {
      engine.start();
      setIsBroadcasting(true);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-all ${
          isBroadcasting ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
        }`}>
          <Radio className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Live Speech-to-Text Caption Host
            {isBroadcasting && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                ON AIR
              </span>
            )}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {lastSpeech ? `"${lastSpeech}"` : "Broadcasting live speech to event attendees via SSE"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleBroadcasting}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
          isBroadcasting
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {isBroadcasting ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {isBroadcasting ? "Stop Live Captions" : "Start Live Captions"}
      </button>
    </div>
  );
}
