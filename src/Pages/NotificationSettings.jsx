import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, BellOff, Check, Mail, Monitor, Save, Volume2 } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useNotification } from "../context/NotificationContext";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_SOUNDS } from "../utils/notificationPreferences";

const digestOptions = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "off", label: "Off" },
];

const channelConfig = [
  { key: "inApp", label: "In-app", icon: Monitor },
  { key: "push", label: "Push", icon: Bell },
  { key: "email", label: "Email", icon: Mail },
];

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    aria-label={label}
    aria-pressed={checked}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition ${
      checked
        ? "border-emerald-500 bg-emerald-500"
        : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
        checked ? "translate-x-5" : "translate-x-0.5"
      }`}
    />
  </button>
);

const NotificationSettings = () => {
  useDocumentTitle("Eventra | Notification Settings");
  const {
    preferences,
    pushStatus,
    updatePreferences,
    savePreferences,
    subscribeToPush,
    unsubscribeFromPush,
    showBrowserNotification,
  } = useNotification();
  const [statusMessage, setStatusMessage] = useState("");
  const timeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  if (statusMessage) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setStatusMessage('');
    }, 4000);
  }

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, [statusMessage]);

  const enabledCategoryCount = useMemo(
    () =>
      Object.values(preferences.categories || {}).filter(
        (category) => category.inApp || category.push || category.email
      ).length,
    [preferences.categories]
  );

  const setPreference = (key, value) => {
    updatePreferences((current) => ({ ...current, [key]: value }));
  };

  const setCategoryPreference = (category, channel, value) => {
    updatePreferences((current) => ({
      ...current,
      categories: {
        ...current.categories,
        [category]: {
          ...current.categories[category],
          [channel]: value,
        },
      },
    }));
  };

  const showStatusMessage = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const handlePushToggle = async (enabled) => {
    if (enabled) {
      const result = await subscribeToPush();
      if (result.subscribed) {
        showStatusMessage("Push notifications are active for this browser.");
      } else if (result.reason === "missing-vapid-key") {
        showStatusMessage("Browser notifications are enabled. Server push needs a VAPID key.");
      } else {
        showStatusMessage("Push notifications could not be enabled in this browser.");
      }
      return;
    }

    await unsubscribeFromPush();
    showStatusMessage("Push notifications are paused.");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await savePreferences(preferences);
    showStatusMessage(
      result.savedRemotely
        ? "Notification preferences saved."
        : "Notification preferences saved locally."
    );
    setIsSaving(false);
  };

  const handleTestNotification = async () => {
    const delivered = await showBrowserNotification({
      id: "eventra-test-notification",
      title: "Eventra",
      message: "Notification preferences are ready.",
      category: "system",
      timestamp: new Date().toISOString(),
    });
    showStatusMessage(
      delivered
        ? "Test notification sent."
        : "Allow browser notifications to send a test notification."
    );
  };

  return (
    <section className="min-h-screen bg-bg py-24 text-text">
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-400">
              Notifications
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Notification Settings</h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Choose how Eventra reaches you for registrations, event updates, reminders,
              announcements, and community activity.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {isSaving ? <Save className="h-4 w-4 animate-pulse" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card-bg/70">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-cyan-500" />
                <div>
                  <h2 className="text-sm font-semibold">In-app alerts</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bell menu and notification sound.
                  </p>
                </div>
              </div>
              <Toggle
                checked={preferences.inApp}
                onChange={(checked) => setPreference("inApp", checked)}
                label="Toggle in-app notifications"
              />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card-bg/70">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {preferences.push ? (
                  <Bell className="h-5 w-5 text-emerald-500" />
                ) : (
                  <BellOff className="h-5 w-5 text-slate-500" />
                )}
                <div>
                  <h2 className="text-sm font-semibold">Browser push</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {pushStatus.permission === "granted"
                      ? "Permission granted"
                      : "Permission required"}
                  </p>
                </div>
              </div>
              <Toggle
                checked={preferences.push}
                onChange={handlePushToggle}
                label="Toggle browser push notifications"
              />
            </div>
            {pushStatus.error ? (
              <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">{pushStatus.error}</p>
            ) : null}
          </article>

          <article className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card-bg/70">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-indigo-500" />
                <div>
                  <h2 className="text-sm font-semibold">Email digest</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {enabledCategoryCount} categories enabled.
                  </p>
                </div>
              </div>
              <Toggle
                checked={preferences.email}
                onChange={(checked) => setPreference("email", checked)}
                label="Toggle email notifications"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {digestOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreference("emailDigest", option.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    preferences.emailDigest === option.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </article>
        </div>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card-bg/70">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Categories</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Keep important categories loud and lower the volume on everything else.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestNotification}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:border-cyan-400 dark:border-slate-800 dark:bg-slate-900"
            >
              <Bell className="h-4 w-4" />
              Test
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-[minmax(180px,1fr)_repeat(3,72px)] border-b border-slate-200 bg-card-bg/50">
              <span>Category</span>
              {channelConfig.map(({ key, label }) => (
                <span key={key} className="text-center">
                  {label}
                </span>
              ))}
            </div>
            {Object.entries(NOTIFICATION_CATEGORIES).map(([category, meta]) => (
              <div
                key={category}
                className="grid grid-cols-[minmax(180px,1fr)_repeat(3,72px)] items-center border-b border-slate-100 px-4 py-3 last:border-b-0 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
                </div>
                {channelConfig.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setCategoryPreference(
                          category,
                          key,
                          !preferences.categories[category]?.[key]
                        )
                      }
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                        preferences.categories[category]?.[key]
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                          : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-bg"
                      }`}
                      aria-label={`Toggle ${label} notifications for ${meta.label}`}
                      title={`${label}: ${meta.label}`}
                    >
                      {preferences.categories[category]?.[key] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-card-bg/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-cyan-500" />
              <div>
                <h2 className="text-base font-semibold">Notification sound</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose the sound used for new in-app notifications.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(NOTIFICATION_SOUNDS).map(([key, sound]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setPreference("sound", key)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    preferences.sound === key
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {statusMessage ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            {statusMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default NotificationSettings;
