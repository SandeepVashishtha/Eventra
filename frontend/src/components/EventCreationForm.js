import React, { useState } from 'react';

const EventCreationForm = () => {
  const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'preview'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: '',
    isOnline: false,
    banner: null,
    bannerPreview: null,
    tags: []
  });
  
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Conference', 'Workshop', 'Seminar', 'Networking', 'Social', 
    'Sports', 'Cultural', 'Educational', 'Technology', 'Business'
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Event date cannot be in the past';
      }
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    if (!formData.isOnline && !formData.location.trim()) {
      newErrors.location = 'Location is required for offline events';
    }
    
    if (formData.maxAttendees && (isNaN(formData.maxAttendees) || parseInt(formData.maxAttendees) <= 0)) {
      newErrors.maxAttendees = 'Please enter a valid number of attendees';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, banner: 'Image size should be less than 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          banner: file,
          bannerPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      if (errors.banner) {
        setErrors(prev => ({ ...prev, banner: '' }));
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setCurrentStep('preview');
    }
  };

  const publishEvent = () => {
    // Here you would typically send the data to your backend
    alert('Event published successfully!');
    // Reset form or redirect
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (currentStep === 'preview') {
    return (
      <div className="preview-container slide-in">
        {/* Preview Header */}
        <div className="preview-header">
          <div>
            <button onClick={() => setCurrentStep('form')} className="back-btn">
              <span>← Back to Edit</span>
            </button>
            <h1 style={{ textAlign:'center', margin: '1rem 0 0 0', fontSize: '2rem' }}>Event Preview</h1>
          </div>
          <span className="preview-badge">Preview Mode</span>
        </div>

        {/* Event Banner */}
        {formData.bannerPreview && (
          <div className="event-banner">
            <img src={formData.bannerPreview} alt="Event banner" />
          </div>
        )}

        {/* Event Details */}
        <div className="preview-content">
          <div className="preview-grid">
            <div>
              <div>
                <span className="event-category">{formData.category}</span>
                <h2 className="event-title">{formData.title}</h2>
                <p className="event-description">{formData.description}</p>
              </div>

              {formData.tags.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem' }}>Tags</h3>
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} style={{ 
                        background: '#f3f4f6', 
                        color: '#374151', 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.875rem' 
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="event-details">
              <h3>Event Details</h3>
              
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div className="detail-content">
                  <p>Date</p>
                  <p>{formatDate(formData.date)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <div className="detail-content">
                  <p>Time</p>
                  <p>{formatTime(formData.startTime)} - {formatTime(formData.endTime)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div className="detail-content">
                  <p>Location</p>
                  <p>{formData.isOnline ? 'Online Event' : formData.location}</p>
                </div>
              </div>

              {formData.maxAttendees && (
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <div className="detail-content">
                    <p>Max Attendees</p>
                    <p>{formData.maxAttendees} people</p>
                  </div>
                </div>
              )}

              <button onClick={publishEvent} className="publish-btn">
                <span>✓ Publish Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-form-container slide-in">
      {/* Form Header */}
      <div className="form-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to create an amazing event</p>
      </div>

      <div className="form-content">
        <div className="form-grid two-columns">
          {/* Event Title */}
          <div className="form-group full-width">
            <label className="form-label required">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Enter event title..."
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label className="form-label required">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Describe your event..."
            />
            {errors.description && <div className="error-message">{errors.description}</div>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label required">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label required">Event Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className={`form-input ${errors.date ? 'error' : ''}`}
            />
            {errors.date && <div className="error-message">{errors.date}</div>}
          </div>

          {/* Start Time */}
          <div className="form-group">
            <label className="form-label required">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={`form-input ${errors.startTime ? 'error' : ''}`}
            />
            {errors.startTime && <div className="error-message">{errors.startTime}</div>}
          </div>

          {/* End Time */}
          <div className="form-group">
            <label className="form-label required">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={`form-input ${errors.endTime ? 'error' : ''}`}
            />
            {errors.endTime && <div className="error-message">{errors.endTime}</div>}
          </div>

          {/* Online Event Toggle */}
          <div className="form-group full-width">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="isOnline"
                checked={formData.isOnline}
                onChange={handleInputChange}
                className="checkbox-input"
                id="isOnline"
              />
              <label htmlFor="isOnline" className="checkbox-label">This is an online event</label>
            </div>
          </div>

          {/* Location */}
          {!formData.isOnline && (
            <div className="form-group full-width">
              <label className="form-label required">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`form-input ${errors.location ? 'error' : ''}`}
                placeholder="Enter event location..."
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>
          )}

          {/* Max Attendees */}
          <div className="form-group">
            <label className="form-label">Max Attendees</label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees}
              onChange={handleInputChange}
              min="1"
              className={`form-input ${errors.maxAttendees ? 'error' : ''}`}
              placeholder="Leave empty for unlimited"
            />
            {errors.maxAttendees && <div className="error-message">{errors.maxAttendees}</div>}
          </div>

          {/* Banner Upload */}
          <div className="form-group full-width">
            <label className="form-label">Event Banner</label>
            <div className={`image-upload-area ${formData.bannerPreview ? 'has-image' : ''}`}>
              {formData.bannerPreview ? (
                <div>
                  <img
                    src={formData.bannerPreview}
                    alt="Banner preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, banner: null, bannerPreview: null }))}
                    className="remove-image-btn"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  <div className="upload-icon">🖼️</div>
                  <div>
                    <p className="upload-text">Upload an event banner</p>
                    <p className="upload-subtext">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ marginTop: '1rem' }}
              />
            </div>
            {errors.banner && <div className="error-message">{errors.banner}</div>}
          </div>

          {/* Tags */}
          <div className="form-group full-width">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              <div className="tag-input-group">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="form-input tag-input"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="add-tag-btn"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
          >
            <span>Preview Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCreationForm;