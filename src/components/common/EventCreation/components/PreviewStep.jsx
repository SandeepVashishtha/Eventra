import React from "react";
import { motion } from "framer-motion";
import {
  TagIcon,
  TicketIcon,
  CheckCircleIcon,
  PencilIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { LoadingButton } from "../../../ui/LoadingButton";
import {
  formatDate,
  formatTime,
} from "../../../../utils/eventCreationUtils";
import { CREATION_STEPS } from "../../../../constants/eventDefaults";

const PreviewStep = ({
  formData,
  categories,
  submitError,
  isSubmitting,
  createEvent,
  setCurrentStep,
}) => {
  return (
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
                  {formData.isMultiDay
                    ? `${formatDate(formData.startDate)} - ${formatDate(
                        formData.endDate
                      )}`
                    : formatDate(formData.date)}
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

      <div className="mt-8 flex flex-col items-center">
        {submitError && (
          <div className="error-banner w-full mb-4" role="alert">
            ❌ {submitError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <motion.button
            onClick={() => setCurrentStep(CREATION_STEPS.FORM)}
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
  );
};

export default PreviewStep;