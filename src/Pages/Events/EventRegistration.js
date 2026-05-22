import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { getEventStatus } from "../../utils/eventUtils";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
import { useSessionRecovery } from "../../context/SessionRecoveryContext";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import mockEvents from "./eventsMockData.json";
import { pushToQueue } from "../../utils/offlineQueue";

const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

function sendConfirmationEmail(userEmail, userName, eventName, eventDate) {
  if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && window.emailjs) {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
    window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: userEmail,
      to_name: userName,
      event_name: eventName,
      event_date: eventDate,
    }).catch(() => {});
  }
}

// Registration lock map to prevent concurrent registrations for the same event
const registrationLocks = new Map();

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const { addRegistration } = useMyEvents();
  const { saveSession, clearSession } = useSessionRecovery();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    additionalInfo: "",
  });

  const [errors, setErrors] = useState({});

  // Load event data
  useEffect(() => {
    const loadEvent = () => {
      setLoading(true);
      // Find event from mock data
      const foundEvent = mockEvents.find((e) => e.id === parseInt(eventId));
      
      if (foundEvent) {
        setEvent({ ...foundEvent, status: getEventStatus(foundEvent) });
        
        // Pre-fill form if user is authenticated
        if (isAuthenticated() && user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
            email: user.email || "",
          }));
        }
      }
      setLoading(false);
    };

    loadEvent();
  }, [eventId, user, isAuthenticated]);

  // Save session state when form data changes
  useEffect(() => {
    if (event && formData) {
      saveSession({
        page: 'event-registration',
        eventId,
        formData,
        eventTitle: event.title,
      });
    }
  }, [formData, event, eventId, saveSession]);

  // Listen for session restoration
  useEffect(() => {
    const handleSessionRestored = (event) => {
      const restoredData = event.detail;
      if (restoredData?.page === 'event-registration' && restoredData?.eventId === eventId) {
        setFormData(restoredData.formData || {});
        toast.info('Your registration form has been restored');
      }
    };

    window.addEventListener('sessionRestored', handleSessionRestored);
    return () => window.removeEventListener('sessionRestored', handleSessionRestored);
  }, [eventId]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Prevent concurrent submissions for the same event
    if (isSubmittingRef.current) {
      toast.error("Registration already in progress. Please wait.");
      return;
    }

    // Check if another registration is in progress for this event
    if (registrationLocks.has(eventId)) {
      toast.error("Another registration is in progress for this event. Please wait.");
      return;
    }

    // Atomic capacity check - re-check immediately before submission
    if (event.attendees >= event.maxAttendees) {
      toast.error("This event has reached maximum capacity.");
      return;
    }

    // Set lock and submission state
    registrationLocks.set(eventId, true);
    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      // API call to register for event using centralized API layer
      const response = await apiUtils.post(
        API_ENDPOINTS.EVENTS.REGISTER(eventId),
        {
          ...formData,
          eventId: parseInt(eventId),
          userId: user?.id || null,
        }
      );

      setRegistered(true);
      toast.success("Registration successful!");
      // ── Save to My Events ──
      addRegistration(event, formData);
      // Redirect to event details after 2 seconds
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 2000);
        }),
      });

      if (response.ok) {
        setRegistered(true);
        toast.success("Registration successful!");
        sendConfirmationEmail(formData.email, formData.name, event?.title, event?.date);
        // ── Save to My Events ──
        addRegistration(event, formData);
        // Clear session after successful registration
        clearSession();
        // Redirect to event details after 2 seconds
        setTimeout(() => {
          navigate(`/events/${eventId}`);
        }, 2000);
      } else {
        const errorData = await response.json();
        // Handle capacity exceeded error specifically
        if (response.status === 409 || errorData.message?.toLowerCase().includes('capacity') || errorData.message?.toLowerCase().includes('full')) {
          toast.error("This event has reached maximum capacity.");
          // Refresh event data to get updated capacity
          const updatedEvent = mockEvents.find((e) => e.id === parseInt(eventId));
          if (updatedEvent) {
            setEvent({ ...updatedEvent, status: getEventStatus(updatedEvent) });
          }
        } else {
          toast.error(errorData.message || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      // ── Offline Sync Queue Fallback ──
      const payload = {
        ...formData,
        eventId: parseInt(eventId),
        userId: user?.id || null,
      };
      
      pushToQueue({ eventId: parseInt(eventId), payload });

      setRegistered(true);
      addRegistration(event, formData);
      toast.warning("Network error. Registration queued and will sync when you are online.", { autoClose: 4000 });
      setTimeout(() => {
        navigate(`/events/${eventId}`);
      }, 3000);
    } finally {
      // Release lock and reset submission state
      registrationLocks.delete(eventId);
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Event Not Found
        </h2>
        <Link
          to="/events"
          className="text-black hover:text-gray-700 dark:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    );
  }

  const isPastEvent = new Date(`${event.date} ${event.time}`) < new Date();
  const isEventFull = event.attendees >= event.maxAttendees;

  if (isPastEvent || isEventFull) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Registration Unavailable
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          {isPastEvent 
            ? "This event has already ended." 
            : "This event has reached maximum capacity."}
        </p>
        <Link
          to={`/events/${eventId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Details
        </Link>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have successfully registered for {event.title}
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Event Header */}
          <div className="relative h-64 overflow-hidden">
            <img loading="lazy"
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Register for this Event
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.fullName
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.email
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      errors.phone
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Organization */}
              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Organization (Optional)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Your company or institution"
                  />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Designation (Optional)
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Your job title or role"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Additional Information (Optional)
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder="Any special requirements or questions?"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-zinc-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;