import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  createRegistrationSubmissionKey,
  getRegistrationGuardResult,
} from "../../utils/registrationDuplicateUtils";

import ExistingRegistrationAlert from "./ExistingRegistrationAlert";

const RegistrationDuplicateGuard = ({
  event = {},
  user = {},
  registrations = [],
  onRegister,
  children,
  registrationBasePath = "/registrations",
  disabled = false,
}) => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const userId =
    user.id ??
    user.userId ??
    user.user_id ??
    user.participantId;

  const eventId =
    event.id ??
    event.eventId ??
    event.event_id;

  const submissionKey =
    createRegistrationSubmissionKey({
      userId,
      eventId,
    });

  const guardResult =
    getRegistrationGuardResult({
      registrations,
      userId,
      eventId,
      registrationBasePath,
    });

  // Prevent registration when an existing
  // active registration is found.
  if (guardResult.blocked) {
    return (
      <ExistingRegistrationAlert
        registration={
          guardResult.existingRegistration
        }
        status={guardResult.status}
        registrationUrl={
          guardResult.registrationUrl
        }
        message={guardResult.message}
      />
    );
  }

  const handleRegistration = async () => {
    if (
      disabled ||
      isSubmitting ||
      !submissionKey
    ) {
      return;
    }

    setError("");

    // Check again immediately before submitting.
    const latestGuard =
      getRegistrationGuardResult({
        registrations,
        userId,
        eventId,
        registrationBasePath,
      });

    if (latestGuard.blocked) {
      return;
    }

    if (
      typeof onRegister !== "function"
    ) {
      setError(
        "Registration action is not available."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await onRegister({
        event,
        user,
        eventId,
        userId,
      });
    } catch (registrationError) {
      setError(
        registrationError?.message ||
          "Unable to complete registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render-prop usage.
  if (typeof children === "function") {
    return (
      <div className="w-full">
        {error && (
          <RegistrationError
            message={error}
          />
        )}

        {children({
          register:
            handleRegistration,
          isSubmitting,
          canRegister:
            !disabled &&
            !isSubmitting &&
            Boolean(submissionKey),
          event,
          user,
        })}
      </div>
    );
  }

  // Default registration button.
  return (
    <div className="w-full">
      {error && (
        <RegistrationError
          message={error}
        />
      )}

      <button
        type="button"
        onClick={handleRegistration}
        disabled={
          disabled ||
          isSubmitting ||
          !submissionKey
        }
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
          disabled ||
          isSubmitting ||
          !submissionKey
            ? "cursor-not-allowed bg-slate-400"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2
              size={17}
              className="animate-spin"
            />
            Registering...
          </>
        ) : (
          <>
            <CheckCircle2 size={17} />
            Register for Event
          </>
        )}
      </button>
    </div>
  );
};

const RegistrationError = ({
  message,
}) => {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
      />

      <div>
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">
          Registration failed
        </p>

        <p className="mt-1 text-xs leading-5 text-red-700 dark:text-red-400">
          {message}
        </p>
      </div>
    </div>
  );
};

export default RegistrationDuplicateGuard;