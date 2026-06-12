import {
  ArrowRightIcon,
  LightBulbIcon,
  FolderOpenIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon, // Icons for form fields
  UserGroupIcon,
  EnvelopeIcon,
  LinkIcon,
  RectangleGroupIcon,
  CpuChipIcon,
  BookmarkIcon,
  UsersIcon,
  ClockIcon,
  UserPlusIcon,
  PhotoIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { projectService } from "../../services/projectService";
import { sanitizeInputText } from "../../utils/inputSanitization";

const SubmitProject = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("You must be logged in to submit a project.");
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    projectName: "",
    teamName: "",
    email: "",
    githubLink: "",
    liveDemoLink: "",
    description: "",
    projectType: "",
    techStack: "",
    projectCategory: "",
    additionalNotes: "",
    projectImage: "",
    submissionCategory: "",
    teamMembersCount: "",
    projectDuration: "", // Added to state
    targetAudience: "", // Added to state
  });
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, projectImage: event.target.result }));
      setErrors((prev) => ({ ...prev, projectImage: "" }));
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, projectImage: "" }));
  };

  const inputRefs = {
    projectName: useRef(null),
    teamName: useRef(null),
    email: useRef(null),
    githubLink: useRef(null),
    description: useRef(null),
    liveDemoLink: useRef(null),
    projectImage: useRef(null),
    projectType: useRef(null),
    techStack: useRef(null),
    // Added refs for new fields to be complete
    submissionCategory: useRef(null),
    teamMembersCount: useRef(null),
    projectDuration: useRef(null),
    targetAudience: useRef(null),
    additionalNotes: useRef(null),
  };

  const requiredFields = [
    "projectName",
    "teamName",
    "email",
    "githubLink",
    "projectType",
    "techStack",
    "description",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (data) => {
    const newErrors = {};

    const formatFieldName = (fieldName) => {
      const result = fieldName.replace(/([A-Z])/g, " $1");
      return result.charAt(0).toUpperCase() + result.slice(1);
    };

    // Required fields
    for (const field of requiredFields) {
      if (!data[field]?.trim()) {
        const formattedName = formatFieldName(field);
        newErrors[field] = `${formattedName} is required.`;
      }
    }

    // Length validations
    if (
      data.projectName &&
      (data.projectName.trim().length < 3 || data.projectName.trim().length > 100)
    ) {
      newErrors.projectName = "Project Name must be between 3 and 100 characters.";
    }
    if (data.teamName && (data.teamName.trim().length < 3 || data.teamName.trim().length > 100)) {
      newErrors.teamName = "Team Name must be between 3 and 100 characters.";
    }
    if (
      data.description &&
      (data.description.trim().length < 20 || data.description.trim().length > 2000)
    ) {
      newErrors.description = "Description must be between 20 and 2000 characters.";
    }

    // Existing validation logic
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (
      data.githubLink &&
      !/^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w-]+(\/)?$/i.test(data.githubLink.trim())
    ) {
      newErrors.githubLink = "Please enter a valid GitHub repository URL.";
    }
    const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
    if (data.liveDemoLink?.trim() && !urlRegex.test(data.liveDemoLink)) {
      newErrors.liveDemoLink = "Please enter a valid URL.";
    }
    if (data.projectImage?.trim()) {
      const isBase64 = data.projectImage.startsWith("data:image/");
      if (!isBase64 && !urlRegex.test(data.projectImage)) {
        newErrors.projectImage = "Please enter a valid image URL.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("You must be logged in to submit a project.");
      navigate("/login");
      return;
    }

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the errors before submitting!");

      const fieldsInOrder = [
        ...formFields.map((field) => field.name),
        "description",
        "additionalNotes",
      ];

      const firstErrorField = fieldsInOrder.find((field) => validationErrors[field]);

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
      // Sanitize and map text fields before sending
      const sanitizedData = {
        ...formData,
        title: sanitizeInputText(formData.projectName),
        category: formData.projectCategory || formData.projectType || "Other",
        thumbnailUrl: formData.projectImage || "",
        githubUrl: formData.githubLink || "",
        projectName: sanitizeInputText(formData.projectName),
        teamName: sanitizeInputText(formData.teamName),
        description: sanitizeInputText(formData.description),
        additionalNotes: sanitizeInputText(formData.additionalNotes),
        submittedBy: user?.id,
      };
      await projectService.submitProject(sanitizedData, {
        headers: {
          Authorization: token,
        },
      });

      toast.success("Project submitted successfully!");
      setFormData({
        projectName: "",
        teamName: "",
        email: "",
        githubLink: "",
        liveDemoLink: "",
        description: "",
        projectType: "",
        techStack: "",
        projectCategory: "",
        additionalNotes: "",
        projectImage: "",
        submissionCategory: "",
        teamMembersCount: "",
        projectDuration: "",
        targetAudience: "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err?.data?.message || err?.message || "Submission failed. Please try again.";
      toast.error(message, {
        // Provide a retry button in the toast
        action: {
          label: "Retry",
          onClick: () => handleSubmit(new Event("submit")),
        },
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define form fields with icons
  const formFields = [
    {
      label: "Project Name",
      name: "projectName",
      type: "text",
      placeholder: "Enter project name",
      icon: LightBulbIcon,
    },
    {
      label: "Team Name",
      name: "teamName",
      type: "text",
      placeholder: "Enter team name",
      icon: UserGroupIcon,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "your@email.com",
      icon: EnvelopeIcon,
    },
    {
      label: "GitHub Link",
      name: "githubLink",
      type: "url",
      placeholder: "https://github.com/username/project",
      icon: CodeBracketIcon,
    },
    {
      label: "Live Demo Link",
      name: "liveDemoLink",
      type: "url",
      placeholder: "https://project-demo.com",
      icon: LinkIcon,
    },
    {
      label: "Project Type",
      name: "projectType",
      type: "text",
      placeholder: "e.g., Web, Mobile, AI",
      icon: RectangleGroupIcon,
    },
    {
      label: "Tech Stack",
      name: "techStack",
      type: "text",
      placeholder: "e.g., React, Node.js, Python",
      icon: CpuChipIcon,
    },
    {
      label: "Project Category",
      name: "projectCategory",
      type: "text",
      placeholder: "e.g., Social Impact, Education, Gaming",
      icon: BookmarkIcon,
    },
    {
      label: "Team Members Count",
      name: "teamMembersCount",
      type: "number",
      placeholder: "Number of team members",
      icon: UserPlusIcon,
    },
    {
      label: "Project Duration",
      name: "projectDuration",
      type: "text",
      placeholder: "Estimated duration or timeline",
      icon: ClockIcon,
    },
    {
      label: "Target Audience",
      name: "targetAudience",
      type: "text",
      placeholder: "Who will benefit from this project?",
      icon: UsersIcon,
    },
    {
      label: "Project Logo / Image Link",
      name: "projectImage",
      type: "url",
      placeholder: "Image URL for your project",
      icon: PhotoIcon,
    },
    {
      label: "Submission Category",
      name: "submissionCategory",
      type: "text",
      placeholder: "Hackathon / Open Submission / Other",
      icon: ArchiveBoxIcon,
    },
  ];

  return (
    <div className="bg-bg text-text flex min-h-screen flex-col items-center justify-center px-4 py-12 pt-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-10 text-center"
        data-aos="fade-down"
        data-aos-once="true"
      >
        {/* UPDATED: Text colors */}
        <h1 className="text-primary mb-4 text-4xl font-extrabold sm:text-5xl">
          Submit Your Project
        </h1>
        <p className="text-text-light text-xs sm:text-base">
          &quot;Fill in the details below to showcase your project.&quot;
        </p>
      </motion.div>
      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-card-bg border-border mb-10 w-full max-w-4xl rounded-2xl border p-6 shadow-lg"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="mb-4 flex items-center gap-2">
          {/* UPDATED: Icon and title colors */}
          <LightBulbIcon className="text-primary h-6 w-6" />
          <h2 className="text-text text-2xl font-bold">Project Submission Guidelines</h2>
        </div>
        <ul className="text-text-light list-disc space-y-3 pl-6 text-sm sm:text-base">
          <li>
            Fill out <span className="font-medium">all mandatory fields</span> marked with an
            asterisk (*) to ensure your project is valid for submission.
          </li>
          <li>
            Provide a <span className="font-medium">clear and concise project name</span> and
            description to help reviewers understand your work quickly.
          </li>
          <li>
            Include <span className="font-medium">all relevant links</span> such as GitHub
            repository and live demo (if any) to demonstrate your project effectively.
          </li>
          <li>
            Specify your <span className="font-medium">team name and members count</span> accurately
            to reflect team participation.
          </li>
          <li>
            Clearly mention the{" "}
            <span className="font-medium">project type, tech stack, and category</span> to help
            categorize your submission.
          </li>
          <li>
            Add any <span className="font-medium">additional notes or special instructions</span>{" "}
            that reviewers should know about your project.
          </li>
          <li>
            Ensure <span className="font-medium">all links are accessible</span> and valid before
            submitting to avoid disqualification.
          </li>
          <li>
            Keep your submission <span className="font-medium">professional and accurate</span> —
            this helps your project stand out and get fair evaluation.
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
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
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <label className="text-text-light mb-1 flex items-center text-sm font-medium">
                <field.icon className="text-primary mr-2 h-5 w-5" />
                {field.label}
                {requiredFields.includes(field.name) && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              {field.name === "projectImage" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary hover:bg-bg/50"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {formData.projectImage ? (
                    <div className="border-border bg-bg group relative flex aspect-square w-full max-w-[200px] items-center justify-center overflow-hidden rounded-lg border">
                      <img
                        src={formData.projectImage}
                        alt="Project Preview"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-rose-600 p-1.5 text-white shadow-md transition-all duration-200 hover:bg-rose-500"
                        title="Remove image"
                        aria-label="button"
                      >
                        <XMarkIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="pointer-events-none space-y-2 text-center">
                      <ArrowUpTrayIcon
                        className={`text-primary mx-auto h-8 w-8 transition-transform duration-300 ${isDragging ? "animate-bounce" : ""}`}
                      />
                      <div className="text-text text-sm font-semibold">
                        Drag and drop your project logo here, or{" "}
                        <span className="text-primary underline decoration-wavy">browse</span>
                      </div>
                      <div className="text-text-light/60 text-xs">
                        Supports PNG, JPG, JPEG, SVG up to 5MB
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  ref={inputRefs[field.name]}
                  className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-lg border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
                />
              )}
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <label className="text-text-light mb-1 flex items-center text-sm font-medium">
              <DocumentTextIcon className="text-primary mr-2 h-5 w-5" />
              Project Description <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              ref={inputRefs.description}
              rows="4"
              placeholder="Briefly describe your project, its purpose, and features."
              className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-lg border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <label className="text-text-light mb-1 flex items-center text-sm font-medium">
              <PencilSquareIcon className="text-primary mr-2 h-5 w-5" />
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="3"
              placeholder="Any other information for the reviewers"
              className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-lg border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl p-3 font-semibold text-white shadow-lg transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Project"}
            {!isSubmitting && <ArrowRightIcon className="h-5 w-5" />}
          </motion.button>
        </form>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mt-12 mb-8 grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3"
        data-aos="fade-up"
        data-aos-delay="1500"
      >
        {[
          { number: "150+", label: "Projects Submitted", icon: FolderOpenIcon },
          { number: "75+", label: "Active Teams", icon: CodeBracketIcon },
          {
            number: "98%",
            label: "Successful Deployments",
            icon: CheckCircleIcon,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="bg-card-bg border-border flex flex-col items-center rounded-2xl border p-6 text-center shadow-xl"
            data-aos="zoom-in"
            data-aos-delay={1500 + index * 100}
          >
            <stat.icon className="text-primary mb-3 h-10 w-10" />
            <h3 className="text-3xl font-bold">{stat.number}</h3>
            <p className="text-text-light mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-card-bg border-border mt-10 w-full max-w-5xl rounded-2xl border p-10 text-center shadow-2xl"
        data-aos="fade-up"
        data-aos-delay="1900"
      >
        <div className="mb-4 flex items-center justify-center gap-2">
          <LightBulbIcon className="h-8 w-8 text-white" />
          <h2 className="text-3xl font-bold text-white">Ready to Launch Your Next Idea?</h2>
        </div>
        <p className="text-text-light mb-6 text-lg">
          Showcase your innovative projects to the community and track your progress easily.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className="bg-primary inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-white shadow-lg transition-all duration-300 hover:opacity-90"
          >
            <ArrowUpTrayIcon className="h-5 w-5" /> Submit Another Project
          </motion.button>

          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-bg text-text border-border hover:bg-card-bg inline-flex items-center justify-center gap-2 rounded-xl border px-8 py-3 shadow-lg transition-all duration-300"
          >
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            Explore Projects
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmitProject;
