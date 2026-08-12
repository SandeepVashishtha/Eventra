import { normalizeEventFilterConfig } from "./eventFilterPresets.js";

export const EVENT_EXPORT_COLUMNS = [
  {
    header: "Event Name",
    value: (event) => event?.title || event?.name || "",
  },
  {
    header: "Category",
    value: (event) => event?.category || event?.type || "",
  },
  {
    header: "Date",
    value: (event) => event?.date || event?.startDate || "",
  },
  {
    header: "Location",
    value: (event) => formatLocation(event),
  },
  {
    header: "Organizer",
    value: (event) =>
      event?.organizer ||
      event?.organizerName ||
      event?.host ||
      event?.createdBy ||
      "",
  },
  {
    header: "Status",
    value: (event) => event?.status || "",
  },
  {
    header: "Registration Link",
    value: (event) => getRegistrationLink(event),
  },
];

const pad = (value) => String(value).padStart(2, "0");

export const getExportDateStamp = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getEventExportFilename = (format, date = new Date()) => {
  const extension = format === "json" ? "json" : "csv";
  return `events-export-${getExportDateStamp(date)}.${extension}`;
};

export const formatLocation = (event) => {
  const location = event?.location;
  if (!location) {
    return event?.venue || event?.city || event?.mode || event?.eventMode || "";
  }

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object") {
    return [
      location.name,
      location.venue,
      location.city,
      location.state,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return "";
};

export const getRegistrationLink = (event, origin = globalThis.location?.origin || "") => {
  if (!event) return "";
  if (event.registrationLink) return event.registrationLink;
  if (event.registrationUrl) return event.registrationUrl;
  if (event.url) return event.url;
  if (event.link) return event.link;
  if (event.id && origin) return `${origin}/events/${event.id}`;
  return "";
};

const sanitizeCsvField = (field) => {
  const value = String(field ?? "");
  const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
};

const stringifyCsvRow = (row) => row.map(sanitizeCsvField).join(",");

export const buildEventExportRows = (events = []) =>
  (Array.isArray(events) ? events : []).map((event) =>
    EVENT_EXPORT_COLUMNS.map((column) => column.value(event)),
  );

export const buildEventExportMetadata = ({
  filters = {},
  exportedAt = new Date().toISOString(),
  count = 0,
} = {}) => ({
  exportedAt,
  filters: normalizeEventFilterConfig(filters),
  count,
});

export const generateEventsCsv = (events = [], filters = {}, now = new Date()) => {
  const safeEvents = Array.isArray(events) ? events.filter(Boolean) : [];
  const metadata = buildEventExportMetadata({
    filters,
    exportedAt: now.toISOString(),
    count: safeEvents.length,
  });
  const headers = EVENT_EXPORT_COLUMNS.map((column) => column.header);
  const rows = buildEventExportRows(safeEvents);

  return [
    stringifyCsvRow(["Exported At", metadata.exportedAt]),
    stringifyCsvRow(["Active Filters", JSON.stringify(metadata.filters)]),
    stringifyCsvRow(["Event Count", metadata.count]),
    "",
    stringifyCsvRow(headers),
    ...rows.map(stringifyCsvRow),
  ].join("\n");
};

export const generateEventsJson = (events = [], filters = {}, now = new Date()) => {
  const safeEvents = Array.isArray(events) ? events.filter(Boolean) : [];
  const metadata = buildEventExportMetadata({
    filters,
    exportedAt: now.toISOString(),
    count: safeEvents.length,
  });

  return JSON.stringify(
    {
      ...metadata,
      events: safeEvents,
    },
    null,
    2,
  );
};

export const downloadTextFile = (content, filename, mimeType) => {
  if (typeof document === "undefined" || typeof Blob === "undefined") {
    throw new Error("File downloads are only available in a browser.");
  }

  const urlApi = window?.URL || URL;
  const blob = new Blob([content], { type: mimeType });
  const url = urlApi.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    urlApi.revokeObjectURL(url);
  }
};

export const exportEventsResultFile = ({
  events = [],
  filters = {},
  format = "csv",
  now = new Date(),
} = {}) => {
  const safeEvents = Array.isArray(events) ? events.filter(Boolean) : [];
  if (safeEvents.length === 0) {
    return {
      ok: false,
      error: "No events are available to export.",
    };
  }

  const filename = getEventExportFilename(format, now);
  const isJson = format === "json";
  const content = isJson
    ? generateEventsJson(safeEvents, filters, now)
    : generateEventsCsv(safeEvents, filters, now);

  downloadTextFile(
    content,
    filename,
    isJson ? "application/json;charset=utf-8;" : "text/csv;charset=utf-8;",
  );

  return {
    ok: true,
    filename,
    count: safeEvents.length,
  };
};
