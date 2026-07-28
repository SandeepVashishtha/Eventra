/**
 * useEventSeries.js
 * React hook for managing event series operations and modifications.
 */

import { useState, useCallback, useContext } from 'react';
import {
  createEventSeries,
  generateSeriesInstances,
  updateSingleInstance,
  updateThisAndFutureInstances,
  updateAllInstances,
  deleteSingleInstance,
  deleteThisAndFutureInstances,
  createTemplateFromSeries,
  createSeriesFromTemplate
} from '../utils/seriesTemplateUtils';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for event series management
 * @returns {Object} Hook state and methods
 */
export const useEventSeries = () => {
  const { user } = useContext(AuthContext) || {};
  const userId = user?.id;

  const [series, setSeries] = useState(null);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Creates a new series
   */
  const createSeries = useCallback((baseEvent, rrule) => {
    if (!userId) {
      setError('User must be authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newSeries = createEventSeries(baseEvent, rrule, userId);
      setSeries(newSeries);
      
      setSuccessMessage('Series created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      return newSeries;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Generates instances from the current series
   */
  const generateInstances = useCallback((options = {}) => {
    if (!series) {
      setError('No series to generate instances from');
      return [];
    }

    try {
      setLoading(true);
      const generated = generateSeriesInstances(series, options);
      setInstances(generated);
      return generated;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [series]);

  /**
   * Updates a single instance
   */
  const updateInstance = useCallback((instanceDate, updates) => {
    if (!series) {
      setError('No series selected');
      return null;
    }

    if (!userId) {
      setError('User must be authenticated');
      return null;
    }

    try {
      setLoading(true);
      const updated = updateSingleInstance(series, instanceDate, updates, userId);
      setSeries(updated);
      
      setSuccessMessage('Instance updated');
      setTimeout(() => setSuccessMessage(null), 3000);

      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Updates all instances from a date forward
   */
  const updateFutureInstances = useCallback((startDate, updates) => {
    if (!series) {
      setError('No series selected');
      return null;
    }

    if (!userId) {
      setError('User must be authenticated');
      return null;
    }

    try {
      setLoading(true);
      const updated = updateThisAndFutureInstances(series, startDate, updates, userId);
      setSeries(updated);
      
      setSuccessMessage('Future instances updated');
      setTimeout(() => setSuccessMessage(null), 3000);

      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Updates all instances in the series
   */
  const updateAllSeries = useCallback((updates) => {
    if (!series) {
      setError('No series selected');
      return null;
    }

    try {
      setLoading(true);
      const updated = updateAllInstances(series, updates, userId);
      setSeries(updated);
      
      setSuccessMessage('All instances updated');
      setTimeout(() => setSuccessMessage(null), 3000);

      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Deletes a single instance
   */
  const deleteInstance = useCallback((instanceDate) => {
    if (!series) {
      setError('No series selected');
      return null;
    }

    try {
      setLoading(true);
      const updated = deleteSingleInstance(series, instanceDate, userId);
      setSeries(updated);
      
      setSuccessMessage('Instance deleted');
      setTimeout(() => setSuccessMessage(null), 3000);

      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Deletes instances from a date forward
   */
  const deleteFutureInstances = useCallback((startDate) => {
    if (!series) {
      setError('No series selected');
      return null;
    }

    try {
      setLoading(true);
      const updated = deleteThisAndFutureInstances(series, startDate, userId);
      setSeries(updated);
      
      setSuccessMessage('Future instances deleted');
      setTimeout(() => setSuccessMessage(null), 3000);

      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Creates a template from current series
   */
  const createTemplate = useCallback((templateName, isPublic = false) => {
    if (!series) {
      setError('No series to create template from');
      return null;
    }

    try {
      setLoading(true);
      const template = createTemplateFromSeries(series, templateName, userId, isPublic);
      
      setSuccessMessage('Template created successfully');
      setTimeout(() => setSuccessMessage(null), 3000);

      return template;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [series, userId]);

  /**
   * Creates series from a template
   */
  const createFromTemplate = useCallback((template, eventData) => {
    if (!userId) {
      setError('User must be authenticated');
      return null;
    }

    try {
      setLoading(true);
      const newSeries = createSeriesFromTemplate(template, eventData, userId);
      setSeries(newSeries);
      
      setSuccessMessage('Series created from template');
      setTimeout(() => setSuccessMessage(null), 3000);

      return newSeries;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Clears the current series
   */
  const clearSeries = useCallback(() => {
    setSeries(null);
    setInstances([]);
  }, []);

  /**
   * Clears error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    series,
    instances,
    loading,
    error,
    successMessage,
    createSeries,
    generateInstances,
    updateInstance,
    updateFutureInstances,
    updateAllSeries,
    deleteInstance,
    deleteFutureInstances,
    createTemplate,
    createFromTemplate,
    clearSeries,
    clearError,
    setSeries
  };
};

export default useEventSeries;
