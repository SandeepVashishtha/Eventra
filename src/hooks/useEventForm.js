import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../config/api";
import { eventService } from "../services/eventService";
import { useFormSubmit } from "./useFormSubmit";
import {
  DRAFT_KEY,
  initialFormData,
} from "../constants/eventDefaults";
import {
  parseTimeToMinutes,
} from "../utils/eventCreationUtils";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { logger } from "../utils/logger";
import { useAuth } from "../context/AuthContext";
import { safeJsonParse } from "../utils/safeJsonParse";
import { getOrMigrateKey } from "../utils/storageKeyManager";

// 🎯 Constants for better maintainability
const MAX_CAPACITY = 100000;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 200;
const DEBOUNCE_DELAY = 1000;

/**
 * @hook useEventForm
 *
 * @description
 * Manages all state and business logic for the event-creation form. Extracted
 * from the EventCreation monolith so the form UI remains a pure presentational
 * component. Internally orchestrates four distinct concerns:
 *
 * **1. Form state**
 * Initialises from `initialFormData` (see `src/constants/eventDefaults.js`).
 * Flat fields are updated via `handleInputChange`; nested objects (e.g.
 * `location.coordinates.lat`) via either dot-notation names in
 * `handleInputChange` or the explicit `handleNestedChange` helper. Checkbox
 * inputs are handled automatically via `e.target.checked`.
 *
 * **2. Draft persistence**
 * Drafts are saved to `localStorage` under a user-scoped key
 * (`<DRAFT_KEY>_<userId>`, falling back to `<DRAFT_KEY>_guest` when
 * unauthenticated). Saves are debounced by `DEBOUNCE_DELAY` (1 s) to avoid
 * thrashing storage on every keystroke. `banner` and `bannerPreview` are
 * intentionally excluded from the draft — File objects cannot be serialised
 * and must be re-selected after a page reload. On mount (after a 300 ms
 * delay), the hook checks for an existing draft and surfaces
 * `showRestoreModal` when one is found; the consumer decides whether to call
 * `handleRestoreDraft` or `handleDiscardDraft`.
 *
 * **3. Validation**
 * `validateForm` reads from `formDataRef` (a ref kept in sync with state) so
 * it never captures a stale closure. It populates `errors` with field-level
 * messages and returns `true` only when the form is fully valid. Constraints
 * include: title length (3–200 chars), HTTPS-only virtual links, positive
 * capacity ≤ 100 000, non-negative ticket-tier prices, and date/time ordering
 * for both single-day and multi-day events.
 *
 * **4. Submission**
 * Delegates to `useFormSubmit`, which handles loading / error / success state.
 * Before the API call the description is passed through `sanitizeHtml` to
 * strip unsafe markup. When `API_ENDPOINTS.EVENTS.CREATE` is falsy the hook
 * falls back to a mock response (useful for local dev without a backend).
 * The API is expected to return `{ success: true, ... }`; any other shape
 * throws so `useFormSubmit` can surface the error.
 *
 * @requires {AuthContext} useAuth — reads `user.id` to scope the draft key.
 *
 * @example
 * ```jsx
 * import { useEventForm } from "../hooks/useEventForm";
 *
 * const EventCreation = () => {
 *   const {
 *     formData,
 *     errors,
 *     isSubmitting,
 *     showRestoreModal,
 *     handleInputChange,
 *     handleNestedChange,
 *     validateForm,
 *     submitEventForm,
 *     handleRestoreDraft,
 *     handleDiscardDraft,
 *     resetForm,
 *   } = useEventForm();
 *
 *   const onSubmit = async (e) => {
 *     e.preventDefault();
 *     if (!validateForm()) return;          // populates errors, returns false
 *     await submitEventForm(formData);      // handles loading + API call
 *   };
 *
 *   return (
 *     <>
 *       {showRestoreModal && (
 *         <DraftModal
 *           onRestore={handleRestoreDraft}
 *           onDiscard={handleDiscardDraft}
 *         />
 *       )}
 *       <form onSubmit={onSubmit}>
 *         <input
 *           name="title"
 *           value={formData.title}
 *           onChange={handleInputChange}
 *         />
 *         {errors.title && <span>{errors.title}</span>}
 *         {/* …other fields… *\/}
 *         <button type="submit" disabled={isSubmitting}>
 *           {isSubmitting ? "Creating…" : "Create Event"}
 *         </button>
 *       </form>
 *     </>
 *   );
 * };
 * ```
 *
 * @returns {object} Form interface — see property descriptions below.
 *
 * // ── State ──────────────────────────────────────────────────────────────────
 *
 * @returns {object}   formData              - Current form values, shaped as
 *                                            `initialFormData`. Treat as
 *                                            read-only; mutate only through
 *                                            the provided handlers.
 * @returns {Function} setFormData           - Direct state setter. Prefer the
 *                                            named handlers; use this only for
 *                                            bulk updates (e.g. resetting
 *                                            specific fields after an API
 *                                            error).
 * @returns {object}   errors                - Field-level validation errors
 *                                            keyed by field name (e.g.
 *                                            `errors.title`, `errors.endTime`,
 *                                            `errors.ticketTier_0_price`).
 *                                            Empty object when the form is
 *                                            error-free.
 * @returns {Function} setErrors             - Direct errors setter. Use to
 *                                            inject server-side errors returned
 *                                            after submission.
 * @returns {string}   newTag                - Current value of the tag input
 *                                            field (controlled).
 * @returns {Function} setNewTag             - Setter for `newTag`.
 * @returns {boolean}  showRestoreModal      - `true` when a saved draft is
 *                                            detected on mount and the user has
 *                                            not yet decided whether to restore
 *                                            or discard it.
 * @returns {Function} setShowRestoreModal   - Setter for `showRestoreModal`.
 *                                            Call with `false` to dismiss the
 *                                            modal programmatically without
 *                                            taking any draft action.
 * @returns {boolean}  isUploading           - External upload-in-progress flag.
 *                                            The hook exposes the setter but
 *                                            does not set it internally; the
 *                                            consumer is responsible for
 *                                            toggling it around image uploads
 *                                            that go through a separate service.
 * @returns {Function} setIsUploading        - Setter for `isUploading`.
 *
 * // ── Submission state (from useFormSubmit) ──────────────────────────────────
 *
 * @returns {boolean}       isSubmitting  - `true` while the create-event API
 *                                         call is in flight.
 * @returns {string|null}   submitError   - Error message from the last failed
 *                                         submission, or `null`.
 * @returns {boolean}       submitSuccess - `true` after a successful
 *                                         submission. Reset to `false` on the
 *                                         next call.
 * @returns {Function}      submitEventForm - Async function that sanitises the
 *                                         description, calls the create-event
 *                                         endpoint, and updates `isSubmitting`
 *                                         / `submitError` / `submitSuccess`.
 *                                         Signature: `(formData: object) =>
 *                                         Promise<void>`.
 *
 * // ── Validation ─────────────────────────────────────────────────────────────
 *
 * @returns {Function} validateForm - Validates the current form state, updates
 *                                   `errors`, and returns `true` if valid.
 *                                   Reads from a ref so it is safe to call
 *                                   inside async callbacks without stale-
 *                                   closure concerns. Signature: `() =>
 *                                   boolean`.
 *
 * // ── Form helpers ───────────────────────────────────────────────────────────
 *
 * @returns {Function} resetForm         - Resets `formData` to `initialFormData`,
 *                                        clears `errors`, and removes the
 *                                        current user's draft from localStorage.
 * @returns {Function} handleInputChange - Standard `onChange` handler for
 *                                        `<input>`, `<textarea>`, and
 *                                        `<select>` elements. Supports
 *                                        dot-notation `name` attributes for
 *                                        nested paths up to two levels deep
 *                                        (e.g. `name="location.city"`,
 *                                        `name="location.coordinates.lat"`).
 *                                        Automatically clears the corresponding
 *                                        `errors` entry on change. Signature:
 *                                        `(e: ChangeEvent) => void`.
 * @returns {Function} handleNestedChange - Updates a single field inside a
 *                                        named sub-object of `formData`.
 *                                        Clears the parent-level error key.
 *                                        Signature: `(category: string, field:
 *                                        string, value: any) => void`.
 *
 * // ── Tag management ─────────────────────────────────────────────────────────
 *
 * @returns {Function} addTag    - Trims, lowercases, and strips non-alphanumeric
 *                                characters from `newTag`, then appends it to
 *                                `formData.tags` if not already present, and
 *                                resets `newTag` to `""`. No-ops on empty or
 *                                duplicate values. Signature: `() => void`.
 * @returns {Function} removeTag - Removes a tag by value from `formData.tags`.
 *                                Signature: `(tag: string) => void`.
 *
 * // ── Ticket tiers ───────────────────────────────────────────────────────────
 *
 * @returns {Function} addTicketTier    - Appends a blank tier
 *                                       `{ id, name, price, capacity,
 *                                       description }` to
 *                                       `formData.ticketTiers`. Uses
 *                                       `Date.now()` as the tier id.
 *                                       Signature: `() => void`.
 * @returns {Function} removeTicketTier - Removes the tier at the given index.
 *                                       Signature: `(index: number) => void`.
 * @returns {Function} updateTicketTier - Updates a single field on the tier at
 *                                       `index`. Signature: `(index: number,
 *                                       field: string, value: any) => void`.
 *
 * // ── Draft management ───────────────────────────────────────────────────────
 *
 * @returns {Function} handleRestoreDraft - Merges the stored draft into
 *                                         `formData`, nulls out `banner` and
 *                                         `bannerPreview` (not serialisable),
 *                                         shows a success toast, and closes
 *                                         the restore modal. Signature:
 *                                         `() => void`.
 * @returns {Function} handleDiscardDraft - Removes the draft from localStorage
 *                                         and closes the restore modal without
 *                                         changing `formData`. Signature:
 *                                         `() => void`.
 *
 * // ── Derived state ──────────────────────────────────────────────────────────
 *
 * @returns {boolean}  hasUnsavedChanges - `true` when any field (excluding
 *                                        `banner` / `bannerPreview`) differs
 *                                        from `initialFormData`. Drives the
 *                                        `beforeunload` warning so users do
 *                                        not accidentally lose work.
 *
 * // ── Image upload ───────────────────────────────────────────────────────────
 *
 * @returns {Function} handleImageUpload - `onChange` handler for the banner
 *                                        `<input type="file">`. Validates MIME
 *                                        type (JPEG, PNG, WebP, GIF) and size
 *                                        (≤ 5 MB), then reads the file as a
 *                                        data-URL and stores both the raw
 *                                        `File` (`formData.banner`) and the
 *                                        preview string
 *                                        (`formData.bannerPreview`). Sets
 *                                        `errors.banner` on failure. Signature:
 *                                        `(e: ChangeEvent<HTMLInputElement>) =>
 *                                        void`.
 */
