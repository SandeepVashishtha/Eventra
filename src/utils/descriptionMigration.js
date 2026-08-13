/**
 * Description Migration Utilities
 * 
 * Provides utilities for migrating existing markdown descriptions to HTML
 * for the new Rich Text Editor feature.
 */

import { marked } from "marked";
import { sanitizeHtml } from "./sanitizeHtml";

/**
 * Detect if a string contains markdown formatting
 * @param {string} text - Text to check
 * @returns {boolean} True if text appears to be markdown
 */
export function isMarkdown(text) {
  if (!text || typeof text !== "string") return false;
  
  const trimmed = text.trim();
  
  // Common markdown patterns
  const markdownPatterns = [
    /^#+\s/,           // Headings
    /\*\*[^\*]+\*\*/,  // Bold
    /\*[^\*]+\*/,      // Italic
    /`[^`]+`/,          // Inline code
    /^\s*[-*+]\s/,     // Unordered list
    /^\s*\d+\.\s/,    // Ordered list
    /^\[.+\]\(.+\)/,  // Links
    /^>\s/,            // Blockquotes
    /---|\*\*\*|___/,  // Horizontal rules
  ];
  
  return markdownPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Convert markdown to sanitized HTML
 * @param {string} markdown - Markdown text to convert
 * @returns {string} Sanitized HTML
 */
export function markdownToHtml(markdown) {
  if (!markdown || typeof markdown !== "string") return "";
  
  try {
    // Parse markdown to HTML
    const html = marked.parse(markdown);
    
    // Sanitize the HTML to remove any potentially dangerous content
    const sanitizedHtml = sanitizeHtml(html, { profile: "RICH_TEXT" });
    
    return sanitizedHtml;
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    // Return the original text sanitized as a fallback
    return sanitizeHtml(markdown, { profile: "RICH_TEXT" });
  }
}

/**
 * Batch convert markdown descriptions to HTML
 * Useful for migrating existing events in the database
 * @param {Array<Object>} events - Array of event objects with description fields
 * @returns {Array<Object>} Events with HTML descriptions
 */
export function migrateEventDescriptions(events) {
  return events.map(event => {
    if (event.description && isMarkdown(event.description)) {
      return {
        ...event,
        description: markdownToHtml(event.description),
        // Add migration metadata
        _descriptionMigrated: true,
        _descriptionMigrationDate: new Date().toISOString(),
      };
    }
    return event;
  });
}

/**
 * Check if an event needs migration
 * @param {Object} event - Event object
 * @returns {boolean} True if event needs migration
 */
export function needsMigration(event) {
  if (!event || !event.description) return false;
  
  // If already migrated, no need to migrate again
  if (event._descriptionMigrated) return false;
  
  // Check if it's markdown
  return isMarkdown(event.description);
}

/**
 * Migrate a single event description if needed
 * @param {Object} event - Event object
 * @returns {Object} Event with potentially migrated description
 */
export function migrateEventIfNeeded(event) {
  if (!event) return event;
  
  if (needsMigration(event)) {
    return {
      ...event,
      description: markdownToHtml(event.description),
      _descriptionMigrated: true,
      _descriptionMigrationDate: new Date().toISOString(),
    };
  }
  
  return event;
}

/**
 * Migration statistics for a batch of events
 * @param {Array<Object>} events - Array of events
 * @returns {Object} Migration statistics
 */
export function getMigrationStats(events) {
  const total = events.length;
  const markdownCount = events.filter(event => isMarkdown(event.description)).length;
  const migratedCount = events.filter(event => event._descriptionMigrated).length;
  const needsMigrationCount = events.filter(event => needsMigration(event)).length;
  
  return {
    total,
    markdownCount,
    migratedCount,
    needsMigrationCount,
    alreadyMigratedCount: total - needsMigrationCount - (total - markdownCount),
    progress: migratedCount / Math.max(markdownCount, 1),
  };
}

/**
 * Clean migration metadata from events (for production)
 * @param {Array<Object>|Object} events - Events to clean
 * @returns {Array<Object>|Object} Cleaned events
 */
export function cleanMigrationMetadata(events) {
  if (Array.isArray(events)) {
    return events.map(event => {
      const cleaned = { ...event };
      delete cleaned._descriptionMigrated;
      delete cleaned._descriptionMigrationDate;
      return cleaned;
    });
  }
  
  const cleaned = { ...events };
  delete cleaned._descriptionMigrated;
  delete cleaned._descriptionMigrationDate;
  return cleaned;
}

/**
 * Converts plain text (line breaks) to HTML paragraphs
 * Used for very basic text that doesn't have markdown formatting
 * @param {string} text - Plain text with line breaks
 * @returns {string} HTML with paragraph tags
 */
export function plainTextToHtml(text) {
  if (!text || typeof text !== "string") return "";
  
  // Split by double newlines to create paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Split by single newlines to create line breaks
  const html = paragraphs.map((para, index) => {
    const lines = para.split('\n');
    const paraHtml = lines.map((line, lineIndex) => {
      if (line.trim() === '') return '';
      return lineIndex === 0 ? line : `<br />${line}`;
    }).join('');
    
    return `<p>${paraHtml}</p>`;
  }).join('');
  
  return sanitizeHtml(html, { profile: "RICH_TEXT" });
}

/**
 * Auto-detect and convert any text to appropriate HTML
 * Handles markdown, plain text with line breaks, or already HTML
 * @param {string} text - Text to convert
 * @returns {string} HTML content
 */
export function autoConvertToHtml(text) {
  if (!text || typeof text !== "string") return "";
  
  const trimmed = text.trim();
  
  // Already HTML
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return sanitizeHtml(text, { profile: "RICH_TEXT" });
  }
  
  // Contains markdown
  if (isMarkdown(text)) {
    return markdownToHtml(text);
  }
  
  // Plain text with line breaks
  if (text.includes('\n')) {
    return plainTextToHtml(text);
  }
  
  // Simple text
  return sanitizeHtml(`<p>${text}</p>`, { profile: "RICH_TEXT" });
}

export default {
  isMarkdown,
  markdownToHtml,
  migrateEventDescriptions,
  needsMigration,
  migrateEventIfNeeded,
  getMigrationStats,
  cleanMigrationMetadata,
  plainTextToHtml,
  autoConvertToHtml,
};