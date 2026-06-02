import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { API_ENDPOINTS, apiUtils } from "../config/api";
import { useFormSubmit } from "./useFormSubmit";
import {
  DRAFT_KEY,
  initialFormData,
} from "../constants/eventDefaults";
import {
  parseTimeToMinutes,
} from "../utils/eventCreationUtils";
import { logger } from "../utils/logger";
import { useAuth } from "../context/AuthContext";

// 🎯 Constants for better maintainability
const MAX_CAPACITY = 100000;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;
const DEBOUNCE_DELAY = 1000;

/**
 * useEventForm Hook
 * 
 * Extracts all state and logic for event creation from the EventCreation monolith.
 * Handles form state, validation, draft persistence, and submission.
 */
export const useEventForm = () => {
  const { user } = useAuth();
  const scopedDraftKey = `${DRAFT_KEY}_${user?.id || "guest"}`;
  // 📊 State Management
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState("");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 🔄 Refs for optimization
  const formDataRef = useRef(formData);
  const saveDraftTimeoutRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // 🎯 Form Submission Hook
  const { 
    handleSubmit: submitEventForm, 
    isSubmitting, 
    error: submitError, 
    success: submitSuccess 
  } = useFormSubmit(async (eventData) => {
    if (!API_ENDPOINTS.EVENTS.CREATE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: "mock-event-id", success: true };
    }

    const response = await apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    const result = response.data;
    
    if (!(response.status === 200 && result?.success)) {
      const errorMessage = result?.message || result?.error || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return result;
  });

  // 🗄️ Draft Management
  useEffect(() => {
    const checkForDraft = () => {
      try {
        const saved = localStorage.getItem(scopedDraftKey);
        if (saved) {
          setShowRestoreModal(true);
        }
      } catch (error) {
        logger.error("Failed to check for saved draft:", error);
      } finally {
        setIsDraftLoaded(true);
      }
    };
    
    const timer = setTimeout(checkForDraft, 300);
    return () => clearTimeout(timer);
  }, []);

  // 💾 Debounced Draft Saving
  useEffect(() => {
    if (!isDraftLoaded) return;

    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }

    saveDraftTimeoutRef.current = setTimeout(() => {
      try {
        const saveable = { ...formDataRef.current };
        delete saveable.banner;
        delete saveable.bannerPreview;
        localStorage.setItem(scopedDraftKey, JSON.stringify(saveable));
      } catch (error) {
        logger.error("Failed to save draft:", error);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, [formData, isDraftLoaded]);

  // 🔍 Validation Logic
  const validateForm = useCallback(() => {
    const newErrors = {};
    const data = formDataRef.current;

    const title = data.title?.trim();
    if (!title) {
      newErrors.title = "Event title is required";
    } else if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`;
    }

    if (!data.description?.trim()) newErrors.description = "Event description is required";
    if (!data.category) newErrors.category = "Please select a category";

    if (data.isMultiDay) {
      if (!data.startDate) newErrors.startDate = "Start date is required";
      if (!data.endDate) newErrors.endDate = "End date is required";
      if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    } else {
      if (!data.date) newErrors.date = "Event date is required";
    }

    if (!data.startTime) newErrors.startTime = "Start time is required";
    if (!data.endTime) newErrors.endTime = "End time is required";

    if (!newErrors.startTime && !newErrors.endTime && !data.isMultiDay) {
      const startMinutes = parseTimeToMinutes(data.startTime);
      const endMinutes = parseTimeToMinutes(data.endTime);
      if (startMinutes >= endMinutes) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!data.isVirtual && !data.location?.name?.trim()) {
      newErrors.location = "Location name is required for in-person events";
    }
    if (data.isVirtual && !data.virtualLink?.trim()) {
      newErrors.virtualLink = "Virtual link is required for online events";
    }

    if (data.capacity) {
      const capacity = Number(data.capacity);
      if (!capacity || capacity <= 0) {
        newErrors.capacity = "Please enter a valid number";
      } else if (capacity > MAX_CAPACITY) {
        newErrors.capacity = `Maximum capacity is ${MAX_CAPACITY.toLocaleString()} attendees`;
      }
    }

    data.ticketTiers?.forEach((tier, index) => {
      if (tier.name?.trim()) {
        const price = Number(tier.price);
        if (price < 0) newErrors[`ticketTier_${index}_price`] = "Price cannot be negative";
        
        if (tier.capacity) {
          const cap = Number(tier.capacity);
          if (cap <= 0) newErrors[`ticketTier_${index}_capacity`] = "Capacity must be greater than 0";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    localStorage.removeItem(scopedDraftKey);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  }, [errors]);

  const handleNestedChange = useCallback((category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    if (errors[category]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[category];
        return newErrs;
      });
    }
  }, [errors]);

  const addTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setNewTag("");
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  }, []);

  const addTicketTier = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        { id: Date.now(), name: "", price: "", capacity: "", description: "" },
      ],
    }));
  }, []);

  const removeTicketTier = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter((_, i) => i !== index),
    }));
  }, []);

  const updateTicketTier = useCallback((index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  }, []);

  const handleRestoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(scopedDraftKey);
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
        toast.success("Draft restored!");
      }
    } catch (error) {
      logger.error("Failed to restore draft:", error);
    } finally {
      setShowRestoreModal(false);
    }
  }, []);

  const handleDiscardDraft = useCallback(() => {
    localStorage.removeItem(scopedDraftKey);
    setShowRestoreModal(false);
  }, []);

  const hasUnsavedChanges = useMemo(() => {
    return Object.entries(formData).some(([key, value]) => {
      if (["banner", "bannerPreview"].includes(key)) return false;
      if (typeof value === "string") return value.trim() !== (initialFormData[key] || "");
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value) !== JSON.stringify(initialFormData[key] || {});
      }
      return Boolean(value) !== Boolean(initialFormData[key]);
    });
  }, [formData]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    newTag,
    setNewTag,
    showRestoreModal,
    setShowRestoreModal,
    isUploading,
    setIsUploading,
    isSubmitting,
    submitError,
    submitSuccess,
    submitEventForm,
    validateForm,
    resetForm,
    handleInputChange,
    handleNestedChange,
    addTag,
    removeTag,
    addTicketTier,
    removeTicketTier,
    updateTicketTier,
    handleRestoreDraft,
    handleDiscardDraft,
    hasUnsavedChanges,
  };
};
