import React from "react";

export default function ASTDiffViewer({ codeA = "", codeB = "" }) {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto text-[10px] font-mono select-none">
      <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <h4 className="font-bold text-gray-500 mb-2">Team A Source Token List</h4>
        <pre className="whitespace-pre-wrap overflow-x-auto text-indigo-600 dark:text-indigo-400">
          {codeA}
        </pre>
      </div>
      <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <h4 className="font-bold text-gray-500 mb-2">Team B Source Token List</h4>
        <pre className="whitespace-pre-wrap overflow-x-auto text-indigo-600 dark:text-indigo-400">
          {codeB}
        </pre>
      </div>
    </div>
  );
}
