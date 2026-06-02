import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Download } from "lucide-react";
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
import {
  DRAFT_KEY,
  CREATION_STEPS,
  categories,
  mockAttendees,
  initialFormData,
  todayString,
} from "../../../constants/eventDefaults";
import { API_ENDPOINTS, apiUtils } from "../../../config/api";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
import { validateCoordinates } from "../../../utils/eventCreationUtils";
import { validateForm } from "../../../utils/eventFormValidation";

const EventCreation = () => {
  const prefersReducedMotion = useReducedMotion();

  const [currentStep, setCurrentStep] = useState(CREATION_STEPS.FORM);

  const { handleSubmit: submitEventForm, isSubmitting, error: submitError, success: submitSuccess } = useFormSubmit(async (eventData) => {
    if (!API_ENDPOINTS.EVENTS.CREATE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }

    const response = await apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
    const result = response.data;

    if (!(response.status === 200 && result.success)) {
      const errorMessage = result.message || result.error || `Server error: ${response.status}`;
      throw new Error(errorMessage);
    }
  });

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
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const handleInputChange = (e) => {
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          banner: "Image size should be less than 5MB",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          banner: file,
          bannerPreview: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
      if (errors.banner) {
        setErrors((prev) => ({ ...prev, banner: "" }));
      }
    }
  };

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !formData.tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
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

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (error) {
      logger.error("Error progressing to next step:", error);
      toast.error("Unable to continue to the next step.");
    }
  };

  const createEvent = () => {
    try {
      let coordinates = null;
      if (
        formData.location?.coordinates?.latitude &&
        formData.location?.coordinates?.longitude
      ) {
        coordinates = validateCoordinates(
          formData.location?.coordinates?.latitude,
          formData.location?.coordinates?.longitude
        );
      }

      const eventStartDate = new Date(
        `${formData.isMultiDay ? formData.startDate : formData.date}T${formData.startTime}`
      );
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
        timezone: formData.timezone,
        location: formData.isVirtual
          ? null
          : {
              name: formData.location.name.trim(),
              address: formData.location.address?.trim() || "",
              coordinates: coordinates,
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
        tags: formData.tags.filter((tag) => tag.trim()),
        ticketTiers: formData.ticketTiers
          .filter((tier) => tier.name.trim())
          .map((tier) => ({
            name: tier.name.trim(),
            price: Number(tier.price) || 0,
            capacity: tier.capacity ? Number(tier.capacity) : null,
            description: tier.description?.trim() || "",
          })),
      };

      submitEventForm(eventData);
    } catch (error) {
      logger.error("Error creating event:", error);
      const backendMessage = error.response?.data?.message || error.response?.data?.error;
      let errorMessage = "Failed to create event. ";
      if (backendMessage) {
        errorMessage += backendMessage;
      } else if (error.message.includes("Invalid date")) {
        errorMessage += "Please check your date and time values.";
      } else {
        errorMessage += error.message || "Please try again.";
      }
      toast.error(errorMessage);
      setCurrentStep(CREATION_STEPS.FORM);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);

    if (saved) {
      setShowRestoreModal(true);
    }

    setIsDraftLoaded(true);
  }, []);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        setFormData((prev) => ({
          ...prev,
          ...parsed,
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

    const saveable = { ...formData };
    delete saveable.banner;
    delete saveable.bannerPreview;

    localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
  }, [formData, isDraftLoaded]);

  useEffect(() => {
    const hasUnsavedChanges = Object.entries(formData).some(([key, value]) => {
      if (key === "banner" || key === "bannerPreview") {
        return false;
      }

      if (typeof value === "string") {
        return value.trim() !== "";
      }

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value) !== "{}";
      }

      return Boolean(value);
    });

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData]);

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RestoreDraftModal
        isOpen={showRestoreModal}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />

      {currentStep === CREATION_STEPS.FORM ? (
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

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="isVirtual"
                  checked={formData.isVirtual}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                This is a virtual event
              </label>

              <LocationFields
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                prefersReducedMotion={prefersReducedMotion}
              />

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
