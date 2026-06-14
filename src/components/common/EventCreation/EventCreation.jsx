import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Download, Calendar, Globe, Link2, Plus } from "lucide-react";
import { logger } from "../../../utils/logger";
import useReducedMotion from "../../../hooks/useReducedMotion";
import TicketsStep from "./components/TicketsStep";
import GeneralInfoStep from "./components/GeneralInfoStep";
import { exportAttendeesToCSV } from "../../../utils/exportCsv";
import PreviewStep from "./components/PreviewStep";
import RestoreDraftModal from "./components/RestoreDraftModal";
import GuidelinesSection from "./components/GuidelinesSection";
import EventDurationSelector from "./components/EventDurationSelector";
import DateTimeFields from "./components/DateTimeFields";
import LocationFields from "./components/LocationFields";
import RegistrationDatesFields from "./components/RegistrationDatesFields";
import TagsInput from "./components/TagsInput";
import StatsSection from "./components/StatsSection";
// import { useAutoSaveDraft } from "../../../hooks/useAutoSaveDraft";
import { formatDraftAge } from "../../../utils/eventDraftUtils";
import {
  DRAFT_KEY,
  CREATION_STEPS,
  categories,
  mockAttendees,
  initialFormData,
  todayString,
} from "../../../constants/eventDefaults";
import {
  TagIcon,
} from "@heroicons/react/24/solid";
import { API_ENDPOINTS, apiUtils } from "../../../config/api";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
import { validateCoordinates } from "../../../utils/eventCreationUtils";
import { validateForm } from "../../../utils/eventFormValidation";
import { safeJsonParse } from "../../../utils/safeJsonParse";

const extractCoordinates = (locationObj) => {
  if (!locationObj) return null;
  if (!locationObj.coordinates) return null;
  if (locationObj.coordinates.latitude && locationObj.coordinates.longitude) {
    return validateCoordinates(locationObj.coordinates.latitude, locationObj.coordinates.longitude);
  }
  return null;
};

const parseEventDates = (formData) => {
  const dateVal = formData.isMultiDay ? formData.startDate : formData.date;
  const endVal = formData.isMultiDay ? formData.endDate : formData.date;
  const eventStartDate = new Date(`${dateVal}T${formData.startTime}`);
  const eventEndDate = new Date(`${endVal}T${formData.endTime}`);

  if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
    throw new Error("Invalid date or time format");
  }

  return { eventStartDate, eventEndDate };
};

const formatLocation = (formData, coordinates) => {
  if (formData.isVirtual) return null;
  return {
    name: formData.location.name.trim(),
    address: formData.location.address?.trim() || "",
    coordinates: coordinates,
  };
};

const formatTicketTiers = (tiers) => {
  if (!tiers) return [];
  return tiers
    .filter((tier) => tier.name.trim())
    .map((tier) => ({
      name: tier.name.trim(),
      price: Number(tier.price) || 0,
      capacity: tier.capacity ? Number(tier.capacity) : null,
      description: tier.description?.trim() || "",
    }));
};

const generateEventDataPayload = (formData) => {
  const coordinates = extractCoordinates(formData.location);
  const { eventStartDate, eventEndDate } = parseEventDates(formData);

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    startDate: eventStartDate.toISOString(),
    endDate: eventEndDate.toISOString(),
    timezone: formData.timezone,
    location: formatLocation(formData, coordinates),
    isVirtual: formData.isVirtual,
    virtualLink: formData.isVirtual ? formData.virtualLink.trim() : null,
    capacity: formData.capacity ? Number(formData.capacity) : null,
    isPublic: formData.isPublic,
    requiresApproval: formData.requiresApproval,
    registrationStart: formData.registrationStart ? new Date(formData.registrationStart).toISOString() : null,
    registrationEnd: formData.registrationEnd ? new Date(formData.registrationEnd).toISOString() : null,
    category: formData.category,
    tags: Array.isArray(formData.tags) ? formData.tags.filter((t) => t.trim()) : [],
    ticketTiers: formatTicketTiers(formData.ticketTiers),
  };
};

const getErrorMessage = (error) => {
  const backendMessage = error.response?.data?.message || error.response?.data?.error;
  if (backendMessage) return `Failed to create event. ${backendMessage}`;
  if (error.message && error.message.includes("Invalid date")) return "Failed to create event. Please check your date and time values.";
  return `Failed to create event. ${error.message || "Please try again."}`;
};

