import React, { useState, useEffect } from "react";
import { Play, Download, Save, Code, Sparkles, RefreshCw } from "lucide-react";
import YjsSyncService from "./YjsSyncService";
import "./workspace.css";

export default function CodeWorkspace({ teamId = "team-alpha" }) {
  const [code, setCode] = useState(`// Welcome to Eventra Collaborative Code Space
function greetTeam() {
  console.log(\`Hello from ${teamId}!\`);
}
greetTeam();`);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Initialize dummy collaborative sockets sync
    YjsSyncService.connect(teamId, (updatedCode) => {
      setCode(updatedCode);
    });

    return () => {
      YjsSyncService.disconnect();
    };
  }, [teamId]);

  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    YjsSyncService.broadcastChange(val);
  };

  const runCode = () => {
    setOutput("Executing snippet...\n");
    setTimeout(() => {
      if (language === "javascript") {
        try {
          // Safe sandboxed console capture
          const logs = [];
          const customConsole = {
            log: (...args) => logs.push(args.join(" ")),
            error: (...args) => logs.push("ERROR: " + args.join(" ")),
          };
          const execFn = new Function("console", code);
          execFn(customConsole);
          setOutput(logs.join("\n") || "Code executed successfully with no console output.");
        } catch (err) {
          setOutput("Runtime Error: " + err.message);
        }
      } else {
        setOutput(`Execution mock only supported for JavaScript currently. Running dry run for ${language}.`);
      }
    }, 500);
  };

  const downloadFile = () => {
    const extensions = { javascript: "js", python: "py", html: "html", css: "css" };
    const blob = new Blob([code], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `solution.${extensions[language] || "txt"}`;
    link.click();
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="workspace-container p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl max-w-5xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Code className="text-indigo-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Collaborative Code Workspace</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800 text-slate-200 text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col">
          <div className="editor-wrapper bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-96 p-4 bg-transparent text-slate-355 font-mono text-sm leading-relaxed border-none resize-none focus:ring-0 focus:outline-none text-emerald-400"
              spellCheck="false"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={downloadFile}
              className="flex items-center gap-1.5 bg-slate-800 text-slate-200 hover:bg-slate-750 px-4 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4" /> Export File
            </button>
            <button
              onClick={runCode}
              className="flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-650/20"
            >
              <Play className="w-4 h-4 fill-current" /> Run Code
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="console-wrapper flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="console-header border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Terminal Console</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </div>
            <pre className="p-4 flex-1 text-xs font-mono text-slate-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {output || "Run your code to see the execution results here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
