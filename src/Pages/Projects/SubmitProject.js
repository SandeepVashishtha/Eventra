import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  LightBulbIcon, // for Guidelines
  RocketLaunchIcon, // for CTA
} from "@heroicons/react/24/solid";
import {
  FolderOpenIcon,
  CodeBracketIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowUpTrayIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";

const SubmitProject = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    teamName: "",
    email: "",
    githubLink: "",
    liveDemoLink: "",
    description: "",
    projectType: "",
    techStack: "",
    additionalNotes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Project Submitted:", formData);
    alert("Project submitted successfully!");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Heading Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-10"
        data-aos="fade-down"
        data-aos-once="true"
      >
        {/* UPDATED: Text colors */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-4">
          Submit Your Project
        </h1>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
          "Fill in the details below to showcase your project."
        </p>
      </motion.div>
      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-indigo-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 mb-10"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="flex items-center gap-2 mb-4">
          {/* UPDATED: Icon and title colors */}
          <LightBulbIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-gray-100">
            Project Submission Guidelines
          </h2>
        </div>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
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

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-indigo-300 dark:border-gray-700"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          {[
            {
              label: "Project Name",
              name: "projectName",
              type: "text",
              placeholder: "Enter project name",
              required: true,
            },
            {
              label: "Team Name",
              name: "teamName",
              type: "text",
              placeholder: "Enter team name",
              required: true,
            },
            {
              label: "Email",
              name: "email",
              type: "email",
              placeholder: "your@email.com",
              required: true,
            },
            {
              label: "GitHub Link",
              name: "githubLink",
              type: "url",
              placeholder: "https://github.com/username/project",
              required: true,
            },
            {
              label: "Live Demo Link",
              name: "liveDemoLink",
              type: "url",
              placeholder: "https://project-demo.com",
              required: false,
            },
            {
              label: "Project Type",
              name: "projectType",
              type: "text",
              placeholder: "e.g., Web, Mobile, AI",
              required: false,
            },
            {
              label: "Tech Stack",
              name: "techStack",
              type: "text",
              placeholder: "Technologies used",
              required: false,
            },
            {
              label: "Project Category",
              name: "projectCategory",
              type: "text",
              placeholder: "e.g., Social Impact, Education, Gaming",
              required: false,
            },
            {
              label: "Team Members Count",
              name: "teamMembersCount",
              type: "number",
              placeholder: "Number of team members",
              required: false,
            },
            {
              label: "Project Duration",
              name: "projectDuration",
              type: "text",
              placeholder: "Estimated duration or timeline",
              required: false,
            },
            {
              label: "Target Audience",
              name: "targetAudience",
              type: "text",
              placeholder: "Who will benefit from this project?",
              required: false,
            },
            {
              label: "Additional Notes",
              name: "additionalNotes",
              type: "text",
              placeholder: "Any other info",
              required: false,
            },
            {
              label: "Project Logo / Image Link",
              name: "projectImage",
              type: "url",
              placeholder: "Image URL for your project",
              required: false,
            },
            {
              label: "Submission Category",
              name: "submissionCategory",
              type: "text",
              placeholder: "Hackathon / Open Submission / Other",
              required: false,
            },
          ].map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-aos="fade-right"
              data-aos-delay={index * 50 + 600}
            >
              {/* UPDATED: Label color */}
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              {field.name === "additionalNotes" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
                />
              )}
            </motion.div>
          ))}

          {/* Submit Button */}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold p-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
            data-aos="zoom-in"
            data-aos-delay="1400"
          >
            Submit Project <ArrowRightIcon className="w-5 h-5" />
          </motion.button>
        </form>
      </motion.div>

      {/* Stats Section */}
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
            // UPDATED: Stat card background and border
            className="bg-white dark:bg-gray-800 border border-indigo-300 dark:border-gray-700 rounded-2xl shadow-xl p-6 text-center flex flex-col items-center"
            data-aos="zoom-in"
            data-aos-delay={1500 + index * 100}
          >
            {/* UPDATED: Icon and text colors */}
            <stat.icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3 animate-bounce" />
            <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
              {stat.number}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section - Dark Background with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-5xl mt-10 text-center bg-gradient-to-r from-black via-indigo-900 via-purple-900 to-indigo-800 border border-indigo-700 rounded-2xl p-10 shadow-2xl"
        data-aos="fade-up"
        data-aos-delay="1900"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <ArrowUpTrayIcon className="w-8 h-8 text-white animate-bounce" />
          <h2 className="text-3xl font-bold text-white">
            Submit Your Next Project
          </h2>
        </div>
        <p className="text-gray-300 mb-6 text-lg">
          Showcase your innovative ideas to the community. Keep submitting
          projects and track your progress easily!
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <motion.a
            href="/submit-project"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            <ArrowUpTrayIcon className="w-5 h-5" /> Submit Another Project
          </motion.a>

          <motion.a
            href="/projects"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-indigo-700 transition-all duration-300"
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