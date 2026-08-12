import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Info,
  Lock,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_FIELDS = [
  {
    id: "full-name",
    type: "text",
    label: "Full Name",
    placeholder: "Enter your full name",
    required: true,
    description: "Enter your name as it should appear on the event certificate.",
  },
  {
    id: "email",
    type: "email",
    label: "Email Address",
    placeholder: "you@example.com",
    required: true,
    description: "We'll use this email for event updates.",
  },
  {
    id: "category",
    type: "select",
    label: "Participant Category",
    required: true,
    options: ["Student", "Professional", "Other"],
  },
  {
    id: "experience",
    type: "select",
    label: "Experience Level",
    required: false,
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "question",
    type: "textarea",
    label: "Why do you want to attend this event?",
    placeholder: "Tell us briefly...",
    required: true,
    validation: {
      minLength: 20,
      maxLength: 500,
    },
  },
];

const EventRegistrationFormPreview = ({
  eventId = "event-14406",
  eventTitle = "AI & ML Hackathon",
  eventDescription =
    "Join developers, designers, and innovators for an exciting technology event.",
  fields = DEFAULT_FIELDS,
  onClose,
  onSubmitPreview,
  className = "",
}) => {
  const [formValues, setFormValues] =
    useState({});

  const [errors, setErrors] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [showRules, setShowRules] =
    useState(false);

  const validationSummary = useMemo(() => {
    return fields.map((field) => ({
      id: field.id,
      label: field.label,
      required: Boolean(field.required),
      validation: field.validation || {},
    }));
  }, [fields]);

  const updateValue = (
    fieldId,
    value
  ) => {
    setFormValues((current) => ({
      ...current,
      [fieldId]: value,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next[fieldId];

      return next;
    });
  };

  const validateField = (
    field,
    value
  ) => {
    const normalized =
      typeof value === "string"
        ? value.trim()
        : value;

    if (
      field.required &&
      !normalized
    ) {
      return `${field.label} is required.`;
    }

    if (
      field.type === "email" &&
      normalized
    ) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(normalized)) {
        return "Please enter a valid email address.";
      }
    }

    const rules =
      field.validation || {};

    if (
      rules.minLength &&
      normalized &&
      String(normalized).length <
        rules.minLength
    ) {
      return `${field.label} must contain at least ${rules.minLength} characters.`;
    }

    if (
      rules.maxLength &&
      normalized &&
      String(normalized).length >
        rules.maxLength
    ) {
      return `${field.label} cannot exceed ${rules.maxLength} characters.`;
    }

    if (
      rules.min &&
      Number(normalized) <
        rules.min
    ) {
      return `${field.label} must be at least ${rules.min}.`;
    }

    if (
      rules.max &&
      Number(normalized) >
        rules.max
    ) {
      return `${field.label} cannot exceed ${rules.max}.`;
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors = {};

    fields.forEach((field) => {
      const error = validateField(
        field,
        formValues[field.id]
      );

      if (error) {
        nextErrors[field.id] =
          error;
      }
    });

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const handlePreviewSubmit = async (
    event
  ) => {
    event.preventDefault();

    const valid =
      validateForm();

    if (!valid) return;

    setSubmitted(true);

    await onSubmitPreview?.({
      eventId,
      values: formValues,
      preview: true,
    });
  };

  const getFieldRules = (
    field
  ) => {
    const rules = [];

    if (field.required) {
      rules.push("Required");
    } else {
      rules.push("Optional");
    }

    if (field.type === "email") {
      rules.push("Valid email");
    }

    if (field.validation?.minLength) {
      rules.push(
        `Min ${field.validation.minLength} characters`
      );
    }

    if (field.validation?.maxLength) {
      rules.push(
        `Max ${field.validation.maxLength} characters`
      );
    }

    if (field.validation?.min) {
      rules.push(
        `Minimum ${field.validation.min}`
      );
    }

    if (field.validation?.max) {
      rules.push(
        `Maximum ${field.validation.max}`
      );
    }

    return rules;
  };

  return (
    <section
      className={`min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 ${className}`}
    >
      {/* Preview header */}
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Eye size={18} />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Organizer Preview
                </p>

                <h1 className="mt-1 text-lg font-bold text-indigo-950 dark:text-white">
                  Registration Form Preview
                </h1>

                <p className="mt-1 text-[8px] leading-4 text-indigo-700/70 dark:text-indigo-300">
                  This is how participants will see the
                  registration form.
                </p>
              </div>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-[8px] font-bold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300"
              >
                <X size={13} />
                Exit Preview
              </button>
            )}
          </div>
        </div>

        {/* Event card */}
        <div className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <FileText
                  size={20}
                  className="text-slate-600 dark:text-slate-300"
                />
              </div>

              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Event Registration
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {eventTitle}
                </h2>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {eventDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={
              handlePreviewSubmit
            }
            className="p-5 sm:p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Registration Details
                </h3>

                <p className="mt-1 text-[8px] text-slate-400">
                  Fields marked with * are required.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:flex dark:bg-slate-800">
                <Lock
                  size={11}
                  className="text-slate-400"
                />

                <span className="text-[7px] font-bold text-slate-400">
                  Preview Mode
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {fields.map(
                (field, index) => {
                  const value =
                    formValues[
                      field.id
                    ] ?? "";

                  const error =
                    errors[field.id];

                  return (
                    <div
                      key={field.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50"
                    >
                      {/* Field order */}
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-lg bg-white px-2 py-1 text-[7px] font-bold text-slate-400 shadow-sm dark:bg-slate-900">
                          Field {index + 1}
                        </span>

                        {field.required ? (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-[7px] font-bold text-red-500 dark:bg-red-900/10 dark:text-red-400">
                            Required
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[7px] font-bold text-slate-400 dark:bg-slate-800">
                            Optional
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <label
                        htmlFor={`preview-${field.id}`}
                        className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                      >
                        {field.label}

                        {field.required && (
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        )}
                      </label>

                      {/* Description */}
                      {field.description && (
                        <p className="mt-1 text-[8px] leading-4 text-slate-400">
                          {field.description}
                        </p>
                      )}

                      {/* Text */}
                      {field.type ===
                        "text" && (
                        <input
                          id={`preview-${field.id}`}
                          type="text"
                          value={value}
                          onChange={(event) =>
                            updateValue(
                              field.id,
                              event.target
                                .value
                            )
                          }
                          placeholder={
                            field.placeholder
                          }
                          className={`mt-3 w-full rounded-xl border bg-white px-3 py-3 text-xs outline-none transition focus:border-indigo-400 dark:bg-slate-900 dark:text-white ${
                            error
                              ? "border-red-400"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                      )}

                      {/* Email */}
                      {field.type ===
                        "email" && (
                        <input
                          id={`preview-${field.id}`}
                          type="email"
                          value={value}
                          onChange={(event) =>
                            updateValue(
                              field.id,
                              event.target
                                .value
                            )
                          }
                          placeholder={
                            field.placeholder
                          }
                          className={`mt-3 w-full rounded-xl border bg-white px-3 py-3 text-xs outline-none transition focus:border-indigo-400 dark:bg-slate-900 dark:text-white ${
                            error
                              ? "border-red-400"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                      )}

                      {/* Select */}
                      {field.type ===
                        "select" && (
                        <div className="relative mt-3">
                          <select
                            id={`preview-${field.id}`}
                            value={value}
                            onChange={(event) =>
                              updateValue(
                                field.id,
                                event.target
                                  .value
                              )
                            }
                            className={`w-full appearance-none rounded-xl border bg-white px-3 py-3 pr-10 text-xs outline-none focus:border-indigo-400 dark:bg-slate-900 dark:text-white ${
                              error
                                ? "border-red-400"
                                : "border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <option value="">
                              Select an option
                            </option>

                            {(
                              field.options ||
                              []
                            ).map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option
                                  }
                                  value={
                                    option
                                  }
                                >
                                  {
                                    option
                                  }
                                </option>
                              )
                            )}
                          </select>

                          <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                        </div>
                      )}

                      {/* Textarea */}
                      {field.type ===
                        "textarea" && (
                        <textarea
                          id={`preview-${field.id}`}
                          value={value}
                          onChange={(event) =>
                            updateValue(
                              field.id,
                              event.target
                                .value
                            )
                          }
                          placeholder={
                            field.placeholder
                          }
                          rows={5}
                          className={`mt-3 w-full resize-none rounded-xl border bg-white px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:bg-slate-900 dark:text-white ${
                            error
                              ? "border-red-400"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        />
                      )}

                      {/* Character counter */}
                      {field.validation
                        ?.maxLength && (
                        <div className="mt-2 flex justify-end">
                          <span
                            className={`text-[7px] ${
                              String(
                                value
                              ).length >
                              field
                                .validation
                                .maxLength
                                ? "text-red-500"
                                : "text-slate-400"
                            }`}
                          >
                            {
                              String(
                                value
                              ).length
                            }{" "}
                            /{" "}
                            {
                              field
                                .validation
                                .maxLength
                            }
                          </span>
                        </div>
                      )}

                      {/* Error */}
                      {error && (
                        <div className="mt-3 flex items-center gap-2 text-red-500">
                          <AlertCircle
                            size={12}
                          />

                          <span className="text-[8px] font-semibold">
                            {error}
                          </span>
                        </div>
                      )}

                      {/* Validation rules */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {getFieldRules(
                          field
                        ).map(
                          (rule) => (
                            <span
                              key={
                                rule
                              }
                              className="rounded-full bg-white px-2 py-1 text-[6px] font-bold text-slate-400 dark:bg-slate-900"
                            >
                              {rule}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* Submit preview */}
            <div className="mt-7 border-t border-slate-100 pt-6 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <Info
                    size={13}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <p className="max-w-md text-[8px] leading-4 text-slate-400">
                    This is preview mode. Submitting this
                    form will only test the configured
                    validation rules and will not create a
                    real registration.
                  </p>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
                >
                  <CheckCircle2
                    size={13}
                  />
                  Test Form Validation
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Success preview */}
        {submitted &&
          Object.keys(errors).length ===
            0 && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 text-green-600 dark:text-green-400"
                />

                <div>
                  <p className="text-xs font-bold text-green-700 dark:text-green-400">
                    Validation Successful
                  </p>

                  <p className="mt-1 text-[8px] leading-4 text-green-600 dark:text-green-300">
                    All configured required fields and
                    validation rules passed successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Validation rules summary */}
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() =>
              setShowRules(
                (current) => !current
              )
            }
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <Info
                  size={15}
                  className="text-slate-500"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Validation Rules Summary
                </p>

                <p className="mt-1 text-[8px] text-slate-400">
                  {fields.length} configured form fields
                </p>
              </div>
            </div>

            <ChevronDown
              size={15}
              className={`text-slate-400 transition-transform ${
                showRules
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {showRules && (
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
              <div className="space-y-2">
                {validationSummary.map(
                  (field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-[7px] font-bold text-slate-400 dark:bg-slate-900">
                          {index + 1}
                        </span>

                        <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200">
                          {field.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {field.validation &&
                        Object.keys(
                          field.validation
                        ).length > 0 ? (
                          Object.entries(
                            field.validation
                          ).map(
                            ([key, value]) => (
                              <span
                                key={
                                  key
                                }
                                className="rounded-full bg-indigo-50 px-2 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                              >
                                {key}:{" "}
                                {value}
                              </span>
                            )
                          )
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[6px] font-bold text-slate-400 dark:bg-slate-800">
                            Standard validation
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-1 text-[6px] font-bold ${
                            field.required
                              ? "bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}
                        >
                          {field.required
                            ? "Required"
                            : "Optional"}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview notice */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <Eye
            size={15}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Preview Mode
            </p>

            <p className="mt-1 text-[8px] leading-4 text-slate-400">
              Organizers can verify field labels, required
              fields, dropdown options, questions, field
              ordering, and validation behavior before
              publishing the registration form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventRegistrationFormPreview;