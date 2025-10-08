import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import {
  Calendar,
  Clock,
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

const EventCreation = () => {
  const [currentStep, setCurrentStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: {
      name: "",
      address: "",
      coordinates: { latitude: "", longitude: "" },
    },
    isVirtual: false,
    virtualLink: "",
    capacity: "",
    isPublic: true,
    requiresApproval: false,
    registrationStart: "",
    registrationEnd: "",
    tags: [],
    ticketTiers: [
      {
        name: "General Admission",
        price: 0,
        capacity: "",
        description: "Standard event access",
      },
    ],
    banner: null,
    bannerPreview: null,
  });
  const [errors, setErrors] = useState("");
  const [newTag, setNewTag] = useState("");

  const categories = [
    { label: "Conference", value: "CONFERENCE" },
    { label: "Workshop", value: "WORKSHOP" },
    { label: "Meetup", value: "MEETUP" },
    { label: "Webinar", value: "WEBINAR" },
    { label: "Social", value: "SOCIAL" },
    { label: "Sports", value: "SPORTS" },
    { label: "Cultural", value: "CULTURAL" },
    { label: "Business", value: "BUSINESS" },
    { label: "Charity", value: "CHARITY" },
    { label: "Other", value: "OTHER" },
  ];

  const todayString = new Date().toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    } else if (formData.title.length < 3 || formData.title.length > 200) {
      newErrors.title = "Title must be between 3 and 200 characters";
    }

    if (!formData.description.trim())
      newErrors.description = "Event description is required";
    if (!formData.category) newErrors.category = "Please select a category";

    if (!formData.date) {
      newErrors.date = "Event date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today)
        newErrors.date = "Event date cannot be in the past";
    }

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "End time must be after start time";
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
      if (
        new Date(formData.registrationStart) >=
        new Date(formData.registrationEnd)
      ) {
        newErrors.registrationEnd =
          "Registration end must be after registration start";
      }
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

  const handleTicketTierChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((tier, i) =>
        i === index ? { ...tier, [field]: value } : tier
      ),
    }));
  };

  const addTicketTier = () => {
    setFormData((prev) => ({
      ...prev,
      ticketTiers: [
        ...prev.ticketTiers,
        {
          name: "",
          price: 0,
          capacity: "",
          description: "",
        },
      ],
    }));
  };

  const removeTicketTier = (index) => {
    if (formData.ticketTiers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        ticketTiers: prev.ticketTiers.filter((_, i) => i !== index),
      }));
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
    if (
      trimmed &&
      !formData.tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase())
    ) {
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
      setCurrentStep("preview");
    }
  };

  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const createEvent = async () => {
    setLoading(true);
    setSuccessMessage("");
    setGeneralError("");
    try {
      let coordinates = null;
      if (
        formData.location.coordinates.latitude &&
        formData.location.coordinates.longitude
      ) {
        const lat = parseFloat(formData.location.coordinates.latitude);
        const lng = parseFloat(formData.location.coordinates.longitude);

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coordinates = { latitude: lat, longitude: lng };
        }
      }

      const eventStartDate = new Date(`${formData.date}T${formData.startTime}`);
      const eventEndDate = new Date(`${formData.date}T${formData.endTime}`);

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

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please log in and try again.");
        setCurrentStep("form");
        return;
      }

      if (
        !API_ENDPOINTS.EVENTS.CREATE ||
        process.env.NODE_ENV === "development"
      ) {
        console.warn("⚠️ Mocking event creation success (API inactive)");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay
        setSuccessMessage("Event created successfully!");
        resetForm();
        setCurrentStep("form");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
        return;
      }

      const response = await apiUtils.post(
        API_ENDPOINTS.EVENTS.CREATE,
        eventData,
        token
      );

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (response.ok && result.success) {
        setSuccessMessage("Event created successfully!");
        resetForm();
        setCurrentStep("form");
      } else {
        if (result.errors && typeof result.errors === "object") {
          setErrors(result.errors);
          setCurrentStep("form");
        } else {
          const errorMessage =
            result.message ||
            result.error ||
            `Server error: ${response.status}`;
          setGeneralError(`Error creating event: ${errorMessage}`);
        }
        setCurrentStep("form");
      }
    } catch (error) {
      console.error("Error creating event:", error);

      let errorMessage = "Failed to create event. ";
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage += "Network error - please check your connection.";
      } else if (error.message.includes("Invalid date")) {
        errorMessage += "Please check your date and time values.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      setGeneralError(errorMessage);
      setCurrentStep("form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (successMessage || generalError) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setGeneralError("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, generalError]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      date: "",
      startTime: "",
      endTime: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: {
        name: "",
        address: "",
        coordinates: { latitude: "", longitude: "" },
      },
      isVirtual: false,
      virtualLink: "",
      capacity: "",
      isPublic: true,
      requiresApproval: false,
      registrationStart: "",
      registrationEnd: "",
      tags: [],
      ticketTiers: [
        {
          name: "General Admission",
          price: 0,
          capacity: "",
          description: "Standard event access",
        },
      ],
      banner: null,
      bannerPreview: null,
    });
    setErrors({});
    setNewTag("");
    setCurrentStep("form");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-6 py-4 rounded-xl bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-medium shadow-md text-center"
        >
          {successMessage}
        </motion.div>
      )}

      {generalError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-6 py-4 rounded-xl bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-medium shadow-md text-center"
        >
          {generalError}
        </motion.div>
      )}

      {currentStep === "form" ? (
        <>
          {/* Heading Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
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
            transition={{ duration: 0.7 }}
            className="w-full max-w-4xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-indigo-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 mb-10"
          >
            <div className="flex items-center gap-2 mb-3">
              <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
                Guidelines
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <li>
                Provide a{" "}
                <span className="font-medium">clear and catchy title</span> that
                accurately represents your event (3-200 characters).
              </li>
              <li>
                Write a{" "}
                <span className="font-medium">detailed description</span>{" "}
                explaining what attendees can expect and why they should join.
              </li>
              <li>
                Set{" "}
                <span className="font-medium">accurate dates and times</span> to
                avoid confusion. Make sure the end time is after the start time.
              </li>
              <li>
                Choose between{" "}
                <span className="font-medium">virtual or in-person</span> format
                and provide the necessary details (link or location).
              </li>
              <li>
                Define <span className="font-medium">ticket tiers</span> if
                applicable, with clear pricing and capacity limits.
              </li>
              <li>
                Add relevant{" "}
                <span className="font-medium">tags and categories</span> to help
                people discover your event.
              </li>
              <li>
                Upload an{" "}
                <span className="font-medium">eye-catching banner image</span>{" "}
                (max 5MB) to make your event stand out.
              </li>
              <li>
                Review all details in the{" "}
                <span className="font-medium">preview</span> before publishing
                your event.
              </li>
            </ul>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-indigo-300 dark:border-gray-700"
          >
            <div className="space-y-6">
              {/* Event Title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                  Event Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title (3-200 characters)"
                  maxLength={200}
                  className={`w-full border ${
                    errors.title
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300`}
                />
                {errors.title && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.title}
                  </span>
                )}
              </motion.div>

              {/* Event Banner */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  <Image className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                  Event Banner (Max 5MB)
                </label>

                <div className="relative flex flex-col items-start gap-3">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    id="bannerUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {/* Show Choose File only if no banner is uploaded */}
                  {!formData.banner && (
                    <label
                      htmlFor="bannerUpload"
                      className="
        cursor-pointer
        inline-flex items-center justify-center gap-2
        bg-gradient-to-r from-indigo-500 to-purple-500
        dark:from-indigo-600 dark:to-purple-700
        text-white font-medium
        px-4 py-2 rounded-2xl
        shadow-md hover:shadow-lg
        hover:from-indigo-600 hover:to-purple-600
        dark:hover:from-indigo-500 dark:hover:to-purple-500
        transition-all duration-300
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
        transform hover:scale-[1.03] active:scale-[0.97] text-sm
      "
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  )}

                  {/* Remove Button (only when uploaded) */}
                  {formData.banner && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          banner: null,
                          bannerPreview: null,
                        }))
                      }
                      className="
        text-red-500 dark:text-red-400
        font-medium text-sm
        flex items-center gap-2
        hover:text-red-600 dark:hover:text-red-300
        transition-all duration-300
        transform hover:scale-[1.05]
      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Remove Banner
                    </button>
                  )}

                  {/* Show file name */}
                  {formData.banner && (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formData.banner.name}
                    </span>
                  )}

                  {/* Error Message */}
                  {errors.banner && (
                    <span className="text-red-500 text-sm">
                      {errors.banner}
                    </span>
                  )}

                  {/* Preview Section */}
                  {formData.bannerPreview && (
                    <div className="rounded-lg overflow-hidden border border-indigo-200 dark:border-gray-700 shadow-md">
                      <img
                        src={formData.bannerPreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <ClipboardList className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event"
                  rows={4}
                  className={`w-full border ${
                    errors.description
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300`}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </span>
                )}
              </motion.div>

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Layers className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full border ${
                    errors.category
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.category}
                  </span>
                )}
              </motion.div>

              {/* Date and Time Row */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                    Event Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={todayString}
                    className={`w-full border ${
                      errors.date
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.date && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.date}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                    Start Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      errors.startTime
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.startTime && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.startTime}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-5 h-5 text-indigo-500 inline-block mr-2" />
                    End Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className={`w-full border ${
                      errors.endTime
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.endTime && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.endTime}
                    </span>
                  )}
                </div>
              </motion.div>

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
                      errors.virtualLink
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                  />
                  {errors.virtualLink && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.virtualLink}
                    </span>
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
                        errors.location
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                    />
                    {errors.location && (
                      <span className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </span>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
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
                    errors.capacity
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300`}
                />
                {errors.capacity && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.capacity}
                  </span>
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
                    <span className="text-red-500 text-sm mt-1">
                      {errors.registrationEnd}
                    </span>
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

              {/* Ticket Tiers Section */}
              {/* Ticket Tiers Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="border-t border-gray-200 dark:border-gray-600 pt-6"
              >
                {/* Header with "Add Tier" button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      Ticket Tiers
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={addTicketTier}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-3xl text-sm font-medium shadow-md hover:from-indigo-600 hover:to-purple-600 dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-500 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97]"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tier
                  </button>
                </div>

                {formData.ticketTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        Tier {index + 1}
                      </h4>
                      {formData.ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketTier(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Tier name"
                        value={tier.name}
                        onChange={(e) =>
                          handleTicketTierChange(index, "name", e.target.value)
                        }
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          value={tier.price}
                          onChange={(e) =>
                            handleTicketTierChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="Capacity (optional)"
                          min="1"
                          value={tier.capacity}
                          onChange={(e) =>
                            handleTicketTierChange(
                              index,
                              "capacity",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <textarea
                        placeholder="Description"
                        value={tier.description}
                        onChange={(e) =>
                          handleTicketTierChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={2}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>

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
        bg-gradient-to-r from-indigo-500 to-purple-500
        dark:from-indigo-600 dark:to-purple-700
        shadow-md hover:shadow-lg
        hover:from-indigo-600 hover:to-purple-600
        dark:hover:from-indigo-500 dark:hover:to-purple-500
        transform hover:scale-[1.03] active:scale-[0.97]
        transition-all duration-300
        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 text-sm
      "
                  >
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold p-4 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
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
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {stat.label}
                </p>
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
            <p className="text-gray-600 dark:text-gray-400">
              Review all details before publishing
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-indigo-300 dark:border-gray-700">
            {formData.bannerPreview && (
              <div className="w-full h-64 overflow-hidden">
                <img
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
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Category
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {
                        categories.find(
                          (cat) => cat.value === formData.category
                        )?.label
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Date & Time
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatDate(formData.date)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatTime(formData.startTime)} -{" "}
                      {formatTime(formData.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Location
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.isVirtual
                        ? "Virtual Event"
                        : formData.location.name}
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
                    <p className="font-semibold text-gray-700 dark:text-gray-300">
                      Capacity
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formData.capacity === ""
                        ? "Unlimited"
                        : `${formData.capacity} attendees`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formData.isPublic ? "Public" : "Private"} Event
                    </p>
                  </div>
                </div>
              </div>

              {formData.ticketTiers.length > 0 &&
                formData.ticketTiers[0].name && (
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
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {tier.name}
                            </p>
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

          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <motion.button
              onClick={() => setCurrentStep("form")}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500 font-semibold px-8 py-3 rounded-xl shadow-lg hover:bg-indigo-50 dark:hover:bg-gray-600 transition-all duration-300"
            >
              <PencilIcon className="w-5 h-5" />
              Edit Event
            </motion.button>

            <motion.button
              onClick={createEvent}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Event...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Create Event
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EventCreation;
