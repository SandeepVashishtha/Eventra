import {
  Bell,
  Check,
  Mail,
  Megaphone,
  Save,
  Settings,
  Smartphone,
  CalendarClock,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_PREFERENCES = {
  inAppNotifications: true,
  emailNotifications: true,
  eventReminders: true,
  organizerAnnouncements: true,
  scheduleChanges: true,
  registrationUpdates: true,
};

const EventParticipantCommunicationPreference = ({
  initialPreferences = DEFAULT_PREFERENCES,
  onSave,
  className = "",
}) => {
  const [preferences, setPreferences] =
    useState({
      ...DEFAULT_PREFERENCES,
      ...initialPreferences,
    });

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const updatePreference = (
    key,
    value
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      await onSave?.(preferences);

      setSaved(true);
    } catch (err) {
      setError(
        err?.message ||
          "Unable to save communication preferences."
      );
    } finally {
      setSaving(false);
    }
  };

  const enableAll = () => {
    setPreferences(
      Object.keys(preferences).reduce(
        (result, key) => ({
          ...result,
          [key]: true,
        }),
        {}
      )
    );

    setSaved(false);
  };

  const disableAll = () => {
    setPreferences(
      Object.keys(preferences).reduce(
        (result, key) => ({
          ...result,
          [key]: false,
        }),
        {}
      )
    );

    setSaved(false);
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Settings size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Notification Settings
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Communication Preferences
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose how you want to receive event-related
              communications.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={enableAll}
            className="rounded-xl bg-green-50 px-3 py-2 text-[7px] font-bold text-green-600 hover:bg-green-100 dark:bg-green-900/10 dark:text-green-400"
          >
            Enable All
          </button>

          <button
            type="button"
            onClick={disableAll}
            className="rounded-xl bg-slate-100 px-3 py-2 text-[7px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Channel summary */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ChannelCard
          icon={<Smartphone size={17} />}
          title="In-App Notifications"
          description="Receive alerts inside Eventra."
          enabled={
            preferences.inAppNotifications
          }
        />

        <ChannelCard
          icon={<Mail size={17} />}
          title="Email Notifications"
          description="Receive important updates by email."
          enabled={
            preferences.emailNotifications
          }
        />
      </div>

      {/* Preferences */}
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Bell
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            Notification Categories
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <PreferenceItem
            icon={<CalendarClock size={16} />}
            title="Event Reminders"
            description="Receive reminders before registered events and sessions."
            checked={
              preferences.eventReminders
            }
            onChange={(value) =>
              updatePreference(
                "eventReminders",
                value
              )
            }
          />

          <PreferenceItem
            icon={<Megaphone size={16} />}
            title="Organizer Announcements"
            description="Receive announcements and important messages from organizers."
            checked={
              preferences.organizerAnnouncements
            }
            onChange={(value) =>
              updatePreference(
                "organizerAnnouncements",
                value
              )
            }
          />

          <PreferenceItem
            icon={<CalendarClock size={16} />}
            title="Schedule Changes"
            description="Get notified when an event or session schedule changes."
            checked={
              preferences.scheduleChanges
            }
            onChange={(value) =>
              updatePreference(
                "scheduleChanges",
                value
              )
            }
          />

          <PreferenceItem
            icon={<Check size={16} />}
            title="Registration Updates"
            description="Receive updates about registration status, approval, cancellation, or waitlist changes."
            checked={
              preferences.registrationUpdates
            }
            onChange={(value) =>
              updatePreference(
                "registrationUpdates",
                value
              )
            }
          />
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[7px] text-slate-400">
          Your preferences apply to future event
          communications.
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={13} />

          {saving
            ? "Saving..."
            : saved
              ? "Preferences Saved"
              : "Save Preferences"}
        </button>
      </div>

      {/* Success */}
      {saved && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-600 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <Check size={14} />
          Communication preferences saved successfully.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[8px] font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}
    </section>
  );
};

const ChannelCard = ({
  icon,
  title,
  description,
  enabled,
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        enabled
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400"
          : "bg-slate-100 text-slate-400 dark:bg-slate-800"
      }`}
    >
      {icon}
    </div>

    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          {title}
        </p>

        <span
          className={`rounded-full px-2 py-0.5 text-[5px] font-bold ${
            enabled
              ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}
        >
          {enabled
            ? "Enabled"
            : "Disabled"}
        </span>
      </div>

      <p className="mt-1 text-[7px] text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

const PreferenceItem = ({
  icon,
  title,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          checked
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-[9px] font-bold text-slate-800 dark:text-white">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-[7px] leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`Toggle ${title}`}
      onClick={() =>
        onChange(!checked)
      }
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked
          ? "bg-indigo-600"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked
            ? "translate-x-6"
            : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default EventParticipantCommunicationPreference;