export const useEventForm = () => {
  const { user } = useAuth();
  const legacyKey = `${DRAFT_KEY}_${user?.id || "guest"}`;
  const scopedDraftKey = getOrMigrateKey(DRAFT_KEY, user?.id, legacyKey);
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
    const sanitized = {
      ...eventData,
      description: sanitizeHtml(eventData.description || ""),
    };
    if (!API_ENDPOINTS.EVENTS.CREATE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: "mock-event-id", success: true };
    }

    const response = await eventService.createEvent(sanitized);
    const result = response.data;

    if (!(response.status === 200 && result?.success)) {
      const errorMessage = result?.message || result?.error || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }

    resetForm();
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
  }, [scopedDraftKey]);

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
  }, [formData, isDraftLoaded, scopedDraftKey]);

  // 🔍 Validation Logic

  /**
   * Returns today's date string in YYYY-MM-DD format (local time) — used
   * as the `min` attribute on date pickers and for past-date comparisons.
   */
  const getTodayDateString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    const data = formDataRef.current;
    const todayStr = getTodayDateString();

    const title = data.title?.trim();
    if (!title) {
      newErrors.title = "Event title is required";
    } else if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`;
    }

    if (!data.description?.trim()) newErrors.description = "Event description is required";
    if (!data.category) newErrors.category = "Please select a category";

    if (data.isMultiDay) {
      if (!data.startDate) {
        newErrors.startDate = "Start date is required";
      } else if (data.startDate < todayStr) {
        newErrors.startDate = "Event date cannot be in the past";
      }
      if (!data.endDate) {
        newErrors.endDate = "End date is required";
      } else if (data.endDate < todayStr) {
        newErrors.endDate = "Event date cannot be in the past";
      } else if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    } else {
      if (!data.date) {
        newErrors.date = "Event date is required";
      } else if (data.date < todayStr) {
        newErrors.date = "Event date cannot be in the past";
      }
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
    if (data.isVirtual) {
      const link = data.virtualLink?.trim();
      if (!link) {
        newErrors.virtualLink = "Virtual link is required for online events";
      } else if (!/^https:\/\//i.test(link)) {
        newErrors.virtualLink = "Virtual link must use HTTPS protocol";
      }
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

  /**
   * validateField — validates a single named field on blur and merges the
   * result into `errors`.  Supports the same field names used by validateForm.
   * Called by `handleFieldBlur` which form inputs wire up to their `onBlur`.
   */
  const validateField = useCallback((fieldName, value) => {
    const data = formDataRef.current;
    const todayStr = getTodayDateString();
    let fieldError = "";

    switch (fieldName) {
      case "title": {
        const title = (value ?? data.title)?.trim();
        if (!title) fieldError = "Event title is required";
        else if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH)
          fieldError = `Title must be between ${MIN_TITLE_LENGTH} and ${MAX_TITLE_LENGTH} characters`;
        break;
      }
      case "description":
        if (!(value ?? data.description)?.trim()) fieldError = "Event description is required";
        break;
      case "category":
        if (!(value ?? data.category)) fieldError = "Please select a category";
        break;
      case "date": {
        const date = value ?? data.date;
        if (!date) fieldError = "Event date is required";
        else if (date < todayStr) fieldError = "Event date cannot be in the past";
        break;
      }
      case "startDate": {
        const startDate = value ?? data.startDate;
        if (!startDate) fieldError = "Start date is required";
        else if (startDate < todayStr) fieldError = "Event date cannot be in the past";
        break;
      }
      case "endDate": {
        const endDate = value ?? data.endDate;
        if (!endDate) fieldError = "End date is required";
        else if (endDate < todayStr) fieldError = "Event date cannot be in the past";
        else if (data.startDate && new Date(endDate) < new Date(data.startDate))
          fieldError = "End date must be after start date";
        break;
      }
      case "startTime":
        if (!(value ?? data.startTime)) fieldError = "Start time is required";
        break;
      case "endTime": {
        const endTime = value ?? data.endTime;
        if (!endTime) {
          fieldError = "End time is required";
        } else if (data.startTime && !data.isMultiDay) {
          const startMin = parseTimeToMinutes(data.startTime);
          const endMin = parseTimeToMinutes(endTime);
          if (startMin >= endMin) fieldError = "End time must be after start time";
        }
        break;
      }
      case "location": {
        if (!data.isVirtual && !(value ?? data.location?.name)?.trim())
          fieldError = "Location name is required for in-person events";
        break;
      }
      case "virtualLink": {
        const link = (value ?? data.virtualLink)?.trim();
        if (data.isVirtual) {
          if (!link) fieldError = "Virtual link is required for online events";
          else if (!/^https:\/\//i.test(link)) fieldError = "Virtual link must use HTTPS protocol";
        }
        break;
      }
      default:
        break;
    }

    setErrors((prev) => {
      if (!fieldError) {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      }
      return { ...prev, [fieldName]: fieldError };
    });
  }, []);

  /**
   * handleFieldBlur — standard `onBlur` handler to wire to any <input> /
   * <select> / <textarea>.  Reads the field name from `e.target.name` and
   * delegates to validateField.
   */
  const handleFieldBlur = useCallback((e) => {
    const { name, value } = e.target;
    if (name) validateField(name, value);
  }, [validateField]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    localStorage.removeItem(scopedDraftKey);
  }, [scopedDraftKey]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("location.coordinates.")) {
      const coordField = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: {
            ...prev.location.coordinates,
            [coordField]: value,
          },
        },
      }));
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const newErrs = { ...prev };
      delete newErrs[name];
      return newErrs;
    });
  }, []);

  const handleNestedChange = useCallback((category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    setErrors((prev) => {
      if (!prev[category]) return prev;
      const newErrs = { ...prev };
      delete newErrs[category];
      return newErrs;
    });
  }, []);

  const addTag = useCallback(() => {
    const tag = newTag.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!tag) return;
    setFormData((prev) => {
      if (prev.tags.includes(tag)) return prev;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    setNewTag("");
  }, [newTag]);

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
        setFormData((prev) => ({ ...prev, ...safeJsonParse(saved, {}), banner: null, bannerPreview: null }));
        toast.success("Draft restored successfully!");
      }
    } catch (error) {
      logger.error("Failed to restore draft:", error);
    } finally {
      setShowRestoreModal(false);
    }
  }, [scopedDraftKey]);

  const handleDiscardDraft = useCallback(() => {
    localStorage.removeItem(scopedDraftKey);
    setShowRestoreModal(false);
  }, [scopedDraftKey]);

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

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, banner: "Please upload a valid image file (JPG, PNG, GIF, or WebP)" }));
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, banner: "Image size should be less than 5MB" }));
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setFormData((prev) => {
      if (prev.bannerPreview && prev.bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(prev.bannerPreview);
      }
      return { ...prev, banner: file, bannerPreview: objectUrl };
    });
    setErrors((prev) => ({ ...prev, banner: "" }));
  }, []);

  // Browser guard for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Cleanup ObjectURLs on unmount
  useEffect(() => {
    return () => {
      const preview = formDataRef.current?.bannerPreview;
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, []);

  /**
   * isFormValid — true when the errors object is empty AND all required
   * fields have been touched / filled.  Used to disable the submit button
   * before the user has attempted any submission.
   */
  const isFormValid = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    const data = formData;
    const todayStr = getTodayDateString();
    if (!data.title?.trim() || data.title.trim().length < MIN_TITLE_LENGTH) return false;
    if (!data.description?.trim()) return false;
    if (!data.category) return false;
    if (data.isMultiDay) {
      if (!data.startDate || data.startDate < todayStr) return false;
      if (!data.endDate || data.endDate < todayStr) return false;
    } else {
      if (!data.date || data.date < todayStr) return false;
    }
    if (!data.startTime || !data.endTime) return false;
    if (!data.isVirtual && !data.location?.name?.trim()) return false;
    if (data.isVirtual && !data.virtualLink?.trim()) return false;
    return true;
  }, [formData, errors]);

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
    validateField,
    handleFieldBlur,
    isFormValid,
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
    handleImageUpload,
  };
};