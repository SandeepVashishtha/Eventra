/**
 * Event location utilities for physical and
 * online events.
 */

/**
 * Event location types.
 */
export const LOCATION_TYPES = {
  ONLINE: "online",
  OFFLINE: "offline",
};

/**
 * Detect whether an event is online.
 */
export const isOnlineEvent = (event = {}) => {
  const type = String(
    event.type ||
      event.eventType ||
      event.mode ||
      event.locationType ||
      ""
  ).toLowerCase();

  if (
    type === "online" ||
    type === "virtual" ||
    type === "remote"
  ) {
    return true;
  }

  if (
    event.isOnline === true ||
    event.online === true ||
    event.virtual === true
  ) {
    return true;
  }

  return false;
};

/**
 * Detect whether an event is offline/physical.
 */
export const isOfflineEvent = (event = {}) => {
  return !isOnlineEvent(event);
};

/**
 * Get the event location information.
 */
export const getEventLocation = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    return null;
  }

  const location =
    event.location ||
    event.venue ||
    event.address ||
    null;

  if (!location) {
    return null;
  }

  /*
   * Location stored as a string.
   */
  if (typeof location === "string") {
    return {
      name:
        event.venueName ||
        event.locationName ||
        "",
      address: location,
      latitude:
        toNumberOrNull(
          event.latitude ??
            event.lat
        ),
      longitude:
        toNumberOrNull(
          event.longitude ??
            event.lng ??
            event.lon
        ),
      landmarks:
        normalizeLandmarks(
          event.landmarks
        ),
    };
  }

  /*
   * Location stored as an object.
   */
  return {
    name:
      location.name ||
      location.venueName ||
      event.venueName ||
      "",
    address:
      location.address ||
      location.fullAddress ||
      location.formattedAddress ||
      "",
    latitude:
      toNumberOrNull(
        location.latitude ??
          location.lat ??
          event.latitude ??
          event.lat
      ),
    longitude:
      toNumberOrNull(
        location.longitude ??
          location.lng ??
          location.lon ??
          event.longitude ??
          event.lng ??
          event.lon
      ),
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
      "",
    landmarks:
      normalizeLandmarks(
        location.landmarks ||
          event.landmarks
      ),
  };
};

/**
 * Get a complete address string.
 */
