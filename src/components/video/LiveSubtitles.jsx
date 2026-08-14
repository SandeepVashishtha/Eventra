import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Settings, Download } from "lucide-react";
import { defaultSubtitleConfig } from "./subtitleConfig";
import "./subtitles.css";

export default function LiveSubtitles() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState(defaultSubtitleConfig);
  const [showConfig, setShowConfig] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = config.language;

      rec.onresult = (event) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          setTranscript(final);
          setHistory((prev) => [...prev, final]);
        } else {
          setTranscript(interim);
        }
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition error", e);
      };

      recognitionRef.current = rec;
    }
  }, [config.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const downloadTranscripts = () => {
    const textContent = history.join("\n");
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "speech-transcript.txt";
    link.click();
  };

  return (
    <div className="live-subtitles-container p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl max-w-xl mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          Live Caption Assist
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={downloadTranscripts}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            disabled={history.length === 0}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="config-panel bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 text-sm text-slate-200">
          <div className="flex justify-between items-center mb-2">
            <span>Subtitle Font Size</span>
            <select
              value={config.fontSize}
              onChange={(e) => setConfig({ ...config, fontSize: e.target.value })}
              className="bg-slate-750 px-2 py-1 rounded"
            >
              <option value="text-sm">Small</option>
              <option value="text-base">Medium</option>
              <option value="text-lg">Large</option>
              <option value="text-xl">Extra Large</option>
            </select>
          </div>
        </div>
      )}

      <div className="subtitle-display-box min-h-[100px] bg-black p-4 rounded-2xl mb-6 flex items-center justify-center border border-slate-800">
        <p className={`text-center font-semibold leading-relaxed tracking-wide text-white ${config.fontSize}`}>
          {transcript || "Click mic and speak to see live caption transcripts..."}
        </p>
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${
            isListening ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/10" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/10"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Stop captions
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Start Captions
            </>
          )}
        </button>
      </div>
    </div>
  );
}
