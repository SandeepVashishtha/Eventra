import {
  BarChart3,
  Check,
  ChevronDown,
  Filter,
  Plus,
  Search,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const SEGMENT_FIELDS = {
  attendance: {
    label: "Attendance",
    options: [
      "High Attendance",
      "Medium Attendance",
      "Low Attendance",
      "Not Attended",
    ],
  },
  registrationStatus: {
    label: "Registration Status",
    options: [
      "Approved",
      "Pending",
      "Rejected",
      "Cancelled",
    ],
  },
  participantCategory: {
    label: "Participant Category",
    options: [
      "Student",
      "Professional",
      "Speaker",
      "Volunteer",
      "Mentor",
    ],
  },
  team: {
    label: "Team",
    options: [],
  },
  sessionParticipation: {
    label: "Session Participation",
    options: [
      "Attended",
      "Partially Attended",
      "Not Attended",
    ],
  },
  submissionStatus: {
    label: "Submission Status",
    options: [
      "Submitted",
      "Pending",
      "Not Submitted",
      "Approved",
      "Rejected",
    ],
  },
};

const DEFAULT_SEGMENTS = [
  {
    id: "segment-1",
    name: "High Attendance Participants",
    description:
      "Participants with high event attendance.",
    conditions: [
      {
        field: "attendance",
        operator: "equals",
        value: "High Attendance",
      },
    ],
    participantIds: ["p1", "p2"],
  },
];

const ParticipantSegmentation = ({
  participants = [],
  initialSegments = DEFAULT_SEGMENTS,
  onSaveSegment,
  onDeleteSegment,
  onUseSegment,
}) => {
  const [segments, setSegments] =
    useState(initialSegments);

  const [search, setSearch] = useState("");

  const [showBuilder, setShowBuilder] =
    useState(false);

  const [editingSegment, setEditingSegment] =
    useState(null);

  const [segmentName, setSegmentName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [conditions, setConditions] =
    useState([
      {
        field: "attendance",
        operator: "equals",
        value: "High Attendance",
      },
    ]);

  const filteredSegments = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return segments;

    return segments.filter(
      (segment) =>
        segment.name
          ?.toLowerCase()
          .includes(query) ||
        segment.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [segments, search]);

  const openCreateBuilder = () => {
    setEditingSegment(null);
    setSegmentName("");
    setDescription("");
    setConditions([
      {
        field: "attendance",
        operator: "equals",
        value: "High Attendance",
      },
    ]);
    setShowBuilder(true);
  };

  const openEditBuilder = (segment) => {
    setEditingSegment(segment);
    setSegmentName(segment.name);
    setDescription(
      segment.description || ""
    );
    setConditions(
      segment.conditions?.length
        ? segment.conditions
        : [
            {
              field: "attendance",
              operator: "equals",
              value: "High Attendance",
            },
          ]
    );
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditingSegment(null);
  };

  const addCondition = () => {
    setConditions((current) => [
      ...current,
      {
        field: "attendance",
        operator: "equals",
        value: "High Attendance",
      },
    ]);
  };

  const updateCondition = (
    index,
    property,
    value
  ) => {
    setConditions((current) =>
      current.map((condition, i) => {
        if (i !== index) {
          return condition;
        }

        const updated = {
          ...condition,
          [property]: value,
        };

        if (property === "field") {
          const options =
            SEGMENT_FIELDS[value]
              ?.options || [];

          updated.value =
            options[0] || "";
        }

        return updated;
      })
    );
  };

  const removeCondition = (index) => {
    setConditions((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const calculateMatchingParticipants = (
    segmentConditions
  ) => {
    if (!participants.length) {
      return [];
    }

    return participants.filter(
      (participant) =>
        segmentConditions.every(
          (condition) => {
            const value =
              participant[
                condition.field
              ];

            return matchesCondition(
              value,
              condition.value
            );
          }
        )
    );
  };

  const saveSegment = async () => {
    if (
      !segmentName.trim() ||
      conditions.length === 0
    ) {
      return;
    }

    const participantMatches =
      calculateMatchingParticipants(
        conditions
      );

    const segment = {
      id:
        editingSegment?.id ||
        `segment-${Date.now()}`,
      name: segmentName.trim(),
      description:
        description.trim(),
      conditions,
      participantIds:
        participantMatches.map(
          (participant) =>
            participant.id
        ),
      participantCount:
        participantMatches.length,
      updatedAt:
        new Date().toISOString(),
    };

    if (editingSegment) {
      setSegments((current) =>
        current.map((item) =>
          item.id === segment.id
            ? segment
            : item
        )
      );
    } else {
      setSegments((current) => [
        segment,
        ...current,
      ]);
    }

    await onSaveSegment?.(segment);

    closeBuilder();
  };

  const deleteSegment = async (
    segment
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${segment.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setSegments((current) =>
      current.filter(
        (item) =>
          item.id !== segment.id
      )
    );

    await onDeleteSegment?.(segment);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Users size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Participant Segments
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Create reusable participant groups based on
              attendance, registration, teams, sessions,
              and submissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateBuilder}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
          Create Segment
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Segments"
          value={segments.length}
        />

        <StatCard
          label="Participants"
          value={participants.length}
        />

        <StatCard
          label="Reusable Groups"
          value={segments.length}
        />
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search participant segments..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* Segments */}
      <div className="mt-6 space-y-3">
        {filteredSegments.length ===
        0 ? (
          <EmptyState
            onCreate={
              openCreateBuilder
            }
          />
        ) : (
          filteredSegments.map(
            (segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                onEdit={() =>
                  openEditBuilder(
                    segment
                  )
                }
                onDelete={() =>
                  deleteSegment(
                    segment
                  )
                }
                onUse={() =>
                  onUseSegment?.(
                    segment
                  )
                }
              />
            )
          )
        )}
      </div>

      {/* Builder */}
      {showBuilder && (
        <SegmentBuilder
          name={segmentName}
          description={description}
          conditions={conditions}
          onNameChange={setSegmentName}
          onDescriptionChange={
            setDescription
          }
          onConditionChange={
            updateCondition
          }
          onAddCondition={
            addCondition
          }
          onRemoveCondition={
            removeCondition
          }
          onSave={saveSegment}
          onClose={closeBuilder}
          editing={Boolean(
            editingSegment
          )}
        />
      )}
    </section>
  );
};

/* --------------------------------
   Segment Card
--------------------------------- */

const SegmentCard = ({
  segment,
  onEdit,
  onDelete,
  onUse,
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Tag size={17} />
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              {segment.name}
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-slate-400">
              {segment.description ||
                "Custom participant segment"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {segment.conditions?.map(
                (condition, index) => (
                  <ConditionBadge
                    key={`${condition.field}-${index}`}
                    condition={
                      condition
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="mr-2 text-right">
            <p className="text-lg font-black text-slate-800 dark:text-white">
              {segment.participantCount ??
                segment.participantIds
                  ?.length ??
                0}
            </p>

            <p className="text-[6px] uppercase tracking-wide text-slate-400">
              Participants
            </p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Edit segment"
          >
            <Filter size={14} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:hover:bg-red-900/10"
            aria-label="Delete segment"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={onUse}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
        >
          <Users size={12} />
          Use Segment
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Edit Conditions
        </button>
      </div>
    </article>
  );
};

/* --------------------------------
   Segment Builder
--------------------------------- */

const SegmentBuilder = ({
  name,
  description,
  conditions,
  onNameChange,
  onDescriptionChange,
  onConditionChange,
  onAddCondition,
  onRemoveCondition,
  onSave,
  onClose,
  editing,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Segment Builder
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              {editing
                ? "Edit Participant Segment"
                : "Create Participant Segment"}
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Define rules to automatically group
              participants.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Name */}
        <div className="mt-6">
          <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Segment Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              onNameChange(
                event.target.value
              )
            }
            placeholder="e.g. High Attendance Students"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              onDescriptionChange(
                event.target.value
              )
            }
            rows={2}
            placeholder="Describe who belongs in this segment..."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {/* Conditions */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                Segment Conditions
              </h4>

              <p className="mt-1 text-[7px] text-slate-400">
                Participants must match all conditions.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddCondition}
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[7px] font-bold text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400"
            >
              <Plus size={11} />
              Add Rule
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {conditions.map(
              (condition, index) => (
                <ConditionRow
                  key={index}
                  index={index}
                  condition={
                    condition
                  }
                  onChange={
                    onConditionChange
                  }
                  onRemove={() =>
                    onRemoveCondition(
                      index
                    )
                  }
                  canRemove={
                    conditions.length >
                    1
                  }
                />
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              !name.trim() ||
              conditions.length ===
                0
            }
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={13} />

            {editing
              ? "Update Segment"
              : "Create Segment"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Condition Row
--------------------------------- */

const ConditionRow = ({
  index,
  condition,
  onChange,
  onRemove,
  canRemove,
}) => {
  const field =
    SEGMENT_FIELDS[
      condition.field
    ];

  const options =
    field?.options || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="text-[7px] font-bold text-slate-500">
            Rule {index + 1}
          </label>

          <Select
            value={condition.field}
            onChange={(value) =>
              onChange(
                index,
                "field",
                value
              )
            }
            options={Object.entries(
              SEGMENT_FIELDS
            ).map(
              ([value, data]) => ({
                value,
                label: data.label,
              })
            )}
          />
        </div>

        <div className="lg:w-40">
          <label className="text-[7px] font-bold text-slate-500">
            Condition
          </label>

          <Select
            value={
              condition.operator
            }
            onChange={(value) =>
              onChange(
                index,
                "operator",
                value
              )
            }
            options={[
              {
                value: "equals",
                label: "Is",
              },
              {
                value: "not_equals",
                label: "Is Not",
              },
            ]}
          />
        </div>

        <div className="flex-1">
          <label className="text-[7px] font-bold text-slate-500">
            Value
          </label>

          {options.length > 0 ? (
            <Select
              value={
                condition.value
              }
              onChange={(value) =>
                onChange(
                  index,
                  "value",
                  value
                )
              }
              options={options.map(
                (option) => ({
                  value: option,
                  label: option,
                })
              )}
            />
          ) : (
            <input
              value={
                condition.value
              }
              onChange={(event) =>
                onChange(
                  index,
                  "value",
                  event.target.value
                )
              }
              placeholder="Enter value"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          )}
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-xl border border-red-200 p-3 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
            aria-label="Remove condition"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

/* --------------------------------
   Select
--------------------------------- */

const Select = ({
  value,
  onChange,
  options,
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-9 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
};

/* --------------------------------
   Condition Badge
--------------------------------- */

const ConditionBadge = ({
  condition,
}) => {
  const field =
    SEGMENT_FIELDS[
      condition.field
    ];

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[6px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {field?.label ||
        condition.field}{" "}
      {condition.operator ===
      "not_equals"
        ? "≠"
        : "="}{" "}
      {condition.value}
    </span>
  );
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyState = ({
  onCreate,
}) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <Users
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-300">
        No participant segments
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Create a reusable segment to organize participants.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
      >
        <Plus size={12} />
        Create First Segment
      </button>
    </div>
  );
};

/* --------------------------------
   Matching Logic
--------------------------------- */

const matchesCondition = (
  participantValue,
  conditionValue
) => {
  if (
    Array.isArray(
      participantValue
    )
  ) {
    return participantValue.includes(
      conditionValue
    );
  }

  return (
    String(
      participantValue ?? ""
    ).toLowerCase() ===
    String(
      conditionValue ?? ""
    ).toLowerCase()
  );
};

export default ParticipantSegmentation;