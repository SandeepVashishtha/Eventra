import React, {
  useEffect,
  useState,
} from "react";

export type RegistrationStatus =
  | "loading"
  | "not_registered"
  | "registered"
  | "pending"
  | "cancelled"
  | "unknown";

interface DuplicateRegistrationGuardProps {
  eventId: string;

  /**
   * Existing registration status.
   *
   * If your application already fetches this
   * information, pass it here instead of making
   * another request.
   */
  registrationStatus?: RegistrationStatus;

  /**
   * Called when the user attempts to register.
   *
   * The parent should connect this to Eventra's
   * existing registration API.
   */
  onRegister: () => Promise<void> | void;

  /**
   * Optional callback when the existing registration
   * is selected.
   */
  onViewRegistration?: () => void;

  /**
   * Whether the current user is authenticated.
   */
  isAuthenticated?: boolean;

  /**
   * Optional custom registration label.
   */
  registerLabel?: string;

  className?: string;
}

const DuplicateRegistrationGuard: React.FC<
  DuplicateRegistrationGuardProps
> = ({
  eventId,
  registrationStatus = "unknown",
  onRegister,
  onViewRegistration,
  isAuthenticated = true,
  registerLabel = "Register for Event",
  className = "",
}) => {
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    localStatus,
    setLocalStatus,
  ] = useState<RegistrationStatus>(
    registrationStatus
  );

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    setLocalStatus(
      registrationStatus
    );
  }, [registrationStatus]);

  const alreadyRegistered =
    localStatus === "registered" ||
    localStatus === "pending";

  const canRegister =
    localStatus ===
      "not_registered" ||
    localStatus ===
      "unknown";

  const handleRegister =
    async () => {
      if (!isAuthenticated) {
        setError(
          "Please sign in before registering."
        );

        return;
      }

      /**
       * Frontend guard.
       *
       * This prevents repeated clicks while the
       * registration request is in progress.
       */
      if (isSubmitting) {
        return;
      }

      /**
       * Prevent registration when the user is
       * already registered.
       */
      if (alreadyRegistered) {
        return;
      }

      if (!canRegister) {
        return;
      }

      setError("");
      setIsSubmitting(true);

      try {
        await onRegister();

        /**
         * Optimistically update the UI after a
         * successful registration request.
         *
         * The backend must still perform the
         * authoritative duplicate check.
         */
        setLocalStatus(
          "registered"
        );
      } catch (registrationError) {
        console.error(
          "Event registration failed:",
          registrationError
        );

        setError(
          registrationError instanceof
            Error
            ? registrationError.message
            : "Registration could not be completed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  if (!isAuthenticated) {
    return (
      <div
        className={`
          w-full
          ${className}
        `}
      >
        <button
          type="button"
          disabled
          className="
            w-full
            cursor-not-allowed
            rounded-xl
            bg-gray-300
            px-5
            py-3
            text-sm
            font-semibold
            text-gray-600
            dark:bg-gray-700
            dark:text-gray-400
          "
        >
          Sign in to Register
        </button>
      </div>
    );
  }

  if (
    localStatus ===
    "registered"
  ) {
    return (
      <div
        className={`
          w-full
          rounded-xl
          border
          border-green-200
          bg-green-50
          p-4
          dark:border-green-900
          dark:bg-green-950/30
          ${className}
        `}
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm
                font-bold
                text-green-800
                dark:text-green-300
              "
            >
              ✓ Already Registered
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-green-700
                dark:text-green-400
              "
            >
              You already have a valid
              registration for this event.
              You cannot register again.
            </p>
          </div>

          {onViewRegistration && (
            <button
              type="button"
              onClick={
                onViewRegistration
              }
              className="
                shrink-0
                rounded-lg
                bg-green-600
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                hover:bg-green-700
              "
            >
              View Registration
            </button>
          )}
        </div>
      </div>
    );
  }

  if (
    localStatus ===
    "pending"
  ) {
    return (
      <div
        className={`
          w-full
          rounded-xl
          border
          border-yellow-200
          bg-yellow-50
          p-4
          dark:border-yellow-900
          dark:bg-yellow-950/30
          ${className}
        `}
      >
        <p
          className="
            text-sm
            font-bold
            text-yellow-800
            dark:text-yellow-300
          "
        >
          Registration Pending
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-yellow-700
            dark:text-yellow-400
          "
        >
          Your registration is already
          being processed. Please wait
          instead of submitting again.
        </p>
      </div>
    );
  }

  if (
    localStatus ===
    "cancelled"
  ) {
    return (
      <div
        className={`
          w-full
          rounded-xl
          border
          border-gray-200
          bg-gray-50
          p-4
          dark:border-gray-700
          dark:bg-gray-800
          ${className}
        `}
      >
        <p
          className="
            text-sm
            font-bold
            text-gray-700
            dark:text-gray-300
          "
        >
          Previous Registration Cancelled
        </p>

        <p
          className="
            mt-1
            text-xs
            leading-5
            text-gray-500
            dark:text-gray-400
          "
        >
          Your previous registration was
          cancelled. Registration availability
          is determined by the event's current
          registration rules.
        </p>

        <button
          type="button"
          onClick={
            handleRegister
          }
          disabled={
            isSubmitting
          }
          className="
            mt-3
            rounded-lg
            bg-blue-600
            px-4
            py-2
            text-xs
            font-semibold
            text-white
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isSubmitting
            ? "Checking..."
            : registerLabel}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`
        w-full
        ${className}
      `}
    >
      {error && (
        <div
          role="alert"
          className="
            mb-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-3
            text-sm
            text-red-700
            dark:border-red-900
            dark:bg-red-950/30
            dark:text-red-300
          "
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={
          handleRegister
        }
        disabled={
          isSubmitting ||
          !canRegister
        }
        aria-busy={
          isSubmitting
        }
        data-event-id={
          eventId
        }
        className="
          w-full
          rounded-xl
          bg-blue-600
          px-5
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-blue-700
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:ring-offset-2
          disabled:cursor-not-allowed
          disabled:opacity-50
          dark:focus:ring-offset-gray-900
        "
      >
        {isSubmitting
          ? "Registering..."
          : registerLabel}
      </button>

      <p
        className="
          mt-2
          text-center
          text-[11px]
          text-gray-400
        "
      >
        Registration is limited to one
        registration per user for this event.
      </p>
    </div>
  );
};

export default DuplicateRegistrationGuard;