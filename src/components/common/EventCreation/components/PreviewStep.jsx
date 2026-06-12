import {
  TagIcon,
  Ticket,
  CheckCircleIcon,
  PencilIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { LoadingButton } from "../../../ui/LoadingButton";
import { formatDate, formatTime } from "../../../../utils/eventCreationUtils";
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
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-indigo-800 dark:text-indigo-300">
          Preview Your Event
        </h1>

        <p className="text-gray-600 dark:text-gray-400">Review all details before publishing</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-indigo-300 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        {formData.bannerPreview && (
          <div className="h-64 w-full overflow-hidden">
            <img
              loading="lazy"
              src={formData.bannerPreview}
              alt="Event banner"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {formData.title}
          </h2>

          <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-300">
            {formData.description}
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-4 dark:bg-gray-700">
              <TagIcon className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Category</p>

                <p className="text-gray-600 dark:text-gray-400">
                  {categories.find((cat) => cat.value === formData.category)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-4 dark:bg-gray-700">
              <CalendarIcon className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Date & Time</p>

                <p className="text-gray-600 dark:text-gray-400">
                  {formData.isMultiDay
                    ? `${formatDate(formData.startDate)} - ${formatDate(formData.endDate)}`
                    : formatDate(formData.date)}
                </p>

                <p className="text-gray-600 dark:text-gray-400">
                  {formatTime(formData.startTime)} - {formatTime(formData.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-4 dark:bg-gray-700">
              <MapPinIcon className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Location</p>

                <p className="text-gray-600 dark:text-gray-400">
                  {formData.isVirtual ? "Virtual Event" : formData.location.name}
                </p>

                {formData.location.address && !formData.isVirtual && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.location.address}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-4 dark:bg-gray-700">
              <UsersIcon className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400" />

              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Capacity</p>

                <p className="text-gray-600 dark:text-gray-400">
                  {formData.capacity === "" ? "Unlimited" : `${formData.capacity} attendees`}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.isPublic ? "Public" : "Private"} Event
                </p>
              </div>
            </div>
          </div>

          {formData.ticketTiers.length > 0 && formData.ticketTiers[0].name && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  Ticket Tiers
                </h3>
              </div>

              <div className="space-y-3">
                {formData.ticketTiers.map((tier, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{tier.name}</p>

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
              <h3 className="mb-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Tags</h3>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.requiresApproval && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                ⚠️ This event requires approval for registration
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center">
        {submitError && (
          <div className="error-banner mb-4 w-full" role="alert">
            ❌ {submitError}
          </div>
        )}

        <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
          <motion.button
            onClick={() => setCurrentStep(CREATION_STEPS.FORM)}
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-500 bg-white px-8 py-3 font-semibold text-indigo-600 shadow-lg transition-all duration-300 hover:bg-indigo-50 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-gray-600"
          >
            <PencilIcon className="h-5 w-5" />
            Edit Event
          </motion.button>

          <LoadingButton
            onClick={createEvent}
            isLoading={isSubmitting}
            loadingText="Creating Event..."
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Create Event
          </LoadingButton>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewStep;
