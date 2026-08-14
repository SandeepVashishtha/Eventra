/* eslint-disable no-console */

/**
 * Eventra User Profile & Preference Management System
 * Handles persistent storage, schema migration, reactivity listeners,
 * profile completeness metrics, and synchronization utilities.
 */

// ============================================================================
// CONSTANTS & DEFAULT CONFIGURATIONS
// ============================================================================

export const PROFILE_STORAGE_KEY = "eventra_user_profile";
export const PROFILE_SCHEMA_VERSION = 2;
export const PROFILE_UPDATED_EVENT = "eventra:profile-updated";

export const VALID_EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export const VALID_EVENT_TYPES = [
  "Hackathon",
  "Workshop",
  "Conference",
  "Webinar",
  "Meetup",
  "Networking",
];

export const DEFAULT_USER_PROFILE = Object.freeze({
  version: PROFILE_SCHEMA_VERSION,
  id: "",
  fullName: "",
  email: "",
  bio: "",
  avatarUrl: "",
  location: "",
  organization: "",
  interests: [],
  techStack: [],
  eventTypes: [],
  level: "Beginner",
  notificationPreferences: {
    emailAlerts: true,
    pushNotifications: true,
    weeklyDigest: false,
    eventReminders: true,
  },
  socialLinks: {
    github: "",
    linkedin: "",
    twitter: "",
    website: "",
  },
  onboardingCompleted: false,
  createdAt: null,
  updatedAt: null,
});

// ============================================================================
// INTERNAL STORAGE & SSR UTILITIES
// ============================================================================

/**
 * Checks if window and localStorage are accessible (SSR safe).
 * @returns {boolean}
 */
const isStorageAvailable = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }
    const testKey = "__eventra_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely reads raw string value from localStorage.
 * @returns {string|null}
 */
const readRawStorage = () => {
  if (!isStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error("[ProfileStorage] Failed to read from localStorage:", error);
    return null;
  }
};

/**
 * Safely writes string value to localStorage.
 * @param {string} value
 * @returns {boolean}
 */
const writeRawStorage = (value) => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, value);
    return true;
  } catch (error) {
    console.error("[ProfileStorage] Failed to write to localStorage:", error);
    return false;
  }
};

// ============================================================================
// VALIDATION & SANITIZATION HELPERS
// ============================================================================

const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(
    new Set(
      arr
        .map((item) => String(item || "").trim())
        .filter((item) => item.length > 0)
    )
  );
};

const sanitizeString = (str, fallback = "") => {
  if (str === null || str === undefined) return fallback;
  return String(str).trim();
};

const sanitizeLevel = (level) => {
  const normalized = sanitizeString(level);
  const matched = VALID_EXPERIENCE_LEVELS.find(
    (valid) => valid.toLowerCase() === normalized.toLowerCase()
  );
  return matched || DEFAULT_USER_PROFILE.level;
};

/**
 * Validates and sanitizes a profile object against the schema.
 * @param {Object} rawProfile
 * @returns {Object} Sanitized profile
 */
