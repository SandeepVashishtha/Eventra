import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Download, X } from "lucide-react";
import useReducedMotion from "../hooks/useReducedMotion";
import CharacterCounter from "./common/CharacterCounter";
import { exportAttendeesToCSV } from "../utils/exportCsv";
import { logger } from "../utils/logger";
import {
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TicketIcon,
  TagIcon,
  CheckCircleIcon,
  PencilIcon,
  AlertCircleIcon,
  Trash2Icon,
} from "@heroicons/react/24/solid";
import { API_ENDPOINTS, apiUtils } from "../config/api";
import {
  Calendar,
  MapPin,
  Link2,
  Users,
  Image as ImageIcon,
  ClipboardList,
  FileText,
  Layers,
  Globe,
  CalendarPlus,
  CalendarX,
  Map as MapIcon,
  Navigation,
  Compass,
  Upload,
  Plus,
  Loader2,
} from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { LoadingButton } from "./ui/LoadingButton";
import {
  DRAFT_KEY,
  categories,
  mockAttendees,
  initialFormData,
  todayString,
} from "../constants/eventDefaults";
import {
  parseTimeToMinutes,
  formatDate,
  formatTime,
  validateCoordinates,
} from "../utils/eventCreationUtils";

// 🎯 Constants for better maintainability
const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TITLE_LENGTH = 200;
const MIN_TITLE_LENGTH = 3;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CAPACITY = 100000;
const DEBOUNCE_DELAY = 1000; // 1 second for localStorage saves

// 🧩 Helper Components (Extracted for reusability)
const FormField = ({ label, icon: Icon, error, children, required, hint }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {Icon && <Icon className="w-5 h-5 text-indigo-500 inline-block mr-2" />}
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-sm flex items-center gap-1"
      >
        <AlertCircleIcon className="w-4 h-4" />
        {error}
      </motion.p>
    )}
  </div>
);

