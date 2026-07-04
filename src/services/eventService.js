import { apiUtils, API_ENDPOINTS } from "../config/api";

export const eventService = {
  getAllEvents: async (page, size) => {
    if (page !== undefined && size !== undefined) {
      return apiUtils.get(API_ENDPOINTS.EVENTS.PAGINATED(page, size));
    }
    return apiUtils.get(API_ENDPOINTS.EVENTS.LIST);
  },
  
  getEventDetails: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.DETAIL(eventId));
  },
  
  createEvent: async (eventData) => {
    return apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
  },
  
  registerForEvent: async (eventId, data = {}) => {
    const endpoint = API_ENDPOINTS.EVENTS.REGISTER ? API_ENDPOINTS.EVENTS.REGISTER(eventId) : undefined;
    if (!endpoint) throw new Error("Register endpoint missing");
    return apiUtils.post(endpoint, data);
  },
  
  getAvailability: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.AVAILABILITY(eventId));
  },
  
  getRegistrants: async (eventId) => {
    return apiUtils.get(API_ENDPOINTS.EVENTS.REGISTRANTS(eventId));
  },

  // Recurring Event APIs
  createRecurringEvent: async (eventData, recurrenceRule) => {
    /**
     * Creates a new recurring event series
     * @param {Object} eventData - Base event data
     * @param {Object} recurrenceRule - RFC 5545 recurrence rule
     * @returns {Promise} Response with created series
     */
    return apiUtils.post("/api/events/recurring", {
      ...eventData,
      recurrenceRule
    });
  },

  getRecurringSeries: async (seriesId) => {
    /**
     * Retrieves a recurring event series by ID
     * @param {string} seriesId - Series ID
     * @returns {Promise} Series object
     */
    return apiUtils.get(`/api/events/recurring/${seriesId}`);
  },

  getSeriesInstances: async (seriesId, options = {}) => {
    /**
     * Generates instances for a series
     * @param {string} seriesId - Series ID
     * @param {Object} options - Generation options
     * @returns {Promise} Array of instances
     */
    const params = new URLSearchParams();
    if (options.maxInstances) params.append('maxInstances', options.maxInstances);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    return apiUtils.get(`/api/events/recurring/${seriesId}/instances?${params}`);
  },

  updateRecurringSeries: async (seriesId, updates, modificationType = 'UPDATE_ALL') => {
    /**
     * Updates a recurring event series
     * @param {string} seriesId - Series ID
     * @param {Object} updates - Fields to update
     * @param {string} modificationType - UPDATE_ALL | UPDATE_THIS_AND_FUTURE | UPDATE_ONLY_THIS
     * @returns {Promise} Updated series
     */
    return apiUtils.put(`/api/events/recurring/${seriesId}`, {
      updates,
      modificationType
    });
  },

  deleteRecurringSeries: async (seriesId, deletionType = 'DELETE_ALL', instanceDate = null) => {
    /**
     * Deletes a recurring event series or specific instances
     * @param {string} seriesId - Series ID
     * @param {string} deletionType - DELETE_ALL | DELETE_THIS | DELETE_THIS_AND_FUTURE
     * @param {string} instanceDate - Instance date for partial deletion
     * @returns {Promise} Deletion result
     */
    return apiUtils.delete(`/api/events/recurring/${seriesId}`, {
      deletionType,
      instanceDate
    });
  },

  getSeriesConflicts: async (seriesId) => {
    /**
     * Detects conflicts for a series
     * @param {string} seriesId - Series ID
     * @returns {Promise} Array of conflicts
     */
    return apiUtils.get(`/api/events/recurring/${seriesId}/conflicts`);
  },

  createSeriesTemplate: async (templateData) => {
    /**
     * Creates a reusable series template
     * @param {Object} templateData - Template data
     * @returns {Promise} Created template
     */
    return apiUtils.post("/api/events/recurring/templates", templateData);
  },

  getSeriesTemplates: async (filter = {}) => {
    /**
     * Retrieves series templates
     * @param {Object} filter - Filter options (isPublic, createdBy, etc.)
     * @returns {Promise} Array of templates
     */
    const params = new URLSearchParams(filter);
    return apiUtils.get(`/api/events/recurring/templates?${params}`);
  },

  getSeriesTemplate: async (templateId) => {
    /**
     * Retrieves a specific series template
     * @param {string} templateId - Template ID
     * @returns {Promise} Template object
     */
    return apiUtils.get(`/api/events/recurring/templates/${templateId}`);
  },

  updateSeriesTemplate: async (templateId, templateData) => {
    /**
     * Updates a series template
     * @param {string} templateId - Template ID
     * @param {Object} templateData - Updated template data
     * @returns {Promise} Updated template
     */
    return apiUtils.put(`/api/events/recurring/templates/${templateId}`, templateData);
  },

  deleteSeriesTemplate: async (templateId) => {
    /**
     * Deletes a series template
     * @param {string} templateId - Template ID
     * @returns {Promise} Deletion result
     */
    return apiUtils.delete(`/api/events/recurring/templates/${templateId}`);
  },

  validateRecurrenceRule: async (recurrenceRule) => {
    /**
     * Validates a recurrence rule
     * @param {Object} recurrenceRule - Rule to validate
     * @returns {Promise} Validation result
     */
    return apiUtils.post("/api/events/recurring/validate", { recurrenceRule });
  },

  exportSeriesToICS: async (seriesId, options = {}) => {
    /**
     * Exports series to iCalendar format
     * @param {string} seriesId - Series ID
     * @param {Object} options - Export options
     * @returns {Promise} ICS file content
     */
    const params = new URLSearchParams(options);
    return apiUtils.get(`/api/events/recurring/${seriesId}/export/ics?${params}`);
  },

  applySeriesTemplate: async (templateId, eventData) => {
    /**
     * Creates a new series from a template
     * @param {string} templateId - Template ID
     * @param {Object} eventData - Event data to merge with template
     * @returns {Promise} Created series
     */
    return apiUtils.post(`/api/events/recurring/templates/${templateId}/apply`, eventData);
  }
};
