import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, MousePointer, Bell, ShieldCheck, ArrowRight, Key, Eye, EyeOff, Clipboard, Download, ShieldAlert, RefreshCw, SlidersHorizontal } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { toast } from "react-toastify";
import KeyboardShortcutsHelp from "../components/accessibility/KeyboardShortcutsHelp";

const Settings = () => {
  useDocumentTitle("Eventra | Settings");

  // Replace scattered localStorage.getItem / setItem calls with the hook
  const [cursorEnabled, setCursorEnabled] = useLocalStorage("cursor", "on");
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    "notifications",
    true
  );
  const [privacyMode, setPrivacyMode] = useLocalStorage("privacyMode", false);

  const handleCursorToggle = () => {
    const next = cursorEnabled === "off" ? "on" : "off";
    setCursorEnabled(next);
    window.dispatchEvent(
      new CustomEvent("cursorPreferenceChanged", {
        detail: { cursorEnabled: next === "on" },
      })
    );
  };

  const [backupKey, setBackupKey] = useLocalStorage("backupKey", null);
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBackupKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const words = [
        "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", 
        "juliet", "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", 
        "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu",
        "hazard", "gravity", "nebula", "quantum", "matrix", "vector", "binary", "cipher",
        "crypto", "kernel", "daemon", "syntax", "lexicon", "cosmos", "beacon", "vortex"
      ];
      
      const randomIndices = new Uint32Array(12);
      crypto.getRandomValues(randomIndices);
      const phraseArr = Array.from(randomIndices, (v) => words[v % words.length]);

      const keyMnemonic = phraseArr.join(" ");
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const keyHex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
      
      setBackupKey({
        mnemonic: keyMnemonic,
        hex: keyHex,
        timestamp: new Date().toLocaleString()
      });
      setShowKey(true);
      setIsGenerating(false);
      toast.success("New Advanced Backup Key generated successfully!");
    }, 850);
  };

  const handleCopyKey = () => {
    if (!backupKey) return;
    navigator.clipboard.writeText(`Mnemonic: ${backupKey.mnemonic}\nHex: ${backupKey.hex}`)
      .then(() => toast.success("Backup key copied to clipboard!"))
      .catch((err) => {
        console.error("Failed to copy key:", err);
        toast.error("Could not copy key. Please copy manually.");
      });
  };

  const handleDownloadKey = () => {
    if (!backupKey) return;
    const content = `Eventra Security Recovery Key\nGenerated At: ${backupKey.timestamp}\n\n12-Word Mnemonic:\n${backupKey.mnemonic}\n\n256-Bit Hex Key:\n${backupKey.hex}\n\nWARNING: Keep this file secure and offline! Do not share this key with anyone.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "eventra-backup-key.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Backup key file downloaded!");
  };

  return (
    <section className="min-h-screen bg-bg text-text py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
            User Settings
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Manage your application preferences, appearance, and account settings from one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Appearance */}
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <Sun className="w-6 h-6 text-yellow-500" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customize visual behavior.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCursorToggle}
                aria-label={cursorEnabled !== "off" ? "Disable fluid cursor" : "Enable fluid cursor"}
                aria-pressed={cursorEnabled !== "off"}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-bg px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <MousePointer className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  {cursorEnabled !== "off" ? "Fluid Cursor: On" : "Fluid Cursor: Off"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>
            </div>
          </article>

          {/* Notifications */}
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <Bell className="w-6 h-6 text-cyan-500" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Control notification preferences for the platform.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setNotificationsEnabled((prev) => !prev)}
                aria-label={
                  notificationsEnabled ? "Pause notifications" : "Enable notifications"
                }
                aria-pressed={!!notificationsEnabled}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-bg px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                  {notificationsEnabled ? "Notifications Enabled" : "Notifications Paused"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We&apos;ll keep you updated about new events, hackathons, and important account alerts.
              </p>
              <Link
                to="/settings/notifications"
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-bg px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                  Notification Preferences
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </Link>
            </div>
          </article>

          {/* Privacy */}
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-6 h-6 text-teal-500" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Privacy</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage your privacy and account links.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPrivacyMode((prev) => !prev)}
                aria-label={privacyMode ? "Disable privacy mode" : "Enable privacy mode"}
                aria-pressed={!!privacyMode}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-bg px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-500" aria-hidden="true" />
                  {privacyMode ? "Privacy Mode: Enabled" : "Privacy Mode: Standard"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Privacy mode keeps your experience secure by limiting extra tracking and personalization.
              </p>
            </div>
          </article>

          {/* Keyboard Shortcuts Help */}
          <KeyboardShortcutsHelp />
        </div>

        {/* Advanced Backup Recovery Key Generator Card */}
        <section className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-card-bg/70 p-6 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Advanced Security Recovery Key</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate a secure key to backup and recover offline drafts, settings, and profile details locally.
              </p>
            </div>
          </div>

          <div className="bg-card-bg/50 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 space-y-4">
            {backupKey ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                  <span>Your Recovery Key Credentials</span>
                  <span>Generated: {backupKey.timestamp}</span>
                </div>

                <div className="relative">
                  <div className="bg-bg p-4 rounded-xl border border-slate-200 dark:border-slate-850 font-mono text-xs break-all select-all pr-20 leading-relaxed">
                    {showKey ? (
                      <div className="space-y-2.5">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Mnemonic Phrase:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{backupKey.mnemonic}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-850/60 pt-2">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block mb-1">Hex Seed (256-bit):</span>
                          <span className="text-slate-700 dark:text-slate-350">{backupKey.hex}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••</span>
                    )}
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      title={showKey ? "Hide credentials" : "Show credentials"}
                    >
                      {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                      title="Copy credentials"
                     aria-label="button">
                      <Clipboard size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    onClick={handleDownloadKey}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer"
                   aria-label="button">
                    <Download size={13} />
                    Download Backup File
                  </button>

                  <button
                    onClick={generateBackupKey}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-300 transition cursor-pointer disabled:opacity-50"
                   aria-label="button">
                    <RefreshCw size={13} className={isGenerating ? "animate-spin" : ""} />
                    Generate New Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No recovery key generated yet. Secure offline IndexedDB drafts and presets by establishing a master seed key.
                </p>
                <button
                  onClick={generateBackupKey}
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-500/10 shrink-0"
                 aria-label="button">
                  <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                  Generate Master Key
                </button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/10 text-xs text-rose-650 dark:text-rose-455 leading-relaxed">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              <strong>Security Warning:</strong> This key is generated entirely in-browser and is never transmitted to our servers. Keep it safe in an offline password vault or physical paper ledger. If you delete browser cache or reinstall, you will need this key to retrieve any offline sync databases.
            </p>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-card-bg/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Quick access to profile settings, checklist reset, and privacy documentation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("eventra_onboarding_dismissed");
                  localStorage.removeItem("eventra_onboarding_completed_fired");
                  localStorage.removeItem("eventra_sandbox_executed");
                  localStorage.removeItem("eventra_ai_recommendation_generated");
                  toast.success("Onboarding checklist reset successfully!");
                  // Dispatch custom event to let widget know immediately if settings resets it
                  window.dispatchEvent(new CustomEvent("eventraOnboardingReset"));
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-bg px-4 py-3 text-sm font-medium hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition cursor-pointer text-slate-800 dark:text-slate-100"
              >
                Reset Onboarding
              </button>
              <Link
                to="/profile"
                aria-label="Go to Edit Profile page"
                className="inline-flex items-center gap-2 rounded-2xl bg-black text-white px-4 py-3 text-sm font-medium hover:bg-slate-900 transition"
              >
                Edit Profile
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;
