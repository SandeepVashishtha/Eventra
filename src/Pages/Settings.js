import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, MousePointer, Bell, ShieldCheck, ArrowRight } from "lucide-react";

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem("notifications") !== "false"
  );
  const [privacyMode, setPrivacyMode] = useState(
    () => localStorage.getItem("privacyMode") === "true"
  );

  useEffect(() => {
    const storedCursor = localStorage.getItem("cursor");
    setCursorEnabled(storedCursor !== "off");
  }, []);

  const handleCursorToggle = () => {
    const enabled = !cursorEnabled;
    setCursorEnabled(enabled);
    localStorage.setItem("cursor", enabled ? "on" : "off");
    window.dispatchEvent(new CustomEvent("cursorPreferenceChanged", { detail: { cursorEnabled: enabled } }));
  };

  return (
    <section className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">User Settings</p>
          <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
            Manage your application preferences, appearance, and account settings from one place.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <Sun className="w-6 h-6 text-yellow-500" />
              <div>
                <h2 className="text-lg font-semibold">Appearance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Switch themes and customize visual behavior.</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  {isDarkMode ? "Dark Mode" : "Light Mode"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={handleCursorToggle}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <MousePointer className="w-5 h-5 text-emerald-500" />
                  {cursorEnabled ? "Fluid Cursor: On" : "Fluid Cursor: Off"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <Bell className="w-6 h-6 text-cyan-500" />
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Control notification preferences for the platform.</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                const next = !notificationsEnabled;
                setNotificationsEnabled(next);
                localStorage.setItem("notifications", next.toString());
              }}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-cyan-500" />
                  {notificationsEnabled ? "Notifications Enabled" : "Notifications Paused"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We’ll keep you updated about new events, hackathons, and important account alerts.
              </p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-6 h-6 text-teal-500" />
              <div>
                <h2 className="text-lg font-semibold">Privacy</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your privacy and account links.</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                const next = !privacyMode;
                setPrivacyMode(next);
                localStorage.setItem("privacyMode", next.toString());
              }}
                className="w-full inline-flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-teal-500" />
                  {privacyMode ? "Privacy Mode: Enabled" : "Privacy Mode: Standard"}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Privacy mode keeps your experience secure by limiting extra tracking and personalization features.
              </p>
            </div>
          </article>
        </div>

        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-950/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quick access to profile settings and privacy documentation.</p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-2xl bg-black text-white px-4 py-3 text-sm font-medium hover:bg-slate-900 transition"
            >
              Edit Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Settings;