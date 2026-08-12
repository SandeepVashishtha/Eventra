import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Flag,
  MessageSquare,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_ACTIONS = [
  {
    id: 1,
    type: "registration",
    title: "Pending registration approval",
    description: "A participant is waiting for registration approval.",
    participant: "Aarav Shah",
    event: "Tech Innovation Summit",
    createdAt: "10 minutes ago",
    priority: "high",
  },
  {
    id: 2,
    type: "document",
    title: "Document verification required",
    description: "A participant submitted a document for verification.",
    participant: "Diya Patel",
    event: "AI Hackathon",
    createdAt: "25 minutes ago",
    priority: "medium",
  },
  {
    id: 3,
    type: "report",
    title: "Participant report requires review",
    description: "A participant report has been submitted.",
    participant: "Rahul Mehta",
    event: "Developer Conference",
    createdAt: "1 hour ago",
    priority: "high",
  },
  {
    id: 4,
    type: "feedback",
    title: "Feedback requires review",
    description: "A participant submitted feedback requiring organizer attention.",
    participant: "Krisha Joshi",
    event: "Women in Technology",
    createdAt: "2 hours ago",
    priority: "medium",
  },
  {
    id: 5,
    type: "team",
    title: "Pending team request",
    description: "A participant requested to join a team.",
    participant: "Dev Shah",
    event: "Code Challenge",
    createdAt: "3 hours ago",
    priority: "low",
  },
  {
    id: 6,
    type: "certificate",
    title: "Certificate request pending",
    description: "A participant requested a certificate.",
    participant: "Riya Desai",
    event: "Cloud Workshop",
    createdAt: "4 hours ago",
    priority: "medium",
  },
];

const ACTION_TYPES = {
  registration: {
    label: "Registration",
    icon: Users,
    iconClass:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  },
  document: {
    label: "Document",
    icon: FileCheck2,
    iconClass:
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  },
  report: {
    label: "Report",
    icon: Flag,
    iconClass:
      "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
  feedback: {
    label: "Feedback",
    icon: MessageSquare,
    iconClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  team: {
    label: "Team Request",
    icon: Users,
    iconClass:
      "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  },
  certificate: {
    label: "Certificate",
    icon: ShieldCheck,
    iconClass:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  },
};

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  medium:
    "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  low: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const OrganizerApprovalQueue = ({
  actions = DEFAULT_ACTIONS,
  onAction,
}) => {
  const [items, setItems] = useState(actions);
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;

    return items.filter(
      (item) => item.type === filter
    );
  }, [items, filter]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      registration: items.filter(
        (item) => item.type === "registration"
      ).length,
      document: items.filter(
        (item) => item.type === "document"
      ).length,
      report: items.filter(
        (item) => item.type === "report"
      ).length,
      feedback: items.filter(
        (item) => item.type === "feedback"
      ).length,
      team: items.filter(
        (item) => item.type === "team"
      ).length,
      certificate: items.filter(
        (item) => item.type === "certificate"
      ).length,
    };
  }, [items]);

  const completeAction = (item) => {
    setItems((current) =>
      current.filter(
        (action) => action.id !== item.id
      )
    );

    setSelectedItem(null);

    if (onAction) {
      onAction(item, "completed");
    }
  };

  const dismissAction = (item) => {
    setItems((current) =>
      current.filter(
        (action) => action.id !== item.id
      )
    );

    setSelectedItem(null);

    if (onAction) {
      onAction(item, "dismissed");
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <AlertCircle size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Dashboard
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Action Required
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Review registrations, documents, reports, feedback, team
              requests, and certificates requiring your attention.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <Clock3
            size={13}
            className="text-indigo-500"
          />

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            {counts.total} Pending Actions
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={AlertCircle}
          label="Total Pending"
          value={counts.total}
        />

        <SummaryCard
          icon={Users}
          label="Registrations"
          value={counts.registration}
        />

        <SummaryCard
          icon={FileCheck2}
          label="Documents"
          value={counts.document}
        />

        <SummaryCard
          icon={Flag}
          label="Reports"
          value={counts.report}
        />
      </div>

      {/* Filters */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          <FilterButton
            active={filter === "all"}
            label={`All (${counts.total})`}
            onClick={() => setFilter("all")}
          />

          {Object.entries(ACTION_TYPES).map(
            ([key, config]) => (
              <FilterButton
                key={key}
                active={filter === key}
                label={`${config.label} (${
                  counts[key]
                })`}
                onClick={() => setFilter(key)}
              />
            )
          )}
        </div>
      </div>

      {/* Queue */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Approval Queue
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Complete or dismiss pending organizer actions.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {filteredItems.length} items
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredItems.map((item) => (
            <ActionItem
              key={item.id}
              item={item}
              onView={() =>
                setSelectedItem(item)
              }
              onComplete={() =>
                completeAction(item)
              }
              onDismiss={() =>
                dismissAction(item)
              }
            />
          ))}

          {!filteredItems.length && (
            <EmptyQueue />
          )}
        </div>
      </div>

      {/* Priority Insight */}
      {items.length > 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-amber-500"
          />

          <div>
            <p className="text-[8px] font-bold text-amber-700 dark:text-amber-400">
              Organizer Attention Needed
            </p>

            <p className="mt-1 text-[7px] leading-4 text-amber-700/70 dark:text-amber-400/70">
              {items.filter(
                (item) =>
                  item.priority === "high"
              ).length}{" "}
              high-priority action
              {items.filter(
                (item) =>
                  item.priority === "high"
              ).length !== 1
                ? "s"
                : ""}{" "}
              currently require attention.
            </p>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <ActionDetailsModal
          item={selectedItem}
          onClose={() =>
            setSelectedItem(null)
          }
          onComplete={() =>
            completeAction(selectedItem)
          }
          onDismiss={() =>
            dismissAction(selectedItem)
          }
        />
      )}
    </section>
  );
};

