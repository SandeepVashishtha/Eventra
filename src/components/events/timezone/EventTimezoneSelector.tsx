import React from "react";

interface EventTimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const COMMON_TIMEZONES = [
  {
    value: "UTC",
    label: "UTC",
  },
  {
    value: "Asia/Kolkata",
    label: "India Standard Time (IST)",
  },
  {
    value: "Asia/Dubai",
    label: "Gulf Standard Time (GST)",
  },
  {
    value: "Asia/Singapore",
    label: "Singapore Time (SGT)",
  },
  {
    value: "Asia/Tokyo",
    label: "Japan Standard Time (JST)",
  },
  {
    value: "Asia/Shanghai",
    label: "China Standard Time (CST)",
  },
  {
    value: "Europe/London",
    label: "United Kingdom Time",
  },
  {
    value: "Europe/Paris",
    label: "Central European Time",
  },
  {
    value: "Europe/Berlin",
    label: "Central European Time (Berlin)",
  },
  {
    value: "America/New_York",
    label: "Eastern Time (New York)",
  },
  {
    value: "America/Chicago",
    label: "Central Time (Chicago)",
  },
  {
    value: "America/Denver",
    label: "Mountain Time (Denver)",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific Time (Los Angeles)",
  },
  {
    value: "Australia/Sydney",
    label: "Australian Eastern Time",
  },
];

const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions()
      .timeZone;
  } catch {
    return "UTC";
  }
};

const EventTimezoneSelector: React.FC<
  EventTimezoneSelectorProps
> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
}) => {
  const browserTimezone =
    getBrowserTimezone();

  const options = [...COMMON_TIMEZONES];

  if (
    browserTimezone &&
    !options.some(
      (timezone) =>
        timezone.value ===
        browserTimezone
    )
  ) {
    options.push({
      value: browserTimezone,
      label: `Your local timezone (${browserTimezone})`,
    });
  }

  return (
    <div
      className={`w-full ${className}`}
    >
      <label
        htmlFor="event-timezone"
        className="
          block
          text-sm
          font-semibold
          text-gray-800
          dark:text-gray-200
        "
      >
        Event Timezone
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <p
        className="
          mt-1
          text-xs
          leading-5
          text-gray-500
          dark:text-gray-400
        "
      >
        Select the timezone in which the
        event organizer has configured the
        event time.
      </p>

      <select
        id="event-timezone"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        disabled={disabled}
        required={required}
        className="
          mt-3
          w-full
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          py-3
          text-sm
          text-gray-900
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-100
          disabled:cursor-not-allowed
          disabled:opacity-60
          dark:border-gray-600
          dark:bg-gray-900
          dark:text-white
          dark:focus:ring-blue-950
        "
      >
        <option value="">
          Select timezone
        </option>

        {options.map(
          (timezone) => (
            <option
              key={timezone.value}
              value={timezone.value}
            >
              {timezone.label}
            </option>
          )
        )}
      </select>

      {value && (
        <div
          className="
            mt-3
            rounded-lg
            bg-blue-50
            px-3
            py-2
            text-xs
            text-blue-700
            dark:bg-blue-950/30
            dark:text-blue-300
          "
        >
          <strong>
            Selected timezone:
          </strong>{" "}
          {value}
        </div>
      )}
    </div>
  );
};

export default EventTimezoneSelector;