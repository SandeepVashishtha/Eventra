/**
 * Determine whether an event is online.
 */
export const isOnlineEvent = (event) => {
  if (!event) {
    return false;
  }

  if (typeof event.isOnline === "boolean") {
    return event.isOnline;
  }

  const mode = String(
    event.mode ||
      event.eventMode ||
      event.type ||
      ""
  )
    .trim()
    .toLowerCase();

  return [
    "online",
    "virtual",
    "remote",
    "webinar",
  ].includes(mode);
};

/**
 * Determine whether an event is a physical event.
 */
export const isPhysicalEvent = (event) => {
  return !isOnlineEvent(event);
};

/**
 * Extract normalized location information
 * from an event object.
 */
export const getEventLocation = (event) => {
  if (!event) {
    return {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      latitude: null,
      longitude: null,
      landmarks: [],
    };
  }

  const location =
    typeof event.location === "object" &&
    event.location !== null
      ? event.location
      : {};

  const latitude =
    location.latitude ??
    location.lat ??
    event.latitude ??
    event.lat ??
    null;

  const longitude =
    location.longitude ??
    location.lng ??
    location.lon ??
    event.longitude ??
    event.lng ??
    event.lon ??
    null;

  const landmarks =
    location.landmarks ||
    event.landmarks ||
    [];

  return {
    name:
      location.name ||
      event.venue ||
      event.venueName ||
      "",

    address:
      location.address ||
      event.address ||
      "",

    city:
      location.city ||
      event.city ||
      "",

    state:
      location.state ||
      event.state ||
      "",

    country:
      location.country ||
      event.country ||
      "",

    postalCode:
      location.postalCode ||
      location.zipCode ||
      event.postalCode ||
      event.zipCode ||
      "",

    latitude:
      toNumberOrNull(latitude),

    longitude:
      toNumberOrNull(longitude),

    landmarks: Array.isArray(landmarks)
      ? landmarks.filter(Boolean)
      : [],
  };
};

/**
 * Check whether valid latitude and longitude
 * coordinates are available.
 */
export const hasValidCoordinates = (
  location
) => {
  if (!location) {
    return false;
  }

  const latitude = Number(
    location.latitude
  );

  const longitude = Number(
    location.longitude
  );

  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Build a human-readable address.
 */
export const formatLocationAddress = (
  location
) => {
  if (!location) {
    return "";
  }

  return [
    location.address,
    location.city,
    location.state,
    location.country,
    location.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
};

/**
 * Build a Google Maps directions URL.
 *
 * Uses coordinates when available and falls
 * back to the formatted address.
 */
export const buildDirectionsUrl = (
  location
) => {
  if (!location) {
    return "";
  }

  let destination = "";

  if (hasValidCoordinates(location)) {
    destination = `${location.latitude},${location.longitude}`;
  } else {
    destination =
      formatLocationAddress(location) ||
      location.name ||
      "";
  }

  if (!destination) {
    return "";
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}`;
};

/**
 * Build a Google Maps search URL.
 */
export const buildMapSearchUrl = (
  location
) => {
  if (!location) {
    return "";
  }

  const query =
    hasValidCoordinates(location)
      ? `${location.latitude},${location.longitude}`
      : formatLocationAddress(location) ||
        location.name ||
        "";

  if (!query) {
    return "";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
};

/**
 * Get a map-friendly location string.
 */
export const getMapQuery = (location) => {
  if (!location) {
    return "";
  }

  if (hasValidCoordinates(location)) {
    return `${location.latitude},${location.longitude}`;
  }

  return (
    formatLocationAddress(location) ||
    location.name ||
    ""
  );
};

/**
 * Get a normalized event location summary.
 */
export const getLocationSummary = (event) => {
  if (isOnlineEvent(event)) {
    return {
      type: "Online",
      label: "Online Event",
      address: "",
      directionsUrl: "",
      mapUrl: "",
    };
  }

  const location =
    getEventLocation(event);

  return {
    type: "Offline",
    label: "Physical Event",
    address:
      formatLocationAddress(location),
    directionsUrl:
      buildDirectionsUrl(location),
    mapUrl:
      buildMapSearchUrl(location),
  };
};

/**
 * Validate a location object.
 */
export const validateEventLocation = (
  location
) => {
  if (!location) {
    return {
      valid: false,
      errors: [
        "Location information is required.",
      ],
    };
  }

  const errors = [];

  if (!location.name) {
    errors.push(
      "Venue name is required."
    );
  }

  if (
    !location.address &&
    !hasValidCoordinates(location)
  ) {
    errors.push(
      "Provide an address or valid map coordinates."
    );
  }

  if (
    location.latitude !== undefined &&
    location.latitude !== null &&
    !Number.isFinite(
      Number(location.latitude)
    )
  ) {
    errors.push(
      "Latitude must be a valid number."
    );
  }

  if (
    location.longitude !== undefined &&
    location.longitude !== null &&
    !Number.isFinite(
      Number(location.longitude)
    )
  ) {
    errors.push(
      "Longitude must be a valid number."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Convert a value to a number or null.
 */
const toNumberOrNull = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};