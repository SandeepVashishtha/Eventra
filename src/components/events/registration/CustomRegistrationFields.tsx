import React, { useState } from "react";

type FieldType =
  | "text"
  | "dropdown"
  | "checkbox"
  | "radio";

interface RegistrationOption {
  id: string;
  label: string;
}

export interface CustomRegistrationField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options: RegistrationOption[];
  placeholder?: string;
}

interface CustomRegistrationFieldsProps {
  initialFields?: CustomRegistrationField[];

  onChange?: (
    fields: CustomRegistrationField[]
  ) => void;

  readOnly?: boolean;
}

const FIELD_TYPES: {
  value: FieldType;
  label: string;
  description: string;
}[] = [
  {
    value: "text",
    label: "Text",
    description: "Short text response",
  },
  {
    value: "dropdown",
    label: "Dropdown",
    description: "Choose one option",
  },
  {
    value: "checkbox",
    label: "Checkbox",
    description: "Yes/no or agreement",
  },
  {
    value: "radio",
    label: "Radio",
    description: "Choose one option",
  },
];

const createId = () =>
  `custom-field-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const CustomRegistrationFields: React.FC<
  CustomRegistrationFieldsProps
> = ({
  initialFields = [],
  onChange,
  readOnly = false,
}) => {
  const [fields, setFields] =
    useState<CustomRegistrationField[]>(
      initialFields
    );

  const [expandedField, setExpandedField] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const updateFields = (
    nextFields: CustomRegistrationField[]
  ) => {
    setFields(nextFields);
    onChange?.(nextFields);
  };

  const addField = () => {
    const newField: CustomRegistrationField = {
      id: createId(),
      label: "",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
    };

    updateFields([
      ...fields,
      newField,
    ]);

    setExpandedField(
      newField.id
    );

    setError("");
    setSuccess("");
  };

  const updateField = (
    fieldId: string,
    updates: Partial<CustomRegistrationField>
  ) => {
    updateFields(
      fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              ...updates,
            }
          : field
      )
    );

    setError("");
    setSuccess("");
  };

  const removeField = (
    fieldId: string
  ) => {
    const confirmed =
      window.confirm(
        "Remove this registration field?"
      );

    if (!confirmed) {
      return;
    }

    updateFields(
      fields.filter(
        (field) =>
          field.id !== fieldId
      )
    );

    if (
      expandedField === fieldId
    ) {
      setExpandedField(null);
    }

    setSuccess(
      "Registration field removed."
    );
  };

  const moveField = (
    fieldId: string,
    direction: "up" | "down"
  ) => {
    const index = fields.findIndex(
      (field) =>
        field.id === fieldId
    );

    if (index === -1) {
      return;
    }

    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= fields.length
    ) {
      return;
    }

    const nextFields = [
      ...fields,
    ];

    const [
      movedField,
    ] = nextFields.splice(
      index,
      1
    );

    nextFields.splice(
      targetIndex,
      0,
      movedField
    );

    updateFields(nextFields);
  };

  const addOption = (
    fieldId: string
  ) => {
    const field =
      fields.find(
        (item) =>
          item.id === fieldId
      );

    if (!field) {
      return;
    }

    const option: RegistrationOption =
      {
        id: createId(),
        label: "",
      };

    updateField(fieldId, {
      options: [
        ...field.options,
        option,
      ],
    });
  };

  const updateOption = (
    fieldId: string,
    optionId: string,
    label: string
  ) => {
    const field =
      fields.find(
        (item) =>
          item.id === fieldId
      );

    if (!field) {
      return;
    }

    updateField(fieldId, {
      options:
        field.options.map(
          (option) =>
            option.id === optionId
              ? {
                  ...option,
                  label,
                }
              : option
        ),
    });
  };

  const removeOption = (
    fieldId: string,
    optionId: string
  ) => {
    const field =
      fields.find(
        (item) =>
          item.id === fieldId
      );

    if (!field) {
      return;
    }

    updateField(fieldId, {
      options:
        field.options.filter(
          (option) =>
            option.id !== optionId
        ),
    });
  };

  const validateFields = () => {
    for (
      const field of fields
    ) {
      if (!field.label.trim()) {
        setError(
          "Every registration field must have a label."
        );
        return false;
      }

      if (
        (field.type ===
          "dropdown" ||
          field.type ===
            "radio") &&
        field.options.length === 0
      ) {
        setError(
          `Add at least one option to "${field.label}".`
        );
        return false;
      }

      if (
        (field.type ===
          "dropdown" ||
          field.type ===
            "radio") &&
        field.options.some(
          (option) =>
            !option.label.trim()
        )
      ) {
        setError(
          `All options for "${field.label}" must have a value.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSave = () => {
    setError("");
    setSuccess("");

    if (!validateFields()) {
      return;
    }

    onChange?.(fields);

    setSuccess(
      "Registration fields are ready to be saved with the event."
    );
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              📝
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Registration
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Custom Registration Fields
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                Collect additional information from
                participants when they register for your
                event.
              </p>
            </div>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={addField}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Add Field
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
          >
            ✓ {success}
          </div>
        )}

        {/* Empty state */}
        {fields.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <div className="text-3xl">
              📋
            </div>

            <h3 className="mt-3 text-base font-bold text-gray-900 dark:text-white">
              No custom fields yet
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Add custom questions to collect information
              that is specific to your event.
            </p>

            {!readOnly && (
              <button
                type="button"
                onClick={addField}
                className="mt-5 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
              >
                Add Your First Field
              </button>
            )}
          </div>
        )}

        {/* Field list */}
        <div className="space-y-4">
          {fields.map(
            (field, index) => {
              const expanded =
                expandedField ===
                field.id;

              const needsOptions =
                field.type ===
                  "dropdown" ||
                field.type ===
                  "radio";

              return (
                <div
                  key={field.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Field summary */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {field.label ||
                                "Untitled field"}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-2">
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                {
                                  FIELD_TYPES.find(
                                    (item) =>
                                      item.value ===
                                      field.type
                                  )?.label
                                }
                              </span>

                              {field.required && (
                                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                                  Required
                                </span>
                              )}

                              {!field.required && (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                  Optional
                                </span>
                              )}
                            </div>
                          </div>

                          {!readOnly && (
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  moveField(
                                    field.id,
                                    "up"
                                  )
                                }
                                disabled={
                                  index ===
                                  0
                                }
                                className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
                                aria-label="Move field up"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  moveField(
                                    field.id,
                                    "down"
                                  )
                                }
                                disabled={
                                  index ===
                                  fields.length -
                                    1
                                }
                                className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
                                aria-label="Move field down"
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedField(
                                    expanded
                                      ? null
                                      : field.id
                                  )
                                }
                                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
                              >
                                {expanded
                                  ? "Close"
                                  : "Edit"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeField(
                                    field.id
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-900 dark:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Editor */}
                  {expanded &&
                    !readOnly && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-5">
                        {/* Label */}
                        <div>
                          <label
                            htmlFor={`field-label-${field.id}`}
                            className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                          >
                            Field label
                          </label>

                          <input
                            id={`field-label-${field.id}`}
                            type="text"
                            value={field.label}
                            onChange={(
                              event
                            ) =>
                              updateField(
                                field.id,
                                {
                                  label:
                                    event
                                      .target
                                      .value,
                                }
                              )
                            }
                            placeholder="e.g. College / Organization"
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                          />
                        </div>

                        {/* Type */}
                        <div className="mt-5">
                          <label
                            htmlFor={`field-type-${field.id}`}
                            className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                          >
                            Field type
                          </label>

                          <select
                            id={`field-type-${field.id}`}
                            value={field.type}
                            onChange={(
                              event
                            ) => {
                              const nextType =
                                event
                                  .target
                                  .value as FieldType;

                              updateField(
                                field.id,
                                {
                                  type:
                                    nextType,
                                  options:
                                    nextType ===
                                      "dropdown" ||
                                    nextType ===
                                      "radio"
                                      ? field.options
                                      : [],
                                }
                              );
                            }}
                            className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                          >
                            {FIELD_TYPES.map(
                              (type) => (
                                <option
                                  key={
                                    type.value
                                  }
                                  value={
                                    type.value
                                  }
                                >
                                  {
                                    type.label
                                  }
                                </option>
                              )
                            )}
                          </select>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {
                              FIELD_TYPES.find(
                                (item) =>
                                  item.value ===
                                  field.type
                              )?.description
                            }
                          </p>
                        </div>

                        {/* Placeholder */}
                        {field.type ===
                          "text" && (
                          <div className="mt-5">
                            <label
                              htmlFor={`field-placeholder-${field.id}`}
                              className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
                            >
                              Placeholder
                            </label>

                            <input
                              id={`field-placeholder-${field.id}`}
                              type="text"
                              value={
                                field.placeholder ??
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                updateField(
                                  field.id,
                                  {
                                    placeholder:
                                      event
                                        .target
                                        .value,
                                  }
                                )
                              }
                              placeholder="e.g. Enter your college name"
                              className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            />
                          </div>
                        )}

                        {/* Required */}
                        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                          <input
                            type="checkbox"
                            checked={
                              field.required
                            }
                            onChange={(
                              event
                            ) =>
                              updateField(
                                field.id,
                                {
                                  required:
                                    event
                                      .target
                                      .checked,
                                }
                              )
                            }
                            className="mt-1 h-4 w-4 accent-blue-600"
                          />

                          <span>
                            <span className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                              Required field
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                              Participants must provide
                              an answer before submitting
                              registration.
                            </span>
                          </span>
                        </label>

                        {/* Options */}
                        {needsOptions && (
                          <div className="mt-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                  Options
                                </p>

                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Add the choices participants
                                  can select.
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  addOption(
                                    field.id
                                  )
                                }
                                className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 dark:border-blue-900 dark:text-blue-400"
                              >
                                + Add Option
                              </button>
                            </div>

                            <div className="mt-3 space-y-2">
                              {field.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (
                                  <div
                                    key={
                                      option.id
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <span className="text-xs text-gray-400">
                                      {optionIndex +
                                        1}
                                      .
                                    </span>

                                    <input
                                      type="text"
                                      value={
                                        option.label
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateOption(
                                          field.id,
                                          option.id,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      placeholder={`Option ${
                                        optionIndex +
                                        1
                                      }`}
                                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                    />

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeOption(
                                          field.id,
                                          option.id
                                        )
                                      }
                                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                                      aria-label="Remove option"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )
                              )}

                              {field.options
                                .length ===
                                0 && (
                                <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                  No options added yet.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              );
            }
          )}
        </div>

        {/* Save */}
        {!readOnly &&
          fields.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Registration Fields
              </button>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🔒
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Registration data belongs to the event
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Custom field responses should be stored with
              the corresponding registration and only made
              available to authorized organizers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomRegistrationFields;