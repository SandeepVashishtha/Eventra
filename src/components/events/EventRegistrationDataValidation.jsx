import {
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Mail,
  Phone,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

const DEFAULT_FORM = {
  fullName: "",
  email: "",
  phone: "",
  teamName: "",
  teamSize: "",
  teamMembers: "",
  portfolio: "",
  document: null,
};

const DEFAULT_CONFIG = {
  allowedFileTypes: [
    "application/pdf",
    "image/png",
    "image/jpeg",
  ],
  maxFileSizeMB: 5,
  minTeamSize: 1,
  maxTeamSize: 5,
};

const EventRegistrationDataValidation = ({
  eventId = "event-14410",
  eventTitle = "AI & ML Hackathon",
  initialData = {},
  config = {},
  existingRegistrations = [],
  onSubmit,
  className = "",
}) => {
  const validationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [form, setForm] = useState({
    ...DEFAULT_FORM,
    ...initialData,
  });

  const [errors, setErrors] =
    useState({});

  const [touched, setTouched] =
    useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  const [notice, setNotice] =
    useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setTouched((current) => ({
      ...current,
      [field]: true,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      delete next[field];

      return next;
    });

    setSubmitSuccess(false);
  };

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const validateEmail = (email) => {
    const pattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return pattern.test(
      String(email).trim()
    );
  };

  const validatePhone = (phone) => {
    const normalized =
      String(phone || "").replace(
        /[\s()-]/g,
        ""
      );

    const pattern =
      /^\+?[0-9]{10,15}$/;

    return pattern.test(
      normalized
    );
  };

  const isDuplicate = (
    field,
    value
  ) => {
    const normalizedValue =
      normalize(value);

    if (!normalizedValue) {
      return false;
    }

    return existingRegistrations.some(
      (registration) =>
        normalize(
          registration[field]
        ) === normalizedValue
    );
  };

  const validateFile = (file) => {
    if (!file) {
      return "";
    }

    const maxBytes =
      validationConfig.maxFileSizeMB *
      1024 *
      1024;

    if (file.size > maxBytes) {
      return `File size must be ${validationConfig.maxFileSizeMB} MB or smaller.`;
    }

    if (
      !validationConfig.allowedFileTypes.includes(
        file.type
      )
    ) {
      return "This file type is not supported.";
    }

    return "";
  };

  const validateForm = () => {
    const nextErrors = {};

    // Full name
    if (!form.fullName.trim()) {
      nextErrors.fullName =
        "Full name is required.";
    } else if (
      form.fullName.trim().length <
      2
    ) {
      nextErrors.fullName =
        "Full name must contain at least 2 characters.";
    }

    // Email
    if (!form.email.trim()) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !validateEmail(form.email)
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    } else if (
      isDuplicate(
        "email",
        form.email
      )
    ) {
      nextErrors.email =
        "This email is already registered.";
    }

    // Phone
    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !validatePhone(form.phone)
    ) {
      nextErrors.phone =
        "Enter a valid phone number with 10–15 digits.";
    } else if (
      isDuplicate(
        "phone",
        form.phone
      )
    ) {
      nextErrors.phone =
        "This phone number is already registered.";
    }

    // Team
    if (!form.teamName.trim()) {
      nextErrors.teamName =
        "Team name is required.";
    }

    // Team size
    const teamSize = Number(
      form.teamSize
    );

    if (!form.teamSize) {
      nextErrors.teamSize =
        "Team size is required.";
    } else if (
      !Number.isInteger(teamSize)
    ) {
      nextErrors.teamSize =
        "Team size must be a whole number.";
    } else if (
      teamSize <
      validationConfig.minTeamSize
    ) {
      nextErrors.teamSize = `Team must have at least ${validationConfig.minTeamSize} participant${
        validationConfig.minTeamSize ===
        1
          ? ""
          : "s"
      }.`;
    } else if (
      teamSize >
      validationConfig.maxTeamSize
    ) {
      nextErrors.teamSize = `Team cannot have more than ${validationConfig.maxTeamSize} participants.`;
    }

    // Team members
    if (!form.teamMembers.trim()) {
      nextErrors.teamMembers =
        "Please provide team member names.";
    }

    // Portfolio URL
    if (form.portfolio.trim()) {
      try {
        new URL(
          form.portfolio.trim()
        );
      } catch {
        nextErrors.portfolio =
          "Please enter a valid URL.";
      }
    }

    // File
    const fileError =
      validateFile(form.document);

    if (fileError) {
      nextErrors.document =
        fileError;
    }

    setErrors(nextErrors);

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      teamName: true,
      teamSize: true,
      teamMembers: true,
      portfolio: true,
      document: true,
    });

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    const error =
      validateFile(file);

    setForm((current) => ({
      ...current,
      document: file,
    }));

    setTouched((current) => ({
      ...current,
      document: true,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      if (error) {
        next.document = error;
      } else {
        delete next.document;
      }

      return next;
    });
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setNotice("");
    setSubmitSuccess(false);

    const valid =
      validateForm();

    if (!valid) {
      setNotice(
        "Please correct the highlighted fields before submitting."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit?.({
        eventId,
        eventTitle,
        ...form,
        document:
          form.document || null,
      });

      setSubmitSuccess(true);

      setNotice(
        "Registration data passed all validation checks."
      );
    } catch (error) {
      setNotice(
        error?.message ||
          "Unable to submit registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <ShieldCheck
            size={21}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Registration Validation
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {eventTitle}
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
            Verify participant information before it is
            submitted to the event.
          </p>
        </div>
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
            submitSuccess
              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
          }`}
        >
          {submitSuccess ? (
            <CheckCircle2
              size={15}
              className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
            />
          ) : (
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />
          )}

          <p
            className={`flex-1 text-[9px] font-semibold ${
              submitSuccess
                ? "text-green-700 dark:text-green-400"
                : "text-amber-700 dark:text-amber-400"
            }`}
          >
            {notice}
          </p>

          <button
            type="button"
            onClick={() =>
              setNotice("")
            }
            className="text-slate-400"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 space-y-5"
      >
        {/* Personal information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <SectionTitle
            icon={<Users size={15} />}
            title="Participant Information"
            description="Provide accurate contact information."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ValidatedInput
              id="fullName"
              label="Full Name"
              required
              value={form.fullName}
              placeholder="Enter your full name"
              error={errors.fullName}
              touched={touched.fullName}
              onChange={(value) =>
                updateField(
                  "fullName",
                  value
                )
              }
            />

            <ValidatedInput
              id="email"
              label="Email Address"
              required
              type="email"
              value={form.email}
              placeholder="you@example.com"
              icon={<Mail size={13} />}
              error={errors.email}
              touched={touched.email}
              onChange={(value) =>
                updateField(
                  "email",
                  value
                )
              }
            />

            <ValidatedInput
              id="phone"
              label="Phone Number"
              required
              type="tel"
              value={form.phone}
              placeholder="+91 9876543210"
              icon={<Phone size={13} />}
              error={errors.phone}
              touched={touched.phone}
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />

            <ValidatedInput
              id="portfolio"
              label="Portfolio / LinkedIn"
              type="url"
              value={form.portfolio}
              placeholder="https://..."
              error={errors.portfolio}
              touched={touched.portfolio}
              onChange={(value) =>
                updateField(
                  "portfolio",
                  value
                )
              }
            />
          </div>
        </div>

        {/* Team information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <SectionTitle
            icon={<Users size={15} />}
            title="Team Information"
            description="Enter the team details required for registration."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <ValidatedInput
              id="teamName"
              label="Team Name"
              required
              value={form.teamName}
              placeholder="Enter team name"
              error={errors.teamName}
              touched={touched.teamName}
              onChange={(value) =>
                updateField(
                  "teamName",
                  value
                )
              }
            />

            <ValidatedInput
              id="teamSize"
              label={`Team Size (${validationConfig.minTeamSize}-${validationConfig.maxTeamSize})`}
              required
              type="number"
              min={
                validationConfig.minTeamSize
              }
              max={
                validationConfig.maxTeamSize
              }
              value={form.teamSize}
              placeholder="Enter team size"
              error={errors.teamSize}
              touched={touched.teamSize}
              onChange={(value) =>
                updateField(
                  "teamSize",
                  value
                )
              }
            />

            <div className="md:col-span-2">
              <ValidatedTextarea
                id="teamMembers"
                label="Team Members"
                required
                value={form.teamMembers}
                placeholder="Example: Jainiksha Patel, Rahul Shah, Priya Mehta"
                error={
                  errors.teamMembers
                }
                touched={
                  touched.teamMembers
                }
                onChange={(value) =>
                  updateField(
                    "teamMembers",
                    value
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* File upload */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <SectionTitle
            icon={<FileCheck2 size={15} />}
            title="Supporting Document"
            description={`Allowed files: PDF, PNG, JPG • Maximum size: ${validationConfig.maxFileSizeMB} MB`}
          />

          <div className="mt-5">
            <label
              htmlFor="registration-document"
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${
                errors.document
                  ? "border-red-300 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950"
              }`}
            >
              <FileCheck2
                size={25}
                className={
                  errors.document
                    ? "text-red-500"
                    : "text-indigo-500"
                }
              />

              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                {form.document
                  ? form.document.name
                  : "Choose a supporting document"}
              </p>

              <p className="mt-1 text-[8px] text-slate-400">
                {form.document
                  ? formatFileSize(
                      form.document
                        .size
                    )
                  : "Click to browse files"}
              </p>

              <input
                id="registration-document"
                type="file"
                accept={validationConfig.allowedFileTypes.join(
                  ","
                )}
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>

            {errors.document && (
              <FieldError
                message={
                  errors.document
                }
              />
            )}
          </div>
        </div>

        {/* Validation checklist */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <SectionTitle
            icon={<ShieldCheck size={15} />}
            title="Validation Checklist"
            description="The following checks are performed before submission."
          />

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <ValidationCheck
              label="Required fields"
              valid={
                !errors.fullName &&
                !errors.email &&
                !errors.phone &&
                !errors.teamName &&
                !errors.teamSize &&
                !errors.teamMembers
              }
            />

            <ValidationCheck
              label="Email format"
              valid={
                !form.email ||
                validateEmail(
                  form.email
                )
              }
            />

            <ValidationCheck
              label="Phone number format"
              valid={
                !form.phone ||
                validatePhone(
                  form.phone
                )
              }
            />

            <ValidationCheck
              label="Duplicate email / phone"
              valid={
                !isDuplicate(
                  "email",
                  form.email
                ) &&
                !isDuplicate(
                  "phone",
                  form.phone
                )
              }
            />

            <ValidationCheck
              label="Team information"
              valid={
                !form.teamSize ||
                (Number.isInteger(
                  Number(
                    form.teamSize
                  )
                ) &&
                  Number(
                    form.teamSize
                  ) >=
                    validationConfig.minTeamSize &&
                  Number(
                    form.teamSize
                  ) <=
                    validationConfig.maxTeamSize)
              }
            />

            <ValidationCheck
              label="File constraints"
              valid={
                !form.document ||
                !validateFile(
                  form.document
                )
              }
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <ShieldCheck
              size={14}
              className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
            />

            <p className="text-[8px] leading-4 text-indigo-700/80 dark:text-indigo-300">
              All registration data will be validated before
              submission.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={13} />

            {isSubmitting
              ? "Validating..."
              : "Validate & Submit"}
          </button>
        </div>
      </form>
    </section>
  );
};

const SectionTitle = ({
  icon,
  title,
  description,
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
      {icon}
    </div>

    <div>
      <h3 className="text-xs font-bold text-slate-800 dark:text-white">
        {title}
      </h3>

      <p className="mt-1 text-[8px] text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

const ValidatedInput = ({
  id,
  label,
  required = false,
  type = "text",
  value,
  placeholder,
  icon,
  error,
  touched,
  min,
  max,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="relative mt-2">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}

      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-xs outline-none transition focus:border-indigo-400 dark:bg-slate-950 dark:text-white ${
          icon ? "pl-9" : ""
        } ${
          error && touched
            ? "border-red-400"
            : "border-slate-200 dark:border-slate-700"
        }`}
      />
    </div>

    {error && touched && (
      <FieldError message={error} />
    )}

    {!error && touched && value && (
      <FieldSuccess />
    )}
  </div>
);

const ValidatedTextarea = ({
  id,
  label,
  required,
  value,
  placeholder,
  error,
  touched,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className="block text-[8px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <textarea
      id={id}
      value={value}
      placeholder={placeholder}
      rows={4}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className={`mt-2 w-full resize-none rounded-xl border bg-slate-50 px-3 py-3 text-xs outline-none focus:border-indigo-400 dark:bg-slate-950 dark:text-white ${
        error && touched
          ? "border-red-400"
          : "border-slate-200 dark:border-slate-700"
      }`}
    />

    {error && touched && (
      <FieldError message={error} />
    )}

    {!error && touched && value && (
      <FieldSuccess />
    )}
  </div>
);

const FieldError = ({
  message,
}) => (
  <div className="mt-2 flex items-center gap-1.5 text-red-500">
    <AlertCircle size={11} />

    <span className="text-[7px] font-semibold">
      {message}
    </span>
  </div>
);

const FieldSuccess = () => (
  <div className="mt-2 flex items-center gap-1.5 text-green-600 dark:text-green-400">
    <CheckCircle2 size={11} />

    <span className="text-[7px] font-semibold">
      Valid
    </span>
  </div>
);

const ValidationCheck = ({
  label,
  valid,
}) => (
  <div
    className={`flex items-center gap-3 rounded-xl border p-3 ${
      valid
        ? "border-green-100 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
        : "border-red-100 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
    }`}
  >
    {valid ? (
      <CheckCircle2
        size={14}
        className="text-green-600 dark:text-green-400"
      />
    ) : (
      <FileWarning
        size={14}
        className="text-red-500 dark:text-red-400"
      />
    )}

    <span
      className={`text-[8px] font-bold ${
        valid
          ? "text-green-700 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {label}
    </span>
  </div>
);

const formatFileSize = (
  bytes
) => {
  if (!bytes) return "0 KB";

  if (bytes < 1024 * 1024) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};

export default EventRegistrationDataValidation;