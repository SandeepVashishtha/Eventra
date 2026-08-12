import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  RotateCcw,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import NotificationPreferenceItem from "./NotificationPreferenceItem";
import {
  NOTIFICATION_TYPES,
  getNotificationPreferences,
  saveNotificationPreferences,
  resetNotificationPreferences,
  enableAllNotifications,
  disableAllNotifications,
} from "../../utils/notificationPreferenceUtils";

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState(() =>
    getNotificationPreferences()
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreferences(getNotificationPreferences());
  }, []);

  const handleToggle = (id) => {
    const updatedPreferences = {
      ...preferences,
      [id]: !preferences[id],
    };

    setPreferences(updatedPreferences);
    setSaved(false);
  };

  const handleSave = () => {
    const updated = saveNotificationPreferences(
      preferences
    );

    setPreferences(updated);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    const defaults =
      resetNotificationPreferences();

    setPreferences(defaults);
    setSaved(false);
  };

  const handleEnableAll = () => {
    const updated =
      enableAllNotifications();

    setPreferences(updated);
    setSaved(false);
  };

  const handleDisableAll = () => {
    const updated =
      disableAllNotifications();

    setPreferences(updated);
    setSaved(false);
  };

  const enabledCount = Object.values(
    preferences
  ).filter(Boolean).length;

  return (
    <section className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Bell
              size={24}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Notification Preferences
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose which event notifications you want to receive.
            </p>
          </div>
        </div>

        <span className="whitespace-nowrap rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {enabledCount}/{NOTIFICATION_TYPES.length} Enabled
        </span>
      </div>

      {/* Quick Actions */}

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleEnableAll}
          className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
        >
          <ToggleRight size={18} />
          Enable All
        </button>

        <button
          type="button"
          onClick={handleDisableAll}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <ToggleLeft size={18} />
          Disable All
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {/* Preferences */}

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {NOTIFICATION_TYPES.map((notification) => (
          <NotificationPreferenceItem
            key={notification.id}
            id={notification.id}
            label={notification.label}
            description={notification.description}
            enabled={Boolean(
              preferences[notification.id]
            )}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Footer */}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-[24px]">
          {saved && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
              <CheckCircle size={18} />
              Preferences saved successfully.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Save Preferences
        </button>
      </div>
    </section>
  );
};

export default NotificationPreferences;