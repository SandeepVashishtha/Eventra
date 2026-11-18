"use client";

import React, { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Field renderers
// ---------------------------------------------------------------------------
function TextField({ field, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-neutral-500">{field.description}</p>
      )}
      <input
        type={field.inputType || "text"}
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder ?? ""}
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400 ${
          error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"
        }`}
      />
      {error && (
        <ul className="mt-1 space-y-0.5">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-1">
              <span>⚠</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SelectField({ field, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-neutral-500">{field.description}</p>
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400 ${
          error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"
        }`}
      >
        <option value="">— Select —</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && (
        <ul className="mt-1 space-y-0.5">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-1">
              <span>⚠</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumberField({ field, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-neutral-500">{field.description}</p>
      )}
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(
            field.name,
            e.target.value === "" ? "" : Number(e.target.value)
          )
        }
        min={field.minimum}
        max={field.maximum}
        placeholder={field.placeholder ?? ""}
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400 ${
          error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"
        }`}
      />
      {error && (
        <ul className="mt-1 space-y-0.5">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-1">
              <span>⚠</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TextareaField({ field, value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-neutral-500">{field.description}</p>
      )}
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholder ?? ""}
        rows={field.rows ?? 3}
        className={`border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400 resize-y ${
          error ? "border-red-400 bg-red-50" : "border-neutral-300 bg-white"
        }`}
      />
      {error && (
        <ul className="mt-1 space-y-0.5">
          {error.map((msg, i) => (
            <li key={i} className="text-xs text-red-600 flex items-start gap-1">
              <span>⚠</span>
              <span>{msg}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function renderField(field, value, onChange, fieldErrors) {
  const error = fieldErrors?.[field.name];
  switch (field.type) {
    case "select":
      return (
        <SelectField
          key={field.name}
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case "number":
    case "integer":
      return (
        <NumberField
          key={field.name}
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    case "textarea":
      return (
        <TextareaField
          key={field.name}
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
    default:
      return (
        <TextField
          key={field.name}
          field={field}
          value={value}
          onChange={onChange}
          error={error}
        />
      );
  }
}

// ---------------------------------------------------------------------------
// Build JSON Schema from field template
// ---------------------------------------------------------------------------
function buildJsonSchema(fields) {
  const schema = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: [],
    properties: {},
  };

  for (const field of fields) {
    if (field.required) schema.required.push(field.name);

    const propSchema = {};
    const fieldType = field.type === "integer" ? "integer" : field.type === "number" ? "number" : "string";
    propSchema.type = ["select", "text", "email", "url", "textarea"].includes(field.type) ? "string" : fieldType;

    if (field.minLength !== undefined) propSchema.minLength = field.minLength;
    if (field.maxLength !== undefined) propSchema.maxLength = field.maxLength;
    if (field.minimum !== undefined) propSchema.minimum = field.minimum;
    if (field.maximum !== undefined) propSchema.maximum = field.maximum;
    if (field.pattern) propSchema.pattern = field.pattern;
    if (field.format) propSchema.format = field.format;
    if (field.options) propSchema.enum = field.options.map((o) => (typeof o === "object" ? o.value : o));

    schema.properties[field.name] = propSchema;
  }

  return schema;
}

// ---------------------------------------------------------------------------
// Status Banner
// ---------------------------------------------------------------------------
function StatusBanner({ result }) {
  if (!result) return null;

  if (result.valid) {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
        <span className="text-green-500 text-lg">✓</span>
        <div>
          <p className="font-semibold text-green-700 text-sm">Form submitted successfully!</p>
          <p className="text-xs text-green-600 mt-0.5">
            All fields passed validation. Sanitized data was sent to the server.
          </p>
        </div>
      </div>
    );
  }

  const errorCount = Object.values(result.errors ?? {}).flat().length;
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
      <span className="text-red-500 text-lg">✕</span>
      <div>
        <p className="font-semibold text-red-700 text-sm">
          {errorCount} validation error{errorCount !== 1 ? "s" : ""} found
        </p>
        <p className="text-xs text-red-600 mt-0.5">
          Please fix the highlighted fields and try again.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
/**
 * DynamicFormValidator
 *
 * Props:
 *   title        {string}   – Form heading
 *   description  {string}   – Optional subtitle
 *   fields       {Array}    – Array of field descriptor objects:
 *     {
 *       name:        string   (key used in formData & schema)
 *       label:       string
 *       type:        "text"|"email"|"url"|"number"|"integer"|"textarea"|"select"
 *       required:    boolean
 *       placeholder: string
 *       description: string
 *       minLength:   number
 *       maxLength:   number
 *       minimum:     number
 *       maximum:     number
 *       pattern:     string  (regex)
 *       format:      "email"|"url"|"date"
 *       options:     string[] | {label,value}[]  (for select)
 *     }
 *   onSuccess    {function(sanitizedData)}
 */
export default function DynamicFormValidator({
  title = "Dynamic Registration Form",
  description = "Fill in the form below. All inputs are validated and sanitized before submission.",
  fields = DEFAULT_FIELDS,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setFieldErrors({});

    const schema = buildJsonSchema(fields);

    try {
      const res = await fetch("/api/forms/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema, formData }),
      });

      const data = await res.json();
      setResult(data);

      if (data.valid) {
        setFieldErrors({});
        if (onSuccess) onSuccess(data.sanitizedData);
      } else {
        setFieldErrors(data.errors ?? {});
      }
    } catch (err) {
      setResult({ valid: false, errors: { general: [`Network error: ${err.message}`] } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-100 bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description && (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4" noValidate>
        {fields.map((field) =>
          renderField(field, formData[field.name], handleChange, fieldErrors)
        )}

        <StatusBanner result={result} />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Validating…
            </span>
          ) : (
            "Submit & Validate"
          )}
        </button>
      </form>

      {/* Debug: show sanitized data on success */}
      {result?.valid && result.sanitizedData && (
        <div className="px-6 pb-5">
          <details className="text-xs text-neutral-500 mt-2">
            <summary className="cursor-pointer select-none font-medium text-neutral-600">
              Sanitized payload (debug)
            </summary>
            <pre className="mt-2 p-3 bg-neutral-50 rounded-lg overflow-x-auto text-neutral-700 border border-neutral-200">
              {JSON.stringify(result.sanitizedData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default field template (hackathon registration example)
// ---------------------------------------------------------------------------
export const DEFAULT_FIELDS = [
  {
    name: "teamName",
    label: "Team Name",
    type: "text",
    required: true,
    placeholder: "e.g. CodeBuilders",
    description: "Your team's display name (3–50 characters).",
    minLength: 3,
    maxLength: 50,
  },
  {
    name: "githubHandle",
    label: "GitHub Handle",
    type: "text",
    required: true,
    placeholder: "e.g. octocat",
    description: "Letters, numbers, and hyphens only.",
    pattern: "^[a-zA-Z0-9-]+$",
  },
  {
    name: "email",
    label: "Contact Email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
    format: "email",
  },
  {
    name: "teamSize",
    label: "Team Size",
    type: "integer",
    required: true,
    placeholder: "1–4",
    minimum: 1,
    maximum: 4,
  },
  {
    name: "track",
    label: "Hackathon Track",
    type: "select",
    required: true,
    options: [
      { label: "AI / ML", value: "ai-ml" },
      { label: "Web3 / Blockchain", value: "web3" },
      { label: "Open Innovation", value: "open" },
      { label: "Social Impact", value: "social" },
    ],
  },
  {
    name: "projectDescription",
    label: "Project Description",
    type: "textarea",
    required: false,
    placeholder: "Briefly describe what you plan to build…",
    maxLength: 500,
    rows: 4,
  },
];
