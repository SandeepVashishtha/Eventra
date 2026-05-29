import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Download } from "lucide-react";
import { logger } from "../../../utils/logger";
import useReducedMotion from "../../../hooks/useReducedMotion";
import TicketTiersSection from "./components/TicketTiersSection";
import GeneralInfoStep from "./components/GeneralInfoStep";
import { exportAttendeesToCSV } from "../../../utils/exportCsv";
import ProgressStepper from "../common/ProgressStepper";
import {
  DRAFT_KEY,
  CREATION_STEPS,
  categories,
  mockAttendees,
  initialFormData,
  todayString,
} from "../../../constants/eventDefaults";
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
} from "@heroicons/react/24/solid";
import { API_ENDPOINTS, apiUtils } from "../../../config/api";
import {
  Calendar,
  MapPin,
  Link2,
  Users,
  Image,
  ClipboardList,
  FileText,
  Layers,
  Globe,
  CalendarPlus,
  CalendarX,
  Map,
  Navigation,
  Compass,
  Upload,
  Plus,
} from "lucide-react";
import { useFormSubmit } from "../../../hooks/useFormSubmit";
import { LoadingButton } from "../../ui/LoadingButton";
import {
  parseTimeToMinutes,
  formatDate,
  formatTime,
  validateCoordinates,
} from "../../../utils/eventCreationUtils";


