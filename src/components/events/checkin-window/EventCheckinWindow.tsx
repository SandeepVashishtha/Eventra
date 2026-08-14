import React, { useEffect, useMemo, useState } from "react";

type CheckInWindowState =
  | "not-configured"
  | "upcoming"
  | "open"
  | "closed";

export interface EventCheckinWindowConfig {
  startTime: string;
  endTime: string;
  timezone: string;
}

interface EventCheckinWindowProps {
  eventId: string;
  initialConfig?: EventCheckinWindowConfig | null;
  onSave?: (
    eventId: string,
    config: EventCheckinWindowConfig,
  ) => Promise<void> | void;
  readOnly?: boolean;
}

const DEFAULT_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const TIMEZONE_OPTIONS = [
  "UTC",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
];

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDefaultConfig = (): EventCheckinWindowConfig => ({
  startTime: "10:00",
  endTime: "11:00",
  timezone: DEFAULT_TIMEZONE,
});

const getMinutesFromTime = (time: string): number => {
  if (!time || !time.includes(":")) {
    return -1;
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return -1;
  }

  return hours * 60 + minutes;
};

const getWindowState = (
  config: EventCheckinWindowConfig | null,
): CheckInWindowState => {
  if (!config?.startTime || !config?.endTime) {
    return "not-configured";
  }

  const startMinutes = getMinutesFromTime(config.startTime);
  const endMinutes = getMinutesFromTime(config.endTime);

  if (startMinutes < 0 || endMinutes < 0 || endMinutes <= startMinutes) {
    return "not-configured";
  }

  const currentDate = new Date();

  const currentMinutes =
    currentDate.getHours() * 60 + currentDate.getMinutes();

  if (currentMinutes < startMinutes) {
    return "upcoming";
  }

  if (currentMinutes >= endMinutes) {
    return "closed";
  }

  return "open";
};

const getStatusLabel = (state: CheckInWindowState): string => {
  switch (state) {
    case "upcoming":
      return "Check-in not yet open";

    case "open":
      return "Check-in is currently open";

    case "closed":
      return "Check-in window closed";

    case "not-configured":
    default:
      return "Check-in window not configured";
  }
};

const getStatusDescription = (
  state: CheckInWindowState,
  config: EventCheckinWindowConfig | null,
): string => {
  if (state === "upcoming" && config) {
    return `Check-in opens at ${config.startTime} ${config.timezone}.`;
  }

  if (state === "open" && config) {
    return `Participants can check in until ${config.endTime} ${config.timezone}.`;
  }

  if (state === "closed" && config) {
    return `Check-in closed at ${config.endTime} ${config.timezone}.`;
  }

  return "Configure a time window to control participant check-in.";
};

const isValidTime = (time: string): boolean => {
  return getMinutesFromTime(time) >= 0;
};

const validateConfig = (
  config: EventCheckinWindowConfig,
): string | null => {
  if (!config.startTime) {
    return "Check-in start time is required.";
  }

  if (!config.endTime) {
    return "Check-in end time is required.";
  }

  if (!isValidTime(config.startTime)) {
    return "Please enter a valid start time.";
  }

  if (!isValidTime(config.endTime)) {
    return "Please enter a valid end time.";
  }

  const startMinutes = getMinutesFromTime(config.startTime);
  const endMinutes = getMinutesFromTime(config.endTime);

  if (endMinutes <= startMinutes) {
    return "Check-in end time must be later than the start time.";
  }

  if (!config.timezone) {
    return "Please select an event timezone.";
  }

  return null;
};

const getStateClassName = (state: CheckInWindowState): string => {
  switch (state) {
    case "open":
      return "checkin-window-status checkin-window-status-open";

    case "upcoming":
      return "checkin-window-status checkin-window-status-upcoming";

    case "closed":
      return "checkin-window-status checkin-window-status-closed";

    default:
      return "checkin-window-status checkin-window-status-neutral";
  }
};

