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

/**
 * Get all templates from localStorage
 * @returns {Array} Array of template objects
 */
export const getTemplates = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const stored = window.localStorage.getItem(TEMPLATES_KEY);
    if (!stored) return [];

    const templates = safeJsonParse(stored, []);
    return Array.isArray(templates) ? templates : [];
  } catch (error) {
    console.error("[EventTemplates] Error retrieving templates:", error);
    return [];
  }
};

/**
 * Save a new template to localStorage
 * @param {String} templateName - User-provided template name
 * @param {Object} formData - Current event form data
 * @returns {Object|null} The created template object or null on error
 */
export const saveTemplate = (templateName, formData) => {
  if (!templateName || !templateName.trim()) {
    console.warn("[EventTemplates] Template name is required");
    return null;
  }

  const trimmedName = templateName.trim();

  // Guard against duplicate template names before persisting. Without this
  // check two templates with identical names can be created, making it
  // impossible for the user to distinguish them in the UI.
  if (templateNameExists(trimmedName)) {
    console.warn(
      `[EventTemplates] A template named "${trimmedName}" already exists. Use a unique name.`
    );
    return null;
  }

  if (typeof window === "undefined" || !window.localStorage) return null;

  try {
    const templates = getTemplates();

    const newTemplate = {
      id: generateTemplateId(),
      name: trimmedName,
      createdAt: new Date().toISOString(),
      data: sanitizeTemplateData(formData),
    };

    templates.push(newTemplate);
    window.localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));

    return newTemplate;
  } catch (error) {
    console.error("[EventTemplates] Error saving template:", error);
    return null;
  }
};

/**
 * Load a template by ID
 * @param {String} templateId - Template ID to load
 * @returns {Object|null} Template data or null if not found
 */
export const loadTemplate = (templateId) => {
  try {
    const templates = getTemplates();
    const template = templates.find((t) => t.id === templateId);

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
  if (typeof window === "undefined" || !window.localStorage) return false;
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
  if (typeof window === "undefined" || !window.localStorage) return false;
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
    const templates = getTemplates();
    return templates.some(
      (t) => (t.name || "").toLowerCase() === (templateName || "").toLowerCase()
    );
  } catch (error) {
    console.error("[EventTemplates] Error checking template name:", error);
    return false;
  }
};
