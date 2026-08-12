import React from "react";
import { Keyboard } from "lucide-react";

const KeyboardShortcutsHelp = () => {
  const shortcuts = [
    { keys: ["/"], action: "Focus Search Input" },
    { keys: ["Ctrl", "K"], action: "Global Search / Toggle Palette" },
    { keys: ["Esc"], action: "Close Active Modal / Drawer" },
    { keys: ["Alt", "D"], action: "Navigate to Dashboard" },
    { keys: ["Alt", "E"], action: "Navigate to Events" },
    { keys: ["Alt", "P"], action: "Navigate to Profile" },
  ];

  return (
    <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm col-span-1 lg:col-span-3">
      <div className="flex items-center gap-3 mb-6 text-slate-900 dark:text-slate-100">
        <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <Keyboard className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Speed up your workflow using global hotkeys.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-150 dark:border-slate-800">
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Shortcut</th>
              <th className="py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {shortcuts.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    {s.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && <span className="text-slate-450 dark:text-slate-500 text-xs font-bold">+</span>}
                        <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-extrabold rounded-lg shadow-sm">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </td>
                <td className="py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};

export default KeyboardShortcutsHelp;