const TagInput = ({ tags, onAdd, onRemove, newTag, setNewTag, placeholder = "Add a tag" }) => {
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      onAdd();
    }
  }, [onAdd]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Add new tag"
          className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                   transition-all duration-200"
        />
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!newTag.trim()}
          className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg 
                   bg-indigo-600 text-white font-medium text-sm
                   hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
          aria-label="Add tag"
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>
      
      <AnimatePresence mode="popLayout">
        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {tags.map((tag, index) => (
            <motion.span
              key={`${tag}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 
                       text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="ml-1 hover:text-red-500 transition-colors duration-200 
                         focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-0.5"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.span>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

const TicketTierCard = ({ tier, index, onChange, onRemove, canRemove, errors }) => {
  const handleChange = useCallback((field, value) => {
    onChange(index, field, value);
  }, [index, onChange]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 
               rounded-xl p-4 space-y-4"
    >
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
          Tier {index + 1}
        </h4>
        {canRemove && (
          <motion.button
            type="button"
            onClick={() => onRemove(index)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 
                     text-sm font-medium transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg p-1"
            aria-label={`Remove ticket tier ${index + 1}`}
          >
            <Trash2Icon className="w-4 h-4" />
            Remove
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        <FormField label="Tier Name" required>
          <input
            type="text"
            placeholder="e.g., Early Bird, VIP, General Admission"
            value={tier.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-600 
                     text-gray-900 dark:text-gray-100 focus:outline-none 
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     transition-all duration-200 ${
                       errors[`ticketTier_${index}_name`] 
                         ? "border-red-500 focus:ring-red-500" 
                         : "border-gray-300 dark:border-gray-600"
                     }`}
            aria-invalid={!!errors[`ticketTier_${index}_name`]}
            aria-describedby={errors[`ticketTier_${index}_name`] ? `tier-name-error-${index}` : undefined}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price (₹)" required>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={tier.price}
              onChange={(e) => handleChange("price", e.target.value)}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-600 
                       text-gray-900 dark:text-gray-100 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 ${
                         errors[`ticketTier_${index}_price`] 
                           ? "border-red-500 focus:ring-red-500" 
                           : "border-gray-300 dark:border-gray-600"
                       }`}
              aria-invalid={!!errors[`ticketTier_${index}_price`]}
            />
          </FormField>
          
          <FormField label="Capacity (Optional)">
            <input
              type="number"
              placeholder="Unlimited"
              min="1"
              value={tier.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-600 
                       text-gray-900 dark:text-gray-100 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 ${
                         errors[`ticketTier_${index}_capacity`] 
                           ? "border-red-500 focus:ring-red-500" 
                           : "border-gray-300 dark:border-gray-600"
                       }`}
              aria-invalid={!!errors[`ticketTier_${index}_capacity`]}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            placeholder="What's included in this tier?"
            value={tier.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                     bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 
                     focus:border-transparent transition-all duration-200 resize-none"
          />
          <div className="flex justify-end">
            <CharacterCounter current={tier.description.length} max={200} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 🎨 Main Component
const EventCreation = () => {
  const prefersReducedMotion = useReducedMotion();
  
  // 📊 State Management
  const [currentStep, setCurrentStep] = useState("form");
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState("");
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 🔄 Refs for optimization
  const formDataRef = useRef(formData);
  const saveDraftTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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
    // Auth is handled by the HttpOnly session cookie — apiUtils sends it
    // automatically via withCredentials. Never read tokens from sessionStorage;
    // setToken was removed as part of the HttpOnly cookie migration.
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

  // 🎉 Success Handler
  useEffect(() => {
    if (submitSuccess) {
      toast.success("🎉 Event created successfully!");
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitSuccess]);

  // 🗄️ Draft Management
  useEffect(() => {
    const checkForDraft = () => {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          setShowRestoreModal(true);
        }
      } catch (error) {
        logger.error("Failed to check for saved draft:", error);
      } finally {
        setIsDraftLoaded(true);
      }
    };
    
    // Small delay to avoid flash on mount
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
        localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
      } catch (error) {
        logger.error("Failed to save draft:", error);
        // Fallback: try to save without complex objects
        try {
          const minimal = {
            title: formDataRef.current.title,
            description: formDataRef.current.description,
            date: formDataRef.current.date,
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(minimal));
        } catch (e) {
          logger.error("Critical: Could not save draft:", e);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => {
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, [formData, isDraftLoaded]);

  // ⚠️ Before Unload Warning (Memoized)
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

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 🔍 Validation Logic (Extracted & Optimized)
  const validateForm = useCallback(() => {
    const newErrors = {};
    const data = formDataRef.current;

    // Title validation
    const title = data.title?.trim();
    if (!title) {
      newErrors.title = "Event title is required";
    } else if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`;
    }

    // Required fields
    if (!data.description?.trim()) newErrors.description = "Event description is required";
    if (!data.category) newErrors.category = "Please select a category";

    // Date validation
    if (data.isMultiDay) {
      if (!data.startDate) newErrors.startDate = "Start date is required";
      if (!data.endDate) newErrors.endDate = "End date is required";
      if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    } else {
      if (!data.date) newErrors.date = "Event date is required";
    }

    // Time validation
    if (!data.startTime) newErrors.startTime = "Start time is required";
    if (!data.endTime) newErrors.endTime = "End time is required";

    if (!newErrors.startTime && !newErrors.endTime && !data.isMultiDay) {
      const startMinutes = parseTimeToMinutes(data.startTime);
      const endMinutes = parseTimeToMinutes(data.endTime);
      if (startMinutes >= endMinutes) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Location/Virtual validation
    if (!data.isVirtual && !data.location?.name?.trim()) {
      newErrors.location = "Location name is required for in-person events";
    }
    if (data.isVirtual && !data.virtualLink?.trim()) {
      newErrors.virtualLink = "Virtual link is required for online events";
    }

    // Capacity validation
    if (data.capacity) {
      const capacity = Number(data.capacity);
      if (!capacity || capacity <= 0) {
        newErrors.capacity = "Please enter a valid number";
      } else if (capacity > MAX_CAPACITY) {
        newErrors.capacity = `Maximum capacity is ${MAX_CAPACITY.toLocaleString()} attendees`;
      }
    }

    // Registration dates
    if (data.registrationStart && data.registrationEnd) {
      if (new Date(data.registrationStart) >= new Date(data.registrationEnd)) {
        newErrors.registrationEnd = "Registration end must be after start";
      }
    }

    // Ticket tiers validation
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
  }, []); // No dependencies needed as we use formDataRef

  // 📝 Input Handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      if (name.startsWith("location.coordinates.")) {
        const coordField = name.split(".")[2];
        return {
          ...prev,
          location: {
            ...prev.location,
            coordinates: { ...prev.location.coordinates, [coordField]: value }
          }
        };
      } else if (name.startsWith("location.")) {
        const locationField = name.split(".")[1];
        return {
          ...prev,
          location: { ...prev.location, [locationField]: value }
        };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleTicketTierChange = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
    
    const errorKey = `ticketTier_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  }, [errors]);

  // 🏷️ Tag Management
  const addTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.some(tag => tag.toLowerCase() === trimmed.toLowerCase())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTag("");
    }
  }, [newTag, formData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // 🖼️ Image Upload with Validation
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, banner: "Please upload a valid image file" }));
      toast.error("❌ Invalid file type. Please upload an image.");
      return;
    }

    // Validate file size
    if (file.size > MAX_BANNER_SIZE) {
      setErrors(prev => ({ ...prev, banner: "Image size should be less than 5MB" }));
      toast.error(`❌ Image too large. Max size is ${(MAX_BANNER_SIZE / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          banner: file,
          bannerPreview: event.target?.result
        }));
        if (errors.banner) {
          setErrors(prev => ({ ...prev, banner: "" }));
        }
        toast.success("✅ Banner uploaded successfully!");
      };
      
      reader.onerror = () => {
        toast.error("❌ Failed to read image file");
        setErrors(prev => ({ ...prev, banner: "Failed to process image" }));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      logger.error("Image upload error:", error);
      toast.error("❌ Upload failed. Please try again.");
      setErrors(prev => ({ ...prev, banner: "Upload error occurred" }));
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [errors.banner]);

  // 🎫 Ticket Tier Management
  const addTicketTier = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, {
        name: "",
        price: 0,
        capacity: "",
        description: ""
      }]
    }));
    toast.info("➕ New ticket tier added");
  }, []);

  const removeTicketTier = useCallback((index) => {
    if (formData.ticketTiers.length > 1) {
      setFormData(prev => ({
        ...prev,
        ticketTiers: prev.ticketTiers.filter((_, i) => i !== index)
      }));
      toast.info("🗑️ Ticket tier removed");
    }
  }, [formData.ticketTiers.length]);

  // 🚀 Form Submission Flow
  const handlePreview = useCallback(() => {
    if (validateForm()) {
      setCurrentStep("preview");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.info("👀 Review your event details below");
    } else {
      toast.error("⚠️ Please fix the errors before proceeding");
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus();
      }
    }
  }, [validateForm, errors]);

  const createEvent = useCallback(async () => {
    try {
      let coordinates = null;
      if (formData.location.coordinates?.latitude && formData.location.coordinates?.longitude) {
        coordinates = validateCoordinates(
          formData.location.coordinates.latitude,
          formData.location.coordinates.longitude
        );
      }

      const eventDate = formData.isMultiDay ? formData.startDate : formData.date;
      const eventStartDate = new Date(`${eventDate}T${formData.startTime}`);
      const eventEndDate = new Date(
        `${formData.isMultiDay ? formData.endDate : formData.date}T${formData.endTime}`
      );

      if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
        throw new Error("Invalid date or time format");
      }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: eventStartDate.toISOString(),
        endDate: eventEndDate.toISOString(),
        timezone: formData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: formData.isVirtual
          ? null
          : {
              name: formData.location.name.trim(),
              address: formData.location.address?.trim() || "",
              coordinates
            },
        isVirtual: formData.isVirtual,
        virtualLink: formData.isVirtual ? formData.virtualLink.trim() : null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        isPublic: formData.isPublic,
        requiresApproval: formData.requiresApproval,
        registrationStart: formData.registrationStart
          ? new Date(formData.registrationStart).toISOString()
          : null,
        registrationEnd: formData.registrationEnd
          ? new Date(formData.registrationEnd).toISOString()
          : null,
        category: formData.category,
        tags: formData.tags.filter(tag => tag.trim()),
        ticketTiers: formData.ticketTiers
          .filter(tier => tier.name?.trim())
          .map(tier => ({
            name: tier.name.trim(),
            price: Number(tier.price) || 0,
            capacity: tier.capacity ? Number(tier.capacity) : null,
            description: tier.description?.trim() || ""
          }))
      };

      await submitEventForm(eventData);
    } catch (error) {
      logger.error("Event creation failed:", error);
      
      // Avoid duplicate toasts - useFormSubmit already handles error display
      // Just ensure we're back on form step
      setCurrentStep("form");
    }
  }, [formData, submitEventForm]);

  // 🔄 Draft Actions
  const handleRestoreDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(() => ({
          ...initialFormData, // Start fresh, then merge saved data
          ...parsed,
          banner: null, // Don't restore file objects
          bannerPreview: null
        }));
        toast.success("📝 Draft restored successfully!");
      }
    } catch (error) {
      logger.error("Failed to restore draft:", error);
      toast.error("❌ Could not restore draft");
    }
    setShowRestoreModal(false);
  }, []);

  const handleDiscardDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setShowRestoreModal(false);
    toast.info("🗑️ Draft discarded");
  }, []);

  // 🧹 Reset Form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setNewTag("");
    setCurrentStep("form");
    localStorage.removeItem(DRAFT_KEY);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 🎨 Animation Variants
  const fadeInUp = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: prefersReducedMotion ? 0 : 0.4 }
  }), [prefersReducedMotion]);

  const staggerContainer = useMemo(() => ({
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 
                  dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 
                  py-8 px-4 sm:px-6 lg:px-8">
      
      {/* 🔄 Restore Draft Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 
                     bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-draft-title"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl 
                       shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 id="restore-draft-title" className="text-xl font-bold text-gray-900 dark:text-white">
                  Restore Draft?
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We found a previously saved event draft. Would you like to restore it or start fresh?
              </p>
              
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDiscardDraft}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                           font-medium transition-colors duration-200"
                >
                  Start Fresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestoreDraft}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 
                           text-white font-medium shadow-lg shadow-indigo-500/25 
                           transition-all duration-200"
                >
                  Restore Draft
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📋 Main Content */}
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 
                       bg-clip-text text-transparent mb-4">
            Create Your Event
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Fill in the details below and bring your event to life! ✨
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div variants={fadeInUp} className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              exportAttendeesToCSV(mockAttendees, "event-attendees.csv");
              toast.success("📥 CSV exported successfully!");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl 
                     bg-emerald-600 hover:bg-emerald-700 text-white font-medium 
                     shadow-lg shadow-emerald-500/25 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export Sample CSV
          </motion.button>
        </motion.div>

        {/* Guidelines Card */}
        <motion.div 
          variants={fadeInUp}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                   border border-gray-200 dark:border-gray-700 
                   shadow-xl rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Guidelines
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
            {[
              "Title: 3-200 characters, clear & catchy",
              "Description: Explain what attendees can expect",
              "Dates: Ensure end is after start",
              "Virtual/In-person: Provide correct details",
              "Tickets: Set clear pricing & capacity",
              "Tags: Add relevant keywords for discovery",
              "Banner: Max 5MB, eye-catching image",
              "Preview: Always review before publishing"
            ].map((guideline, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Form / Preview Toggle */}
        <AnimatePresence mode="wait">
          {currentStep === "form" ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => { e.preventDefault(); handlePreview(); }}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 sm:p-8 
                       border border-gray-200 dark:border-gray-700 space-y-6"
            >
              {/* Event Title */}
              <motion.div variants={fadeInUp}>
                <FormField 
                  label="Event Title" 
                  icon={FileText} 
                  error={errors.title} 
                  required
                  hint={`${formData.title.length}/${MAX_TITLE_LENGTH} characters`}
                >
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="React Summit 2026 • AI Hackathon • Tech Meetup"
                    maxLength={MAX_TITLE_LENGTH}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.title 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                    aria-invalid={!!errors.title}
                  />
                </FormField>
              </motion.div>

              {/* Event Banner */}
              <motion.div variants={fadeInUp}>
                <FormField label="Event Banner" icon={ImageIcon} error={errors.banner}>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="bannerUpload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                        aria-label="Upload event banner"
                      />
                      
                      <motion.label
                        htmlFor="bannerUpload"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 
                                 rounded-lg bg-gray-900 text-white font-medium 
                                 hover:bg-gray-800 transition-colors duration-200
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {formData.bannerPreview ? "Change Image" : "Choose File"}
                          </>
                        )}
                      </motion.label>

                      {formData.bannerPreview && (
                        <motion.button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, banner: null, bannerPreview: null }));
                            if (fileInputRef.current) fileInputRef.current.value = "";
                            toast.info("🗑️ Banner removed");
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg 
                                   text-red-600 hover:text-red-700 hover:bg-red-50 
                                   dark:hover:bg-red-900/20 font-medium text-sm 
                                   transition-colors duration-200"
                        >
                          <Trash2Icon className="w-4 h-4" />
                          Remove
                        </motion.button>
                      )}
                    </div>

                    {formData.banner && !isUploading && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        📁 {formData.banner.name} • {(formData.banner.size / 1024).toFixed(1)} KB
                      </p>
                    )}

                    <AnimatePresence>
                      {formData.bannerPreview && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl overflow-hidden border-2 border-dashed 
                                   border-gray-200 dark:border-gray-600"
                        >
                          <img
                            loading="lazy"
                            decoding="async"
                            src={formData.bannerPreview}
                            alt="Banner preview"
                            className="w-full h-48 sm:h-64 object-cover 
                                     transition-transform duration-300 hover:scale-[1.02]"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FormField>
              </motion.div>

              {/* Description with Character Counter */}
              <motion.div variants={fadeInUp}>
                <FormField 
                  label="Description" 
                  icon={ClipboardList} 
                  error={errors.description} 
                  required
                >
                  <div className="space-y-2">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your event: agenda, speakers, what attendees will learn..."
                      rows={4}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                               text-gray-900 dark:text-gray-100 focus:outline-none 
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               transition-all duration-200 resize-none ${
                                 errors.description 
                                   ? "border-red-500 focus:ring-red-500" 
                                   : "border-gray-300 dark:border-gray-600"
                               }`}
                      aria-invalid={!!errors.description}
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Pro tip: Be specific about value for attendees
                      </span>
                      <CharacterCounter 
                        current={formData.description.length} 
                        max={MAX_DESCRIPTION_LENGTH} 
                      />
                    </div>
                  </div>
                </FormField>
              </motion.div>

              {/* Category */}
              <motion.div variants={fadeInUp}>
                <FormField label="Category" icon={Layers} error={errors.category} required>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.category 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                    aria-invalid={!!errors.category}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </FormField>
              </motion.div>

              {/* Event Duration Toggle */}
              <motion.div variants={fadeInUp}>
                <FormField label="Event Duration" icon={Calendar}>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                    transition-colors duration-200 ${
                                      !formData.isMultiDay 
                                        ? "border-indigo-600 bg-indigo-600" 
                                        : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                                    }`}>
                        {!formData.isMultiDay && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="eventType"
                        checked={!formData.isMultiDay}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          isMultiDay: false,
                          startDate: "",
                          endDate: "",
                          date: "",
                          startTime: "",
                          endTime: ""
                        }))}
                        className="sr-only"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Single-day Event
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                                    transition-colors duration-200 ${
                                      formData.isMultiDay 
                                        ? "border-indigo-600 bg-indigo-600" 
                                        : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                                    }`}>
                        {formData.isMultiDay && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="eventType"
                        checked={formData.isMultiDay}
                        onChange={() => setFormData(prev => ({
                          ...prev,
                          isMultiDay: true,
                          date: "",
                          startDate: "",
                          endDate: "",
                          startTime: "",
                          endTime: ""
                        }))}
                        className="sr-only"
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Multi-day Event
                      </span>
                    </label>
                  </div>
                </FormField>
              </motion.div>

              {/* Date & Time Fields */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {formData.isMultiDay ? (
                  <>
                    <FormField label="Start Date" required error={errors.startDate}>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        min={todayString}
                        className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                                 text-gray-900 dark:text-gray-100 focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all duration-200 ${
                                   errors.startDate 
                                     ? "border-red-500 focus:ring-red-500" 
                                     : "border-gray-300 dark:border-gray-600"
                                 }`}
                      />
                    </FormField>
                    <FormField label="End Date" required error={errors.endDate}>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        min={formData.startDate || todayString}
                        className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                                 text-gray-900 dark:text-gray-100 focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all duration-200 ${
                                   errors.endDate 
                                     ? "border-red-500 focus:ring-red-500" 
                                     : "border-gray-300 dark:border-gray-600"
                                 }`}
                      />
                    </FormField>
                  </>
                ) : (
                  <FormField label="Event Date" required error={errors.date}>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={todayString}
                      className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                               text-gray-900 dark:text-gray-100 focus:outline-none 
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               transition-all duration-200 ${
                                 errors.date 
                                   ? "border-red-500 focus:ring-red-500" 
                                   : "border-gray-300 dark:border-gray-600"
                               }`}
                    />
                  </FormField>
                )}
                
                <FormField label="Start Time" required error={errors.startTime}>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.startTime 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                  />
                </FormField>
                <FormField label="End Time" required error={errors.endTime}>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.endTime 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                  />
                </FormField>
              </motion.div>

              {/* Virtual Event Toggle */}
              <motion.div variants={fadeInUp}>
                <label className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 
                                border border-gray-200 dark:border-gray-600 cursor-pointer 
                                hover:border-indigo-300 dark:hover:border-indigo-500 
                                transition-colors duration-200 group">
                  <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${
                    formData.isVirtual ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                      formData.isVirtual ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </div>
                  <input
                    type="checkbox"
                    name="isVirtual"
                    checked={formData.isVirtual}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      This is a virtual event
                    </span>
                  </div>
                </label>
              </motion.div>

              {/* Location / Virtual Link */}
              <AnimatePresence mode="wait">
                {formData.isVirtual ? (
                  <motion.div
                    key="virtual"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <FormField label="Virtual Event Link" icon={Link2} error={errors.virtualLink} required>
                      <input
                        type="url"
                        name="virtualLink"
                        value={formData.virtualLink}
                        onChange={handleInputChange}
                        placeholder="https://zoom.us/j/... • https://meet.google.com/..."
                        className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                                 text-gray-900 dark:text-gray-100 focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all duration-200 ${
                                   errors.virtualLink 
                                     ? "border-red-500 focus:ring-red-500" 
                                     : "border-gray-300 dark:border-gray-600"
                                 }`}
                      />
                    </FormField>
                  </motion.div>
                ) : (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <FormField label="Venue Name" icon={MapPin} error={errors.location} required>
                      <input
                        type="text"
                        name="location.name"
                        value={formData.location.name}
                        onChange={handleInputChange}
                        placeholder="Convention Center • Community Hall • Office Address"
                        className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                                 text-gray-900 dark:text-gray-100 focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-all duration-200 ${
                                   errors.location 
                                     ? "border-red-500 focus:ring-red-500" 
                                     : "border-gray-300 dark:border-gray-600"
                                 }`}
                      />
                    </FormField>

                    <FormField label="Full Address" icon={MapIcon}>
                      <input
                        type="text"
                        name="location.address"
                        value={formData.location.address}
                        onChange={handleInputChange}
                        placeholder="123 Tech Street, Innovation City, TC 12345"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                 focus:border-transparent transition-all duration-200"
                      />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Latitude (Optional)" icon={Navigation}>
                        <input
                          type="number"
                          name="location.coordinates.latitude"
                          value={formData.location.coordinates.latitude}
                          onChange={handleInputChange}
                          placeholder="40.7128"
                          step="any"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                   focus:border-transparent transition-all duration-200"
                        />
                      </FormField>
                      <FormField label="Longitude (Optional)" icon={Compass}>
                        <input
                          type="number"
                          name="location.coordinates.longitude"
                          value={formData.location.coordinates.longitude}
                          onChange={handleInputChange}
                          placeholder="-74.0060"
                          step="any"
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 
                                   focus:border-transparent transition-all duration-200"
                        />
                      </FormField>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Capacity */}
              <motion.div variants={fadeInUp}>
                <FormField label="Maximum Attendees" icon={Users} error={errors.capacity}>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    max={MAX_CAPACITY}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.capacity 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                  />
                </FormField>
              </motion.div>

              {/* Registration Window */}
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Registration Opens" icon={CalendarPlus}>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={formData.registrationStart}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 
                             focus:border-transparent transition-all duration-200"
                  />
                </FormField>
                <FormField label="Registration Closes" icon={CalendarX} error={errors.registrationEnd}>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={formData.registrationEnd}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-gray-100 focus:outline-none 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                             transition-all duration-200 ${
                               errors.registrationEnd 
                                 ? "border-red-500 focus:ring-red-500" 
                                 : "border-gray-300 dark:border-gray-600"
                             }`}
                  />
                </FormField>
              </motion.div>

              {/* Visibility & Approval */}
              <motion.div variants={fadeInUp} className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 
                                dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded 
                             focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Make this event public (discoverable in listings)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 
                                dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded 
                             focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Require approval for registrations
                  </span>
                </label>
              </motion.div>

              {/* Ticket Tiers */}
              <motion.div variants={fadeInUp} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Ticket Tiers
                    </h3>
                  </div>
                  <motion.button
                    type="button"
                    onClick={addTicketTier}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 
                             text-white text-sm font-medium hover:bg-indigo-700 
                             transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </motion.button>
                </div>

                <AnimatePresence mode="popLayout">
                  <div className="space-y-4">
                    {formData.ticketTiers.map((tier, index) => (
                      <TicketTierCard
                        key={index}
                        tier={tier}
                        index={index}
                        onChange={handleTicketTierChange}
                        onRemove={removeTicketTier}
                        canRemove={formData.ticketTiers.length > 1}
                        errors={errors}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              </motion.div>

              {/* Tags */}
              <motion.div variants={fadeInUp}>
                <FormField label="Tags" icon={TagIcon}>
                  <TagInput
                    tags={formData.tags}
                    onAdd={addTag}
                    onRemove={removeTag}
                    newTag={newTag}
                    setNewTag={setNewTag}
                  />
                </FormField>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={fadeInUp} className="pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r 
                           from-indigo-600 to-purple-600 text-white font-semibold p-4 
                           rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl 
                           hover:shadow-indigo-500/40 transition-all duration-300 
                           disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Preview Event
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Your progress is auto-saved locally ✨
                </p>
              </motion.div>
            </motion.form>
          ) : (
            /* Preview Step */
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Preview Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
                             bg-clip-text text-transparent mb-2">
                  Preview Your Event
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Review all details before publishing
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden 
                            border border-gray-200 dark:border-gray-700">
                {/* Banner */}
                {formData.bannerPreview && (
                  <div className="relative h-64 sm:h-80">
                    <img
                      loading="lazy"
                      src={formData.bannerPreview}
                      alt="Event banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full 
                                     bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                        {formData.isVirtual ? "🌐 Virtual Event" : "📍 In-Person"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Title & Category */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || "Untitled Event"}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg 
                                     bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 
                                     dark:text-indigo-300 text-sm font-medium">
                        {categories.find(c => c.value === formData.category)?.label || "Uncategorized"}
                      </span>
                      {formData.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 
                                               rounded-full bg-gray-100 dark:bg-gray-700 
                                               text-gray-700 dark:text-gray-300 text-xs">
                          #{tag}
                        </span>
                      ))}
                      {formData.tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{formData.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {formData.description || "No description provided."}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        icon: CalendarIcon,
                        label: "Date & Time",
                        value: formData.isMultiDay
                          ? `${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`
                          : formatDate(formData.date),
                        subValue: `${formatTime(formData.startTime)} - ${formatTime(formData.endTime)}`
                      },
                      {
                        icon: MapPinIcon,
                        label: "Location",
                        value: formData.isVirtual 
                          ? "Virtual Event" 
                          : formData.location.name || "Not specified",
                        subValue: !formData.isVirtual && formData.location.address
                      },
                      {
                        icon: UsersIcon,
                        label: "Capacity",
                        value: formData.capacity 
                          ? `${formData.capacity.toLocaleString()} attendees` 
                          : "Unlimited",
                        subValue: formData.isPublic ? "Public Event" : "Private Event"
                      },
                      {
                        icon: TicketIcon,
                        label: "Tickets",
                        value: formData.ticketTiers.filter(t => t.name).length > 0
                          ? `${formData.ticketTiers.filter(t => t.name).length} tier(s) available`
                          : "Free / No tiers set",
                        subValue: formData.requiresApproval && "Approval required"
                      }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl 
                                            bg-gray-50 dark:bg-gray-700/50">
                        <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                          <p className="text-gray-900 dark:text-white font-semibold">{item.value}</p>
                          {item.subValue && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.subValue}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Tiers Preview */}
                  {formData.ticketTiers.filter(t => t.name).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <TicketIcon className="w-4 h-4 text-indigo-600" />
                        Available Tickets
                      </h4>
                      <div className="space-y-2">
                        {formData.ticketTiers.filter(t => t.name).map((tier, i) => (
                          <div key={i} className="flex justify-between items-center p-3 
                                                rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{tier.name}</p>
                              {tier.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {tier.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                ₹{Number(tier.price).toFixed(2)}
                              </p>
                              {tier.capacity && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {tier.capacity} spots
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warning for Approval */}
                  {formData.requiresApproval && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 
                                  border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-3">
                        <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="text-amber-800 dark:text-amber-200 font-medium">
                          Registrations will require manual approval before confirmation
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setCurrentStep("form")}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 
                           px-6 py-3 rounded-xl border-2 border-indigo-500 text-indigo-600 
                           dark:text-indigo-400 font-semibold hover:bg-indigo-50 
                           dark:hover:bg-indigo-900/20 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PencilIcon className="w-5 h-5" />
                  Edit Details
                </motion.button>

                <LoadingButton
                  onClick={createEvent}
                  isLoading={isSubmitting}
                  loadingText="Creating Event..."
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 
                           px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                           text-white font-semibold shadow-lg shadow-indigo-500/25 
                           hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300
                           disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {isSubmitting ? "Publishing..." : "Publish Event"}
                </LoadingButton>
              </div>

              {/* Error Display */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 
                           dark:border-red-800 text-red-800 dark:text-red-200 text-center"
                  role="alert"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircleIcon className="w-5 h-5" />
                    <span>{submitError}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Section */}
        <motion.div 
          variants={fadeInUp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12"
        >
          {[
            { number: "10k+", label: "Events Created", icon: CalendarIcon, color: "indigo" },
            { number: "500k+", label: "Happy Attendees", icon: UsersIcon, color: "emerald" },
            { number: "98%", label: "Success Rate", icon: CheckCircleIcon, color: "purple" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                       border border-gray-200 dark:border-gray-700 rounded-xl p-5 
                       text-center shadow-lg"
            >
              <stat.icon className={`w-8 h-8 mx-auto mb-3 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.number}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EventCreation;
