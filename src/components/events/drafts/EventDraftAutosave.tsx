import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Represents the data entered in an event creation form.
 *
 * Keep this interface compatible with the existing Eventra
 * event form rather than duplicating an application-level
 * event model.
 */
export interface EventDraftFormData {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  capacity?: number | string;
  image?: string;
  [key: string]: unknown;
}

/**
 * Saved autosave record.
 */
interface AutosavedEventDraft {
  data: EventDraftFormData;
  savedAt: string;
  version: number;
}

/**
 * Props for the autosave manager.
 */
export interface EventDraftAutosaveProps {
  /**
   * Current event form values.
   */
  formData: EventDraftFormData;

  /**
   * Called when previously autosaved data is restored.
   */
  onRestore: (
    data: EventDraftFormData
  ) => void;

  /**
   * Optional identifier for an existing draft.
   *
   * If supplied, autosave data is associated with
   * that specific draft.
   */
  draftId?: string;

  /**
   * Optional event creation session identifier.
   *
   * Useful when the organizer has not created a
   * persistent draft yet.
   */
  sessionId?: string;

  /**
   * Autosave interval in milliseconds.
   *
   * Defaults to 10 seconds.
   */
  interval?: number;

  /**
   * Whether autosave should be enabled.
   */
  enabled?: boolean;

  /**
   * Optional callback after successful autosave.
   */
  onAutosave?: (
    savedAt: Date
  ) => void;

  /**
   * Optional class name.
   */
  className?: string;
}

/**
 * Storage prefix prevents collisions with unrelated
 * localStorage values used by Eventra.
 */
const STORAGE_PREFIX =
  "eventra:event-draft-autosave";

/**
 * Current storage version.
 *
 * Increment this when the local autosave structure
 * changes in a backwards-incompatible way.
 */
const STORAGE_VERSION = 1;

/**
 * Default autosave interval.
 */
const DEFAULT_INTERVAL = 10000;

/**
 * Builds a unique local storage key.
 */
const getStorageKey = (
  draftId?: string,
  sessionId?: string
): string => {
  const identifier =
    draftId ||
    sessionId ||
    "new-event";

  return `${STORAGE_PREFIX}:${identifier}`;
};

/**
 * Safely parses an autosave record.
 *
 * Invalid localStorage data should never prevent
 * the event creation page from loading.
 */
const readAutosavedDraft = (
  key: string
): AutosavedEventDraft | null => {
  try {
    const raw =
      window.localStorage.getItem(
        key
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object"
    ) {
      return null;
    }

    if (
      typeof parsed.savedAt !==
      "string"
    ) {
      return null;
    }

    if (
      !parsed.data ||
      typeof parsed.data !==
        "object"
    ) {
      return null;
    }

    return {
      data: parsed.data,
      savedAt: parsed.savedAt,
      version:
        typeof parsed.version ===
        "number"
          ? parsed.version
          : STORAGE_VERSION,
    };
  } catch {
    return null;
  }
};

/**
 * Saves an autosave record.
 *
 * This only stores incomplete form data locally.
 * It does not publish or submit an event.
 */
const writeAutosavedDraft = (
  key: string,
  data: EventDraftFormData
): Date | null => {
  try {
    const savedAt = new Date();

    const record: AutosavedEventDraft =
      {
        data,
        savedAt:
          savedAt.toISOString(),
        version:
          STORAGE_VERSION,
      };

    window.localStorage.setItem(
      key,
      JSON.stringify(record)
    );

    return savedAt;
  } catch {
    return null;
  }
};

/**
 * Deletes an autosaved record.
 */
const removeAutosavedDraft = (
  key: string
): void => {
  try {
    window.localStorage.removeItem(
      key
    );
  } catch {
    // Ignore storage errors.
  }
};

/**
 * Determines whether two form values are
 * meaningfully different.
 */
const serializeFormData = (
  data: EventDraftFormData
): string => {
  try {
    return JSON.stringify(data);
  } catch {
    return "";
  }
};

/**
 * Formats the saved time for display.
 */
const formatSavedTime = (
  date: Date | null
): string => {
  if (!date) {
    return "";
  }

  return date.toLocaleTimeString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }
  );
};

