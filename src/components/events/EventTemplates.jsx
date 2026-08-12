import {
  CalendarDays,
  Check,
  Copy,
  Edit3,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TEMPLATES = [
  {
    id: "template-1",
    name: "Hackathon Template",
    description:
      "Standard configuration for recurring hackathons.",
    category: "Hackathon",
    eventStructure: "Multi-session",
    registrationFields: 8,
    eligibilityRules: 4,
    faqCount: 6,
    notificationSettings: 5,
    sessionCount: 6,
    resourcesCount: 4,
    updatedAt: "2026-08-10",
  },
  {
    id: "template-2",
    name: "Workshop Template",
    description:
      "Reusable setup for technical workshops.",
    category: "Workshop",
    eventStructure: "Single-session",
    registrationFields: 5,
    eligibilityRules: 2,
    faqCount: 4,
    notificationSettings: 3,
    sessionCount: 1,
    resourcesCount: 3,
    updatedAt: "2026-08-08",
  },
];

const EMPTY_TEMPLATE = {
  name: "",
  description: "",
  category: "Workshop",
  eventStructure: "Single-session",
  registrationFields: [],
  eligibilityRules: [],
  faq: [],
  notificationSettings: [],
  sessions: [],
  resources: [],
};

const EventTemplates = ({
  initialTemplates = DEFAULT_TEMPLATES,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate,
  className = "",
}) => {
  const [templates, setTemplates] =
    useState(initialTemplates);

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingTemplate, setEditingTemplate] =
    useState(null);

  const [menuId, setMenuId] = useState(null);

  const filteredTemplates = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return templates.filter((template) => {
      const matchesSearch =
        !query ||
        template.name
          .toLowerCase()
          .includes(query) ||
        template.description
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        template.category ===
          categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    templates,
    search,
    categoryFilter,
  ]);

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        templates.map(
          (template) =>
            template.category
        )
      ),
    ];
  }, [templates]);

  const openCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const openEdit = (template) => {
    setEditingTemplate(template);
    setShowEditor(true);
    setMenuId(null);
  };

  const handleSave = async (data) => {
    if (editingTemplate) {
      const updated = {
        ...editingTemplate,
        ...data,
        updatedAt:
          new Date().toISOString(),
      };

      setTemplates((current) =>
        current.map((template) =>
          template.id ===
          editingTemplate.id
            ? updated
            : template
        )
      );

      await onUpdateTemplate?.(
        updated
      );
    } else {
      const created = {
        ...data,
        id: `template-${Date.now()}`,
        updatedAt:
          new Date().toISOString(),
      };

      setTemplates((current) => [
        created,
        ...current,
      ]);

      await onCreateTemplate?.(
        created
      );
    }

    setShowEditor(false);
    setEditingTemplate(null);
  };

  const handleDelete = async (
    template
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${template.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setTemplates((current) =>
      current.filter(
        (item) =>
          item.id !== template.id
      )
    );

    await onDeleteTemplate?.(
      template
    );

    setMenuId(null);
  };

  const handleDuplicate = async (
    template
  ) => {
    const duplicate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} Copy`,
      updatedAt:
        new Date().toISOString(),
    };

    setTemplates((current) => [
      duplicate,
      ...current,
    ]);

    setMenuId(null);

    await onCreateTemplate?.(
      duplicate
    );
  };

  const handleUse = async (
    template
  ) => {
    await onUseTemplate?.(
      template
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={21} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Tools
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Templates
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Save reusable event configurations and
              quickly create recurring workshops,
              hackathons, and conferences.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
        >
          <Plus size={15} />
          Create Template
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Templates"
          value={templates.length}
          icon={FileText}
        />

        <StatCard
          label="Hackathons"
          value={
            templates.filter(
              (item) =>
                item.category ===
                "Hackathon"
            ).length
          }
          icon={Users}
        />

        <StatCard
          label="Workshops"
          value={
            templates.filter(
              (item) =>
                item.category ===
                "Workshop"
            ).length
          }
          icon={CalendarDays}
        />

        <StatCard
          label="Categories"
          value={
            new Set(
              templates.map(
                (item) =>
                  item.category
              )
            ).size
          }
          icon={Settings2}
        />
      </div>

      {/* Search */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search templates..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(
                      category
                    )
                  }
                  className={`rounded-xl px-3 py-2 text-[7px] font-bold ${
                    categoryFilter ===
                    category
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Template Cards */}
      <div className="mt-6">
        {filteredTemplates.length ===
        0 ? (
          <EmptyState
            onCreate={openCreate}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map(
              (template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  menuOpen={
                    menuId ===
                    template.id
                  }
                  onMenu={() =>
                    setMenuId(
                      menuId ===
                        template.id
                        ? null
                        : template.id
                    )
                  }
                  onEdit={() =>
                    openEdit(
                      template
                    )
                  }
                  onDuplicate={() =>
                    handleDuplicate(
                      template
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      template
                    )
                  }
                  onUse={() =>
                    handleUse(
                      template
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      {showEditor && (
        <TemplateEditor
          template={
            editingTemplate
          }
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(
              null
            );
          }}
          onSave={handleSave}
        />
      )}
    </section>
  );
};

/* --------------------------------
   Template Card
--------------------------------- */

const TemplateCard = ({
  template,
  menuOpen,
  onMenu,
  onEdit,
  onDuplicate,
  onDelete,
  onUse,
}) => {
  return (
    <article className="relative overflow-visible rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <FileText size={19} />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onMenu}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MoreVertical
              size={17}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <MenuButton
                icon={Edit3}
                label="Edit Template"
                onClick={onEdit}
              />

              <MenuButton
                icon={Copy}
                label="Duplicate"
                onClick={onDuplicate}
              />

              <MenuButton
                icon={Trash2}
                label="Delete"
                danger
                onClick={onDelete}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            {template.name}
          </h3>

          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {template.category}
          </span>
        </div>

        <p className="mt-2 min-h-[35px] text-[8px] leading-4 text-slate-500 dark:text-slate-400">
          {template.description}
        </p>
      </div>

      {/* Included Settings */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <FeatureCount
          label="Registration Fields"
          value={
            Array.isArray(
              template.registrationFields
            )
              ? template
                  .registrationFields
                  .length
              : template.registrationFields ||
                0
          }
        />

        <FeatureCount
          label="Eligibility Rules"
          value={
            Array.isArray(
              template.eligibilityRules
            )
              ? template
                  .eligibilityRules
                  .length
              : template.eligibilityRules ||
                0
          }
        />

        <FeatureCount
          label="FAQ"
          value={
            Array.isArray(
              template.faq
            )
              ? template.faq
                  .length
              : template.faqCount ||
                0
          }
        />

        <FeatureCount
          label="Notifications"
          value={
            Array.isArray(
              template.notificationSettings
            )
              ? template
                  .notificationSettings
                  .length
              : template.notificationSettings ||
                0
          }
        />

        <FeatureCount
          label="Sessions"
          value={
            Array.isArray(
              template.sessions
            )
              ? template.sessions
                  .length
              : template.sessionCount ||
                0
          }
        />

        <FeatureCount
          label="Resources"
          value={
            Array.isArray(
              template.resources
            )
              ? template.resources
                  .length
              : template.resourcesCount ||
                0
          }
        />
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <p className="text-[6px] text-slate-400">
          Updated{" "}
          {formatDate(
            template.updatedAt
          )}
        </p>

        <button
          type="button"
          onClick={onUse}
          className="rounded-xl bg-indigo-600 px-4 py-2.5 text-[7px] font-bold text-white hover:bg-indigo-700"
        >
          Use Template
        </button>
      </div>
    </article>
  );
};

/* --------------------------------
   Template Editor
--------------------------------- */

const TemplateEditor = ({
  template,
  onClose,
  onSave,
}) => {
  const [form, setForm] =
    useState(() => ({
      ...EMPTY_TEMPLATE,
      ...(template || {}),
      registrationFields:
        template?.registrationFields ||
        [],
      eligibilityRules:
        template?.eligibilityRules ||
        [],
      faq:
        template?.faq || [],
      notificationSettings:
        template?.notificationSettings ||
        [],
      sessions:
        template?.sessions || [],
      resources:
        template?.resources || [],
    }));

  const [newItem, setNewItem] =
    useState({
      registrationFields: "",
      eligibilityRules: "",
      faq: "",
      notificationSettings: "",
      sessions: "",
      resources: "",
    });

  const updateField = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addItem = (field) => {
    const value =
      newItem[field].trim();

    if (!value) {
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: [
        ...(current[field] || []),
        {
          id: `${field}-${Date.now()}`,
          name: value,
        },
      ],
    }));

    setNewItem((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const removeItem = (
    field,
    id
  ) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].filter(
        (item) => item.id !== id
      ),
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      description:
        form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {template
                ? "Edit Template"
                : "Create Template"}
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Template Configuration
            </h3>

            <p className="mt-1 text-[8px] text-slate-400">
              Configure the reusable structure for future
              events.
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

        <form
          onSubmit={submit}
          className="mt-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Template Name"
              value={form.name}
              placeholder="e.g. Annual Hackathon"
              required
              onChange={(value) =>
                updateField(
                  "name",
                  value
                )
              }
            />

            <Select
              label="Event Category"
              value={form.category}
              options={[
                "Workshop",
                "Hackathon",
                "Conference",
                "Seminar",
                "Competition",
                "Meetup",
                "Other",
              ]}
              onChange={(value) =>
                updateField(
                  "category",
                  value
                )
              }
            />

            <Select
              label="Event Structure"
              value={
                form.eventStructure
              }
              options={[
                "Single-session",
                "Multi-session",
                "Multi-day",
              ]}
              onChange={(value) =>
                updateField(
                  "eventStructure",
                  value
                )
              }
            />

            <Input
              label="Description"
              value={
                form.description
              }
              placeholder="Describe this template..."
              onChange={(value) =>
                updateField(
                  "description",
                  value
                )
              }
            />
          </div>

          {/* Configuration Sections */}
          <div className="grid gap-4 lg:grid-cols-2">
            <BuilderSection
              title="Registration Fields"
              description="Fields included in registration forms."
              field="registrationFields"
              items={
                form.registrationFields
              }
              newValue={
                newItem.registrationFields
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    registrationFields:
                      value,
                  })
                )
              }
              onAdd={() =>
                addItem(
                  "registrationFields"
                )
              }
              onRemove={(id) =>
                removeItem(
                  "registrationFields",
                  id
                )
              }
              placeholder="e.g. Phone Number"
            />

            <BuilderSection
              title="Eligibility Rules"
              description="Requirements participants must satisfy."
              field="eligibilityRules"
              items={
                form.eligibilityRules
              }
              newValue={
                newItem.eligibilityRules
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    eligibilityRules:
                      value,
                  })
                )
              }
              onAdd={() =>
                addItem(
                  "eligibilityRules"
                )
              }
              onRemove={(id) =>
                removeItem(
                  "eligibilityRules",
                  id
                )
              }
              placeholder="e.g. Student status"
            />

            <BuilderSection
              title="FAQ"
              description="Frequently asked questions for the event."
              field="faq"
              items={form.faq}
              newValue={
                newItem.faq
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    faq: value,
                  })
                )
              }
              onAdd={() =>
                addItem("faq")
              }
              onRemove={(id) =>
                removeItem(
                  "faq",
                  id
                )
              }
              placeholder="e.g. What is the registration deadline?"
            />

            <BuilderSection
              title="Notification Settings"
              description="Standard notifications for this event type."
              field="notificationSettings"
              items={
                form.notificationSettings
              }
              newValue={
                newItem.notificationSettings
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    notificationSettings:
                      value,
                  })
                )
              }
              onAdd={() =>
                addItem(
                  "notificationSettings"
                )
              }
              onRemove={(id) =>
                removeItem(
                  "notificationSettings",
                  id
                )
              }
              placeholder="e.g. Registration confirmation"
            />

            <BuilderSection
              title="Session Structure"
              description="Reusable sessions for recurring events."
              field="sessions"
              items={form.sessions}
              newValue={
                newItem.sessions
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    sessions: value,
                  })
                )
              }
              onAdd={() =>
                addItem("sessions")
              }
              onRemove={(id) =>
                removeItem(
                  "sessions",
                  id
                )
              }
              placeholder="e.g. Opening Ceremony"
            />

            <BuilderSection
              title="Standard Resources"
              description="Resources automatically included with the template."
              field="resources"
              items={
                form.resources
              }
              newValue={
                newItem.resources
              }
              onNewValue={(value) =>
                setNewItem(
                  (current) => ({
                    ...current,
                    resources:
                      value,
                  })
                )
              }
              onAdd={() =>
                addItem(
                  "resources"
                )
              }
              onRemove={(id) =>
                removeItem(
                  "resources",
                  id
                )
              }
              placeholder="e.g. Participant Guide"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[8px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
            >
              <Check size={14} />

              {template
                ? "Save Changes"
                : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --------------------------------
   Builder Section
--------------------------------- */

const BuilderSection = ({
  title,
  description,
  items,
  newValue,
  onNewValue,
  onAdd,
  onRemove,
  placeholder,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            {title}
          </p>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            {description}
          </p>
        </div>

        <span className="rounded-full bg-white px-2.5 py-1 text-[6px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
          {items.length}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(event) =>
            onNewValue(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-indigo-600 px-3 text-white hover:bg-indigo-700"
        >
          <Plus size={14} />
        </button>
      </div>

      {items.length > 0 && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 dark:bg-slate-900"
            >
              <span className="text-[7px] font-semibold text-slate-600 dark:text-slate-300">
                {item.name ||
                  item.label ||
                  item.title}
              </span>

              <button
                type="button"
                onClick={() =>
                  onRemove(
                    item.id
                  )
                }
                className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --------------------------------
   Input
--------------------------------- */

const Input = ({
  label,
  value,
  placeholder,
  required = false,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        required={required}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
};

/* --------------------------------
   Select
--------------------------------- */

const Select = ({
  label,
  value,
  options,
  onChange,
}) => {
  return (
    <div>
      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </div>
  );
};

/* --------------------------------
   Stat Card
--------------------------------- */

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <Icon
          size={14}
          className="text-indigo-500"
        />
      </div>

      <p className="mt-2 text-xl font-black text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Feature Count
--------------------------------- */

const FeatureCount = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-950">
      <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[9px] font-black text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

/* --------------------------------
   Menu Button
--------------------------------- */

const MenuButton = ({
  icon: Icon,
  label,
  danger = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-[7px] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 ${
        danger
          ? "text-red-500"
          : "text-slate-600 dark:text-slate-300"
      }`}
    >
      <Icon size={13} />
      {label}
    </button>
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
      <FileText
        size={30}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-[10px] font-bold text-slate-700 dark:text-slate-300">
        No event templates found
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        Create a reusable template to speed up future
        event creation.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700"
      >
        <Plus size={14} />
        Create Template
      </button>
    </div>
  );
};

/* --------------------------------
   Date Helper
--------------------------------- */

const formatDate = (
  value
) => {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

export default EventTemplates;