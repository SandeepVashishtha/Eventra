import { useState, useCallback } from "react";
import toast from 'react-hot-toast';
import {
  getTemplates,
  saveTemplate,
  loadTemplate,
  deleteTemplate,
  templateNameExists,
} from "../utils/eventTemplateUtils";
import { logger } from "../utils/logger";

/**
 * useEventTemplates Hook
 *
 * Provides template management functionality for event creation.
 * Handles loading, saving, deleting templates with error handling and user feedback.
 */
export const useEventTemplates = () => {
  const [templates, setTemplates] = useState(() => getTemplates());

  /**
   * Refresh templates list from localStorage
   */
  const refreshTemplates = useCallback(() => {
    const updated = getTemplates();
    setTemplates(updated);
  }, []);

  /**
   * Save current form as a template
   * @param {String} templateName - Name for the template
   * @param {Object} formData - Current form data
   * @returns {Boolean} Success status
   */
  const handleSaveTemplate = useCallback(
    (templateName, formData) => {
      if (!templateName || !templateName.trim()) {
        toast.error("Please provide a template name.");
        return false;
      }

      if (templateNameExists(templateName)) {
        toast(`Template "${templateName}" already exists.`);
        return false;
      }

      try {
        const created = saveTemplate(templateName, formData);

        if (created) {
          refreshTemplates();
          toast.success(`Template "${templateName}" saved successfully!`);
          logger.info(`[Templates] Saved template: ${templateName}`);
          return true;
        } else {
          toast.error("Failed to save template. Please try again.");
          return false;
        }
      } catch (error) {
        logger.error("[Templates] Error saving template:", error);
        toast.error("An error occurred while saving the template.");
        return false;
      }
    },
    [refreshTemplates]
  );

  /**
   * Load a template by ID into form
   * @param {String} templateId - Template ID to load
   * @returns {Object|null} Template data or null on error
   */
  const handleLoadTemplate = useCallback((templateId) => {
    try {
      const templateData = loadTemplate(templateId);

      if (templateData) {
        const template = templates.find((t) => t.id === templateId);
        toast.success(
          `Loaded template "${template?.name || "Template"}"!`
        );
        logger.info(`[Templates] Loaded template: ${templateId}`);
        return templateData;
      } else {
        toast.error("Failed to load template. It may have been deleted.");
        logger.warn("[Templates] Template not found for loading:", templateId);
        refreshTemplates();
        return null;
      }
    } catch (error) {
      logger.error("[Templates] Error loading template:", error);
      toast.error("An error occurred while loading the template.");
      return null;
    }
  }, [templates, refreshTemplates]);

  /**
   * Delete a template by ID with confirmation
   * @param {String} templateId - Template ID to delete
   * @param {Function} onConfirm - Optional callback after confirmation
   * @returns {Boolean} Success status
   */
  const handleDeleteTemplate = useCallback(
    (templateId, onConfirm) => {
      try {
        const template = templates.find((t) => t.id === templateId);
        const templateName = template?.name || "Template";

        if (window.confirm(`Are you sure you want to delete "${templateName}"?`)) {
          const deleted = deleteTemplate(templateId);

          if (deleted) {
            refreshTemplates();
            toast.success(`Template "${templateName}" deleted.`);
            logger.info(`[Templates] Deleted template: ${templateId}`);

            if (onConfirm) {
              onConfirm();
            }

            return true;
          } else {
            toast.error("Failed to delete template. Please try again.");
            return false;
          }
        }

        return false;
      } catch (error) {
        logger.error("[Templates] Error deleting template:", error);
        toast.error("An error occurred while deleting the template.");
        return false;
      }
    },
    [templates, refreshTemplates]
  );

  return {
    templates,
    refreshTemplates,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
  };
};
