import { safeJsonParse } from "./safeJsonParse.js";

const TEMPLATES_KEY = "eventra_event_templates";

/**
 * Generate a unique template ID
 */
const generateTemplateId = () => {
  return `template_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Fields to exclude when saving a template
 * These are runtime/user-specific/upload fields
 */
const excludeFields = new Set([
  "banner",
  "bannerPreview",
  "eventId",
  "registrationCounts",
  "analytics",
  "createdBy",
  "updatedAt",
  "createdAt",
]);

/**
 * Filter form data to keep only template-relevant fields
 */
const sanitizeTemplateData = (formData) => {
  const sanitized = {};

  Object.entries(formData).forEach(([key, value]) => {
    if (!excludeFields.has(key)) {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

// 🔥 CodeScene refactor: shared SSR guard. Extracted so each accessor is a
// single-purpose function with a single conditional.
const isStorageAvailable = () =>
  typeof window !== "undefined" && Boolean(window.localStorage);

// 🔥 CodeScene refactor: shared read/parse pipeline. Extracted from
// getTemplates to drop its cyclomatic complexity and to make the safe-parse
// path unit-testable in isolation.
const parseTemplates = (raw) => {
  if (!raw) return [];
  const parsed = safeJsonParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
};

/**
 * Get all templates from localStorage
 * @returns {Array} Array of template objects
 */
export const getTemplates = () => {
  if (!isStorageAvailable()) return [];
  try {
    return parseTemplates(window.localStorage.getItem(TEMPLATES_KEY));
  } catch (error) {
    console.error("[EventTemplates] Error retrieving templates:", error);
    return [];
  }
};

// 🔥 CodeScene refactor: extracted saveTemplate validation guards so the
// public saveTemplate is a single-purpose composer.
const validateTemplateName = (templateName) => {
  if (!templateName || !templateName.trim()) {
    console.warn("[EventTemplates] Template name is required");
    return { ok: false, trimmed: "" };
  }
  return { ok: true, trimmed: templateName.trim() };
};

// 🔥 CodeScene refactor: extracted so saveTemplate does not have to do the
// "load → push → write" dance inline.
const persistNewTemplate = (newTemplate) => {
  if (!isStorageAvailable()) return false;
  try {
    const templates = getTemplates();
    templates.push(newTemplate);
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    return true;
  } catch (error) {
    console.error("[EventTemplates] Error saving template:", error);
    return false;
  }
};

/**
 * Save a new template to localStorage
 * @param {String} templateName - User-provided template name
 * @param {Object} formData - Current event form data
 * @returns {Object|null} The created template object or null on error
 */
export const saveTemplate = (templateName, formData) => {
  const { ok, trimmed } = validateTemplateName(templateName);
  if (!ok) return null;

  // Guard against duplicate template names before persisting. Without this
  // check two templates with identical names can be created, making it
  // impossible for the user to distinguish them in the UI.
  if (templateNameExists(trimmed)) {
    console.warn(
      `[EventTemplates] A template named "${trimmed}" already exists. Use a unique name.`
    );
    return null;
  }

  const newTemplate = {
    id: generateTemplateId(),
    name: trimmed,
    createdAt: new Date().toISOString(),
    data: sanitizeTemplateData(formData),
  };

  return persistNewTemplate(newTemplate) ? newTemplate : null;
};

/**
 * Load a template by ID
 * @param {String} templateId - Template ID to load
 * @returns {Object|null} Template data or null if not found
 */
export const loadTemplate = (templateId) => {
  try {
    const template = getTemplates().find((t) => t.id === templateId);
    if (!template) {
      console.warn(`[EventTemplates] Template ${templateId} not found`);
      return null;
    }
    return template.data || null;
  } catch (error) {
    console.error("[EventTemplates] Error loading template:", error);
    return null;
  }
};

/**
 * Delete a template by ID
 * @param {String} templateId - Template ID to delete
 * @returns {Boolean} True if deleted, false otherwise
 */
export const deleteTemplate = (templateId) => {
  if (!isStorageAvailable()) return false;
  try {
    const templates = getTemplates();
    const filteredTemplates = templates.filter((t) => t.id !== templateId);

    if (filteredTemplates.length === templates.length) {
      console.warn(`[EventTemplates] Template ${templateId} not found for deletion`);
      return false;
    }

    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filteredTemplates));
    return true;
  } catch (error) {
    console.error("[EventTemplates] Error deleting template:", error);
    return false;
  }
};

/**
 * Clear all templates (use with caution)
 * @returns {Boolean} True if cleared
 */
export const clearAllTemplates = () => {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(TEMPLATES_KEY);
    return true;
  } catch (error) {
    console.error("[EventTemplates] Error clearing templates:", error);
    return false;
  }
};

/**
 * Check if template name already exists
 * @param {String} templateName - Name to check
 * @returns {Boolean} True if name exists
 */
export const templateNameExists = (templateName) => {
  try {
    return getTemplates().some(
      (t) => (t.name || "").toLowerCase() === (templateName || "").toLowerCase()
    );
  } catch (error) {
    console.error("[EventTemplates] Error checking template name:", error);
    return false;
  }
};
