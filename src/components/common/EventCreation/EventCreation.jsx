import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Download, FileJson, Save } from "lucide-react";
import { logger } from "../../../utils/logger";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { useEventForm } from "../../../hooks/useEventForm";
import { useEventTemplates } from "../../../hooks/useEventTemplates";
import TicketsStep from "./components/TicketsStep";
import GeneralInfoStep from "./components/GeneralInfoStep";
import { exportAttendeesToCSV } from "../../../utils/exportCsv";
import PreviewStep from "./components/PreviewStep";
import RestoreDraftModal from "./components/RestoreDraftModal";
import TemplatePicker from "./components/TemplatePicker";
import TemplateNamePrompt from "./components/TemplateNamePrompt";
import GuidelinesSection from "./components/GuidelinesSection";
import EventDurationSelector from "./components/EventDurationSelector";
import DateTimeFields from "./components/DateTimeFields";
import LocationFields from "./components/LocationFields";
import RegistrationDatesFields from "./components/RegistrationDatesFields";
import TagsInput from "./components/TagsInput";
import StatsSection from "./components/StatsSection";
import {
  CREATION_STEPS,
  categories,
  mockAttendees,
  todayString,
} from "../../../constants/eventDefaults";
import {
  TagIcon,
} from "@heroicons/react/24/solid";
import { validateCoordinates } from "../../../utils/eventCreationUtils";

const EventCreation = () => {
  const prefersReducedMotion = useReducedMotion();

  const [currentStep, setCurrentStep] = useState(CREATION_STEPS.FORM);

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    newTag,
    setNewTag,
    showRestoreModal,
    isSubmitting,
    submitError,
    submitSuccess,
    submitEventForm,
    validateForm,
    resetForm,
    handleInputChange,
    addTag,
    removeTag,
    handleRestoreDraft,
    handleDiscardDraft,
    handleImageUpload,
  } = useEventForm();

  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTemplateNamePrompt, setShowTemplateNamePrompt] = useState(false);
  const {
    templates,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
  } = useEventTemplates();

  const handleResetForm = useCallback(() => {
    resetForm();
    setCurrentStep(CREATION_STEPS.FORM);
  }, [resetForm]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success("Event created successfully!");
      handleResetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitSuccess, handleResetForm]);

  const handleNext = () => {
    try {
      if (currentStep === CREATION_STEPS.FORM) {
        const isValid = validateForm();
        if (!isValid) {
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

  const handleOpenSaveTemplatePrompt = () => {
    setShowTemplateNamePrompt(true);
  };

  const handleSaveTemplateSubmit = (templateName) => {
    const success = handleSaveTemplate(templateName, formData);
    if (success) {
      setShowTemplateNamePrompt(false);
    }
  };

  const handleOpenTemplatePicker = () => {
    setShowTemplatePicker(true);
  };

  const handleLoadTemplateFromPicker = (templateId) => {
    const templateData = handleLoadTemplate(templateId);
    if (templateData) {
      setFormData((prev) => ({
        ...prev,
        ...templateData,
        banner: null,
        bannerPreview: null,
      }));
      setErrors({});
    }
  };

  const handleDeleteTemplateFromPicker = (templateId) => {
    handleDeleteTemplate(templateId, () => {});
  };

  const createEvent = () => {
    try {
      let coordinates = null;
      if (formData.location?.coordinates?.latitude && formData.location?.coordinates?.longitude) {
        coordinates = validateCoordinates(
          formData.location.coordinates.latitude,
          formData.location.coordinates.longitude
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
              coordinates,
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RestoreDraftModal
        isOpen={showRestoreModal}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />

      <TemplatePicker
        isOpen={showTemplatePicker}
        templates={templates}
        onLoad={handleLoadTemplateFromPicker}
        onDelete={handleDeleteTemplateFromPicker}
        onClose={() => setShowTemplatePicker(false)}
      />

      <TemplateNamePrompt
        isOpen={showTemplateNamePrompt}
        onSave={handleSaveTemplateSubmit}
        onCancel={() => setShowTemplateNamePrompt(false)}
      />

      {currentStep === CREATION_STEPS.FORM ? (
        <>
          <div className="w-full max-w-4xl flex justify-end gap-3 mb-6">
            <button
              onClick={handleOpenTemplatePicker}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Load template"
            >
              <FileJson size={18} />
              Use Template
            </button>

            <button
              onClick={handleOpenSaveTemplatePrompt}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Save as template"
            >
              <Save size={18} />
              Save as Template
            </button>

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

              {formData.isVirtual ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Virtual Event Link
                  </label>
                  <input
                    type="url"
                    name="virtualLink"
                    value={formData.virtualLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/..."
                    className={`w-full border ${errors.virtualLink ? "border-red-500" : "border-gray-300 dark:border-gray-600"} rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.virtualLink && (
                    <span className="text-red-500 text-sm mt-1">{errors.virtualLink}</span>
                  )}
                </div>
              ) : (
                <LocationFields
                  formData={formData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  prefersReducedMotion={prefersReducedMotion}
                />
              )}

              <div>
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
              </div>

              <RegistrationDatesFields
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              <div className="space-y-3">
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
              </div>

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

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-3xl font-semibold text-white bg-black shadow-md hover:shadow-lg hover:bg-zinc-800 transform hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 text-sm"
                    aria-label="button"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

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
