/**
 * RecurringEventForm.jsx
 * Component for creating and editing recurring events.
 */

import React, { useState, useCallback } from 'react';
import { useRecurringEvents } from '../../hooks/useRecurringEvents';
import { useEventSeries } from '../../hooks/useEventSeries';
import { PREDEFINED_TEMPLATES } from '../../utils/seriesTemplateUtils';
import './RecurringEventForm.css';

/**
 * Recurring event creation/editing form component
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback on form submission
 * @param {Object} props.initialData - Initial event data
 * @param {boolean} props.isEditing - Whether editing an existing event
 * @returns {JSX.Element} Recurring event form component
 */
const RecurringEventForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    venue: initialData.venue || '',
    duration: initialData.duration || 60,
    maxAttendees: initialData.maxAttendees || '',
    category: initialData.category || '',
    ...initialData
  });

  // Recurrence state
  const [recurrence, setRecurrence] = useState({
    freq: 'WEEKLY',
    dtstart: initialData.date || new Date().toISOString().split('T')[0],
    interval: 1,
    byweekday: ['MO', 'WE', 'FR'],
    count: 10
  });

  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('WEEKLY');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hooks
  const recurringEventsHook = useRecurringEvents();
  const seriesHook = useEventSeries();
  const { instances, validation, error: validationError } = recurringEventsHook;
  const { loading, error: seriesError } = seriesHook;

  /**
   * Handles form field changes
   */
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  /**
   * Handles recurrence field changes
   */
  const handleRecurrenceChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'freq') {
      // Apply template defaults when frequency changes
      const template = PREDEFINED_TEMPLATES[value];
      if (template) {
        setRecurrence(prev => ({
          ...prev,
          ...template.recurrenceRule,
          dtstart: prev.dtstart
        }));
      }
    } else if (name === 'interval' || name === 'count') {
      setRecurrence(prev => ({
        ...prev,
        [name]: parseInt(value, 10)
      }));
    } else if (name === 'dtstart') {
      setRecurrence(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setRecurrence(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  /**
   * Handles weekday selection
   */
  const handleWeekdayChange = useCallback((day) => {
    setRecurrence(prev => {
      const byweekday = prev.byweekday || [];
      const index = byweekday.indexOf(day);
      
      if (index > -1) {
        // Remove
        return {
          ...prev,
          byweekday: byweekday.filter(d => d !== day)
        };
      } else {
        // Add
        return {
          ...prev,
          byweekday: [...byweekday, day]
        };
      }
    });
  }, []);

  /**
   * Handles template selection
   */
  const handleTemplateSelect = useCallback((templateKey) => {
    const template = PREDEFINED_TEMPLATES[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      setRecurrence(prev => ({
        ...prev,
        ...template.recurrenceRule,
        dtstart: prev.dtstart
      }));
    }
  }, []);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    // Validate recurrence rule
    recurringEventsHook.generateInstances(recurrence, { maxInstances: 50 });

    // If validation passed
    if (validation?.isValid) {
      // Create series
      const series = seriesHook.createSeries(formData, recurrence);
      
      if (series && onSubmit) {
        onSubmit({
          formData,
          recurrence,
          series,
          instances
        });
      }
    }
  }, [formData, recurrence, recurringEventsHook, seriesHook, validation, instances, onSubmit]);

  /**
   * Handles preview generation
   */
  const handlePreview = useCallback(() => {
    recurringEventsHook.generateInstances(recurrence, { maxInstances: 10 });
  }, [recurrence, recurringEventsHook]);

  const error = validationError || seriesError;
  const isLoading = loading || recurringEventsHook.loading;

  return (
    <div className="recurring-event-form">
      <form onSubmit={handleSubmit}>
        {/* Event Details Section */}
        <fieldset>
          <legend>Event Details</legend>
          
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter event title"
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter event description"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="venue">Venue</label>
              <input
                id="venue"
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleFormChange}
                placeholder="Enter venue"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
              >
                <option value="">Select category</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="conference">Conference</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleFormChange}
                min="15"
                max="480"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxAttendees">Max Attendees</label>
              <input
                id="maxAttendees"
                type="number"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleFormChange}
                min="1"
              />
            </div>
          </div>
        </fieldset>

        {/* Recurrence Section */}
        <fieldset>
          <legend>Recurrence Pattern</legend>

          <div className="template-selector">
            <label>Quick Templates</label>
            <div className="template-buttons">
              {Object.entries(PREDEFINED_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  className={`template-btn ${selectedTemplate === key ? 'active' : ''}`}
                  onClick={() => handleTemplateSelect(key)}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dtstart">Start Date *</label>
              <input
                id="dtstart"
                type="date"
                name="dtstart"
                value={recurrence.dtstart}
                onChange={handleRecurrenceChange}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="freq">Frequency *</label>
              <select
                id="freq"
                name="freq"
                value={recurrence.freq}
                onChange={handleRecurrenceChange}
                required
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="interval">Repeat Every (X units)</label>
              <input
                id="interval"
                type="number"
                name="interval"
                value={recurrence.interval || 1}
                onChange={handleRecurrenceChange}
                min="1"
                max="30"
              />
            </div>

            <div className="form-group">
              <label htmlFor="count">Number of Occurrences</label>
              <input
                id="count"
                type="number"
                name="count"
                value={recurrence.count || 10}
                onChange={handleRecurrenceChange}
                min="1"
                max="365"
              />
            </div>
          </div>

          {/* Weekday Selection for Weekly */}
          {recurrence.freq === 'WEEKLY' && (
            <div className="weekday-selector">
              <label>Days of Week</label>
              <div className="weekday-buttons">
                {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`weekday-btn ${(recurrence.byweekday || []).includes(day) ? 'active' : ''}`}
                    onClick={() => handleWeekdayChange(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Options */}
          <button
            type="button"
            className="toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-group">
                <label htmlFor="dtend">End Date</label>
                <input
                  id="dtend"
                  type="date"
                  name="dtend"
                  value={recurrence.dtend || ''}
                  onChange={handleRecurrenceChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tzid">Timezone</label>
                <input
                  id="tzid"
                  type="text"
                  name="tzid"
                  value={recurrence.tzid || 'UTC'}
                  onChange={handleRecurrenceChange}
                  placeholder="UTC"
                />
              </div>

              <div className="form-group">
                <label htmlFor="exdates">Exception Dates (comma-separated)</label>
                <textarea
                  id="exdates"
                  name="exdates"
                  placeholder="YYYY-MM-DD,YYYY-MM-DD"
                  rows={3}
                />
              </div>
            </div>
          )}
        </fieldset>

        {/* Error Messages */}
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {validation && !validation.isValid && (
          <div className="alert alert-error" role="alert">
            <strong>Validation Errors:</strong>
            <ul>
              {validation.errors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {validation?.warnings.length > 0 && (
          <div className="alert alert-warning" role="alert">
            <strong>Warnings:</strong>
            <ul>
              {validation.warnings.map((warn, index) => (
                <li key={index}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview Section */}
        <div className="preview-section">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isLoading}
          >
            {isLoading ? 'Generating Preview...' : 'Preview Instances'}
          </button>

          {instances.length > 0 && (
            <div className="preview-results">
              <h4>Preview ({instances.length} instances)</h4>
              <div className="instance-list">
                {instances.map((instance, index) => (
                  <div key={index} className="instance-item">
                    {instance}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Creating Series...' : isEditing ? 'Update Series' : 'Create Series'}
          </button>
          <button
            type="reset"
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecurringEventForm;