const getDraftMessage = (saved, isDuplicateDraft) => {
  if (isDuplicateDraft) {
    return "A duplicated event draft is ready. Would you like to restore it and continue editing?";
  }
  try {
    const parsed = safeJsonParse(saved, {});
    if (parsed?.savedAt) {
      return `A previously saved event draft was found (saved ${formatDraftAge(parsed.savedAt)}). Would you like to restore it?`;
    }
  } catch {
    // Keep default message
  }
  return "A previously saved event draft was found. Would you like to restore it?";
};

const useDraftManager = (formData, setFormData) => {
  const location = useLocation();
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [restoreDraftMessage, setRestoreDraftMessage] = useState(
    "A previously saved event draft was found. Would you like to restore it?"
  );

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      setShowRestoreModal(true);
      setRestoreDraftMessage(getDraftMessage(saved, location.state?.duplicateDraft));
    }
    setIsDraftLoaded(true);
  }, [location.state]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = safeJsonParse(saved, {});
        const restoredData = parsed?.data || parsed;
        setFormData((prev) => ({
          ...prev,
          ...restoredData,
          banner: null,
          bannerPreview: null,
        }));
        toast.success("Draft restored successfully!");
      }
    } catch (error) {
      logger.error(error);
    }
    setShowRestoreModal(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setShowRestoreModal(false);
    toast.info("Saved draft discarded.");
  };

  useEffect(() => {
    if (!isDraftLoaded) return;
    const timer = setTimeout(() => {
      const saveable = { ...formData };
      delete saveable.banner;
      delete saveable.bannerPreview;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ data: saveable, savedAt: new Date().toISOString() })
      );
      setLastSavedAt(new Date().toISOString());
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, isDraftLoaded]);

  return { showRestoreModal, restoreDraftMessage, handleRestoreDraft, handleDiscardDraft };
};

const useUnsavedChanges = (formData) => {
  useEffect(() => {
    const hasUnsavedChanges = Object.entries(formData).some(([key, value]) => {
      if (key === "banner" || key === "bannerPreview") return false;
      if (typeof value === "string") return value.trim() !== "";
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "object" && value !== null) return JSON.stringify(value) !== "{}";
      return Boolean(value);
    });

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);
};

