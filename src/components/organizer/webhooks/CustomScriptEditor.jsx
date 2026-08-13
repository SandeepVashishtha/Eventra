import React, { useState } from "react";
import { Play, Code2, AlertCircle } from "lucide-react";
import ExecutionTerminal from "./ExecutionTerminal";
import { getSandboxWorkerSource } from "../../../utils/security/sandbox/workerSandbox";

export default function CustomScriptEditor({ initialScript = "return data.attendeeCount * 2;" }) {
  const [userScript, setUserScript] = useState(initialScript);
  const [terminalOutput, setTerminalOutput] = useState("");
  const [status, setStatus] = useState("idle");

  const runScriptSandbox = () => {
    setStatus("running");
    setTerminalOutput("Initializing sandbox execution context...");

    try {
      const code = getSandboxWorkerSource();
      const blob = new Blob([code], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);

      worker.onmessage = (e) => {
        if (e.data.success) {
          setTerminalOutput(`SUCCESS: Result returned: ${JSON.stringify(e.data.result)}`);
          setStatus("success");
        } else {
          setTerminalOutput(`ERROR: ${e.data.error}`);
          setStatus("error");
        }
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
      };

      // Mock payload matching what would be sent by webhooks
      worker.postMessage({
        userScript,
        contextData: { attendeeCount: 150 },
      });
    } catch (err) {
      setTerminalOutput(`CRITICAL ERROR: Failed to instantiate sandbox: ${err.message}`);
      setStatus("error");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Sandbox Integration Worklet</span>
        </div>
        <button
          onClick={runScriptSandbox}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <Play className="w-3.5 h-3.5" /> Execute Sandbox
        </button>
      </div>

      <div className="relative">
        <textarea
          value={userScript}
          onChange={(e) => setUserScript(e.target.value)}
          className="w-full h-32 p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 font-mono text-[11px] outline-none text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <ExecutionTerminal output={terminalOutput} status={status} />
    </div>
  );
}
