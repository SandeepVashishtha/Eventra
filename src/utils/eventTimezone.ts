export const DEFAULT_EVENT_TIMEZONE =
  "UTC";

export const getUserTimezone =
  (): string => {
    try {
      return (
        Intl.DateTimeFormat()
          .resolvedOptions()
          .timeZone ||
        DEFAULT_EVENT_TIMEZONE
      );
    } catch {
      return DEFAULT_EVENT_TIMEZONE;
    }
  };

export const formatEventDateTime = (
  dateValue: string | Date,
  timezone?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Invalid date";
  }

  const selectedTimezone =
    timezone ||
    DEFAULT_EVENT_TIMEZONE;

  try {
    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone:
          selectedTimezone,
        ...options,
      }
    ).format(date);
  } catch {
    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(date);
  }
};

export const getTimezoneLabel = (
  timezone?: string
): string => {
  if (!timezone) {
    return "UTC";
  }

  try {
    const formatter =
      new Intl.DateTimeFormat(
        undefined,
        {
          timeZone:
            timezone,
          timeZoneName:
            "long",
        }
      );

    const parts =
      formatter.formatToParts(
        new Date()
      );

    return (
      parts.find(
        (part) =>
          part.type ===
          "timeZoneName"
      )?.value ||
      timezone
    );
  } catch {
    return timezone;
  }
};

export const formatEventTimeWithTimezone =
  (
    dateValue: string | Date,
    eventTimezone?: string
  ): string => {
    const timezone =
      eventTimezone ||
      DEFAULT_EVENT_TIMEZONE;

    const formatted =
      formatEventDateTime(
        dateValue,
        timezone
      );

    return `${formatted} (${timezone})`;
  };

export const formatEventTimeForUser =
  (
    dateValue: string | Date,
    eventTimezone?: string
  ): string => {
    const userTimezone =
      getUserTimezone();

    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Invalid date";
    }

    try {
      const formatted =
        new Intl.DateTimeFormat(
          undefined,
          {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone:
              userTimezone,
          }
        ).format(date);

      return `${formatted} (${userTimezone})`;
    } catch {
      return formatEventTimeWithTimezone(
        date,
        eventTimezone
      );
    }
  };

export const getTimezoneOffsetLabel =
  (
    timezone: string,
    date: Date = new Date()
  ): string => {
    try {
      const formatter =
        new Intl.DateTimeFormat(
          "en-US",
          {
            timeZone:
              timezone,
            timeZoneName:
              "longOffset",
          }
        );

      const parts =
        formatter.formatToParts(
          date
        );

      return (
        parts.find(
          (part) =>
            part.type ===
            "timeZoneName"
        )?.value ||
        timezone
      );
    } catch {
      return timezone;
    }
  };