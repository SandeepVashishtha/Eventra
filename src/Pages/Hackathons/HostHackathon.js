import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

import {
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  ClipboardDocumentListIcon, // for Guidelines
  RocketLaunchIcon, // for CTA
} from "@heroicons/react/24/solid";

const HostHackathon = () => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const requiredFields = [
      "hackathonName",
      "organizerName",
      "email",
      "location",
      "startDate",
      "endDate",
      "description",
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        throw new Error(`${field.replace(/([A-Z])/g, " $1")} is required!`);
      }
    }

    toast.success("Hackathon submitted successfully!");

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
  } catch (error) {
    toast.error(error.message || "Something went wrong!");
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-white dark:from-gray-900 dark:to-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
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
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-800 dark:text-indigo-300 mb-4">
          Host Your Hackathon
        </h1>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
          "Fill in the details below and let's get your hackathon live!"
        </p>
      </motion.div>

      {/* Guidelines Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-indigo-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 mb-10"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="flex items-center gap-2 mb-3">
          <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
            Guidelines
          </h2>
        </div>
        <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
          <li>
            Clearly define the{" "}
            <span className="font-medium">objectives, theme, and rules</span> of
            your hackathon so participants know the purpose and scope.
          </li>
          <li>
            Mention <span className="font-medium">eligibility criteria</span>{" "}
            such as student status, professional background, or region to avoid
            confusion later.
          </li>
          <li>
            Ensure the{" "}
            <span className="font-medium">timeline (start and end dates)</span>{" "}
            is accurate and realistic, giving teams enough time to brainstorm
            and build.
          </li>
          <li>
            Highlight{" "}
            <span className="font-medium">
              prize distribution and judging criteria
            </span>{" "}
            to motivate participants and maintain transparency in evaluation.
          </li>
          <li>
            Provide clear{" "}
            <span className="font-medium">
              contact details or a support channel
            </span>{" "}
            so participants can ask questions during the event.
          </li>
          <li>
            Promote{" "}
            <span className="font-medium">inclusivity and diversity</span> by
            encouraging people from different backgrounds, genders, and skill
            levels to participate.
          </li>
          <li>
            Set{" "}
            <span className="font-medium">
              submission guidelines and deadlines
            </span>{" "}
            (format, platform, file types) to ensure smooth evaluation of
            projects.
          </li>
          <li>
            Encourage{" "}
            <span className="font-medium">collaboration and team spirit</span>{" "}
            by promoting teamwork, idea-sharing, and peer learning during the
            event.
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
              label: "Hackathon Name",
              name: "hackathonName",
              type: "text",
              placeholder: "Enter hackathon name",
              required: true,
            },
            {
              label: "Organization/Organizer Name",
              name: "organizerName",
              type: "text",
              placeholder: "Enter your name or organization",
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
              label: "Location (Online / City)",
              name: "location",
              type: "text",
              placeholder: "e.g., Online or New York City",
              required: true,
            },
            {
              label: "Participant Limit",
              name: "participantLimit",
              type: "number",
              placeholder: "Maximum number of participants",
              required: false,
            },
            {
              label: "Prize Details",
              name: "prizeDetails",
              type: "text",
              placeholder: "Mention prizes if any",
              required: false,
            },
            {
              label: "Website / Registration Link",
              name: "website",
              type: "url",
              placeholder: "https://example.com",
              required: false,
            },
          ].map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              data-aos="fade-right"
              data-aos-delay={index * 50 + 500}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
              />
            </motion.div>
          ))}

          {/* Date Fields */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            data-aos="fade-up"
            data-aos-delay="900"
          >
            {["Start Date", "End Date"].map((label, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {label}
                </label>
                <input
                  type="date"
                  name={label === "Start Date" ? "startDate" : "endDate"}
                  value={
                    label === "Start Date"
                      ? formData.startDate
                      : formData.endDate
                  }
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            data-aos="fade-up"
            data-aos-delay="1000"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Briefly describe your hackathon"
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300"
            />
          </motion.div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold p-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            Submit Hackathon <ArrowRightIcon className="w-5 h-5" />
          </button>
        </form>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mb-8 mt-12"
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
            className="bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-2xl shadow-md p-6 text-center flex flex-col items-center"
            data-aos="zoom-in"
            data-aos-delay={1200 + index * 100}
          >
            {/* UPDATED: Icon and text colors */}
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

      {/* CTA Section - Dark Background */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-4xl mt-10 text-center bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 border border-indigo-800 rounded-2xl p-10 shadow-2xl"
        data-aos="fade-up"
        data-aos-delay="1600"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <RocketLaunchIcon className="w-8 h-8 text-indigo-400" />
          <h2 className="text-3xl font-bold text-white">
            Ready to Inspire the Next Big Innovation?
          </h2>
        </div>
        <p className="text-gray-300 mb-6 text-lg">
          Hosting a hackathon is your chance to bring creative minds together,
          solve real-world problems, and build impactful projects. Take the lead
          today!
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            Explore Hosting Options
          </motion.a>

          <motion.a
            href="/hackathons"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-gradient-to-r from-cyan-500 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:from-cyan-600 hover:to-indigo-700 transition-all duration-300"
          >
            Explore Hackathons
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
};

export default HostHackathon;
