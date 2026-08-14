import React, { useState } from "react";
import { Play, Copy, RefreshCw, Terminal } from "lucide-react";
import SandboxConsole from "./SandboxConsole";
import "./sandbox.css";

export default function CodeSandbox() {
  const [html, setHtml] = useState("<h1>Hello World</h1>");
  const [css, setCss] = useState("h1 { color: #4f46e5; font-family: sans-serif; }");
  const [js, setJs] = useState("console.log('App sandbox is active.');");
  
  const [activeTab, setActiveTab] = useState("html");
  const [srcDoc, setSrcDoc] = useState("");
  const [logs, setLogs] = useState([]);

  const compileSource = () => {
    setLogs(["Compiling preview sandbox..."]);
    
    const combined = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>
            // Capture console output
            const _log = console.log;
            console.log = (...args) => {
              window.parent.postMessage({ type: 'CONSOLE_LOG', data: args.join(' ') }, '*');
              _log(...args);
            };
            try {
              ${js}
            } catch (err) {
              window.parent.postMessage({ type: 'CONSOLE_ERROR', data: err.message }, '*');
            }
          </script>
        </body>
      </html>
    `;
    
    setSrcDoc(combined);
  };

  React.useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === "CONSOLE_LOG") {
        setLogs((prev) => [...prev, `LOG: ${e.data.data}`]);
      } else if (e.data?.type === "CONSOLE_ERROR") {
        setLogs((prev) => [...prev, `ERROR: ${e.data.data}`]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="sandbox-container p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl max-w-5xl mx-auto my-8 text-white">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-850 pb-4 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Terminal className="text-indigo-400 w-5 h-5" />
          Code Sandbox Playground
        </h2>
        <div className="flex gap-2">
          {["html", "css", "js"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                activeTab === tab ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-750 text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="editor bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 relative">
            <textarea
              value={activeTab === "html" ? html : activeTab === "css" ? css : js}
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === "html") setHtml(val);
                else if (activeTab === "css") setCss(val);
                else setJs(val);
              }}
              className="w-full h-80 p-4 bg-transparent font-mono text-sm leading-relaxed text-indigo-300 resize-none focus:outline-none"
              spellCheck="false"
            />
          </div>
          <button
            onClick={compileSource}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/20"
          >
            <Play className="w-4 h-4 fill-current" /> Compile and Run
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="preview-frame bg-white rounded-2xl h-56 border border-slate-850 overflow-hidden shadow-inner">
            {srcDoc ? (
              <iframe
                srcDoc={srcDoc}
                title="Sandbox Sandbox"
                sandbox="allow-scripts"
                className="w-full h-full border-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-450 text-xs font-semibold uppercase tracking-wider">
                Preview Window
              </div>
            )}
          </div>
          <SandboxConsole logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
}
