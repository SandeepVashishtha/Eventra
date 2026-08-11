/**
 * Event Accessibility utilities.
 *
 * Provides helpers for:
 * - Wheelchair accessibility
 * - Accessible entrances
 * - Accessible restrooms
 * - Elevator availability
 * - Sign-language support
 * - Accessibility contact information
 * - Normalization and validation
 */

export const ACCESSIBILITY_FEATURES = {
  WHEELCHAIR: "wheelchair",
  ACCESSIBLE_ENTRANCE:
    "accessibleEntrance",
  ACCESSIBLE_RESTROOM:
    "accessibleRestroom",
  ELEVATOR: "elevator",
  SIGN_LANGUAGE:
    "signLanguage",
};

export const ACCESSIBILITY_FEATURE_CONFIG = [
  {
    id: ACCESSIBILITY_FEATURES.WHEELCHAIR,
    label: "Wheelchair Accessibility",
    description:
      "The venue provides wheelchair-accessible facilities.",
  },
  {
    id: ACCESSIBILITY_FEATURES.ACCESSIBLE_ENTRANCE,
    label: "Accessible Entrance",
    description:
      "Accessible entrances are available at the venue.",
  },
  {
    id: ACCESSIBILITY_FEATURES.ACCESSIBLE_RESTROOM,
    label: "Accessible Restrooms",
    description:
      "Accessible restroom facilities are available.",
  },
  {
    id: ACCESSIBILITY_FEATURES.ELEVATOR,
    label: "Elevator Availability",
    description:
      "Elevator access is available where required.",
  },
  {
    id: ACCESSIBILITY_FEATURES.SIGN_LANGUAGE,
    label: "Sign-Language Support",
    description:
      "Sign-language assistance or interpretation is available.",
  },
];

/**
 * Normalize an ID or primitive value.
 */
export const normalizeAccessibilityValue = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Get the accessibility configuration
 * from an event.
 */
export const getAccessibilityConfig = (
  event = {}
) => {
  return (
    event.accessibility ||
    event.accessibilityInfo ||
    event.accessibilityInformation ||
    event.venue?.accessibility ||
    {}
  );
};

/**
 * Read a feature value from multiple
 * possible event data structures.
 */
export const getAccessibilityFeatureValue = (
  event = {},
  featureId
) => {
  const accessibility =
    getAccessibilityConfig(
      event
    );

  if (
    accessibility &&
    Object.prototype.hasOwnProperty.call(
      accessibility,
      featureId
    )
  ) {
    return Boolean(
      accessibility[featureId]
    );
  }

  const aliases = {
    wheelchair: [
      "wheelchairAccessible",
      "wheelchairAccessibility",
      "isWheelchairAccessible",
    ],

    accessibleEntrance: [
      "accessibleEntrance",
      "accessibleEntrances",
      "hasAccessibleEntrance",
    ],

    accessibleRestroom: [
      "accessibleRestroom",
      "accessibleRestrooms",
      "hasAccessibleRestroom",
    ],

    elevator: [
      "elevator",
      "elevatorAvailable",
      "hasElevator",
    ],

    signLanguage: [
      "signLanguage",
      "signLanguageSupport",
      "signLanguageAvailable",
      "hasSignLanguageSupport",
    ],
  };

  const keys =
    aliases[featureId] || [];

  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(
        accessibility,
        key
      )
    ) {
      return Boolean(
        accessibility[key]
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        event,
        key
      )
    ) {
      return Boolean(
        event[key]
      );
    }
  }

  return null;
};

/**
 * Get a custom description for an
 * accessibility feature.
 */
export const getAccessibilityFeatureDescription = (
  event = {},
  featureId
) => {
  const accessibility =
    getAccessibilityConfig(
      event
    );

  const descriptions =
    accessibility.descriptions ||
    accessibility.featureDescriptions ||
    {};

  if (
    descriptions &&
    descriptions[featureId]
  ) {
    return String(
      descriptions[featureId]
    ).trim();
  }

  const feature =
    ACCESSIBILITY_FEATURE_CONFIG.find(
      (item) =>
        item.id === featureId
    );

  return (
    feature?.description || ""
  );
};

/**
 * Build a complete feature object.
 */
