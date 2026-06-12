import {
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  MapPinIcon,
  TrophyIcon,
  LinkIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import useReducedMotion from "../../hooks/useReducedMotion.js";
import { useAuth } from "../../context/AuthContext";

import { hostHackathon } from "../../services/hackathonService";
import { sanitizeInputText } from "../../utils/inputSanitization";

const HostHackathon = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("You must be logged in to host a hackathon.");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);
  const [formData, setFormData] = useState({
    hackathonName: "",
    organizerName: "",
    email: "",
    startDate: "",
    endDate: "",
    description: "",
    location: "",
    participantLimit: "",
    prizeDetails: "",
    website: "",
  });
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const hackathonNameRef = useRef(null);
  const organizerNameRef = useRef(null);
  const emailRef = useRef(null);
  const locationRef = useRef(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const descriptionRef = useRef(null);
  const participantLimitRef = useRef(null);
  const prizeDetailsRef = useRef(null);
  const websiteRef = useRef(null);

  const inputRefs = {
    hackathonName: hackathonNameRef,
    organizerName: organizerNameRef,
    email: emailRef,
    location: locationRef,
    startDate: startDateRef,
    endDate: endDateRef,
    description: descriptionRef,
    participantLimit: participantLimitRef,
    prizeDetails: prizeDetailsRef,
    website: websiteRef,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const requiredFields = [
    "hackathonName",
    "organizerName",
    "email",
    "location",
    "startDate",
    "endDate",
    "description",
  ];

  const validateForm = (data) => {
    const newErrors = {};

    // Required fields
    for (const field of requiredFields) {
      if (!data[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, " $1")} is required!`;
      }
    }

    // Hackathon Name validation
    if (
      data.hackathonName &&
      (data.hackathonName.trim().length < 3 || data.hackathonName.trim().length > 100)
    ) {
      newErrors.hackathonName = "Hackathon Name must be between 3 and 100 characters long!";
    }

    // Organizer validation
    if (
      data.organizerName &&
      (data.organizerName.trim().length < 3 || data.organizerName.trim().length > 100)
    ) {
      newErrors.organizerName = "Organizer Name must be between 3 and 100 characters long!";
    }

    // Location validation
    if (data.location && (data.location.trim().length < 3 || data.location.trim().length > 100)) {
      newErrors.location = "Location must be between 3 and 100 characters long!";
    }

    // ✅ Email validation — stricter regex to prevent invalid TLDs
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(data.email.trim())) {
        newErrors.email = "Please enter a valid email address!";
      }
    }

    // Website (optional)
    if (data.website?.trim()) {
      const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
      if (!urlRegex.test(data.website)) {
        newErrors.website = "Please enter a valid URL!";
      }
    }

    // Date validations
    if (data.startDate && data.startDate < today) {
      newErrors.startDate = "Start date cannot be in the past!";
    }
    if (data.endDate && data.startDate && data.endDate < data.startDate) {
      newErrors.endDate = "End date cannot be before start date!";
    }

    // Description validation
    if (
      data.description &&
      (data.description.trim().length < 20 || data.description.trim().length > 2000)
    ) {
      newErrors.description = "Description must be between 20 and 2000 characters long!";
    }

    // Participant Limit validation
    if (data.participantLimit && Number(data.participantLimit) < 1) {
      newErrors.participantLimit = "Participant limit must be at least 1!";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("You must be logged in to host a hackathon.");
      navigate("/login");
      return;
    }

    const validationErrors = validateForm({ ...formData });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting.");

      const firstErrorField =
        requiredFields.find((field) => validationErrors[field]) || Object.keys(validationErrors)[0];

      if (inputRefs[firstErrorField]?.current) {
        inputRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        inputRefs[firstErrorField].current.focus();
      }

      return;
    }

    setIsSubmitting(true);
    try {
      await hostHackathon(
        {
          ...formData,
          // Sanitize description and other text inputs
          description: sanitizeInputText(formData.description),
          hackathonName: sanitizeInputText(formData.hackathonName),
          organizerName: sanitizeInputText(formData.organizerName),
          location: sanitizeInputText(formData.location),
          prizeDetails: sanitizeInputText(formData.prizeDetails),
          hostUserId: user?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Hackathon submitted successfully! It will be reviewed before going live.");

      setFormData({
        hackathonName: "",
        organizerName: "",
        email: "",
        startDate: "",
        endDate: "",
        description: "",
        location: "",
        participantLimit: "",
        prizeDetails: "",
        website: "",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err?.data?.message || err?.message || "Submission failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      label: "Hackathon Name",
      name: "hackathonName",
      type: "text",
      placeholder: "Enter hackathon name",
      icon: ComputerDesktopIcon,
    },
    {
      label: "Organization/Organizer Name",
      name: "organizerName",
      type: "text",
      placeholder: "Enter your name or organization",
      icon: BuildingOffice2Icon,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "your@email.com",
      icon: EnvelopeIcon,
    },
    {
      label: "Location (Online / City)",
      name: "location",
      type: "text",
      placeholder: "e.g., Online or New York City",
      icon: MapPinIcon,
    },
    {
      label: "Participant Limit",
      name: "participantLimit",
      type: "number",
      placeholder: "Maximum number of participants",
      icon: UserGroupIcon,
    },
    {
      label: "Prize Details",
      name: "prizeDetails",
      type: "text",
      placeholder: "Mention prizes if any",
      icon: TrophyIcon,
    },
    {
      label: "Website / Registration Link",
      name: "website",
      type: "url",
      placeholder: "https://example.com",
      icon: LinkIcon,
    },
  ];

  return (
    <div className="bg-bg text-text flex min-h-screen flex-col items-center justify-center px-4 py-12 pt-20 sm:px-6 lg:px-8">
      {/* Heading Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
        className="mb-10 text-center"
        data-aos="fade-down"
        data-aos-once="true"
      >
        {/* UPDATED: Text colors */}
        <h1 className="mb-4 text-4xl font-extrabold text-black sm:text-5xl dark:text-white">
          Host Your Hackathon
        </h1>
        <p className="text-xs text-gray-600 sm:text-base dark:text-gray-400">
          &quot;Fill in the details below and let&apos;s get your hackathon live!&quot;
        </p>
      </motion.div>

      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
        className="bg-card-bg mb-10 w-full max-w-4xl rounded-2xl border border-gray-200 p-6 shadow-lg dark:border-gray-700"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="mb-3 flex items-center gap-2">
          <ClipboardDocumentListIcon className="text-primary h-6 w-6" />
          <h2 className="text-primary text-xl font-semibold">Guidelines</h2>
        </div>
        <ul className="list-disc space-y-3 pl-6 text-sm text-gray-700 sm:text-base dark:text-gray-300">
          <li>
            Clearly define the <span className="font-medium">objectives, theme, and rules</span> of
            your hackathon so participants know the purpose and scope.
          </li>
          <li>
            Mention <span className="font-medium">eligibility criteria</span> such as student
            status, professional background, or region to avoid confusion later.
          </li>
          <li>
            Ensure the <span className="font-medium">timeline (start and end dates)</span> is
            accurate and realistic, giving teams enough time to brainstorm and build.
          </li>
          <li>
            Highlight <span className="font-medium">prize distribution and judging criteria</span>{" "}
            to motivate participants and maintain transparency in evaluation.
          </li>
          <li>
            Provide clear <span className="font-medium">contact details or a support channel</span>{" "}
            so participants can ask questions during the event.
          </li>
          <li>
            Promote <span className="font-medium">inclusivity and diversity</span> by encouraging
            people from different backgrounds, genders, and skill levels to participate.
          </li>
          <li>
            Set <span className="font-medium">submission guidelines and deadlines</span> (format,
            platform, file types) to ensure smooth evaluation of projects.
          </li>
          <li>
            Encourage <span className="font-medium">collaboration and team spirit</span> by
            promoting teamwork, idea-sharing, and peer learning during the event.
          </li>
        </ul>
      </motion.div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        className="bg-card-bg border-border w-full max-w-4xl rounded-2xl border p-8 shadow-xl"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {formFields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              data-aos="fade-right"
              data-aos-delay={index * 50 + 500}
            >
              <label className="mb-1 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <field.icon className="text-primary mr-2 h-5 w-5" />
                {field.label}{" "}
                {requiredFields.includes(field.name) && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                ref={inputRefs[field.name]}
                className="bg-bg focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:outline-none dark:border-gray-600 dark:text-gray-100"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </motion.div>
          ))}

          {/* Date Fields */}
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            data-aos="fade-up"
            data-aos-delay="900"
          >
            {["startDate", "endDate"].map((name) => (
              <div key={name}>
                <label className="mb-1 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <CalendarDaysIcon className="text-primary mr-2 h-5 w-5" />
                  {name === "startDate" ? "Start Date" : "End Date"}{" "}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <input
                  ref={inputRefs[name]}
                  type="date"
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  min={today}
                  className="bg-bg focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 p-3 text-gray-700 transition duration-150 ease-in-out focus:ring-2 focus:outline-none dark:border-gray-600 dark:text-gray-300"
                />
                {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.2 }}
            data-aos="fade-up"
            data-aos-delay="1000"
          >
            <label className="mb-1 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <DocumentTextIcon className="text-primary mr-2 h-5 w-5" />
              Description <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              ref={inputRefs.description}
              rows="4"
              placeholder="Briefly describe your hackathon"
              className="bg-bg focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 p-3 text-gray-900 transition-all duration-300 focus:ring-1 focus:outline-none dark:border-gray-600 dark:text-gray-100"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl p-3 font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isSubmitting ? "Submitting hackathon" : "Submit hackathon"}
          >
            {isSubmitting ? "Submitting..." : "Submit Hackathon"}
            {!isSubmitting && <ArrowRightIcon className="h-5 w-5" />}
          </button>
        </form>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
        className="mt-12 mb-8 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3"
        data-aos="fade-up"
        data-aos-delay="1200"
      >
        {[
          { number: "500+", label: "Hackathons Hosted", icon: ChartBarIcon },
          {
            number: "50k+",
            label: "Participants Engaged",
            icon: UserGroupIcon,
          },
          { number: "99%", label: "Positive Feedback", icon: StarIcon },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.08, rotate: 1 }}
            className="bg-card-bg border-border flex flex-col items-center rounded-2xl border p-6 text-center shadow-md"
            data-aos="zoom-in"
            data-aos-delay={1200 + index * 100}
          >
            {/* UPDATED: Icon and text colors */}
            <stat.icon className="text-primary mb-3 h-10 w-10 animate-bounce" />
            <h3 className="text-primary text-3xl font-bold">{stat.number}</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section - Dark Background */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
        className="bg-card-bg border-border mt-10 w-full max-w-4xl rounded-2xl border p-10 text-center shadow-2xl"
        data-aos="fade-up"
        data-aos-delay="1600"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <TrophyIcon className="text-primary h-8 w-8" />
          <h2 className="text-3xl font-bold text-white">
            Ready to Inspire the Next Big Innovation?
          </h2>
        </div>
        <p className="mb-6 text-lg text-gray-300">
          Hosting a hackathon is your chance to bring creative minds together, solve real-world
          problems, and build impactful projects. Take the lead today!
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary inline-block rounded-xl px-8 py-3 text-white shadow-lg transition-all duration-300 hover:opacity-90"
          >
            Explore Hosting Options
          </motion.button>

          <motion.a
            href="/hackathons"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-bg text-text border-border hover:bg-card-bg inline-block rounded-xl border px-8 py-3 shadow-lg transition-all duration-300"
          >
            Explore Hackathons
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default HostHackathon;
