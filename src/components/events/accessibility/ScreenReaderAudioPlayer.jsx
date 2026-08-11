import React, { useState } from "react";
import { Headphones, Volume2, VolumeX, ShieldAlert, Sparkles } from "lucide-react";
import { TtsVoiceEngine } from "../../../utils/accessibility/ttsVoiceEngine";

export default function ScreenReaderAudioPlayer({
  lastText = "Event speaker has joined the session stage.",
}) {
  const [engine] = useState(() => new TtsVoiceEngine());
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1.0);

  const handleSpeak = () => {
    setIsPlaying(true);
    engine.setSpeechParameters(rate, 1.0);
    engine.speakTextOffline(
      lastText,
      () => setIsPlaying(true),
      () => setIsPlaying(false)
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 text-xs max-w-md mx-auto">
      <div className="flex items-center gap-2">
        <Headphones className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white">Audio Speech Reader</h4>
          <p className="text-[10px] text-gray-400">Offline text-to-speech voice synthesis</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Speed Controls */}
        <select
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-[10px] outline-none"
        >
          <option value="0.8">0.8x</option>
          <option value="1.0">1.0x</option>
          <option value="1.2">1.2x</option>
          <option value="1.5">1.5x</option>
        </select>

        <button
          onClick={handleSpeak}
          disabled={isPlaying}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
            isPlaying ? "bg-indigo-600 text-white animate-pulse" : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
          }`}
        >
          {isPlaying ? "Reading..." : "Read Aloud"}
        </button>
      </div>
    </div>
  );
}
