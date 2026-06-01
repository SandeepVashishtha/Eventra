import { ArrowRightIcon, LightBulbIcon, FolderOpenIcon, CodeBracketIcon, CheckCircleIcon, ArrowUpTrayIcon, ClipboardDocumentCheckIcon, // Icons for form fields
  UserGroupIcon, EnvelopeIcon, LinkIcon, RectangleGroupIcon, CpuChipIcon, BookmarkIcon, UsersIcon, ClockIcon, UserPlusIcon, PhotoIcon, ArchiveBoxIcon, DocumentTextIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_ENDPOINTS, apiUtils } from "../../config/api";
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
  if (data.projectName && (data.projectName.trim().length < 3 || data.projectName.trim().length > 100)) {
    newErrors.projectName = "Project Name must be between 3 and 100 characters.";
  }
  if (data.teamName && (data.teamName.trim().length < 3 || data.teamName.trim().length > 100)) {
    newErrors.teamName = "Team Name must be between 3 and 100 characters.";
  }
  if (data.description && (data.description.trim().length < 20 || data.description.trim().length > 2000)) {
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
        ...formFields.map(field => field.name),
        "description",
        "additionalNotes"
      ];

      const firstErrorField = fieldsInOrder.find(
        (field) => validationErrors[field]
      );

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
      // Sanitize text fields before sending
      const sanitizedData = {
        ...formData,
        projectName: sanitizeInputText(formData.projectName),
        teamName: sanitizeInputText(formData.teamName),
        description: sanitizeInputText(formData.description),
        additionalNotes: sanitizeInputText(formData.additionalNotes),
        submittedBy: user?.id,
      };
      await apiUtils.post(
        API_ENDPOINTS.PROJECTS.SUBMIT,
        sanitizedData,
        {
          headers: {
            Authorization: token
          }
        }
      );

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
          onClick: () => handleSubmit(new Event('submit')),
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
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
        data-aos="fade-down"
        data-aos-once="true"
      >
        {/* UPDATED: Text colors */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-4">
          Submit Your Project
        </h1>
        <p className="text-xs sm:text-base text-text-light">
          &quot;Fill in the details below to showcase your project.&quot;
        </p>
      </motion.div>
      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-card-bg border border-border shadow-lg rounded-2xl p-6 mb-10"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="flex items-center gap-2 mb-4">
          {/* UPDATED: Icon and title colors */}
          <LightBulbIcon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">
            Project Submission Guidelines
          </h2>
        </div>
        <ul className="list-disc pl-6 space-y-3 text-text-light text-sm sm:text-base">
          <li>
            Fill out <span className="font-medium">all mandatory fields</span>{" "}
            marked with an asterisk (*) to ensure your project is valid for
            submission.
          </li>
          <li>
            Provide a{" "}
            <span className="font-medium">clear and concise project name</span>{" "}
            and description to help reviewers understand your work quickly.
          </li>
          <li>
            Include <span className="font-medium">all relevant links</span> such
            as GitHub repository and live demo (if any) to demonstrate your
            project effectively.
          </li>
          <li>
            Specify your{" "}
            <span className="font-medium">team name and members count</span>{" "}
            accurately to reflect team participation.
          </li>
          <li>
            Clearly mention the{" "}
            <span className="font-medium">
              project type, tech stack, and category
            </span>{" "}
            to help categorize your submission.
          </li>
          <li>
            Add any{" "}
            <span className="font-medium">
              additional notes or special instructions
            </span>{" "}
            that reviewers should know about your project.
          </li>
          <li>
            Ensure <span className="font-medium">all links are accessible</span>{" "}
            and valid before submitting to avoid disqualification.
          </li>
          <li>
            Keep your submission{" "}
            <span className="font-medium">professional and accurate</span> —
            this helps your project stand out and get fair evaluation.
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-card-bg shadow-xl rounded-2xl p-8 border border-border"
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
              <label className="flex items-center text-sm font-medium text-text-light mb-1">
                <field.icon className="w-5 h-5 mr-2 text-primary" />
                {field.label}
                {requiredFields.includes(field.name) && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {field.name === "projectImage" ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
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
                    <div className="relative w-full max-w-[200px] aspect-square flex items-center justify-center rounded-lg border border-border overflow-hidden bg-bg group">
                      <img
                        src={formData.projectImage}
                        alt="Project Preview"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md transition-all duration-200 cursor-pointer"
                        title="Remove image"
                       aria-label="button">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 pointer-events-none">
                      <ArrowUpTrayIcon className={`w-8 h-8 mx-auto text-primary transition-transform duration-300 ${isDragging ? "animate-bounce" : ""}`} />
                      <div className="text-sm font-semibold text-text">
                        Drag and drop your project logo here, or <span className="text-primary underline decoration-wavy">browse</span>
                      </div>
                      <div className="text-xs text-text-light/60">
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
                  className="w-full border border-border rounded-lg p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                />
              )}
              {errors[field.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[field.name]}
                </p>
              )}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <label className="flex items-center text-sm font-medium text-text-light mb-1">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-primary" />
              Project Description <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              ref={inputRefs.description}
              rows="4"
              placeholder="Briefly describe your project, its purpose, and features."
              className="w-full border border-border rounded-lg p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <label className="flex items-center text-sm font-medium text-text-light mb-1">
              <PencilSquareIcon className="w-5 h-5 mr-2 text-primary" />
              Additional Notes
            </label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="3"
              placeholder="Any other information for the reviewers"
              className="w-full border border-border rounded-lg p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
            />
          </motion.div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold p-3 rounded-xl shadow-lg transition-all duration-300 bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Project"}
            {!isSubmitting && <ArrowRightIcon className="w-5 h-5" />}
          </motion.button>
        </form>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-5xl mb-8 mt-12"
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
            className="bg-card-bg border border-border shadow-xl rounded-2xl p-6 text-center flex flex-col items-center"
            data-aos="zoom-in"
            data-aos-delay={1500 + index * 100}
          >
            <stat.icon className="w-10 h-10 text-primary mb-3" />
            <h3 className="text-3xl font-bold">
              {stat.number}
            </h3>
            <p className="text-text-light mt-2">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl mt-10 text-center bg-card-bg border border-border rounded-2xl p-10 shadow-2xl"
        data-aos="fade-up"
        data-aos-delay="1900"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <LightBulbIcon className="w-8 h-8 text-white" />
          <h2 className="text-3xl font-bold text-white">
            Ready to Launch Your Next Idea?
          </h2>
        </div>
        <p className="text-text-light mb-6 text-lg">
          Showcase your innovative projects to the community and track your
          progress easily.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all duration-300"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Submit Another Project
          </motion.button>
          
          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 bg-bg text-text border border-border px-8 py-3 rounded-xl shadow-lg hover:bg-card-bg transition-all duration-300"
          >
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            Explore Projects
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default SubmitProject;
