import {
  Check,
  ChevronDown,
  FileUp,
  GripVertical,
  Plus,
  Radio,
  Save,
  Settings2,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { useState } from "react";

const FIELD_TYPES = [
  {
    value: "text",
    label: "Text",
    description: "Short text response",
    icon: Type,
  },
  {
    value: "dropdown",
    label: "Dropdown",
    description: "Select one option",
    icon: ChevronDown,
  },
  {
    value: "checkbox",
    label: "Checkbox",
    description: "Yes/no or multiple selection",
    icon: Check,
  },
  {
    value: "radio",
    label: "Radio",
    description: "Select one option",
    icon: Radio,
  },
  {
    value: "file",
    label: "File Upload",
    description: "Allow participants to upload a file",
    icon: FileUp,
  },
];

const createField = (type = "text") => ({
  id: `custom-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`,
  type,
  label: "",
  placeholder: "",
  description: "",
  required: false,
  options:
    type === "dropdown" ||
    type === "radio"
      ? ["Option 1", "Option 2"]
      : [],
  accept: "",
});

const RegistrationCustomFields = ({
  initialFields = [],
  onSave,
  className = "",
}) => {
  const [fields, setFields] =
    useState(() =>
      Array.isArray(initialFields)
        ? initialFields
        : []
    );

  const [editingId, setEditingId] =
    useState(null);

  const [preview, setPreview] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const addField = (type = "text") => {
    const newField = createField(type);

    setFields((current) => [
      ...current,
      newField,
    ]);

    setEditingId(newField.id);
    setSaved(false);
  };

  const updateField = (
    fieldId,
    updates
  ) => {
    setFields((current) =>
      current.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              ...updates,
            }
          : field
      )
    );

    setSaved(false);
  };

  const removeField = (
    fieldId
  ) => {
    setFields((current) =>
      current.filter(
        (field) =>
          field.id !== fieldId
      )
    );

    if (editingId === fieldId) {
      setEditingId(null);
    }

    setSaved(false);
  };

  const duplicateField = (
    field
  ) => {
    const copy = {
      ...field,
      id: `custom-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      label: field.label
        ? `${field.label} Copy`
        : "",
      options: [
        ...(field.options || []),
      ],
    };

    setFields((current) => {
      const index =
        current.findIndex(
          (item) =>
            item.id === field.id
        );

      if (index === -1) {
        return [
          ...current,
          copy,
        ];
      }

      const next = [...current];
      next.splice(
        index + 1,
        0,
        copy
      );

      return next;
    });

    setEditingId(copy.id);
    setSaved(false);
  };

  const moveField = (
    index,
    direction
  ) => {
    const target =
      index + direction;

    if (
      target < 0 ||
      target >= fields.length
    ) {
      return;
    }

    setFields((current) => {
      const next = [...current];

      [
        next[index],
        next[target],
      ] = [
        next[target],
        next[index],
      ];

      return next;
    });

    setSaved(false);
  };

  const handleSave = async () => {
    const validFields =
      fields.map(
        (field) => ({
          ...field,
          label:
            field.label.trim(),
        })
      );

    setFields(validFields);

    try {
      const result =
        await onSave?.(
          validFields
        );

      if (result === false) {
        return;
      }

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save registration custom fields:",
        error
      );
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Settings2
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Registration Form
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Custom Fields
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Add custom questions and fields to collect
              information specific to your event.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setPreview(
                (current) => !current
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {preview
              ? "Edit Fields"
              : "Preview Form"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            {saved ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}

            {saved
              ? "Saved"
              : "Save Fields"}
          </button>
        </div>
      </div>

      {preview ? (
        <RegistrationPreview
          fields={fields}
        />
      ) : (
        <>
          {/* Field type buttons */}
          <div className="mt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Add Field
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {FIELD_TYPES.map(
                (type) => {
                  const Icon =
                    type.icon;

                  return (
                    <button
                      key={
                        type.value
                      }
                      type="button"
                      onClick={() =>
                        addField(
                          type.value
                        )
                      }
                      className="group rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10"
                    >
                      <div className="flex items-center justify-between">
                        <Icon
                          size={16}
                          className="text-indigo-500"
                        />

                        <Plus
                          size={13}
                          className="text-slate-300 transition group-hover:text-indigo-500"
                        />
                      </div>

                      <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                        {type.label}
                      </p>

                      <p className="mt-1 text-[9px] leading-4 text-slate-400">
                        {
                          type.description
                        }
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="mt-6">
            {fields.length === 0 ? (
              <EmptyState
                onAdd={() =>
                  addField(
                    "text"
                  )
                }
              />
            ) : (
              <div className="space-y-3">
                {fields.map(
                  (
                    field,
                    index
                  ) => (
                    <CustomFieldCard
                      key={
                        field.id
                      }
                      field={
                        field
                      }
                      index={
                        index
                      }
                      total={
                        fields.length
                      }
                      editing={
                        editingId ===
                        field.id
                      }
                      onEdit={() =>
                        setEditingId(
                          editingId ===
                            field.id
                            ? null
                            : field.id
                        )
                      }
                      onUpdate={(
                        updates
                      ) =>
                        updateField(
                          field.id,
                          updates
                        )
                      }
                      onDelete={() =>
                        removeField(
                          field.id
                        )
                      }
                      onDuplicate={() =>
                        duplicateField(
                          field
                        )
                      }
                      onMoveUp={() =>
                        moveField(
                          index,
                          -1
                        )
                      }
                      onMoveDown={() =>
                        moveField(
                          index,
                          1
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

/* ----------------------------------
   Custom field card
----------------------------------- */

const CustomFieldCard = ({
  field,
  index,
  total,
  editing,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const typeInfo =
    FIELD_TYPES.find(
      (item) =>
        item.value === field.type
    ) ||
    FIELD_TYPES[0];

  const Icon = typeInfo.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Card header */}
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          className="cursor-grab text-slate-300 hover:text-slate-500"
          aria-label="Drag to reorder field"
        >
          <GripVertical
            size={17}
          />
        </button>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
          <Icon
            size={15}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-slate-800 dark:text-white">
            {field.label ||
              "Untitled field"}
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            {typeInfo.label}
            {field.required &&
              " · Required"}
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-3 py-2 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
          {editing
            ? "Close"
            : "Edit"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          aria-label="Delete field"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Editor */}
      {editing && (
        <div className="border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Type */}
            <FormControl label="Field Type">
              <select
                value={field.type}
                onChange={(event) =>
                  onUpdate({
                    type: event
                      .target
                      .value,
                    options:
                      event.target
                        .value ===
                        "dropdown" ||
                      event.target
                        .value ===
                        "radio"
                        ? field
                            .options
                            ?.length
                          ? field.options
                          : [
                              "Option 1",
                              "Option 2",
                            ]
                        : [],
                  })
                }
                className="input"
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
                      {type.label}
                    </option>
                  )
                )}
              </select>
            </FormControl>

            {/* Label */}
            <FormControl
              label="Field Label"
              required
            >
              <input
                type="text"
                value={
                  field.label
                }
                onChange={(event) =>
                  onUpdate({
                    label:
                      event.target
                        .value,
                  })
                }
                placeholder="e.g. College Name"
                className="input"
              />
            </FormControl>

            {/* Placeholder */}
            {field.type ===
              "text" && (
              <FormControl
                label="Placeholder"
                full
              >
                <input
                  type="text"
                  value={
                    field.placeholder ||
                    ""
                  }
                  onChange={(
                    event
                  ) =>
                    onUpdate({
                      placeholder:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Enter placeholder text"
                  className="input"
                />
              </FormControl>
            )}

            {/* Description */}
            <FormControl
              label="Help Text"
              full
            >
              <textarea
                value={
                  field.description ||
                  ""
                }
                onChange={(event) =>
                  onUpdate({
                    description:
                      event.target
                        .value,
                  })
                }
                placeholder="Explain what participants should enter"
                rows={2}
                className="input resize-none"
              />
            </FormControl>

            {/* File accept */}
            {field.type ===
              "file" && (
              <FormControl
                label="Accepted File Types"
                full
              >
                <input
                  type="text"
                  value={
                    field.accept ||
                    ""
                  }
                  onChange={(event) =>
                    onUpdate({
                      accept:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder=".pdf, .docx, .png"
                  className="input"
                />
              </FormControl>
            )}
          </div>

          {/* Options */}
          {(field.type ===
            "dropdown" ||
            field.type ===
              "radio") && (
            <OptionsEditor
              options={
                field.options ||
                []
              }
              onChange={(options) =>
                onUpdate({
                  options,
                })
              }
            />
          )}

          {/* Required */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Required field
              </p>

              <p className="mt-0.5 text-[9px] text-slate-400">
                Participants must provide a value before
                submitting the registration.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onUpdate({
                  required:
                    !field.required,
                })
              }
              role="switch"
              aria-checked={
                Boolean(
                  field.required
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                field.required
                  ? "bg-indigo-600"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                  field.required
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Reorder */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[9px] text-slate-400">
              Field {index + 1} of{" "}
              {total}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  onMoveUp
                }
                disabled={
                  index === 0
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Move Up
              </button>

              <button
                type="button"
                onClick={
                  onMoveDown
                }
                disabled={
                  index ===
                  total - 1
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Move Down
              </button>

              <button
                type="button"
                onClick={
                  onDuplicate
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Options editor
----------------------------------- */

const OptionsEditor = ({
  options,
  onChange,
}) => {
  const updateOption = (
    index,
    value
  ) => {
    const next = [
      ...options,
    ];

    next[index] = value;

    onChange(next);
  };

  const addOption = () => {
    onChange([
      ...options,
      `Option ${
        options.length + 1
      }`,
    ]);
  };

  const removeOption = (
    index
  ) => {
    if (options.length <= 1) {
      return;
    }

    onChange(
      options.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Options
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Configure the choices participants can select.
          </p>
        </div>

        <button
          type="button"
          onClick={addOption}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
        >
          <Plus size={12} />
          Add Option
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {options.map(
          (option, index) => (
            <div
              key={index}
              className="flex items-center gap-2"
            >
              <span className="w-5 text-center text-[10px] font-bold text-slate-400">
                {index + 1}
              </span>

              <input
                type="text"
                value={option}
                onChange={(event) =>
                  updateOption(
                    index,
                    event.target
                      .value
                  )
                }
                className="input flex-1"
                placeholder={`Option ${
                  index + 1
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  removeOption(
                    index
                  )
                }
                disabled={
                  options.length <=
                  1
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/20"
                aria-label="Remove option"
              >
                <X size={14} />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

/* ----------------------------------
   Registration preview
----------------------------------- */

const RegistrationPreview = ({
  fields,
}) => {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Participant View
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
          Registration Form
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          This is how your custom fields will appear to
          participants.
        </p>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-400 dark:bg-slate-800/60">
          No custom fields have been added.
        </p>
      ) : (
        <div className="space-y-5">
          {fields.map(
            (field) => (
              <PreviewField
                key={
                  field.id
                }
                field={
                  field
                }
              />
            )
          )}

          <button
            type="button"
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white"
          >
            Submit Registration
          </button>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Preview field
----------------------------------- */

const PreviewField = ({
  field,
}) => {
  const label =
    field.label ||
    "Untitled field";

  const required =
    field.required;

  const labelElement = (
    <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );

  if (
    field.type ===
    "dropdown"
  ) {
    return (
      <div>
        {labelElement}

        <select className="input">
          <option value="">
            Select an option
          </option>

          {(
            field.options ||
            []
          ).map(
            (
              option,
              index
            ) => (
              <option
                key={index}
                value={
                  option
                }
              >
                {option}
              </option>
            )
          )}
        </select>

        <FieldDescription
          text={
            field.description
          }
        />
      </div>
    );
  }

  if (
    field.type ===
    "radio"
  ) {
    return (
      <div>
        {labelElement}

        <div className="space-y-2">
          {(
            field.options ||
            []
          ).map(
            (
              option,
              index
            ) => (
              <label
                key={index}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
              >
                <input
                  type="radio"
                  name={
                    field.id
                  }
                />
                {option}
              </label>
            )
          )}
        </div>

        <FieldDescription
          text={
            field.description
          }
        />
      </div>
    );
  }

  if (
    field.type ===
    "checkbox"
  ) {
    return (
      <div>
        {labelElement}

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input type="checkbox" />
          {field.description ||
            "I agree to the above requirement."}
        </label>
      </div>
    );
  }

  if (
    field.type ===
    "file"
  ) {
    return (
      <div>
        {labelElement}

        <input
          type="file"
          accept={
            field.accept ||
            undefined
          }
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900"
        />

        <FieldDescription
          text={
            field.description
          }
        />
      </div>
    );
  }

  return (
    <div>
      {labelElement}

      <input
        type="text"
        placeholder={
          field.placeholder ||
          "Enter your answer"
        }
        className="input"
      />

      <FieldDescription
        text={
          field.description
        }
      />
    </div>
  );
};

const FieldDescription = ({
  text,
}) => {
  if (!text) {
    return null;
  }

  return (
    <p className="mt-1.5 text-[10px] text-slate-400">
      {text}
    </p>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = ({
  onAdd,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
        <Plus
          size={22}
          className="text-indigo-500"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        No custom fields yet
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Add custom fields to collect additional participant
        information during registration.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
      >
        <Plus size={14} />
        Add First Field
      </button>
    </div>
  );
};

/* ----------------------------------
   Form control
----------------------------------- */

const FormControl = ({
  label,
  children,
  required = false,
  full = false,
}) => {
  return (
    <div
      className={
        full
          ? "sm:col-span-2"
          : ""
      }
    >
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
};

export default RegistrationCustomFields;