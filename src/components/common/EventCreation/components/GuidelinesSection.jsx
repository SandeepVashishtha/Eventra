import { motion } from "framer-motion";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default function GuidelinesSection({ prefersReducedMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
      className="mb-10 w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-3 flex items-center gap-2">
        <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400">
          Guidelines
        </h2>
      </div>
      <ul className="list-disc space-y-3 pl-6 text-sm text-gray-700 sm:text-base dark:text-gray-300">
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
