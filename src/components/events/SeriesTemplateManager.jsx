/**
 * SeriesTemplateManager.jsx
 * Component for managing recurring event series templates.
 */

import React, { useState, useCallback } from 'react';
import { useEventSeries } from '../../hooks/useEventSeries';
import {
  PREDEFINED_TEMPLATES,
  listPredefinedTemplates,
  getPredefinedTemplate
} from '../../utils/seriesTemplateUtils';
import './SeriesTemplateManager.css';

/**
 * Series template manager component
 * @param {Object} props - Component props
 * @param {Function} props.onTemplateSelect - Callback when template is selected
 * @param {Function} props.onTemplateCreate - Callback when custom template is created
 * @returns {JSX.Element} Template manager component
 */
const SeriesTemplateManager = ({ onTemplateSelect, onTemplateCreate }) => {
  const [templates, setTemplates] = useState(listPredefinedTemplates());
  const [customTemplates, setCustomTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'predefined', 'custom'

  const seriesHook = useEventSeries();
  const { series, loading, error } = seriesHook;

  /**
   * Handles template selection
   */
  const handleSelectTemplate = useCallback((template) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  }, [onTemplateSelect]);

  /**
   * Handles creating a custom template from current series
   */
  const handleCreateTemplate = useCallback(() => {
    if (!series) {
      alert('No series available to create template from');
      return;
    }

    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      const template = seriesHook.createTemplate(templateName, isPublic);

      if (template) {
        const newTemplate = {
          ...template,
          isCustom: true
        };

        setCustomTemplates(prev => [...prev, newTemplate]);
        setTemplateName('');
        setIsPublic(false);
        setShowCreateForm(false);

        if (onTemplateCreate) {
          onTemplateCreate(newTemplate);
        }
      }
    } catch (err) {
      alert(`Error creating template: ${err.message}`);
    }
  }, [series, templateName, isPublic, seriesHook, onTemplateCreate]);

  /**
   * Handles deleting a custom template
   */
  const handleDeleteTemplate = useCallback((templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  }, []);

  /**
   * Handles creating a series from template
   */
  const handleCreateFromTemplate = useCallback((template) => {
    const eventName = prompt('Enter event name:');
    if (eventName) {
      try {
        seriesHook.createFromTemplate(template, { title: eventName });
      } catch (err) {
        alert(`Error creating series: ${err.message}`);
      }
    }
  }, [seriesHook]);

  /**
   * Filters templates based on selected mode
   */
  const getFilteredTemplates = () => {
    if (filterMode === 'predefined') {
      return templates;
    }
    if (filterMode === 'custom') {
      return customTemplates;
    }
    return [...templates, ...customTemplates];
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="series-template-manager">
      <header className="manager-header">
        <h2>Series Templates</h2>
        <p className="subtitle">Manage and create recurring event templates</p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          All ({templates.length + customTemplates.length})
        </button>
        <button
          className={`filter-tab ${filterMode === 'predefined' ? 'active' : ''}`}
          onClick={() => setFilterMode('predefined')}
        >
          Predefined ({templates.length})
        </button>
        <button
          className={`filter-tab ${filterMode === 'custom' ? 'active' : ''}`}
          onClick={() => setFilterMode('custom')}
        >
          Custom ({customTemplates.length})
        </button>
      </div>

      {/* Create Template Button */}
      {series && (
        <div className="create-template-section">
          <button
            className="btn-create-template"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Custom Template'}
          </button>

          {/* Create Form */}
          {showCreateForm && (
            <div className="create-template-form">
              <div className="form-group">
                <label htmlFor="templateName">Template Name *</label>
                <input
                  id="templateName"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </div>

              <div className="form-group checkbox">
                <label htmlFor="isPublic">
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Make Public
                </label>
                <small>Public templates can be shared with other users</small>
              </div>

              <button
                className="btn-submit"
                onClick={handleCreateTemplate}
                disabled={loading || !templateName.trim()}
              >
                {loading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="templates-grid">
          {filteredTemplates.map((template) => (
            <div
              key={template.id || template.key}
              className={`template-card ${
                selectedTemplate?.id === template.id ? 'selected' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="template-header">
                <h3>{template.name}</h3>
                {template.isPublic && <span className="badge-public">Public</span>}
                {template.isCustom && <span className="badge-custom">Custom</span>}
              </div>

              <div className="template-details">
                {template.description && (
                  <p className="description">{template.description}</p>
                )}

                <div className="recurrence-info">
                  <strong>Pattern:</strong>
                  <p>{formatRecurrenceRule(template.recurrenceRule)}</p>
                </div>

                {template.defaultProperties && (
                  <div className="default-properties">
                    <strong>Default Properties:</strong>
                    <ul>
                      {Object.entries(template.defaultProperties)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <li key={key}>
                            <small>
                              {key}: {String(value).substring(0, 30)}
                              {String(value).length > 30 ? '...' : ''}
                            </small>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="template-actions">
                <button
                  className="btn-action btn-select"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(template);
                  }}
                >
                  Select
                </button>

                <button
                  className="btn-action btn-use"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateFromTemplate(template);
                  }}
                >
                  Use
                </button>

                {template.isCustom && (
                  <button
                    className="btn-action btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    title="Delete template"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            {filterMode === 'custom'
              ? 'No custom templates yet. Create one from an existing series!'
              : 'No templates found.'}
          </p>
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="selected-template-details">
          <h3>Selected Template: {selectedTemplate.name}</h3>
          <div className="details-content">
            <div className="detail-row">
              <span className="label">Frequency:</span>
              <span className="value">{selectedTemplate.recurrenceRule?.freq}</span>
            </div>
            <div className="detail-row">
              <span className="label">Interval:</span>
              <span className="value">{selectedTemplate.recurrenceRule?.interval || 1}</span>
            </div>
            {selectedTemplate.recurrenceRule?.byweekday && (
              <div className="detail-row">
                <span className="label">Days:</span>
                <span className="value">
                  {selectedTemplate.recurrenceRule.byweekday.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Formats a recurrence rule for display
 */
const formatRecurrenceRule = (rrule) => {
  if (!rrule) return 'No recurrence rule';

  const parts = [];
  
  if (rrule.interval && rrule.interval > 1) {
    parts.push(`Every ${rrule.interval}${rrule.freq.toLowerCase()}`);
  } else {
    parts.push(`${rrule.freq.charAt(0)}${rrule.freq.slice(1).toLowerCase()}`);
  }

  if (rrule.byweekday && rrule.byweekday.length > 0) {
    parts.push(`on ${rrule.byweekday.join(', ')}`);
  }

  if (rrule.count) {
    parts.push(`(${rrule.count} times)`);
  } else if (rrule.dtend) {
    parts.push(`until ${rrule.dtend}`);
  }

  return parts.join(' ');
};

export default SeriesTemplateManager;
