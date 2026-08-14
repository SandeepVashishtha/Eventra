import React, { useState, useEffect, useRef } from "react";
import { Code2, Play, Download, Copy, Check, Users, Sparkles } from "lucide-react";

const INITIAL_CODE_TEMPLATES = {
  javascript: `// Hackathon P2P Pair Programming Session
// Write your algorithm or frontend component below

function calculateHackathonScore(submission) {
  const { innovation, codeQuality, UX } = submission;
  const weightedTotal = (innovation * 0.4) + (codeQuality * 0.35) + (UX * 0.25);
  
  return {
    finalScore: Math.min(100, weightedTotal),
    tier: weightedTotal > 85 ? "Grandmaster" : "Champion"
  };
}

console.log("Team workspace synchronized successfully!");`,
  python: `# Hackathon ML & Data Processing Algorithm
import numpy as np

def predict_event_turnout(registrations, past_attendance_ratio=0.72):
    """Predicts real event turnout based on registration velocity."""
    expected_attendees = int(registrations * past_attendance_ratio)
    confidence = min(0.95, past_attendance_ratio + 0.1)
    return {"expected_attendees": expected_attendees, "confidence": confidence}

print(predict_event_turnout(250))`,
  html: `<!-- Hackathon Prototype Preview -->
<div class="hackathon-card">
  <h2>Eventra P2P Pair Programming</h2>
  <p>Collaborate live with your hackathon team members!</p>
  <button onclick="alert('Session Connected!')">Join Room</button>
</div>`
};

export default function PairCodeEditor({
  incomingCodeDelta,
  onCodeChange,
  activePeers = [],
}) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(INITIAL_CODE_TEMPLATES.javascript);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef(null);

  // Sync incoming code changes from peers
  useEffect(() => {
    if (incomingCodeDelta?.payload?.code !== undefined) {
      setCode(incomingCodeDelta.payload.code);
      if (incomingCodeDelta.payload.language) {
        setLanguage(incomingCodeDelta.payload.language);
      }
    }
  }, [incomingCodeDelta]);

  const handleTextChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onCodeChange) {
      onCodeChange(newCode, language);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const template = INITIAL_CODE_TEMPLATES[newLang] || INITIAL_CODE_TEMPLATES.javascript;
    setCode(template);
    if (onCodeChange) {
      onCodeChange(template, newLang);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === "python" ? "py" : language === "html" ? "html" : "js";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hackathon_solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);

    if (language !== "javascript") {
      setOutput(`[${language.toUpperCase()} Interpreter Simulation]: Output generated successfully.`);
      setIsRunning(false);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.sandbox = "allow-scripts";
    document.body.appendChild(iframe);

    const logs = [];
    const onMessage = (e) => {
      if (e.source !== iframe.contentWindow) return;
      if (e.data?.type === "console") {
        logs.push(e.data.level === "error" ? `[Error] ${e.data.args}` : e.data.args);
      } else if (e.data?.type === "done") {
        cleanup();
        setOutput(logs.length ? logs.join("\n") : "Code executed cleanly with no logs.");
        setIsRunning(false);
      }
    };
    window.addEventListener("message", onMessage);

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      iframe.remove();
    };

    const wrappedCode = `
<script>
  (function() {
    const post = (type, data) => parent.postMessage({ type, ...data }, "*");
    const safeStringify = (a) => {
      try { return typeof a === 'object' ? JSON.stringify(a) : String(a); }
      catch { return String(a); }
    };
    const console = {
      log: (...args) => post("console", { level: "log", args: args.map(safeStringify).join(" ") }),
      error: (...args) => post("console", { level: "error", args: args.map(safeStringify).join(" ") }),
      warn: (...args) => post("console", { level: "log", args: args.map(safeStringify).join(" ") }),
    };
    try {
      ${code.replace(/<\/script>/gi, "<\\/script>")}
    } catch(e) {
      post("console", { level: "error", args: e.message });
    }
    post("done", {});
  })();
</script>`;

    iframe.srcdoc = "<!DOCTYPE html><html><body>" + wrappedCode + "</body></html>";

    setTimeout(() => {
      cleanup();
      setOutput(logs.length ? logs.join("\n") : "Code executed cleanly with no logs.");
      setIsRunning(false);
    }, 5000);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(12, lineCount) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md overflow-hidden transition-all">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">
            Pair Programming Workspace
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-200 mr-2">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>{activePeers.length + 1} Editors online</span>
          </div>

          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="javascript">JavaScript / React</option>
            <option value="python">Python 3</option>
            <option value="html">HTML5 / CSS</option>
          </select>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy Code"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Export Source File"
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? "Executing..." : "Run"}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex min-h-[380px] bg-slate-950 font-mono text-sm">
        {/* Line Numbers */}
        <div className="select-none py-3 px-3 text-right text-xs text-gray-600 bg-slate-900 border-r border-slate-800 min-w-[40px]">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area Code Editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleTextChange}
          spellCheck={false}
          className="w-full h-full py-3 px-4 bg-transparent text-slate-100 leading-6 resize-none focus:outline-none selection:bg-indigo-600/40"
          placeholder="Start pair programming with your teammates..."
        />
      </div>

      {/* Console Output Panel */}
      {output !== null && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-slate-900 text-slate-200 p-3 font-mono text-xs max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <span className="font-semibold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Output Terminal
            </span>
            <button
              onClick={() => setOutput(null)}
              className="text-gray-400 hover:text-white text-[10px]"
            >
              Clear
            </button>
          </div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