/* --------------------------------
   Summary Card
--------------------------------- */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={15} />
        </div>

        <div>
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Filter Button
--------------------------------- */

const FilterButton = ({
  active,
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-[6px] font-bold transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-indigo-600 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700 dark:hover:text-indigo-400"
      }`}
    >
      {label}
    </button>
  );
};

/* --------------------------------
   Action Item
--------------------------------- */

const ActionItem = ({
  item,
  onView,
  onComplete,
  onDismiss,
}) => {
  const config =
    ACTION_TYPES[item.type] ||
    ACTION_TYPES.registration;

  const Icon = config.icon;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-900/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
        >
          <Icon size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[8px] font-bold text-slate-800 dark:text-white">
              {item.title}
            </h4>

            <span
              className={`rounded-full px-2 py-1 text-[5px] font-bold uppercase ${
                PRIORITY_STYLES[
                  item.priority
                ]
              }`}
            >
              {item.priority}
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {config.label}
            </span>
          </div>

          <p className="mt-1 text-[7px] leading-4 text-slate-400">
            {item.description}
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
              Participant: {item.participant}
            </span>

            <span className="text-[6px] font-semibold text-slate-500 dark:text-slate-400">
              Event: {item.event}
            </span>

            <span className="text-[6px] text-slate-400">
              {item.createdAt}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-[6px] font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            Review
            <ArrowRight size={10} />
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-[6px] font-bold text-white hover:bg-green-700"
          >
            <CheckCircle2 size={10} />
            Complete
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:bg-slate-800"
            title="Dismiss"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty Queue
--------------------------------- */

const EmptyQueue = () => {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-5 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-900/20">
        <CheckCircle2 size={23} />
      </div>

      <h4 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">
        All caught up!
      </h4>

      <p className="mt-1 max-w-sm text-[7px] leading-4 text-slate-400">
        There are no pending actions in this category.
      </p>
    </div>
  );
};

/* --------------------------------
   Details Modal
--------------------------------- */

const ActionDetailsModal = ({
  item,
  onClose,
  onComplete,
  onDismiss,
}) => {
  const config =
    ACTION_TYPES[item.type] ||
    ACTION_TYPES.registration;

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.iconClass}`}
            >
              <Icon size={17} />
            </div>

            <div>
              <span className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
                {config.label}
              </span>

              <h3 className="mt-1 text-sm font-black text-slate-800 dark:text-white">
                {item.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 dark:bg-slate-800 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Description
            </p>

            <p className="mt-1 text-[8px] leading-5 text-slate-600 dark:text-slate-300">
              {item.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailField
              label="Participant"
              value={item.participant}
            />

            <DetailField
              label="Event"
              value={item.event}
            />

            <DetailField
              label="Created"
              value={item.createdAt}
            />

            <DetailField
              label="Priority"
              value={item.priority}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 sm:flex-row sm:justify-end dark:border-slate-700">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-slate-200 px-4 py-3 text-[7px] font-bold text-slate-600 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
          >
            Dismiss
          </button>

          <button
            type="button"
            onClick={onComplete}
            className="rounded-xl bg-green-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-green-700"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Detail Field
--------------------------------- */

const DetailField = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[7px] font-bold capitalize text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

export default OrganizerApprovalQueue;