export const sanitizeProfileSchema = (rawProfile = {}) => {
  const input = typeof rawProfile === "object" && rawProfile !== null ? rawProfile : {};

  return {
    version: PROFILE_SCHEMA_VERSION,
    id: sanitizeString(input.id, DEFAULT_USER_PROFILE.id),
    fullName: sanitizeString(input.fullName, DEFAULT_USER_PROFILE.fullName),
    email: sanitizeString(input.email, DEFAULT_USER_PROFILE.email),
    bio: sanitizeString(input.bio, DEFAULT_USER_PROFILE.bio),
    avatarUrl: sanitizeString(input.avatarUrl, DEFAULT_USER_PROFILE.avatarUrl),
    location: sanitizeString(input.location, DEFAULT_USER_PROFILE.location),
    organization: sanitizeString(
      input.organization,
      DEFAULT_USER_PROFILE.organization
    ),
    interests: sanitizeArray(input.interests),
    techStack: sanitizeArray(input.techStack),
    eventTypes: sanitizeArray(input.eventTypes),
    level: sanitizeLevel(input.level),
    notificationPreferences: {
      emailAlerts: Boolean(
        input.notificationPreferences?.emailAlerts ??
          DEFAULT_USER_PROFILE.notificationPreferences.emailAlerts
      ),
      pushNotifications: Boolean(
        input.notificationPreferences?.pushNotifications ??
          DEFAULT_USER_PROFILE.notificationPreferences.pushNotifications
      ),
      weeklyDigest: Boolean(
        input.notificationPreferences?.weeklyDigest ??
          DEFAULT_USER_PROFILE.notificationPreferences.weeklyDigest
      ),
      eventReminders: Boolean(
        input.notificationPreferences?.eventReminders ??
          DEFAULT_USER_PROFILE.notificationPreferences.eventReminders
      ),
    },
    socialLinks: {
      github: sanitizeString(input.socialLinks?.github),
      linkedin: sanitizeString(input.socialLinks?.linkedin),
      twitter: sanitizeString(input.socialLinks?.twitter),
      website: sanitizeString(input.socialLinks?.website),
    },
    onboardingCompleted: Boolean(
      input.onboardingCompleted ?? DEFAULT_USER_PROFILE.onboardingCompleted
    ),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
};

/**
 * Migrates legacy schema profiles to current version.
 * @param {Object} legacyData
 * @returns {Object} Migrated profile
 */
const migrateProfileSchema = (legacyData = {}) => {
  if (!legacyData || typeof legacyData !== "object") {
    return { ...DEFAULT_USER_PROFILE };
  }

  // Schema v1 -> v2 migration
  const currentVersion = Number(legacyData.version) || 1;
  let migrated = { ...legacyData };

  if (currentVersion < 2) {
    console.log("[ProfileStorage] Migrating profile schema from v1 to v2...");
    migrated.version = 2;
    migrated.notificationPreferences = {
      ...DEFAULT_USER_PROFILE.notificationPreferences,
      ...(legacyData.notificationPreferences || {}),
    };
    migrated.socialLinks = {
      ...DEFAULT_USER_PROFILE.socialLinks,
      ...(legacyData.socialLinks || {}),
    };
  }

  return sanitizeProfileSchema(migrated);
};

// ============================================================================
// CORE PROFILE API (GET, SAVE, UPDATE, RESET)
// ============================================================================

/**
 * Fetches and normalizes the user profile from local storage.
 * @returns {Object} User Profile
 */
export const getUserProfile = () => {
  const rawData = readRawStorage();
  if (!rawData) {
    return { ...DEFAULT_USER_PROFILE };
  }

  try {
    const parsed = JSON.parse(rawData);
    return migrateProfileSchema(parsed);
  } catch (error) {
    console.error("[ProfileStorage] Failed to parse stored profile JSON:", error);
    return { ...DEFAULT_USER_PROFILE };
  }
};

/**
 * Saves a complete profile object, updating timestamps and triggering listeners.
 * @param {Object} profileData
 * @returns {boolean} Success status
 */
export const saveUserProfile = (profileData) => {
  const sanitized = sanitizeProfileSchema({
    ...profileData,
    updatedAt: new Date().toISOString(),
  });

  const success = writeRawStorage(JSON.stringify(sanitized));
  if (success) {
    notifyProfileSubscribers(sanitized);
  }
  return success;
};

/**
 * Partially updates existing profile fields.
 * @param {Object} partialUpdates
 * @returns {Object} Updated complete profile
 */
export const updateUserProfile = (partialUpdates = {}) => {
  const currentProfile = getUserProfile();
  const merged = {
    ...currentProfile,
    ...partialUpdates,
    notificationPreferences: {
      ...currentProfile.notificationPreferences,
      ...(partialUpdates.notificationPreferences || {}),
    },
    socialLinks: {
      ...currentProfile.socialLinks,
      ...(partialUpdates.socialLinks || {}),
    },
  };

  const updatedProfile = sanitizeProfileSchema({
    ...merged,
    updatedAt: new Date().toISOString(),
  });

  saveUserProfile(updatedProfile);
  return updatedProfile;
};

/**
 * Resets user profile back to default initial values.
 * @returns {boolean}
 */
export const resetUserProfile = () => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    notifyProfileSubscribers({ ...DEFAULT_USER_PROFILE });
    return true;
  } catch (error) {
    console.error("[ProfileStorage] Failed to clear user profile:", error);
    return false;
  }
};

// ============================================================================
// SPECIFIC ITEM ACCESSORS & MUTATORS
// ============================================================================

export const addInterest = (interest) => {
  const profile = getUserProfile();
  const trimmed = sanitizeString(interest);
  if (!trimmed || profile.interests.includes(trimmed)) return profile;

  return updateUserProfile({
    interests: [...profile.interests, trimmed],
  });
};

export const removeInterest = (interest) => {
  const profile = getUserProfile();
  const trimmed = sanitizeString(interest);
  return updateUserProfile({
    interests: profile.interests.filter((item) => item !== trimmed),
  });
};

export const addTechStackItem = (tech) => {
  const profile = getUserProfile();
  const trimmed = sanitizeString(tech);
  if (!trimmed || profile.techStack.includes(trimmed)) return profile;

  return updateUserProfile({
    techStack: [...profile.techStack, trimmed],
  });
};

export const removeTechStackItem = (tech) => {
  const profile = getUserProfile();
  const trimmed = sanitizeString(tech);
  return updateUserProfile({
    techStack: profile.techStack.filter((item) => item !== trimmed),
  });
};