const useEventFormHandlers = (formData, setFormData, errors, setErrors, newTag, setNewTag, currentStep, setCurrentStep, submitEventForm) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("location.coordinates.")) {
      const coordField = name.split(".")[2];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, coordinates: { ...prev.location.coordinates, [coordField]: value } },
      }));
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
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

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, banner: file, bannerPreview: event.target.result }));
      if (errors.banner) {
        setErrors((prev) => ({ ...prev, banner: "" }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleNext = () => {
    try {
      if (currentStep === CREATION_STEPS.FORM) {
        const newErrors = validateForm(formData);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
          toast.error("Please fix the form errors before continuing.");
          return;
        }
        setCurrentStep(CREATION_STEPS.PREVIEW);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      logger.error("Error progressing to next step:", error);
      toast.error("Unable to continue to the next step.");
    }
  };

  const createEvent = () => {
    try {
      const eventData = generateEventDataPayload(formData);
      submitEventForm(eventData);
    } catch (error) {
      logger.error("Error creating event:", error);
      toast.error(getErrorMessage(error));
      setCurrentStep(CREATION_STEPS.FORM);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    localStorage.removeItem(DRAFT_KEY);
    setNewTag("");
    setCurrentStep(CREATION_STEPS.FORM);
  };

  const handleDurationChange = (isMultiDay) => {
    setFormData((prev) => ({
      ...prev,
      isMultiDay,
      date: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    }));
    setErrors({});
  };

  return {
    handleInputChange,
    handleImageUpload,
    addTag,
    removeTag,
    handleNext,
    createEvent,
    resetForm,
    handleDurationChange
  };
};

const useSubmitEventCreation = () => {
  return useFormSubmit(async (eventData) => {
    if (!API_ENDPOINTS.EVENTS.CREATE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }
    const response = await apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    const result = response.data;
    if (!(response.status === 200 && result.success)) {
      throw new Error(result.message || result.error || `Server error: ${response.status}`);
    }
  });
};

const EventFormContent = ({
  formData,
  setFormData,
  errors,
  setErrors,
  handleInputChange,
  handleImageUpload,
  prefersReducedMotion,
  handleDurationChange,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  handleNext,
}) => (
  <>
    <div className="w-full max-w-4xl flex justify-end mb-6">
      <button
        onClick={() => {
          exportAttendeesToCSV(mockAttendees, "event-attendees.csv");
          toast.success("CSV exported successfully!");
        }}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
      >
        <Download size={18} />
        Download CSV
      </button>
    </div>

    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
      className="text-center mb-10"
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 dark:text-indigo-300 mb-4">
        Create Your Event
      </h1>
      <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
        Fill in the details below and bring your event to life!
      </p>
    </motion.div>

    <GuidelinesSection prefersReducedMotion={prefersReducedMotion} />

    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
      className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-indigo-300 dark:border-gray-700"
    >
      <div className="space-y-6">
        <GeneralInfoStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          prefersReducedMotion={prefersReducedMotion}
          categories={categories}
        />

        <EventDurationSelector
          isMultiDay={formData.isMultiDay}
          onChange={handleDurationChange}
        />

        <DateTimeFields
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
          prefersReducedMotion={prefersReducedMotion}
          todayString={todayString}
        />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isVirtual"
              checked={formData.isVirtual}
              onChange={handleInputChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <Globe className="w-5 h-5 text-indigo-500 inline-block" />
            This is a virtual event
          </label>
        </motion.div>

        {formData.isVirtual ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Link2 className="w-5 h-5 text-indigo-500 inline-block mr-2" />
              Virtual Event Link <span className="text-red-600">*</span>
            </label>
            <input
              type="url"
              name="virtualLink"
              value={formData.virtualLink}
              onChange={handleInputChange}
              placeholder="https://zoom.us/j/..."
              className={`w-full border ${
                errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
            />
            {errors.virtualLink && (
              <span className="text-red-500 text-sm mt-1">{errors.virtualLink}</span>
            )}
          </motion.div>
        ) : (
          <LocationFields
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            prefersReducedMotion={prefersReducedMotion}
          />
        )}

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maximum Attendees
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Leave empty for unlimited (max: 100,000)"
            min="1"
            max="100000"
            className={`w-full border ${errors.capacity ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
          />
          {errors.capacity && <span className="text-red-500 text-sm mt-1">{errors.capacity}</span>}
        </motion.div>

        <RegistrationDatesFields
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            Make this event public
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleInputChange}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            Require approval for registration
          </label>
        </motion.div>

        <TicketsStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
        />

        <TagsInput
          tags={formData.tags}
          newTag={newTag}
          onNewTagChange={setNewTag}
          onAdd={addTag}
          onRemove={removeTag}
        />

        <motion.button
          type="button"
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 bg-black text-white font-semibold p-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all duration-300"
        >
          Preview Event
        </motion.button>
      </div>
    </motion.div>

    <StatsSection />
  </>
);

const EventCreation = () => {
  const prefersReducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(CREATION_STEPS.FORM);

  const {
    handleSubmit: submitEventForm,
    isSubmitting,
    error: submitError,
    success: submitSuccess,
  } = useSubmitEventCreation();

  useEffect(() => {
    if (submitSuccess) {
      toast.success("Event created successfully!");
      resetForm();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [submitSuccess]);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState("");
  const {
    showRestoreModal,
    restoreDraftMessage,
    handleRestoreDraft,
    handleDiscardDraft
  } = useDraftManager(formData, setFormData);

  useUnsavedChanges(formData);

  const {
    handleInputChange,
    handleImageUpload,
    addTag,
    removeTag,
    handleNext,
    createEvent,
    resetForm,
    handleDurationChange
  } = useEventFormHandlers(formData, setFormData, errors, setErrors, newTag, setNewTag, currentStep, setCurrentStep, submitEventForm);



  return (
    <div className="min-h-screen bg-linear-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RestoreDraftModal
        isOpen={showRestoreModal}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        message={restoreDraftMessage}
      />


      {currentStep === CREATION_STEPS.FORM ? (
        <EventFormContent
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          setErrors={setErrors}
          handleInputChange={handleInputChange}
          handleImageUpload={handleImageUpload}
          prefersReducedMotion={prefersReducedMotion}
          handleDurationChange={handleDurationChange}
          newTag={newTag}
          setNewTag={setNewTag}
          addTag={addTag}
          removeTag={removeTag}
          handleNext={handleNext}
        />
      ) : (
        <PreviewStep
          formData={formData}
          categories={categories}
          submitError={submitError}
          isSubmitting={isSubmitting}
          createEvent={createEvent}
          setCurrentStep={setCurrentStep}
        />
      )}
    </div>
  );
};

export default EventCreation;
