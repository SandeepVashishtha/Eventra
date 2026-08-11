/**
 * Event Contact & Support utilities.
 */

/**
 * Support types available for an event.
 */
export const SUPPORT_TYPES = {
  ORGANIZER: "organizer",
  EMAIL: "email",
  FAQ: "faq",
  REPORT: "report",
};

/**
 * Extract organizer information from an event.
 */
export const getOrganizerContact = (
  event = {}
) => {
  const organizer =
    event.organizer ||
    event.organizerDetails ||
    event.organizerInfo ||
    {};

  const name =
    organizer.name ||
    organizer.organizerName ||
    event.organizerName ||
    event.organizer ||
    "";

  const email =
    organizer.email ||
    organizer.contactEmail ||
    event.organizerEmail ||
    event.contactEmail ||
    "";

  const phone =
    organizer.phone ||
    organizer.phoneNumber ||
    event.organizerPhone ||
    event.contactPhone ||
    "";

  const description =
    organizer.description ||
    organizer.bio ||
    event.organizerDescription ||
    "";

  const website =
    organizer.website ||
    organizer.websiteUrl ||
    event.organizerWebsite ||
    "";

  const role =
    organizer.role ||
    event.organizerRole ||
    "Event Organizer";

  if (
    !name &&
    !email &&
    !phone &&
    !description &&
    !website
  ) {
    return null;
  }

  return {
    name:
      name || "Event Organizer",
    email,
    phone,
    description,
    website,
    role,
  };
};

/**
 * Get the event support email.
 */
export const getSupportEmail = (
  event = {}
) => {
  return (
    event.supportEmail ||
    event.support?.email ||
    event.eventSupportEmail ||
    event.helpEmail ||
    event.contactEmail ||
    getOrganizerContact(event)
      ?.email ||
    ""
  );
};

/**
 * Get the FAQ URL for an event.
 */
export const getFAQUrl = (
  event = {}
) => {
  return (
    event.faqUrl ||
    event.faqLink ||
    event.faq ||
    event.support?.faqUrl ||
    event.support?.faqLink ||
    null
  );
};

/**
 * Get the report-issue URL.
 */
export const getReportIssueUrl = (
  event = {}
) => {
  return (
    event.reportIssueUrl ||
    event.reportUrl ||
    event.issueUrl ||
    event.support?.reportIssueUrl ||
    event.support?.reportUrl ||
    null
  );
};

/**
 * Get event-specific support information.
 */
export const getSupportInformation = (
  event = {}
) => {
  return (
    event.supportInformation ||
    event.supportInfo ||
    event.support?.information ||
    event.support?.description ||
    event.eventSupport ||
    ""
  );
};

/**
 * Get all support information for an event.
 */
export const getEventSupportInfo = (
  event = {}
) => {
  const organizer =
    getOrganizerContact(event);

  const supportEmail =
    getSupportEmail(event);

  const faqUrl =
    getFAQUrl(event);

  const reportIssueUrl =
    getReportIssueUrl(event);

  const supportInformation =
    getSupportInformation(event);

  return {
    organizer,
    supportEmail,
    faqUrl,
    reportIssueUrl,
    supportInformation,

    hasOrganizer:
      Boolean(organizer),

    hasSupportEmail:
      Boolean(supportEmail),

    hasFAQ:
      Boolean(faqUrl),

    hasReportIssue:
      Boolean(reportIssueUrl),

    hasSupportInformation:
      Boolean(
        supportInformation
      ),
  };
};

/**
 * Check whether any support information
 * exists for the event.
 */
export const hasSupportInformation = (
  event = {}
) => {
  const support =
    getEventSupportInfo(event);

  return (
    support.hasOrganizer ||
    support.hasSupportEmail ||
    support.hasFAQ ||
    support.hasReportIssue ||
    support.hasSupportInformation
  );
};

/**
 * Check whether organizer contact
 * information exists.
 */
export const hasOrganizerContact = (
  event = {}
) => {
  return Boolean(
    getOrganizerContact(event)
  );
};

/**
 * Check whether an event has a support email.
 */
export const hasSupportEmail = (
  event = {}
) => {
  return Boolean(
    getSupportEmail(event)
  );
};

/**
 * Check whether an FAQ is available.
 */
export const hasFAQ = (
  event = {}
) => {
  return Boolean(
    getFAQUrl(event)
  );
};

/**
 * Check whether reporting an issue
 * is supported.
 */
export const hasReportIssue = (
  event = {}
) => {
  return Boolean(
    getReportIssueUrl(event)
  );
};

/**
 * Build a mailto URL for support.
 */
export const getSupportMailtoUrl = (
  event = {},
  subject = ""
) => {
  const email =
    getSupportEmail(event);

  if (!email) {
    return null;
  }

  const eventName =
    event.name ||
    event.title ||
    "Event";

  const finalSubject =
    subject ||
    `Support request for ${eventName}`;

  return `mailto:${email}?subject=${encodeURIComponent(
    finalSubject
  )}`;
};

/**
 * Build a mailto URL for the organizer.
 */
export const getOrganizerMailtoUrl = (
  event = {},
  subject = ""
) => {
  const organizer =
    getOrganizerContact(event);

  if (!organizer?.email) {
    return null;
  }

  const eventName =
    event.name ||
    event.title ||
    "Event";

  const finalSubject =
    subject ||
    `Question about ${eventName}`;

  return `mailto:${organizer.email}?subject=${encodeURIComponent(
    finalSubject
  )}`;
};