export const toggleEventTypePreference = (eventType) => {
  const profile = getUserProfile();
  const trimmed = sanitizeString(eventType);
  if (!trimmed) return profile;

  const matched = VALID_EVENT_TYPES.find(
    (valid) => valid.toLowerCase() === trimmed.toLowerCase()
  );
  if (!matched) return profile;

  const exists = profile.eventTypes.includes(matched);
  const updatedTypes = exists
    ? profile.eventTypes.filter((t) => t !== matched)
    : [...profile.eventTypes, matched];

  return updateUserProfile({ eventTypes: updatedTypes });
};

// ============================================================================
// METRICS & COMPUTED PROFILE UTILITIES
// ============================================================================

/**
 * Calculates percentage completion score for a profile (0 - 100%).
 * @param {Object} [customProfile]
 * @returns {{ percentage: number, missingFields: string[] }}
 */
export const calculateProfileCompleteness = (customProfile) => {
  const profile = customProfile || getUserProfile();
  const missingFields = [];

  const checkPoints = [
    { key: "fullName", weight: 15, label: "Full Name" },
    { key: "email", weight: 15, label: "Email Address" },
    { key: "bio", weight: 10, label: "Bio" },
    { key: "location", weight: 10, label: "Location" },
    { key: "avatarUrl", weight: 10, label: "Profile Picture" },
    {
      key: "interests",
      weight: 15,
      label: "Interests",
      check: (val) => Array.isArray(val) && val.length > 0,
    },
    {
      key: "techStack",
      weight: 15,
      label: "Tech Stack",
      check: (val) => Array.isArray(val) && val.length > 0,
    },
    {
      key: "eventTypes",
      weight: 10,
      label: "Preferred Event Formats",
      check: (val) => Array.isArray(val) && val.length > 0,
    },
  ];

  let earnedScore = 0;

  checkPoints.forEach(({ key, weight, label, check }) => {
    const value = profile[key];
    const isComplete = check ? check(value) : Boolean(value);

    if (isComplete) {
      earnedScore += weight;
    } else {
      missingFields.push(label);
    }
  });

  return {
    percentage: Math.min(100, Math.round(earnedScore)),
    missingFields,
  };
};

/**
 * Checks if the user profile has minimum required fields for personalizing events.
 * @returns {boolean}
 */
export const hasPersonalizationMetadata = () => {
  const profile = getUserProfile();
  return (
    profile.interests.length > 0 ||
    profile.techStack.length > 0 ||
    profile.eventTypes.length > 0
  );
};

// ============================================================================
// EVENT SUBSCRIPTION & REACTIVITY SYSTEM
// ============================================================================

const profileSubscribers = new Set();

/**
 * Subscribes a listener callback to profile update events.
 * @param {Function} callback
 * @returns {Function} Unsubscribe function
 */
export const subscribeToProfileChanges = (callback) => {
  if (typeof callback !== "function") return () => {};

  profileSubscribers.add(callback);

  // Setup cross-tab window storage listener
  const handleStorageEvent = (event) => {
    if (event.key === PROFILE_STORAGE_KEY) {
      const newProfile = getUserProfile();
      callback(newProfile);
    }
  };

  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("storage", handleStorageEvent);
  }

  return () => {
    profileSubscribers.delete(callback);
    if (typeof window !== "undefined" && window.removeEventListener) {
      window.removeEventListener("storage", handleStorageEvent);
    }
  };
};

/**
 * Broadcasts profile updates to internal subscribers and global DOM CustomEvent.
 * @param {Object} updatedProfile
 */
const notifyProfileSubscribers = (updatedProfile) => {
  profileSubscribers.forEach((callback) => {
    try {
      callback(updatedProfile);
    } catch (error) {
      console.error("[ProfileStorage] Subscriber callback error:", error);
    }
  });

  if (typeof window !== "undefined" && window.dispatchEvent) {
    try {
      const customEvent = new CustomEvent(PROFILE_UPDATED_EVENT, {
        detail: updatedProfile,
      });
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.error("[ProfileStorage] Failed to dispatch CustomEvent:", error);
    }
  }
};

// ============================================================================
// IMPORT, EXPORT & BACKUP UTILITIES
// ============================================================================

/**
 * Exports user profile data as a formatted JSON string.
 * @returns {string}
 */
export const exportProfileToJSON = () => {
  const profile = getUserProfile();
  return JSON.stringify(profile, null, 2);
};

/**
 * Imports profile data from a JSON string.
 * @param {string} jsonString
 * @returns {{ success: boolean, profile?: Object, error?: string }}
 */
export const importProfileFromJSON = (jsonString) => {
  try {
    if (!jsonString || typeof jsonString !== "string") {
      return { success: false, error: "Invalid JSON input" };
    }

    const parsed = JSON.parse(jsonString);
    const sanitized = sanitizeProfileSchema(parsed);
    const saved = saveUserProfile(sanitized);

    if (saved) {
      return { success: true, profile: sanitized };
    }
    return { success: false, error: "Failed to persist imported profile" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
