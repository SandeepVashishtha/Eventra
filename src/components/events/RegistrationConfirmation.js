import {
  CalendarPlus,
  CheckCircle,
  Download,
  MapPin,
} from "lucide-react";
import RegistrationDetailsCard from "./RegistrationDetailsCard";
import {
  downloadConfirmation,
  addEventToCalendar,
} from "../../utils/registrationConfirmationUtils";

const RegistrationConfirmation = ({
  registration,
  onContinue,
}) => {
  if (!registration) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">
          Registration details are not available.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    downloadConfirmation(registration);
  };

  const handleAddToCalendar = () => {
    addEventToCalendar(registration);
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 sm:p-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle
            size={36}
            className="text-green-600 dark:text-green-400"
          />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
          Registration Successful!
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your registration has been successfully completed.
        </p>
      </div>

      {/* Registration ID */}
      <div className="mt-8 rounded-xl bg-indigo-50 p-4 text-center dark:bg-indigo-900/20">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Registration ID
        </p>

        <p className="mt-1 break-all text-lg font-bold text-indigo-700 dark:text-indigo-300">
          {registration.registrationId || "Not Available"}
        </p>
      </div>

      {/* Event Details */}
      <div className="mt-6">
        <RegistrationDetailsCard
          registration={registration}
        />
      </div>

      {/* Venue / Meeting Link */}
      {(registration.venue ||
        registration.meetingLink) && (
        <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <MapPin
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Event Location
              </p>

              {registration.meetingLink ? (
                <a
                  href={registration.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Join Meeting
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {registration.venue}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
        >
          <CalendarPlus size={19} />
          Add to Calendar
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <Download size={19} />
          Download Confirmation
        </button>
      </div>

      {/* Continue */}
      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 w-full rounded-xl px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Continue Browsing Events
        </button>
      )}
    </section>
  );
};

export default RegistrationConfirmation;