export const getFullAddress = (
  event = {}
) => {
  const location =
    getEventLocation(event);

  if (!location) {
    return "";
  }

  if (location.address) {
    return location.address;
  }

  return [
    location.name,
    location.city,
    location.state,
    location.country,
    location.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
};

/**
 * Get the event venue name.
 */
export const getVenueName = (
  event = {}
) => {
  const location =
    getEventLocation(event);

  if (!location) {
    return "";
  }

  return location.name || "";
};

/**
 * Get latitude and longitude.
 */
export const getCoordinates = (
  event = {}
) => {
  const location =
    getEventLocation(event);

  if (!location) {
    return null;
  }

  if (
    location.latitude === null ||
    location.longitude === null
  ) {
    return null;
  }

  return {
    latitude: location.latitude,
    longitude: location.longitude,
  };
};

/**
 * Check whether valid map coordinates exist.
 */
export const hasMapCoordinates = (
  event = {}
) => {
  return Boolean(
    getCoordinates(event)
  );
};

/**
 * Generate a Google Maps search URL.
 *
 * This works with coordinates when available
 * and falls back to the address.
 */
export const getDirectionsUrl = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    return null;
  }

  const coordinates =
    getCoordinates(event);

  if (coordinates) {
    const {
      latitude,
      longitude,
    } = coordinates;

    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${latitude},${longitude}`
    )}`;
  }

  const address =
    getFullAddress(event);

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}`;
};

/**
 * Generate a Google Maps place/search URL.
 */
export const getMapUrl = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    return null;
  }

  const coordinates =
    getCoordinates(event);

  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${coordinates.latitude},${coordinates.longitude}`
    )}`;
  }

  const address =
    getFullAddress(event);

  if (!address) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
};

/**
 * Get the online meeting URL.
 */
export const getMeetingUrl = (
  event = {}
) => {
  if (!isOnlineEvent(event)) {
    return null;
  }

  return (
    event.meetingUrl ||
    event.meetingLink ||
    event.onlineLink ||
    event.joinUrl ||
    event.virtualLink ||
    null
  );
};

/**
 * Check whether an online event has
 * a meeting link.
 */
export const hasMeetingUrl = (
  event = {}
) => {
  return Boolean(
    getMeetingUrl(event)
  );
};

/**
 * Get the location display mode.
 */
export const getLocationType = (
  event = {}
) => {
  return isOnlineEvent(event)
    ? LOCATION_TYPES.ONLINE
    : LOCATION_TYPES.OFFLINE;
};

/**
 * Get a human-readable location label.
 */
export const getLocationTypeLabel = (
  event = {}
) => {
  return isOnlineEvent(event)
    ? "Online"
    : "Offline";
};

/**
 * Get the primary location text for
 * displaying on event cards.
 */
export const getLocationDisplayText = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    return "Online Event";
  }

  const venueName =
    getVenueName(event);

  if (venueName) {
    return venueName;
  }

  const address =
    getFullAddress(event);

  return address || "Location not available";
};

/**
 * Get nearby landmarks.
 */
export const getNearbyLandmarks = (
  event = {}
) => {
  const location =
    getEventLocation(event);

  if (!location) {
    return [];
  }

  return normalizeLandmarks(
    location.landmarks
  );
};

/**
 * Add a landmark to an event location.
 */
export const addLandmark = (
  event,
  landmark
) => {
  if (!event || !landmark) {
    return event;
  }

  const existing =
    getNearbyLandmarks(event);

  const normalized =
    normalizeLandmark(landmark);

  if (!normalized) {
    return event;
  }

  const duplicate =
    existing.some(
      (item) =>
        getLandmarkName(item)
          .toLowerCase() ===
        getLandmarkName(
          normalized
        ).toLowerCase()
    );

  if (duplicate) {
    return event;
  }

  return {
    ...event,
    landmarks: [
      ...existing,
      normalized,
    ],
  };
};

/**
 * Format a coordinate for display.
 */
export const formatCoordinate = (
  value,
  decimals = 6
) => {
  const number =
    toNumberOrNull(value);

  if (number === null) {
    return "";
  }

  return number.toFixed(decimals);
};

/**
 * Validate an event location.
 */
export const validateEventLocation = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    const meetingUrl =
      getMeetingUrl(event);

    return {
      valid: Boolean(meetingUrl),
      type: LOCATION_TYPES.ONLINE,
      error: meetingUrl
        ? null
        : "Online event meeting link is required.",
    };
  }

  const location =
    getEventLocation(event);

  if (!location) {
    return {
      valid: false,
      type: LOCATION_TYPES.OFFLINE,
      error:
        "Physical event venue information is required.",
    };
  }

  if (
    !location.address &&
    !(
      location.latitude !== null &&
      location.longitude !== null
    )
  ) {
    return {
      valid: false,
      type: LOCATION_TYPES.OFFLINE,
      error:
        "Provide a venue address or valid map coordinates.",
    };
  }

  return {
    valid: true,
    type: LOCATION_TYPES.OFFLINE,
    error: null,
  };
};

/**
 * Normalize a location object.
 */
export const normalizeEventLocation = (
  location = {}
) => {
  if (
    !location ||
    typeof location !== "object"
  ) {
    return null;
  }

  return {
    name:
      location.name ||
      location.venueName ||
      "",
    address:
      location.address ||
      location.fullAddress ||
      location.formattedAddress ||
      "",
    latitude:
      toNumberOrNull(
        location.latitude ??
          location.lat
      ),
    longitude:
      toNumberOrNull(
        location.longitude ??
          location.lng ??
          location.lon
      ),
    city:
      location.city || "",
    state:
      location.state || "",
    country:
      location.country || "",
    postalCode:
      location.postalCode ||
      location.zipCode ||
      "",
    landmarks:
      normalizeLandmarks(
        location.landmarks
      ),
  };
};

/**
 * Create a physical location object.
 */
export const createEventLocation = ({
  name = "",
  address = "",
  latitude = null,
  longitude = null,
  city = "",
  state = "",
  country = "",
  postalCode = "",
  landmarks = [],
} = {}) => {
  return {
    name,
    address,
    latitude:
      toNumberOrNull(latitude),
    longitude:
      toNumberOrNull(longitude),
    city,
    state,
    country,
    postalCode,
    landmarks:
      normalizeLandmarks(landmarks),
  };
};

/**
 * Create online event location data.
 */
export const createOnlineLocation = (
  meetingUrl
) => {
  return {
    type: LOCATION_TYPES.ONLINE,
    meetingUrl:
      meetingUrl || "",
  };
};

/**
 * Create an event location summary.
 */
export const getEventLocationSummary = (
  event = {}
) => {
  if (isOnlineEvent(event)) {
    return {
      type: LOCATION_TYPES.ONLINE,
      label: "Online Event",
      venue: null,
      address: null,
      meetingUrl:
        getMeetingUrl(event),
      directionsUrl: null,
      mapUrl: null,
      landmarks: [],
    };
  }

  const location =
    getEventLocation(event);

  return {
    type: LOCATION_TYPES.OFFLINE,
    label: "Offline Event",
    venue:
      location?.name || "",
    address:
      getFullAddress(event),
    meetingUrl: null,
    directionsUrl:
      getDirectionsUrl(event),
    mapUrl: getMapUrl(event),
    landmarks:
      getNearbyLandmarks(event),
  };
};

/**
 * Convert a value to a valid number or null.
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

/**
 * Normalize landmarks into a consistent
 * array format.
 */
const normalizeLandmarks = (
  landmarks
) => {
  if (!Array.isArray(landmarks)) {
    return [];
  }

  return landmarks
    .map(normalizeLandmark)
    .filter(Boolean);
};

/**
 * Normalize one landmark.
 */
const normalizeLandmark = (
  landmark
) => {
  if (!landmark) {
    return null;
  }

  if (typeof landmark === "string") {
    const name = landmark.trim();

    return name
      ? { name }
      : null;
  }

  if (
    typeof landmark === "object"
  ) {
    const name =
      landmark.name ||
      landmark.title ||
      landmark.label ||
      "";

    if (!String(name).trim()) {
      return null;
    }

    return {
      ...landmark,
      name: String(name).trim(),
    };
  }

  return null;
};

/**
 * Get a landmark's name.
 */
const getLandmarkName = (
  landmark
) => {
  if (
    typeof landmark === "string"
  ) {
    return landmark;
  }

  return (
    landmark?.name ||
    landmark?.title ||
    landmark?.label ||
    ""
  );
};