const EventCheckinWindow: React.FC<EventCheckinWindowProps> = ({
  eventId,
  initialConfig = null,
  onSave,
  readOnly = false,
}) => {
  const [config, setConfig] = useState<EventCheckinWindowConfig>(
    initialConfig ?? createDefaultConfig(),
  );

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(
    null,
  );

  const [saving, setSaving] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const windowState = useMemo(() => {
    void currentTime;

    return getWindowState(config);
  }, [config, currentTime]);

  const statusLabel = getStatusLabel(windowState);

  const statusDescription = getStatusDescription(
    windowState,
    config,
  );

  const updateField = (
    field: keyof EventCheckinWindowConfig,
    value: string,
  ) => {
    setConfig((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setSuccessMessage(null);

    const validationError = validateConfig(config);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!onSave) {
      setError(
        "Check-in window saving is not connected to the event service yet.",
      );
      return;
    }

    try {
      setSaving(true);

      await onSave(eventId, config);

      setSuccessMessage("Check-in window saved successfully.");
    } catch (saveError) {
      console.error("Unable to save check-in window:", saveError);

      setError(
        "Unable to save the check-in window. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialConfig) {
      setConfig(initialConfig);
    } else {
      setConfig(createDefaultConfig());
    }

    setError(null);
    setSuccessMessage(null);
  };

  return (
    <section
      aria-labelledby="event-checkin-window-title"
      className="checkin-window-container"
    >
      <div className="checkin-window-header">
        <div>
          <h2 id="event-checkin-window-title">
            Check-in Window
          </h2>

          <p>
            Configure when participants can check in to this
            event.
          </p>
        </div>
      </div>

      <div
        className={getStateClassName(windowState)}
        role="status"
        aria-live="polite"
      >
        <div className="checkin-window-status-title">
          {statusLabel}
        </div>

        <div className="checkin-window-status-description">
          {statusDescription}
        </div>
      </div>

      <div className="checkin-window-form">
        <div className="checkin-window-field">
          <label htmlFor={`checkin-start-${eventId}`}>
            Check-in start time
          </label>

          <input
            id={`checkin-start-${eventId}`}
            type="time"
            value={config.startTime}
            disabled={readOnly || saving}
            onChange={(event) =>
              updateField("startTime", event.target.value)
            }
          />

          <span>
            Participants cannot check in before this time.
          </span>
        </div>

        <div className="checkin-window-field">
          <label htmlFor={`checkin-end-${eventId}`}>
            Check-in end time
          </label>

          <input
            id={`checkin-end-${eventId}`}
            type="time"
            value={config.endTime}
            disabled={readOnly || saving}
            onChange={(event) =>
              updateField("endTime", event.target.value)
            }
          />

          <span>
            Participants cannot check in after this time.
          </span>
        </div>

        <div className="checkin-window-field">
          <label htmlFor={`checkin-timezone-${eventId}`}>
            Event timezone
          </label>

          <select
            id={`checkin-timezone-${eventId}`}
            value={config.timezone}
            disabled={readOnly || saving}
            onChange={(event) =>
              updateField("timezone", event.target.value)
            }
          >
            {TIMEZONE_OPTIONS.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>

          <span>
            Check-in availability follows the event timezone.
          </span>
        </div>
      </div>

      {error && (
        <div
          className="checkin-window-message checkin-window-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {successMessage && (
        <div
          className="checkin-window-message checkin-window-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {!readOnly && (
        <div className="checkin-window-actions">
          <button
            type="button"
            disabled={saving}
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Check-in Window"}
          </button>
        </div>
      )}

      <div className="checkin-window-information">
        <h3>How check-in works</h3>

        <ul>
          <li>
            Before the start time, participant check-in is
            unavailable.
          </li>

          <li>
            During the configured window, valid participants
            can check in.
          </li>

          <li>
            After the end time, participant check-in is
            unavailable.
          </li>

          <li>
            The configured event timezone determines the
            check-in window.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default EventCheckinWindow;