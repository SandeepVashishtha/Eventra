import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS, apiUtils } from '../../config/api';
import './ProjectSubmission.css';

const ProjectSubmission = ({ onClose, onSubmit }) => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: user?.firstName + ' ' + user?.lastName || '',
    category: '',
    techStack: [],
    githubUrl: '',
    liveDemo: '',
    image: '',
    difficulty: 'Beginner',
    openIssues: 0,
    pullRequests: 0,
    stars: 0,
    forks: 0
  });
  const [techInput, setTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Game Development',
    'Desktop Application',
    'API/Backend',
    'Open Source',
    'E-commerce',
    'Educational',
    'Portfolio',
    'Other'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleTechStackAdd = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const handleTechStackRemove = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTechStackAdd();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiUtils.post(
        API_ENDPOINTS.PROJECTS.SUBMIT,
        formData,
        token
      );

      if (response.ok) {
        const result = await response.json();
        setSuccess('Project submitted successfully! It will be reviewed by administrators.');
        onSubmit && onSubmit(result);
        setTimeout(() => {
          onClose && onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit project');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="project-submission-modal">
        <div className="project-submission-content">
          <div className="text-center">
            <h2>Please Login</h2>
            <p>You need to be logged in to submit a project.</p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-submission-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="project-submission-content"
      >
        <div className="submission-header">
          <h2>Submit Your Project</h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="title">Project Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength="255"
              placeholder="Enter your project title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your project, its features, and purpose"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tech Stack</label>
            <div className="tech-stack-input">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add technology (press Enter)"
              />
              <button type="button" onClick={handleTechStackAdd} className="add-tech-btn">
                <FiPlus />
              </button>
            </div>
            <div className="tech-stack-list">
              {formData.techStack.map(tech => (
                <span key={tech} className="tech-tag">
                  {tech}
                  <button type="button" onClick={() => handleTechStackRemove(tech)}>
                    <FiX />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="githubUrl">GitHub URL</label>
              <div className="input-with-icon">
                <FiGithub />
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="liveDemo">Live Demo URL</label>
              <div className="input-with-icon">
                <FiExternalLink />
                <input
                  type="url"
                  id="liveDemo"
                  name="liveDemo"
                  value={formData.liveDemo}
                  onChange={handleInputChange}
                  placeholder="https://your-project-demo.com"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Project Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="https://example.com/project-screenshot.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty Level</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stars">GitHub Stars</label>
              <input
                type="number"
                id="stars"
                name="stars"
                value={formData.stars}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="forks">GitHub Forks</label>
              <input
                type="number"
                id="forks"
                name="forks"
                value={formData.forks}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="openIssues">Open Issues</label>
              <input
                type="number"
                id="openIssues"
                name="openIssues"
                value={formData.openIssues}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="pullRequests">Pull Requests</label>
              <input
                type="number"
                id="pullRequests"
                name="pullRequests"
                value={formData.pullRequests}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Submitting...' : 'Submit Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectSubmission;