export const createAccessibilityFeature = (
  event,
  config
) => {
  const available =
    getAccessibilityFeatureValue(
      event,
      config.id
    );

  return {
    id: config.id,
    name: config.label,
    label: config.label,
    description:
      getAccessibilityFeatureDescription(
        event,
        config.id
      ),
    available:
      available === null
        ? false
        : available,
    specified:
      available !== null,
  };
};

/**
 * Get all accessibility features.
 */
export const getAccessibilityFeatures = (
  event = {}
) => {
  return ACCESSIBILITY_FEATURE_CONFIG.map(
    (config) =>
      createAccessibilityFeature(
        event,
        config
      )
  );
};

/**
 * Get only features explicitly specified
 * by the organizer.
 */
export const getSpecifiedAccessibilityFeatures = (
  event = {}
) => {
  return getAccessibilityFeatures(
    event
  ).filter(
    (feature) =>
      feature.specified
  );
};

/**
 * Get only available accessibility
 * features.
 */
export const getAvailableAccessibilityFeatures = (
  event = {}
) => {
  return getAccessibilityFeatures(
    event
  ).filter(
    (feature) =>
      feature.available
  );
};

/**
 * Get only unavailable accessibility
 * features.
 */
export const getUnavailableAccessibilityFeatures = (
  event = {}
) => {
  return getAccessibilityFeatures(
    event
  ).filter(
    (feature) =>
      feature.specified &&
      !feature.available
  );
};

/**
 * Get accessibility contact details.
 */
export const getAccessibilityContact = (
  event = {}
) => {
  const accessibility =
    getAccessibilityConfig(
      event
    );

  const contact =
    accessibility.contact ||
    accessibility.accessibilityContact ||
    event.accessibilityContact ||
    {};

  if (
    typeof contact ===
    "string"
  ) {
    return {
      name: "",
      email: contact,
      phone: "",
      description: "",
    };
  }

  const name =
    contact.name ||
    contact.contactName ||
    accessibility.contactName ||
    event.accessibilityContactName ||
    "";

  const email =
    contact.email ||
    contact.contactEmail ||
    accessibility.contactEmail ||
    event.accessibilityContactEmail ||
    "";

  const phone =
    contact.phone ||
    contact.phoneNumber ||
    accessibility.contactPhone ||
    event.accessibilityContactPhone ||
    "";

  const description =
    contact.description ||
    accessibility.contactDescription ||
    event.accessibilityContactDescription ||
    "";

  if (
    !name &&
    !email &&
    !phone &&
    !description
  ) {
    return null;
  }

  return {
    name,
    email,
    phone,
    description,
  };
};

/**
 * Check whether accessibility information
 * exists for an event.
 */
export const hasAccessibilityInformation = (
  event = {}
) => {
  const accessibility =
    getAccessibilityConfig(
      event
    );

  const hasFeatures =
    getAccessibilityFeatures(
      event
    ).some(
      (feature) =>
        feature.specified
    );

  const hasContact =
    Boolean(
      getAccessibilityContact(
        event
      )
    );

  return (
    hasFeatures ||
    hasContact ||
    Boolean(
      accessibility.description ||
        accessibility.notes
    )
  );
};

/**
 * Get general accessibility notes.
 */
export const getAccessibilityNotes = (
  event = {}
) => {
  const accessibility =
    getAccessibilityConfig(
      event
    );

  return (
    accessibility.description ||
    accessibility.notes ||
    event.accessibilityNotes ||
    ""
  );
};

/**
 * Validate an email address.
 */
export const isValidAccessibilityEmail = (
  email
) => {
  if (
    typeof email !==
    "string"
  ) {
    return false;
  }

  const normalized =
    email.trim();

  if (!normalized) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalized
  );
};

/**
 * Validate accessibility contact data.
 */
