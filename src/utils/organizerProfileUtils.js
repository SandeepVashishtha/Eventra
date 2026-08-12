/**
 * Normalize organizer profile data.
 */
export const getOrganizerProfile = (
  organizer = {}
) => {
  const socialLinks = normalizeSocialLinks(
    organizer.socialLinks ||
      organizer.socials ||
      {}
  );

  return {
    id:
      organizer.id ||
      organizer.organizerId ||
      null,

    name:
      organizer.name ||
      organizer.organizerName ||
      organizer.displayName ||
      "Event Organizer",

    organization:
      organizer.organization ||
      organizer.organizationName ||
      organizer.company ||
      "",

    description:
      organizer.description ||
      organizer.bio ||
      organizer.about ||
      "",

    image:
      organizer.image ||
      organizer.profileImage ||
      organizer.avatar ||
      organizer.logo ||
      "",

    email:
      organizer.email ||
      organizer.contactEmail ||
      "",

    phone:
      organizer.phone ||
      organizer.contactPhone ||
      "",

    website:
      organizer.website ||
      organizer.websiteUrl ||
      "",

    location:
      formatOrganizerLocation(
        organizer.location ||
          organizer.address ||
          ""
      ),

    socialLinks,
  };
};

/**
 * Normalize social/contact links into a
 * consistent array format.
 */
export const normalizeSocialLinks = (
  socialLinks = {}
) => {
  if (Array.isArray(socialLinks)) {
    return socialLinks
      .filter((item) => item?.url)
      .map((item) => ({
        label:
          item.label ||
          item.name ||
          "Social Link",
        url: item.url,
      }));
  }

  if (
    typeof socialLinks !== "object" ||
    socialLinks === null
  ) {
    return [];
  }

  return Object.entries(socialLinks)
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => ({
      label: formatSocialLabel(platform),
      url,
    }));
};

/**
 * Format organizer location information.
 */
export const formatOrganizerLocation = (
  location
) => {
  if (!location) {
    return "";
  }

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object") {
    return [
      location.address,
      location.city,
      location.state,
      location.country,
      location.postalCode ||
        location.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return String(location);
};

/**
 * Check whether an event date is valid.
 */
export const parseOrganizerEventDate = (
  event
) => {
  const date =
    event?.date ||
    event?.eventDate ||
    event?.startDate;

  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);

  return Number.isNaN(
    parsedDate.getTime()
  )
    ? null
    : parsedDate;
};

/**
 * Determine whether an event is upcoming.
 */
export const isUpcomingOrganizerEvent = (
  event,
  referenceDate = new Date()
) => {
  const eventDate =
    parseOrganizerEventDate(event);

  if (!eventDate) {
    return false;
  }

  return eventDate >= referenceDate;
};

/**
 * Determine whether an event is a previous event.
 */
export const isPreviousOrganizerEvent = (
  event,
  referenceDate = new Date()
) => {
  const eventDate =
    parseOrganizerEventDate(event);

  if (!eventDate) {
    return false;
  }

  return eventDate < referenceDate;
};

/**
 * Get upcoming and previous events.
 */
export const getOrganizerEventSummary = (
  events = [],
  referenceDate = new Date()
) => {
  if (!Array.isArray(events)) {
    return {
      totalEvents: 0,
      upcomingEvents: [],
      previousEvents: [],
    };
  }

  const upcomingEvents = events
    .filter((event) =>
      isUpcomingOrganizerEvent(
        event,
        referenceDate
      )
    )
    .sort(
      (a, b) =>
        parseOrganizerEventDate(a) -
        parseOrganizerEventDate(b)
    );

  const previousEvents = events
    .filter((event) =>
      isPreviousOrganizerEvent(
        event,
        referenceDate
      )
    )
    .sort(
      (a, b) =>
        parseOrganizerEventDate(b) -
        parseOrganizerEventDate(a)
    );

  return {
    totalEvents: events.length,
    upcomingEvents,
    previousEvents,
  };
};

/**
 * Get an event's display status.
 */
export const getOrganizerEventStatus = (
  event,
  referenceDate = new Date()
) => {
  if (!event) {
    return "Unknown";
  }

  if (event.status) {
    return event.status;
  }

  const eventDate =
    parseOrganizerEventDate(event);

  if (!eventDate) {
    return "Unknown";
  }

  const now = referenceDate;

  const endDate = event.endDate
    ? new Date(event.endDate)
    : null;

  if (
    endDate &&
    !Number.isNaN(endDate.getTime()) &&
    now >= eventDate &&
    now <= endDate
  ) {
    return "Ongoing";
  }

  return eventDate >= now
    ? "Upcoming"
    : "Completed";
};

/**
 * Format an event date for display.
 */
export const formatOrganizerEventDate = (
  date
) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return String(date);
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

/**
 * Get organizer event statistics.
 */
export const getOrganizerStatistics = (
  events = [],
  referenceDate = new Date()
) => {
  const summary =
    getOrganizerEventSummary(
      events,
      referenceDate
    );

  return {
    totalEvents: summary.totalEvents,
    upcomingEvents:
      summary.upcomingEvents.length,
    previousEvents:
      summary.previousEvents.length,
    ongoingEvents: events.filter(
      (event) =>
        getOrganizerEventStatus(
          event,
          referenceDate
        ) === "Ongoing"
    ).length,
  };
};

/**
 * Filter organizer events by event type.
 */
export const filterOrganizerEventsByType = (
  events = [],
  eventType = "All"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    !eventType ||
    eventType === "All"
  ) {
    return events;
  }

  const normalizedType = String(
    eventType
  )
    .trim()
    .toLowerCase();

  return events.filter((event) => {
    const type = String(
      event?.eventType ||
        event?.type ||
        event?.category ||
        ""
    )
      .trim()
      .toLowerCase();

    return type === normalizedType;
  });
};

/**
 * Get all unique event types.
 */
export const getOrganizerEventTypes = (
  events = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  return [
    ...new Set(
      events
        .map(
          (event) =>
            event?.eventType ||
            event?.type ||
            event?.category
        )
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
};

/**
 * Create a safe organizer profile URL.
 */
export const getOrganizerProfileUrl = (
  organizer
) => {
  if (!organizer) {
    return "";
  }

  if (organizer.profileUrl) {
    return organizer.profileUrl;
  }

  const id =
    organizer.id ||
    organizer.organizerId;

  return id
    ? `/organizers/${id}`
    : "";
};

/**
 * Format social platform names.
 */
const formatSocialLabel = (
  platform
) => {
  const labels = {
    linkedin: "LinkedIn",
    twitter: "Twitter",
    x: "X",
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
    github: "GitHub",
    website: "Website",
  };

  const normalized = String(
    platform
  )
    .trim()
    .toLowerCase();

  return (
    labels[normalized] ||
    String(platform)
      .charAt(0)
      .toUpperCase() +
      String(platform).slice(1)
  );
};