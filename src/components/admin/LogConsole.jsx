import React, { useRef, useEffect } from "react";

export default function LogConsole({ logs, filter }) {
  const consoleEndRef = useRef(null);

  const filteredLogs = logs.filter((log) => filter === "ALL" || log.type === filter);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredLogs]);

  const getColorClass = (type) => {
    switch (type) {
      case "ERROR":
        return "text-red-400";
      case "WARN":
        return "text-yellow-400";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="log-console bg-slate-900 border border-slate-850 rounded-2xl h-80 overflow-y-auto p-4 font-mono text-xs flex flex-col gap-2">
      {filteredLogs.map((log) => (
        <div key={log.id} className="log-line flex items-start gap-3">
          <span className="text-slate-500 font-bold select-none">{log.time}</span>
          <span className={`font-bold select-none w-14 ${getColorClass(log.type)}`}>
            [{log.type}]
          </span>
          <span className="flex-1 text-slate-100">{log.text}</span>
        </div>
      ))}
      <div ref={consoleEndRef} />
    </div>
  );
}