/**
 * Validate an email address.
 */
export const isValidEmail = (
  email
) => {
  if (
    typeof email !==
    "string"
  ) {
    return false;
  }

  const value = email.trim();

  if (!value) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
};

/**
 * Validate a support URL.
 */
export const isValidSupportUrl = (
  url
) => {
  if (
    typeof url !==
    "string"
  ) {
    return false;
  }

  try {
    const parsed =
      new URL(url);

    return (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
};

/**
 * Validate support configuration.
 */
export const validateEventSupport = (
  event = {}
) => {
  const support =
    getEventSupportInfo(event);

  const errors = [];

  if (
    support.supportEmail &&
    !isValidEmail(
      support.supportEmail
    )
  ) {
    errors.push(
      "Support email is invalid."
    );
  }

  if (
    support.faqUrl &&
    !isValidSupportUrl(
      support.faqUrl
    )
  ) {
    errors.push(
      "FAQ URL is invalid."
    );
  }

  if (
    support.reportIssueUrl &&
    !isValidSupportUrl(
      support.reportIssueUrl
    )
  ) {
    errors.push(
      "Report issue URL is invalid."
    );
  }

  if (
    support.organizer?.email &&
    !isValidEmail(
      support.organizer.email
    )
  ) {
    errors.push(
      "Organizer email is invalid."
    );
  }

  if (
    support.organizer?.website &&
    !isValidSupportUrl(
      support.organizer.website
    )
  ) {
    errors.push(
      "Organizer website URL is invalid."
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Create a normalized support configuration.
 */
export const createEventSupportConfig = ({
  organizer = {},
  supportEmail = "",
  faqUrl = "",
  reportIssueUrl = "",
  supportInformation = "",
} = {}) => {
  return {
    organizer: {
      name:
        organizer.name ||
        "Event Organizer",
      role:
        organizer.role ||
        "Event Organizer",
      email:
        organizer.email || "",
      phone:
        organizer.phone || "",
      description:
        organizer.description ||
        "",
      website:
        organizer.website || "",
    },
    supportEmail,
    faqUrl,
    reportIssueUrl,
    supportInformation,
  };
};

/**
 * Merge existing support information
 * with updates.
 */
export const updateEventSupportConfig = (
  event = {},
  updates = {}
) => {
  const current =
    getEventSupportInfo(event);

  const updatedOrganizer = {
    ...(current.organizer || {}),
    ...(updates.organizer || {}),
  };

  return {
    ...event,

    organizer:
      updatedOrganizer,

    supportEmail:
      updates.supportEmail !==
      undefined
        ? updates.supportEmail
        : current.supportEmail,

    faqUrl:
      updates.faqUrl !==
      undefined
        ? updates.faqUrl
        : current.faqUrl,

    reportIssueUrl:
      updates.reportIssueUrl !==
      undefined
        ? updates.reportIssueUrl
        : current.reportIssueUrl,

    supportInformation:
      updates.supportInformation !==
      undefined
        ? updates.supportInformation
        : current.supportInformation,
  };
};

/**
 * Remove empty support fields.
 */
export const cleanSupportConfig = (
  support = {}
) => {
  const cleaned = {
    ...support,
  };

  Object.keys(cleaned).forEach(
    (key) => {
      const value =
        cleaned[key];

      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        delete cleaned[key];
      }
    }
  );

  if (
    cleaned.organizer &&
    typeof cleaned.organizer ===
      "object"
  ) {
    Object.keys(
      cleaned.organizer
    ).forEach((key) => {
      const value =
        cleaned.organizer[key];

      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        delete cleaned.organizer[
          key
        ];
      }
    });
  }

  return cleaned;
};

/**
 * Get available support actions.
 */
export const getAvailableSupportActions = (
  event = {}
) => {
  const support =
    getEventSupportInfo(event);

  const actions = [];

  if (
    support.organizer
      ?.email
  ) {
    actions.push({
      type:
        SUPPORT_TYPES.ORGANIZER,
      label:
        "Contact Organizer",
      href:
        getOrganizerMailtoUrl(
          event
        ),
    });
  }

  if (
    support.supportEmail
  ) {
    actions.push({
      type:
        SUPPORT_TYPES.EMAIL,
      label:
        "Email Support",
      href:
        getSupportMailtoUrl(
          event
        ),
    });
  }

  if (support.faqUrl) {
    actions.push({
      type:
        SUPPORT_TYPES.FAQ,
      label: "View FAQ",
      href:
        support.faqUrl,
    });
  }

  if (
    support.reportIssueUrl
  ) {
    actions.push({
      type:
        SUPPORT_TYPES.REPORT,
      label:
        "Report an Issue",
      href:
        support.reportIssueUrl,
    });
  }

  return actions;
};

/**
 * Get a short support summary.
 */
export const getSupportSummary = (
  event = {}
) => {
  const support =
    getEventSupportInfo(event);

  const options = [];

  if (support.organizer) {
    options.push(
      "organizer contact"
    );
  }

  if (support.supportEmail) {
    options.push(
      "support email"
    );
  }

  if (support.faqUrl) {
    options.push("FAQ");
  }

  if (support.reportIssueUrl) {
    options.push(
      "issue reporting"
    );
  }

  if (
    support.supportInformation
  ) {
    options.push(
      "event-specific support"
    );
  }

  if (options.length === 0) {
    return "No support information available.";
  }

  return `Support available: ${options.join(
    ", "
  )}.`;
};