/**
 * EventDraftAutosave
 *
 * Provides client-side autosaving for an event
 * creation/editing form.
 *
 * Important:
 * - It does NOT publish an event.
 * - It does NOT submit the event.
 * - It only stores form progress.
 * - Restored data must still be explicitly submitted
 *   through the normal event creation workflow.
 */
const EventDraftAutosave: React.FC<
  EventDraftAutosaveProps
> = ({
  formData,
  onRestore,
  draftId,
  sessionId,
  interval = DEFAULT_INTERVAL,
  enabled = true,
  onAutosave,
  className = "",
}) => {
  /**
   * Current autosave status.
   */
  const [
    status,
    setStatus,
  ] = useState<
    "idle" |
    "saving" |
    "saved" |
    "error"
  >("idle");

  /**
   * Last successful save time.
   */
  const [
    lastSavedAt,
    setLastSavedAt,
  ] = useState<Date | null>(
    null
  );

  /**
   * Whether a restore option is available.
   */
  const [
    hasRecovery,
    setHasRecovery,
  ] = useState(false);

  /**
   * Store the last serialized form state so we
   * don't repeatedly write identical data.
   */
  const lastSavedData =
    useRef<string>("");

  /**
   * Keep the latest form data available to
   * interval callbacks without recreating the
   * interval every time a field changes.
   */
  const latestFormData =
    useRef<EventDraftFormData>(
      formData
    );

  /**
   * Current storage key.
   */
  const storageKey =
    useMemo(
      () =>
        getStorageKey(
          draftId,
          sessionId
        ),
      [draftId, sessionId]
    );

  /**
   * Keep latest form data synchronized.
   */
  useEffect(() => {
    latestFormData.current =
      formData;
  }, [formData]);

  /**
   * Check for an existing autosaved record
   * whenever the draft/session changes.
   */
  useEffect(() => {
    if (!enabled) {
      setHasRecovery(false);
      return;
    }

    const existing =
      readAutosavedDraft(
        storageKey
      );

    if (!existing) {
      setHasRecovery(false);
      return;
    }

    const savedSerialized =
      serializeFormData(
        existing.data
      );

    const currentSerialized =
      serializeFormData(
        formData
      );

    if (
      savedSerialized !==
      currentSerialized
    ) {
      setHasRecovery(true);
      return;
    }

    setHasRecovery(false);

    const savedDate =
      new Date(existing.savedAt);

    if (
      !Number.isNaN(
        savedDate.getTime()
      )
    ) {
      setLastSavedAt(
        savedDate
      );

      lastSavedData.current =
        savedSerialized;
    }
  }, [
    storageKey,
    enabled,
  ]);

  /**
   * Perform an autosave.
   */
  const saveDraft =
    useCallback(() => {
      if (!enabled) {
        return;
      }

      const currentData =
        latestFormData.current;

      const serialized =
        serializeFormData(
          currentData
        );

      /**
       * Don't save when nothing has changed.
       */
      if (
        serialized ===
        lastSavedData.current
      ) {
        return;
      }

      setStatus("saving");

      const savedAt =
        writeAutosavedDraft(
          storageKey,
          currentData
        );

      if (!savedAt) {
        setStatus("error");
        return;
      }

      lastSavedData.current =
        serialized;

      setLastSavedAt(
        savedAt
      );

      setHasRecovery(false);
      setStatus("saved");

      onAutosave?.(savedAt);
    }, [
      enabled,
      storageKey,
      onAutosave,
    ]);

  /**
   * Autosave periodically.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer =
      window.setInterval(
        saveDraft,
        Math.max(
          interval,
          1000
        )
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    enabled,
    interval,
    saveDraft,
  ]);

  /**
   * Also save when the page becomes hidden.
   *
   * This helps reduce data loss if the user changes
   * tabs or navigates away.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          saveDraft();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    enabled,
    saveDraft,
  ]);

  /**
   * Restore the previously autosaved form.
   */
  const handleRestore =
    useCallback(() => {
      const existing =
        readAutosavedDraft(
          storageKey
        );

      if (!existing) {
        setHasRecovery(false);
        return;
      }

      onRestore(existing.data);

      const restoredDate =
        new Date(
          existing.savedAt
        );

      if (
        !Number.isNaN(
          restoredDate.getTime()
        )
      ) {
        setLastSavedAt(
          restoredDate
        );
      }

      lastSavedData.current =
        serializeFormData(
          existing.data
        );

      setHasRecovery(false);
      setStatus("saved");
    }, [
      storageKey,
      onRestore,
    ]);

  /**
   * Ignore an autosaved version.
   *
   * This is useful when the organizer intentionally
   * wants to keep the current form instead.
   */
  const handleDismissRecovery =
    useCallback(() => {
      removeAutosavedDraft(
        storageKey
      );

      setHasRecovery(false);
    }, [storageKey]);

  /**
   * Manually save the current form.
   *
   * This is still an autosave operation and does not
   * publish the event.
   */
  const handleSaveNow =
    () => {
      saveDraft();
    };

  /**
   * Clear autosaved information.
   *
   * This should be used only when the organizer
   * intentionally wants to discard recovery data.
   */
  const handleClearAutosave =
    () => {
      removeAutosavedDraft(
        storageKey
      );

      lastSavedData.current =
        "";

      setLastSavedAt(null);
      setHasRecovery(false);
      setStatus("idle");
    };

  /**
   * Don't display the UI when the feature is disabled.
   */
  if (!enabled) {
    return null;
  }

  return (
    <div
      className={`
        w-full
        ${className}
      `}
    >
      {/* Recovery notification */}
      {hasRecovery && (
        <div
          className="
            mb-4
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-4
            dark:border-blue-800
            dark:bg-blue-950/30
          "
          role="alert"
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
                  text-blue-800
                  dark:text-blue-300
                "
              >
                Unsaved event information found
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-blue-700
                  dark:text-blue-400
                "
              >
                We found information saved from
                your previous event creation session.
                Would you like to restore it?
              </p>
            </div>

            <div
              className="
                flex
                gap-2
              "
            >
              <button
                type="button"
                onClick={
                  handleRestore
                }
                className="
                  rounded-lg
                  bg-blue-600
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  hover:bg-blue-700
                "
              >
                Restore
              </button>

              <button
                type="button"
                onClick={
                  handleDismissRecovery
                }
                className="
                  rounded-lg
                  border
                  border-blue-200
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-blue-700
                  hover:bg-blue-100
                  dark:border-blue-800
                  dark:text-blue-300
                  dark:hover:bg-blue-950
                "
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Autosave status */}
      <div
        className="
          flex
          flex-col
          gap-3
          rounded-xl
          border
          border-gray-200
          bg-white
          p-3
          dark:border-gray-700
          dark:bg-gray-900
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <span
            className={`
              h-2
              w-2
              rounded-full
              ${
                status ===
                "saving"
                  ? "bg-yellow-500"
                  : status ===
                    "error"
                  ? "bg-red-500"
                  : status ===
                    "saved"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }
            `}
            aria-hidden="true"
          />

          <div>
            <p
              className="
                text-xs
                font-semibold
                text-gray-700
                dark:text-gray-300
              "
            >
              {status ===
                "saving" &&
                "Saving changes..."}

              {status ===
                "saved" &&
                "Draft saved automatically"}

              {status ===
                "error" &&
                "Autosave unavailable"}

              {status ===
                "idle" &&
                "Autosave enabled"}
            </p>

            {lastSavedAt && (
              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-gray-400
                "
              >
                Last saved at{" "}
                {formatSavedTime(
                  lastSavedAt
                )}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={
              handleSaveNow
            }
            className="
              rounded-lg
              border
              border-gray-300
              px-3
              py-2
              text-xs
              font-semibold
              text-gray-700
              hover:bg-gray-50
              dark:border-gray-600
              dark:text-gray-300
              dark:hover:bg-gray-800
            "
          >
            Save Now
          </button>

          <button
            type="button"
            onClick={
              handleClearAutosave
            }
            className="
              rounded-lg
              px-3
              py-2
              text-xs
              font-semibold
              text-red-600
              hover:bg-red-50
              dark:text-red-400
              dark:hover:bg-red-950/30
            "
          >
            Clear Autosave
          </button>
        </div>
      </div>

      {/* Explanation */}
      <p
        className="
          mt-2
          text-[11px]
          leading-5
          text-gray-400
        "
      >
        Your event information is automatically
        saved while you work. Autosaving does not
        publish your event.
      </p>
    </div>
  );
};

export default EventDraftAutosave;