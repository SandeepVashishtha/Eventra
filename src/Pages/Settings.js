import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, MousePointer, Bell, ShieldCheck, ArrowRight, Palette } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage";
import useDocumentTitle from "../hooks/useDocumentTitle";

const Settings = () => {
  useDocumentTitle("Eventra | Settings");
  const { isDarkMode, toggleTheme, setIsCustomizerOpen } = useTheme();

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

  return (
    <section className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 py-24">
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
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <Sun className="w-6 h-6 text-yellow-500" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Switch themes and customize visual behavior.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDarkMode}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  )}
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                aria-label="Open theme customizer skins panel"
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                  Theme Customizer
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleCursorToggle}
                aria-label={cursorEnabled !== "off" ? "Disable fluid cursor" : "Enable fluid cursor"}
                aria-pressed={cursorEnabled !== "off"}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
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
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
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
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                  {notificationsEnabled ? "Notifications Enabled" : "Notifications Paused"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We'll keep you updated about new events, hackathons, and important account alerts.
              </p>
            </div>
          </article>

          {/* Privacy */}
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
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
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
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
        </div>

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Quick access to profile settings and privacy documentation.
              </p>
            </div>
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
    </section>
  );
};

export default Settings;