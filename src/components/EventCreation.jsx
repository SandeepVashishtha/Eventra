import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  ArrowRight,
  Pencil,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Ticket as TicketIcon,
} from "lucide-react";
import { API_ENDPOINTS, apiUtils } from "../config/api";

import { useEventForm } from "../hooks/useEventForm";
import EventBasicInfo from "./common/EventCreation/EventBasicInfo";
import EventMediaSection from "./common/EventCreation/EventMediaSection";
import EventLocationSection from "./common/EventCreation/EventLocationSection";
import EventTicketSection from "./common/EventCreation/EventTicketSection";
import DraftRestoreModal from "./common/EventCreation/DraftRestoreModal";
import { LoadingButton } from "./ui/LoadingButton";
import { categories } from "../constants/eventDefaults";
import { formatDate, formatTime } from "../utils/eventCreationUtils";

const EventCreation = () => {
  const [currentStep, setCurrentStep] = useState("form");

  const {
    formData,
    setFormData,
    errors,
    newTag,
    setNewTag,
    showRestoreModal,
    isUploading,
    setIsUploading,
    isSubmitting,
    submitError,
    submitSuccess,
    submitEventForm,
    validateForm,
    handleFieldBlur,
    isFormValid,
    handleInputChange,
    handleNestedChange,
    addTag,
    removeTag,
    addTicketTier,
    removeTicketTier,
    updateTicketTier,
    handleRestoreDraft,
    handleDiscardDraft,
  } = useEventForm();

  const handlePreview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep("preview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors in the form.");
    }
  };

  const handlePublish = async () => {
    const eventData = formData;
    try {
      if (!API_ENDPOINTS.EVENTS.CREATE) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        toast.success("🎉 Mock event creation successful!");
        return;
      }
      await apiUtils.post(API_ENDPOINTS.EVENTS.CREATE, eventData);
      toast.success("🎉 Event published successfully!");
      setCurrentStep("form");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event.");
    }
  };

  useEffect(() => {
    if (submitSuccess) {
      toast.success("🎉 Event published successfully!");
      setCurrentStep("form");
    }
  }, [submitSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <DraftRestoreModal
          show={showRestoreModal}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />

        <AnimatePresence mode="wait">
          {currentStep === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Create Your <span className="text-indigo-600">Event</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Fill in the details below to get started with your awesome event.
                </p>
              </div>

              <form
                onSubmit={handlePreview}
                // 🔥 FIX: Prevent the Enter key from prematurely submitting the form and throwing errors (except inside textareas or native buttons)
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    e.target.tagName !== "TEXTAREA" &&
                    e.target.tagName !== "BUTTON"
                  ) {
                    e.preventDefault();
                  }
                }}
                className="space-y-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800"
              >
                <section>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-600 dark:bg-indigo-900/50">
                      1
                    </span>
                    Basic Information
                  </h2>
                  <EventBasicInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleFieldBlur={handleFieldBlur}
                    errors={errors}
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-600 dark:bg-indigo-900/50">
                      2
                    </span>
                    Media & Tags
                  </h2>
                  <EventMediaSection
                    formData={formData}
                    setFormData={setFormData}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    addTag={addTag}
                    removeTag={removeTag}
                    isUploading={isUploading} // 🔥 FIX: Passed the actual uploading state so the component knows when to show spinners
                    setIsUploading={setIsUploading}
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-600 dark:bg-indigo-900/50">
                      3
                    </span>
                    Location & Time
                  </h2>
                  <EventLocationSection
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleNestedChange={handleNestedChange}
                    handleFieldBlur={handleFieldBlur}
                    errors={errors}
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800 dark:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm text-indigo-600 dark:bg-indigo-900/50">
                      4
                    </span>
                    Tickets
                  </h2>
                  <EventTicketSection
                    formData={formData}
                    addTicketTier={addTicketTier}
                    removeTicketTier={removeTicketTier}
                    updateTicketTier={updateTicketTier}
                    errors={errors}
                  />
                </section>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    aria-disabled={!isFormValid}
                    className={`group flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-all ${
                      isFormValid
                        ? "cursor-pointer bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 dark:shadow-none"
                        : "cursor-not-allowed bg-indigo-300 text-white/70 shadow-none dark:bg-indigo-900/50"
                    }`}
                  >
                    Preview Event
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  {!isFormValid && (
                    <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-amber-600 dark:text-amber-400">
                      <span role="img" aria-label="info">
                        ℹ️
                      </span>
                      Fill in all required fields to continue
                    </p>
                  )}
                  <p className="mt-4 text-center text-sm text-gray-500 italic" aria-live="polite">
                    Progress is auto-saved as you type ✨
                    {lastSavedAt && (
                      <span className="mt-1 block text-xs text-gray-400">
                        Last saved {formatDraftAge(lastSavedAt)}
                      </span>
                    )}
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Review Your <span className="text-indigo-600">Event</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Double check everything before going live!
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                {/* Banner Preview */}
                <div className="relative h-72 bg-gray-200 dark:bg-gray-700">
                  {formData.bannerPreview ? (
                    <img
                      src={formData.bannerPreview}
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      No banner uploaded
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                      {formData.category
                        ? categories.find(
                            (c) => c.id === formData.category || c.value === formData.category
                          )?.label
                        : "General"}
                    </span>
                  </div>
                </div>

                <div className="space-y-8 p-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold break-words text-gray-900 dark:text-white">
                      {formData.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {/* 🔥 FIX: Added fallback array to prevent .map TypeError crashes if data is missing */}
                      {(formData.tags || []).map((tag) => (
                        <span
                          key={tag}
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                    {formData.description}
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                      <Calendar className="mt-1 h-6 w-6 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatDate(formData.date || formData.startDate)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-700/50">
                      <MapPin className="mt-1 h-6 w-6 text-indigo-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {/* 🔥 FIX: Added optional chaining and fallback to prevent Cannot read property 'name' crashes */}
                          {formData.isVirtual ? "Virtual Event" : formData.location?.name || "TBD"}
                        </p>
                        {!formData.isVirtual && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formData.location?.city || formData.location?.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tickets Preview */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold">
                      <TicketIcon className="h-5 w-5 text-indigo-500" /> Ticket Tiers
                    </h3>
                    <div className="space-y-3">
                      {/* 🔥 FIX: Added fallback array to prevent .map TypeError crashes if data is missing */}
                      {(formData.ticketTiers || []).map((tier, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border border-gray-100 p-4 dark:border-gray-700"
                        >
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{tier.name}</p>
                            <p className="text-sm text-gray-500">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-indigo-600">₹{tier.price}</p>
                            <p className="text-xs text-gray-400">
                              {tier.capacity ? `${tier.capacity} spots` : "Unlimited"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                    <button
                      type="button" // 🔥 FIX: Ensure this button doesn't trigger a form submit just in case
                      onClick={() => setCurrentStep("form")}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 py-4 font-bold text-gray-600 transition-all hover:border-indigo-600 dark:border-gray-700 dark:text-gray-300"
                    >
                      <Pencil className="h-5 w-5" /> Edit Details
                    </button>
                    <LoadingButton
                      onClick={handlePublish}
                      isLoading={isSubmitting}
                      loadingText="Publishing..."
                      aria-busy={isSubmitting}
                      aria-label={isSubmitting ? "Publishing event" : "Publish event"}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 dark:shadow-none"
                    >
                      <CheckCircle className="h-5 w-5" /> Publish Event
                    </LoadingButton>
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700">
                      <AlertCircle className="h-5 w-5" />
                      {submitError}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventCreation;
