import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { ArrowRight, Pencil, CheckCircle, AlertCircle, Calendar, Users, MapPin, Ticket as TicketIcon } from "lucide-react";

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
    await submitEventForm(formData);
  };

  useEffect(() => {
    if (submitSuccess) {
      toast.success("🎉 Event published successfully!");
      setCurrentStep("form");
    }
  }, [submitSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <DraftRestoreModal 
          show={showRestoreModal} 
          onRestore={handleRestoreDraft} 
          onDiscard={handleDiscardDraft} 
        />

        <AnimatePresence mode="wait">
          {currentStep === "form" ? (
            <motion
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Create Your <span className="text-indigo-600">Event</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Fill in the details below to get started with your awesome event.
                </p>
              </div>

              <form onSubmit={handlePreview} className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-10 border border-gray-100 dark:border-gray-700">
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 text-sm">1</span>
                    Basic Information
                  </h2>
                  <EventBasicInfo 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    errors={errors} 
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 text-sm">2</span>
                    Media & Tags
                  </h2>
                  <EventMediaSection 
                    formData={formData} 
                    setFormData={setFormData} 
                    newTag={newTag} 
                    setNewTag={setNewTag} 
                    addTag={addTag} 
                    removeTag={removeTag} 
                    setIsUploading={setIsUploading} 
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 text-sm">3</span>
                    Location & Time
                  </h2>
                  <EventLocationSection 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    handleNestedChange={handleNestedChange} 
                    errors={errors} 
                  />
                </section>

                <hr className="border-gray-100 dark:border-gray-700" />

                <section>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 text-sm">4</span>
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
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group"
                  >
                    Preview Event
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-4 italic">
                    Progress is auto-saved as you type ✨
                  </p>
                </div>
              </form>
            </motion>
          ) : (
            <motion
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Review Your <span className="text-indigo-600">Event</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Double check everything before going live!
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Banner Preview */}
                <div className="relative h-72 bg-gray-200 dark:bg-gray-700">
                  {formData.bannerPreview ? (
                    <img src={formData.bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No banner uploaded
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-lg">
                      {formData.category ? categories.find(c => (c.id === formData.category || c.value === formData.category))?.label : "General"}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white break-words">
                      {formData.title}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                      <Calendar className="w-6 h-6 text-indigo-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-bold text-gray-900 dark:text-white">{formatDate(formData.date || formData.startDate)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatTime(formData.startTime)} - {formatTime(formData.endTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                      <MapPin className="w-6 h-6 text-indigo-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formData.isVirtual ? "Virtual Event" : formData.location.name}
                        </p>
                        {!formData.isVirtual && <p className="text-sm text-gray-600 dark:text-gray-400">{formData.location.city || formData.location.address}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Tickets Preview */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <TicketIcon className="w-5 h-5 text-indigo-500" /> Ticket Tiers
                    </h3>
                    <div className="space-y-3">
                      {formData.ticketTiers.map((tier, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{tier.name}</p>
                            <p className="text-sm text-gray-500">{tier.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-indigo-600">₹{tier.price}</p>
                            <p className="text-xs text-gray-400">{tier.capacity ? `${tier.capacity} spots` : "Unlimited"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => setCurrentStep("form")}
                      className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-600 text-gray-600 dark:text-gray-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-5 h-5" /> Edit Details
                    </button>
                    <LoadingButton
                      onClick={handlePublish}
                      isLoading={isSubmitting}
                      loadingText="Publishing..."
                      className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> Publish Event
                    </LoadingButton>
                  </div>

                  {submitError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {submitError}
                    </div>
                  )}
                </div>
              </div>
            </motion>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventCreation;
