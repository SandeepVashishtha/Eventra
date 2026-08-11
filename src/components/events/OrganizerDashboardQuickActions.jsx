import {
  Bell,
  CalendarPlus,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  MessageSquare,
  Settings,
  UserRound,
  XCircle,
} from "lucide-react";

const DEFAULT_ACTIONS = [
  {
    id: "create-event",
    title: "Create Event",
    description: "Create a new event",
    icon: CalendarPlus,
    href: "/events/create",
  },
  {
    id: "edit-event",
    title: "Edit Event",
    description: "Update event details",
    icon: Edit3,
    href: "/organizer/events",
  },
  {
    id: "participants",
    title: "View Participants",
    description: "Manage registered users",
    icon: UserRound,
    href: "/organizer/participants",
  },
  {
    id: "announcement",
    title: "Send Announcement",
    description: "Notify participants",
    icon: Bell,
    href: "/organizer/announcements",
  },
  {
    id: "export",
    title: "Export Registrations",
    description: "Download registration data",
    icon: Download,
    action: "export",
  },
  {
    id: "feedback",
    title: "Manage Feedback",
    description: "Review participant feedback",
    icon: MessageSquare,
    href: "/organizer/feedback",
  },
  {
    id: "close-registration",
    title: "Close Registration",
    description: "Stop new registrations",
    icon: XCircle,
    action: "close-registration",
    danger: true,
  },
];

const OrganizerDashboardQuickActions = ({
  actions = DEFAULT_ACTIONS,
  registrations = [],
  eventId,
  onNavigate,
  onExportRegistrations,
  onCloseRegistration,
  registrationOpen = true,
  className = "",
}) => {
  const handleAction = async (action) => {
    if (action.action === "export") {
      if (onExportRegistrations) {
        await onExportRegistrations({
          eventId,
          registrations,
        });
      } else {
        exportRegistrations(
          registrations,
          eventId
        );
      }

      return;
    }

    if (
      action.action ===
      "close-registration"
    ) {
      if (!registrationOpen) {
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to close registration for this event?"
      );

      if (!confirmed) {
        return;
      }

      await onCloseRegistration?.(
        eventId
      );

      return;
    }

    if (action.href) {
      if (onNavigate) {
        onNavigate(action.href);
      } else {
        window.location.href =
          action.href;
      }
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Settings
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Dashboard
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quickly access common event-management tasks.
            </p>
          </div>
        </div>

        <div className="rounded-full bg-indigo-50 px-3 py-1.5 dark:bg-indigo-900/20">
          <span className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
            {actions.length} actions
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          const disabled =
            action.action ===
              "close-registration" &&
            !registrationOpen;

          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                handleAction(action)
              }
              className={`group flex min-h-[105px] items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 ${
                action.danger
                  ? "border-red-100 hover:border-red-200 dark:border-red-900/30"
                  : "border-slate-200 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-indigo-900/50"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  action.danger
                    ? "bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400"
                    : "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                }`}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-[10px] font-bold ${
                    action.danger
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-800 dark:text-white"
                  }`}
                >
                  {action.title}
                </p>

                <p className="mt-1 text-[8px] leading-4 text-slate-400">
                  {action.id ===
                    "close-registration" &&
                  !registrationOpen
                    ? "Registration already closed"
                    : action.description}
                </p>
              </div>

              <ChevronRight
                size={15}
                className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                  action.danger
                    ? "text-red-300"
                    : "text-slate-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Registration status */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              registrationOpen
                ? "bg-green-500"
                : "bg-slate-400"
            }`}
          />

          <div>
            <p className="text-[9px] font-bold text-slate-700 dark:text-slate-200">
              Registration Status
            </p>

            <p className="mt-0.5 text-[7px] text-slate-400">
              {registrationOpen
                ? "Participants can currently register"
                : "New registrations are closed"}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[7px] font-bold ${
            registrationOpen
              ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {registrationOpen
            ? "Open"
            : "Closed"}
        </span>
      </div>
    </section>
  );
};

const exportRegistrations = (
  registrations,
  eventId
) => {
  if (!registrations?.length) {
    window.alert(
      "There are no registrations to export."
    );
    return;
  }

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Status",
    "Team",
  ];

  const rows = registrations.map(
    (participant) => [
      participant.name ?? "",
      participant.email ?? "",
      participant.phone ?? "",
      participant.status ?? "",
      participant.teamName ?? "",
    ]
  );

  const csv = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map(csvEscape)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = `event-${eventId || "registrations"}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};

const csvEscape = (value) => {
  const stringValue =
    String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(
      /"/g,
      '""'
    )}"`;
  }

  return stringValue;
};

export default OrganizerDashboardQuickActions;