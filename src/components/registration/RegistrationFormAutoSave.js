import {
  Check,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  clearRegistrationDraftAfterSuccess,
  discardRegistrationDraft,
  getRegistrationDraft,
  saveRegistrationDraftIfNeeded,
} from "../../utils/registrationDraftUtils";

const AUTOSAVE_DELAY = 800;

const RegistrationFormAutoSave = ({
  eventId,
  userId = "guest",
  initialValues = {},
  onChange,
  onSubmit,
  children,
  autoSave = true,
  autoSaveDelay = AUTOSAVE_DELAY,
  showDraftControls = true,
  className = "",
}) => {
  const [formData, setFormData] =
    useState(initialValues);

  const [saveStatus, setSaveStatus] =
    useState("idle");

  const [draftRestored, setDraftRestored] =
    useState(false);

  const [hasDraft, setHasDraft] =
    useState(false);

  const saveTimerRef =
    useRef(null);

  const initializedRef =
    useRef(false);

  /**
   * Restore an existing draft when the
   * registration form is opened.
   */
  useEffect(() => {
    if (!eventId || initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const savedDraft =
      getRegistrationDraft({
        eventId,
        userId,
      });

    if (savedDraft?.formData) {
      setFormData((current) => ({
        ...current,
        ...savedDraft.formData,
      }));

      setDraftRestored(true);
      setHasDraft(true);

      onChange?.({
        ...initialValues,
        ...savedDraft.formData,
      });

      return;
    }

    setFormData(initialValues);
  }, [
    eventId,
    userId,
    initialValues,
    onChange,
  ]);

  /**
   * Notify parent whenever form data changes.
   */
  const updateFormData = useCallback(
    (nextData) => {
      setFormData(nextData);
      onChange?.(nextData);
    },
    [onChange]
  );

  /**
   * Update a single form field.
   */
  const updateField = useCallback(
    (field, value) => {
      setFormData((current) => {
        const nextData = {
          ...current,
          [field]: value,
        };

        onChange?.(nextData);

        return nextData;
      });
    },
    [onChange]
  );

  /**
   * Automatically save form changes.
   */
  useEffect(() => {
    if (
      !autoSave ||
      !eventId ||
      !initializedRef.current
    ) {
      return undefined;
    }

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current
      );
    }

    setSaveStatus("saving");

    saveTimerRef.current =
      setTimeout(() => {
        const result =
          saveRegistrationDraftIfNeeded({
            eventId,
            userId,
            formData,
          });

        if (result.success) {
          setSaveStatus("saved");
          setHasDraft(true);
        } else if (result.skipped) {
          setSaveStatus("idle");
        } else {
          setSaveStatus("error");
        }
      }, autoSaveDelay);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current
        );
      }
    };
  }, [
    formData,
    eventId,
    userId,
    autoSave,
    autoSaveDelay,
  ]);

  /**
   * Discard the current saved draft.
   */
  const handleDiscardDraft = useCallback(() => {
    if (!eventId) {
      return;
    }

    discardRegistrationDraft({
      eventId,
      userId,
    });

    setHasDraft(false);
    setDraftRestored(false);
    setSaveStatus("idle");

    setFormData(initialValues);
    onChange?.(initialValues);
  }, [
    eventId,
    userId,
    initialValues,
    onChange,
  ]);

  /**
   * Clear draft after successful registration.
   */
  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();

      setSaveStatus("submitting");

      try {
        const result =
          await onSubmit?.(
            formData
          );

        /*
         * Only remove the draft after
         * successful registration.
         */
        if (
          result !== false
        ) {
          clearRegistrationDraftAfterSuccess(
            {
              eventId,
              userId,
            }
          );

          setHasDraft(false);
          setDraftRestored(false);
          setSaveStatus("submitted");
        } else {
          setSaveStatus("saved");
        }

        return result;
      } catch (error) {
        setSaveStatus("error");
        throw error;
      }
    },
    [
      formData,
      eventId,
      userId,
      onSubmit,
    ]
  );

  /**
   * Render children using either:
   *
   * 1. Function-as-child:
   *    {({ formData, updateField }) => ...}
   *
   * 2. Normal React children.
   */
  const renderedChildren =
    typeof children === "function"
      ? children({
          formData,
          updateFormData,
          updateField,
          handleSubmit,
          hasDraft,
          draftRestored,
        })
      : children;

  return (
    <div
      className={`w-full ${className}`}
    >
      {/* Draft status */}
      {showDraftControls && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">
          <DraftStatus
            status={saveStatus}
            draftRestored={
              draftRestored
            }
          />

          {hasDraft && (
            <button
              type="button"
              onClick={
                handleDiscardDraft
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900/50 dark:hover:bg-red-900/10 dark:hover:text-red-400"
            >
              <Trash2 size={14} />
              Discard Draft
            </button>
          )}
        </div>
      )}

      {/* Registration form content */}
      {renderedChildren}
    </div>
  );
};

/**
 * Draft status indicator.
 */
const DraftStatus = ({
  status,
  draftRestored,
}) => {
  if (status === "saving") {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Save
          size={14}
          className="animate-pulse"
        />
        Saving draft...
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
        <Check size={14} />
        Draft saved
      </div>
    );
  }

  if (status === "submitted") {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400">
        <Check size={14} />
        Registration submitted
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
        <Save size={14} />
        Unable to save draft
      </div>
    );
  }

  if (draftRestored) {
    return (
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        <RotateCcw size={14} />
        Draft restored
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-400">
      <Save size={14} />
      Your progress will be saved automatically
    </div>
  );
};

export default RegistrationFormAutoSave;