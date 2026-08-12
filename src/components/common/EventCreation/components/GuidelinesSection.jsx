import { motion } from "framer-motion";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default function GuidelinesSection({ prefersReducedMotion }) {
  return (
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
  );
}