export const validateAccessibilityContact = (
  contact = {}
) => {
  const errors = [];

  if (
    contact.email &&
    !isValidAccessibilityEmail(
      contact.email
    )
  ) {
    errors.push(
      "Accessibility contact email is invalid."
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Validate accessibility information.
 */
export const validateAccessibilityInformation = (
  event = {}
) => {
  const errors = [];

  const contact =
    getAccessibilityContact(
      event
    );

  if (contact) {
    const result =
      validateAccessibilityContact(
        contact
      );

    errors.push(
      ...result.errors
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Create a normalized accessibility
 * configuration.
 */
export const createAccessibilityConfig = ({
  wheelchair = false,
  accessibleEntrance = false,
  accessibleRestroom = false,
  elevator = false,
  signLanguage = false,
  contact = null,
  description = "",
  notes = "",
} = {}) => {
  return {
    wheelchair: Boolean(
      wheelchair
    ),
    accessibleEntrance:
      Boolean(
        accessibleEntrance
      ),
    accessibleRestroom:
      Boolean(
        accessibleRestroom
      ),
    elevator: Boolean(
      elevator
    ),
    signLanguage: Boolean(
      signLanguage
    ),
    contact: contact
      ? {
          name:
            contact.name || "",
          email:
            contact.email || "",
          phone:
            contact.phone || "",
          description:
            contact.description ||
            "",
        }
      : null,
    description:
      String(
        description
      ).trim(),
    notes: String(
      notes
    ).trim(),
  };
};

/**
 * Merge accessibility updates into
 * an existing event.
 */
export const updateAccessibilityConfig = (
  event = {},
  updates = {}
) => {
  const current =
    getAccessibilityConfig(
      event
    );

  return {
    ...event,
    accessibility: {
      ...current,
      ...updates,
    },
  };
};

/**
 * Check one particular feature.
 */
export const isAccessibilityFeatureAvailable = (
  event = {},
  featureId
) => {
  return (
    getAccessibilityFeatureValue(
      event,
      featureId
    ) === true
  );
};

/**
 * Check whether a feature was explicitly
 * specified by the organizer.
 */
export const isAccessibilityFeatureSpecified = (
  event = {},
  featureId
) => {
  return (
    getAccessibilityFeatureValue(
      event,
      featureId
    ) !== null
  );
};

/**
 * Count available accessibility features.
 */
export const countAvailableAccessibilityFeatures = (
  event = {}
) => {
  return getAvailableAccessibilityFeatures(
    event
  ).length;
};

/**
 * Count specified accessibility features.
 */
export const countSpecifiedAccessibilityFeatures = (
  event = {}
) => {
  return getSpecifiedAccessibilityFeatures(
    event
  ).length;
};

/**
 * Calculate an accessibility coverage
 * percentage based on specified features.
 */
export const getAccessibilityCoverage = (
  event = {}
) => {
  const total =
    ACCESSIBILITY_FEATURE_CONFIG.length;

  if (!total) {
    return 0;
  }

  const specified =
    countSpecifiedAccessibilityFeatures(
      event
    );

  return Math.round(
    (specified / total) *
      100
  );
};

/**
 * Get a human-readable feature label.
 */
export const getAccessibilityFeatureLabel = (
  featureId
) => {
  return (
    ACCESSIBILITY_FEATURE_CONFIG.find(
      (feature) =>
        feature.id === featureId
    )?.label ||
    "Accessibility Feature"
  );
};

/**
 * Get a compact accessibility summary.
 */
export const getAccessibilitySummary = (
  event = {}
) => {
  const features =
    getAccessibilityFeatures(
      event
    );

  const available =
    features.filter(
      (feature) =>
        feature.available
    ).length;

  const specified =
    features.filter(
      (feature) =>
        feature.specified
    ).length;

  const contact =
    getAccessibilityContact(
      event
    );

  if (
    specified === 0 &&
    !contact
  ) {
    return "Accessibility information has not been provided.";
  }

  return `${available} of ${features.length} accessibility features are available.`;
};

/**
 * Return a serializable accessibility
 * object for storage/API use.
 */
export const serializeAccessibilityInfo = (
  event = {}
) => {
  const config =
    getAccessibilityConfig(
      event
    );

  return JSON.stringify({
    ...config,
    contact:
      getAccessibilityContact(
        event
      ),
  });
};

/**
 * Parse serialized accessibility data.
 */
export const deserializeAccessibilityInfo = (
  value
) => {
  if (!value) {
    return {};
  }

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    if (
      !parsed ||
      typeof parsed !==
        "object"
    ) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
};