const EventCreation = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const [currentStep, setCurrentStep] = useState(CREATION_STEPS.FORM);

  const { handleSubmit: submitEventForm, isSubmitting, error: submitError, success: submitSuccess } = useFormSubmit(async (eventData) => {
    // Auth is handled by the HttpOnly session cookie — apiUtils sends it
    // automatically via withCredentials. Never read tokens from sessionStorage;
    // setToken was removed as part of the HttpOnly cookie migration.
    if (!API_ENDPOINTS.EVENTS.CREATE) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return;
    }
const CREATION_STEPS = [
  { id: "general", label: "General Info" },
  { id: "location", label: "Location" },
  { id: "tickets", label: "Tickets" },
  { id: "preview", label: "Preview" },
];

// In the component, add state:
const [currentStep, setCurrentStep] = useState(0);

// Add navigation functions:
const handleNext = () => {
  if (currentStep < CREATION_STEPS.length - 1) {
    setCurrentStep((prev) => prev + 1);
  }
};

const handlePrevious = () => {
  if (currentStep > 0) {
    setCurrentStep((prev) => prev - 1);
  }
};

const handleStepClick = (index) => {
  // Only allow going back to completed steps
  if (index <= currentStep) {
    setCurrentStep(index);
  }
};
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
  // Track whether draft has been loaded to avoid overwriting on initial mount
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.length < 3 || formData.title.length > 200) {
      newErrors.title = "Title must be between 3 and 200 characters";
    }

    if (!formData.description.trim()) newErrors.description = "Event description is required";
    if (!formData.category) newErrors.category = "Please select a category";

    if (formData.isMultiDay) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";

      if (formData.startDate && formData.endDate) {
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
          newErrors.endDate = "End date must be after start date";
        }
      }
    } else {
      if (!formData.date) newErrors.date = "Event date is required";
    }

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (!newErrors.startTime && !newErrors.endTime && !formData.isMultiDay) {
      // Convert time strings (HH:MM format) to minutes for proper comparison
      const startMinutes = parseTimeToMinutes(formData.startTime);
      const endMinutes = parseTimeToMinutes(formData.endTime);
      if (startMinutes >= endMinutes) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!formData.isVirtual && !formData.location.name.trim()) {
      newErrors.location = "Location name is required for offline events";
    }

    if (formData.isVirtual && !formData.virtualLink.trim()) {
      newErrors.virtualLink = "Virtual link is required for online events";
    }

    if (formData.capacity) {
      const capacity = Number(formData.capacity);
      if (!capacity || capacity <= 0) {
        newErrors.capacity = "Please enter a valid number of attendees";
      } else if (capacity > 100000) {
        newErrors.capacity = "Maximum capacity is 100,000 attendees";
      }
    }

    if (formData.registrationStart && formData.registrationEnd) {
      if (new Date(formData.registrationStart) >= new Date(formData.registrationEnd)) {
        newErrors.registrationEnd = "Registration end must be after registration start";
      }
    }

    // Validate ticket tiers
    if (formData.ticketTiers && formData.ticketTiers.length > 0) {
      formData.ticketTiers.forEach((tier, index) => {
        if (tier.name && tier.name.trim()) {
          const price = Number(tier.price);
          if (price < 0) {
            newErrors[`ticketPrice_${index}`] = "Ticket price cannot be negative";
          }
          if (tier.capacity) {
            const capacity = Number(tier.capacity);
            if (capacity <= 0) {
              newErrors[`ticketCapacity_${index}`] = "Ticket capacity must be greater than 0";
            }
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = () => {
    if (validateForm()) {
      setCurrentStep(CREATION_STEPS.PREVIEW);
    }
  };

  const createEvent = () => {
    try {
      let coordinates = null;
      if (formData.location.coordinates.latitude && formData.location.coordinates.longitude) {
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
      console.error(error);
    }

    setShowRestoreModal(false);
  };
  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);

    setShowRestoreModal(false);

    toast.info("Saved draft discarded.");
  };

  useEffect(() => {
    // Prevent saving before draft restoration
    if (!isDraftLoaded) return;

    const { banner, bannerPreview, ...saveable } = formData;

    localStorage.setItem(DRAFT_KEY, JSON.stringify(saveable));
  }, [formData, isDraftLoaded]);

  /**
   * Warn user before accidental refresh,
   * tab close, or browser close
   */
  useEffect(() => {
    const hasUnsavedChanges = Object.entries(formData).some(([key, value]) => {
      // Ignore banner fields
      if (key === "banner" || key === "bannerPreview") {
        return false;
      }

      // Handle strings
      if (typeof value === "string") {
        return value.trim() !== "";
      }

      // Handle arrays
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      // Handle objects
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value) !== "{}";
      }

      // Handle booleans/numbers
      return Boolean(value);
    });

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();

        // Required for browser warning
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {showRestoreModal && (
        <div
          className="
      fixed inset-0 z-50
      flex items-center justify-center
      bg-black/50
      px-4
    "
        >
          <div
            className="
        w-full max-w-md
        bg-white dark:bg-gray-900
        rounded-3xl
        p-8
        shadow-2xl
        border border-gray-200
        dark:border-gray-700
      "
          >
            <h2
              className="
          text-2xl font-bold
          text-gray-900 dark:text-white
          mb-3
        "
            >
              Restore Draft?
            </h2>

            <p
              className="
          text-gray-600 dark:text-gray-400
          mb-6
        "
            >
              A previously saved event draft was found. Would you like to restore it?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDiscardDraft}
                className="
            px-4 py-2
            rounded-xl
            border border-gray-300
            dark:border-gray-700
            hover:bg-gray-100
            dark:hover:bg-gray-800
            transition
          "
               aria-label="button">
                Discard
              </button>

              <button
                onClick={handleRestoreDraft}
                className="
            px-5 py-2
            rounded-xl
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            font-medium
            transition
          "
               aria-label="button">
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === CREATION_STEPS.FORM ? (
        <>
          {/* Heading Section */}
          <div className="w-full max-w-4xl flex justify-end mb-6">
            <button
              onClick={() => {
                exportAttendeesToCSV(mockAttendees, "event-attendees.csv");

                toast.success("CSV exported successfully!");
              }}
              className="
      inline-flex
      items-center
      gap-2
      px-5
      py-3
      rounded-2xl
      bg-emerald-600
      hover:bg-emerald-700
      text-white
      font-semibold
      shadow-md
      hover:shadow-lg
      transition-all
      duration-300
    "
            >
              <div className="max-w-4xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
    Create New Event
  </h1>
  
  {/* Progress Stepper */}
  <ProgressStepper steps={CREATION_STEPS} currentStep={currentStep} />

  {/* Form Steps */}
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
    {currentStep === 0 && <GeneralInfoStep formData={formData} setFormData={setFormData} />}
    {currentStep === 1 && <LocationStep formData={formData} setFormData={setFormData} />}
    {currentStep === 2 && <TicketsStep formData={formData} setFormData={setFormData} />}
    {currentStep === 3 && <PreviewStep formData={formData} />}

    {/* Navigation Buttons */}
    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentStep === 0}
        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
          currentStep === 0
            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        }`}
      >
        Previous
      </button>

      {currentStep < CREATION_STEPS.length - 1 ? (
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          Next
        </button>
      ) : (
        <button
          type="submit"
          className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
        >
          Create Event
        </button>
      )}
    </div>
  </div>
</div>
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

          {/* Guidelines Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 mb-10"
          >
            <div className="flex items-center gap-2 mb-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
                Guidelines
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li>
                Provide a <span className="font-medium">clear and catchy title</span> that
                accurately represents your event (3-200 characters).
              </li>
              <li>
                Write a <span className="font-medium">detailed description</span> explaining what
                attendees can expect and why they should join.
              </li>
              <li>
                Set <span className="font-medium">accurate dates and times</span> to avoid
                confusion. Make sure the end time is after the start time.
              </li>
              <li>
                Choose between <span className="font-medium">virtual or in-person</span> format and
                provide the necessary details (link or location).
              </li>
              <li>
                Define <span className="font-medium">ticket tiers</span> if applicable, with clear
                pricing and capacity limits.
              </li>
              <li>
                Add relevant <span className="font-medium">tags and categories</span> to help people
                discover your event.
              </li>
              <li>
                Upload an <span className="font-medium">eye-catching banner image</span> (max 5MB)
                to make your event stand out.
              </li>
              <li>
                Review all details in the <span className="font-medium">preview</span> before
                publishing your event.
              </li>
            </ul>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-indigo-300 dark:border-gray-700"
          >
            <div className="space-y-6">
              {/* General Info Step Component */}
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

              {/* Event Duration Type */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                  Event Duration
                </label>
                <div className="flex gap-6">
                  {/* Single-day Event Option */}
                  <label className="flex items-center text-gray-700 dark:text-white gap-2">
                    <input
                      type="radio"
                      name="eventType"
                      checked={!formData.isMultiDay}
                      onChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          isMultiDay: false,
                          startDate: "",
                          endDate: "",
                          date: "",
                          startTime: "",
                          endTime: "",
                        }));
                        setErrors({});
                      }}
                    />
                    Single-day Event
                  </label>

                  {/* Multi-day Event Option */}
                  <label className="flex items-center text-gray-700 dark:text-white gap-2">
                    <input
                      type="radio"
                      name="eventType"
                      checked={formData.isMultiDay}
                      onChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          isMultiDay: true,
                          date: "",
                          startDate: "",
                          endDate: "",
                          startTime: "",
                          endTime: "",
                        }));
                        setErrors({});
                      }}
                    />
                    Multi-day Event
                  </label>
                </div>
              </motion.div>

              {/* Date and Time Fields */}
              {formData.isMultiDay ? (
                // 🔹 Multi-day Event
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-4 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
                >
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={todayString}
                      className={`w-full border ${
                        errors.startDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.startDate && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.startDate}</span>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || todayString}
                      className={`w-full border ${
                        errors.endDate ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.endDate && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.endDate}</span>
                    )}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        errors.startTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.startTime && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.startTime}</span>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        errors.endTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.endTime && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.endTime}</span>
                    )}
                  </div>
                </motion.div>
              ) : (
                // 🔸 Single-day Event
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
                >
                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={todayString}
                      className={`w-full border ${
                        errors.date ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.date && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.date}</span>
                    )}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        errors.startTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.startTime && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.startTime}</span>
                    )}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        errors.endTime ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-700`}
                    />
                    {errors.endTime && (
                      <span className="text-red-500 text-sm mt-1 block">{errors.endTime}</span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Virtual Event Checkbox */}
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

              {/* Virtual Link or Location */}
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
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MapPin className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                      Location Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="location.name"
                      value={formData.location.name}
                      onChange={handleInputChange}
                      placeholder="Convention Center, Community Hall, etc."
                      className={`w-full border ${
                        errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                    />
                    {errors.location && (
                      <span className="text-red-500 text-sm mt-1">{errors.location}</span>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Map className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State ZIP"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                    />
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Navigation className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                        Latitude (optional)
                      </label>
                      <input
                        type="number"
                        name="location.coordinates.latitude"
                        value={formData.location.coordinates.latitude}
                        onChange={handleInputChange}
                        placeholder="40.7128"
                        step="any"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Compass className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                        Longitude (optional)
                      </label>
                      <input
                        type="number"
                        name="location.coordinates.longitude"
                        value={formData.location.coordinates.longitude}
                        onChange={handleInputChange}
                        placeholder="-74.0060"
                        step="any"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                </>
              )}

              {/* Capacity */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-5 h-5 text-indigo-500 inline-block mr-2" />
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
                  className={`w-full border ${
                    errors.capacity ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                />
                {errors.capacity && (
                  <span className="text-red-500 text-sm mt-1">{errors.capacity}</span>
                )}
              </motion.div>

              {/* Registration Dates */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CalendarPlus className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                    Registration Start
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationStart"
                    value={formData.registrationStart}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <CalendarX className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                    Registration End
                  </label>
                  <input
                    type="datetime-local"
                    name="registrationEnd"
                    value={formData.registrationEnd}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      errors.registrationEnd
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.registrationEnd && (
                    <span className="text-red-500 text-sm mt-1">{errors.registrationEnd}</span>
                  )}
                </div>
              </motion.div>

              {/* Public and Approval Checkboxes */}
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

              <TicketTiersSection
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />

              {/* Tags Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
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
                    className="
        flex items-center justify-center gap-2
        px-4 py-2
        rounded-3xl font-semibold
        text-white
        bg-black
        shadow-md hover:shadow-lg
        hover:bg-zinc-800
        transform hover:scale-[1.03] active:scale-[0.97]
        transition-all duration-300
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 text-sm
      "
                   aria-label="button">
                    <Plus className="w-4 h-4" />
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
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="button"
                onClick={handleSubmit}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-black text-white font-semibold p-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all duration-300"
              >
                Preview Event <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-12"
          >
            {[
              { number: "10k+", label: "Events Created", icon: CalendarIcon },
              { number: "500k+", label: "Attendees", icon: UsersIcon },
              { number: "98%", label: "Success Rate", icon: CheckCircleIcon },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, rotate: 1 }}
                className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-2xl shadow-md p-6 text-center flex flex-col items-center"
              >
                <stat.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3 animate-bounce" />
                <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                  {stat.number}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : (
        /* Preview Section */
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-indigo-800 dark:text-indigo-300 mb-4">
              Preview Your Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Review all details before publishing</p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-indigo-300 dark:border-gray-700">
            {formData.bannerPreview && (
              <div className="w-full h-64 overflow-hidden">
                <img
                  loading="lazy"
                  src={formData.bannerPreview}
                  alt="Event banner"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {formData.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {formData.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <TagIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Category</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {categories.find((cat) => cat.value === formData.category)?.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Date & Time</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.isMultiDay
                        ? `${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`
                        : formatDate(formData.date)}
                    </p>

                    <p className="text-gray-600 dark:text-gray-400">
                      {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Location</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.isVirtual ? "Virtual Event" : formData.location.name}
                    </p>
                    {formData.location.address && !formData.isVirtual && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.location.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <UsersIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Capacity</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.capacity === "" ? "Unlimited" : `${formData.capacity} attendees`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.isPublic ? "Public" : "Private"} Event
                    </p>
                  </div>
                </div>
              </div>

              {formData.ticketTiers.length > 0 && formData.ticketTiers[0].name && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TicketIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                      Ticket Tiers
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {formData.ticketTiers.map((tier, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{tier.name}</p>
                          {tier.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {tier.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{Number(tier.price).toFixed(2)}
                          </p>
                          {tier.capacity && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tier.capacity} available
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.requiresApproval && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium">
                    ⚠️ This event requires approval for registration
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            {submitError && (
              <div className="error-banner w-full mb-4" role="alert">
                ❌ {submitError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <motion.button
                onClick={() => setCurrentStep("form")}
                disabled={isSubmitting}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <PencilIcon className="w-5 h-5" />
                Edit Event
              </motion.button>

              <LoadingButton
                onClick={createEvent}
                isLoading={isSubmitting}
                loadingText="Creating Event..."
                className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-zinc-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Create Event
              </LoadingButton>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EventCreation;
