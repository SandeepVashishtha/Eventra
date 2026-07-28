/**
 * useRecurringEvents.js
 * React hook for managing recurring event operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  validateRecurrenceRule, 
  generateRecurrenceInstances,
  detectSeriesConflicts,
  estimateInstanceCount
} from '../utils/recurringEventUtils';

/**
 * Custom hook for recurring event management
 * @param {Object} initialSeries - Initial series data
 * @returns {Object} Hook state and methods
 */
export const useRecurringEvents = (initialSeries = null) => {
  const [series, setSeries] = useState(initialSeries);
  const [instances, setInstances] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState(null);

  /**
   * Generates instances from recurrence rule
   */
  const generateInstances = useCallback((rrule, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      // Validate rule first
      const validationResult = validateRecurrenceRule(rrule);
      setValidation(validationResult);

      if (!validationResult.isValid) {
        throw new Error(validationResult.errors[0]);
      }

      // Generate instances
      const generatedInstances = generateRecurrenceInstances(rrule, options);
      setInstances(generatedInstances);

      return generatedInstances;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Detects conflicts between instances and existing events
   */
  const checkForConflicts = useCallback((eventInstances = instances, existingEvents = []) => {
    try {
      const detectedConflicts = detectSeriesConflicts(eventInstances, existingEvents);
      setConflicts(detectedConflicts);
      return detectedConflicts;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [instances]);

  /**
   * Updates the series data
   */
  const updateSeries = useCallback((newSeries) => {
    setSeries(newSeries);
    
    // Re-generate instances if series has recurrence rule
    if (newSeries?.recurrenceRule) {
      generateInstances(newSeries.recurrenceRule);
    }
  }, [generateInstances]);

  /**
   * Clears all state
   */
  const reset = useCallback(() => {
    setSeries(null);
    setInstances([]);
    setConflicts([]);
    setError(null);
    setValidation(null);
  }, []);

  /**
   * Gets estimated instance count
   */
  const getEstimatedCount = useCallback((rrule = series?.recurrenceRule) => {
    if (!rrule) return 0;
    return estimateInstanceCount(rrule);
  }, [series]);

  /**
   * Validates the current series
   */
  const validateSeries = useCallback(() => {
    if (!series?.recurrenceRule) {
      setError('No series or recurrence rule to validate');
      return false;
    }

    const result = validateRecurrenceRule(series.recurrenceRule);
    setValidation(result);

    if (!result.isValid) {
      setError(result.errors[0]);
    }

    return result.isValid;
  }, [series]);

  return {
    series,
    instances,
    conflicts,
    loading,
    error,
    validation,
    generateInstances,
    checkForConflicts,
    updateSeries,
    reset,
    getEstimatedCount,
    validateSeries
  };
};

export default useRecurringEvents;
