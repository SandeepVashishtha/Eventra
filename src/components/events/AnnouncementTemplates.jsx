import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Edit3,
  FileText,
  MapPin,
  MessageSquare,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TEMPLATES = [
  {
    id: "registration-reminder",
    name: "Registration Reminder",
    description:
      "Remind participants to complete their event registration.",
    icon: Bell,
    subject: "Registration Reminder - {{eventName}}",
    content:
      "Hello {{participantName}},\n\nThis is a reminder to complete your registration for {{eventName}}.\n\nEvent Date: {{eventDate}}\nRegistration Deadline: {{registrationDeadline}}\n\nWe look forward to seeing you!",
  },
  {
    id: "event-starting",
    name: "Event Starting Soon",
    description:
      "Notify participants that the event is starting soon.",
    icon: CalendarClock,
    subject: "{{eventName}} starts soon",
    content:
      "Hello {{participantName}},\n\n{{eventName}} is starting soon.\n\nDate: {{eventDate}}\nTime: {{eventTime}}\nVenue: {{venue}}\n\nPlease arrive a few minutes early.",
  },
  {
    id: "venue-change",
    name: "Venue Change",
    description:
      "Inform participants about an updated event venue.",
    icon: MapPin,
    subject: "Venue Change - {{eventName}}",
    content:
      "Hello {{participantName}},\n\nPlease note that the venue for {{eventName}} has been changed.\n\nNew Venue: {{venue}}\nEvent Date: {{eventDate}}\nEvent Time: {{eventTime}}\n\nWe apologize for any inconvenience.",
  },
  {
    id: "schedule-update",
    name: "Schedule Update",
    description:
      "Share important changes to the event schedule.",
    icon: CalendarClock,
    subject: "Schedule Update - {{eventName}}",
    content:
      "Hello {{participantName}},\n\nThere has been an update to the schedule for {{eventName}}.\n\nUpdated Schedule:\n{{scheduleDetails}}\n\nPlease review the changes before attending.",
  },
  {
    id: "submission-reminder",
    name: "Submission Reminder",
    description:
      "Remind participants about pending submissions.",
    icon: Upload,
    subject: "Submission Reminder - {{eventName}}",
    content:
      "Hello {{participantName}},\n\nThis is a reminder to submit the required materials for {{eventName}}.\n\nSubmission Deadline: {{submissionDeadline}}\n\nPlease complete your submission before the deadline.",
  },
  {
    id: "feedback-request",
    name: "Feedback Request",
    description:
      "Request feedback after an event.",
    icon: MessageSquare,
    subject: "Share your feedback - {{eventName}}",
    content:
      "Hello {{participantName}},\n\nThank you for participating in {{eventName}}.\n\nWe would appreciate your feedback about the event.\n\nFeedback Link: {{feedbackLink}}\n\nThank you for helping us improve future events!",
  },
];

const VARIABLES = [
  "{{participantName}}",
  "{{eventName}}",
  "{{eventDate}}",
  "{{eventTime}}",
  "{{venue}}",
  "{{registrationDeadline}}",
  "{{submissionDeadline}}",
  "{{scheduleDetails}}",
  "{{feedbackLink}}",
];

const AnnouncementTemplates = ({
  initialTemplates = DEFAULT_TEMPLATES,
  onSend,
  onSaveTemplate,
  className = "",
}) => {
  const [templates, setTemplates] =
    useState(initialTemplates);

  const [selectedId, setSelectedId] =
    useState(
      initialTemplates[0]?.id || ""
    );

  const [subject, setSubject] =
    useState(
      initialTemplates[0]?.subject || ""
    );

  const [content, setContent] =
    useState(
      initialTemplates[0]?.content || ""
    );

  const [search, setSearch] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(false);

  const [showVariables, setShowVariables] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const filteredTemplates = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return templates;
    }

    return templates.filter(
      (template) =>
        template.name
          .toLowerCase()
          .includes(query) ||
        template.description
          .toLowerCase()
          .includes(query)
    );
  }, [templates, search]);

  const selectedTemplate =
    templates.find(
      (template) =>
        template.id === selectedId
    );

  const selectTemplate = (template) => {
    setSelectedId(template.id);
    setSubject(template.subject);
    setContent(template.content);
    setMessage("");
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      return;
    }

    setSaving(true);
    setMessage("");

    const updatedTemplate = {
      ...selectedTemplate,
      subject,
      content,
    };

    try {
      setTemplates((current) =>
        current.map((template) =>
          template.id === selectedId
            ? updatedTemplate
            : template
        )
      );

      await onSaveTemplate?.(
        updatedTemplate
      );

      setMessage(
        "Template saved successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to save template."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      setMessage(
        "Please enter an announcement subject."
      );
      return;
    }

    if (!content.trim()) {
      setMessage(
        "Please enter announcement content."
      );
      return;
    }

    setSending(true);
    setMessage("");

    try {
      await onSend?.({
        templateId: selectedId,
        subject: subject.trim(),
        content: content.trim(),
      });

      setMessage(
        "Announcement sent successfully."
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to send announcement."
      );
    } finally {
      setSending(false);
    }
  };

  const insertVariable = (variable) => {
    setContent(
      (current) =>
        `${current}${current ? " " : ""}${variable}`
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Communication
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Announcement Templates
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create, reuse, edit, preview, and send event
              announcements quickly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[7px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {templates.length} Templates
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* Template List */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                Templates
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                Choose an announcement template.
              </p>
            </div>

            <Sparkles
              size={15}
              className="text-indigo-500"
            />
          </div>

          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search templates..."
            className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />

          {/* List */}
          <div className="mt-4 space-y-2">
            {filteredTemplates.map(
              (template) => {
                const Icon = template.icon;

                const active =
                  template.id === selectedId;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() =>
                      selectTemplate(
                        template
                      )
                    }
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/10"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <Icon size={14} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-bold text-slate-800 dark:text-white">
                          {template.name}
                        </p>

                        <p className="mt-1 text-[7px] leading-4 text-slate-400">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              }
            )}

            {filteredTemplates.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center dark:border-slate-700">
                <p className="text-[8px] font-semibold text-slate-500">
                  No templates found.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Editor */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">
          {selectedTemplate ? (
            <>
              {/* Editor Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-800 dark:text-white">
                    Edit Template
                  </p>

                  <p className="mt-1 text-[7px] text-slate-400">
                    Customize the selected template before sending.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPreview(
                      (current) =>
                        !current
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-[7px] font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FileText size={12} />

                  {showPreview
                    ? "Edit"
                    : "Preview"}
                </button>
              </div>

              {showPreview ? (
                <AnnouncementPreview
                  subject={subject}
                  content={content}
                />
              ) : (
                <>
                  {/* Subject */}
                  <div className="mt-5">
                    <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                      Subject
                    </label>

                    <input
                      type="text"
                      value={subject}
                      onChange={(event) =>
                        setSubject(
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  {/* Content */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <label className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
                        Message
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setShowVariables(
                            (current) =>
                              !current
                          )
                        }
                        className="text-[7px] font-bold text-indigo-600 dark:text-indigo-400"
                      >
                        Insert Variables
                      </button>
                    </div>

                    {showVariables && (
                      <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
                        {VARIABLES.map(
                          (variable) => (
                            <button
                              key={variable}
                              type="button"
                              onClick={() =>
                                insertVariable(
                                  variable
                                )
                              }
                              className="rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 text-[6px] font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/30 dark:bg-slate-900 dark:text-indigo-400"
                            >
                              {variable}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    <textarea
                      value={content}
                      onChange={(event) =>
                        setContent(
                          event.target.value
                        )
                      }
                      rows={12}
                      className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* Message */}
              {message && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[8px] font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
                  <CheckCircle2
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-[8px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit3 size={13} />

                  {saving
                    ? "Saving..."
                    : "Save Template"}
                </button>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={saving || sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send size={13} />

                  {sending
                    ? "Sending..."
                    : "Send Announcement"}
                </button>
              </div>
            </>
          ) : (
            <EmptyEditor />
          )}
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Preview
--------------------------------- */

const AnnouncementPreview = ({
  subject,
  content,
}) => {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <p className="text-[7px] font-bold uppercase tracking-wider text-indigo-500">
            Announcement Preview
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {subject || "Untitled Announcement"}
          </h3>
        </div>

        <div className="whitespace-pre-wrap pt-5 text-xs leading-6 text-slate-600 dark:text-slate-300">
          {content ||
            "Your announcement content will appear here."}
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Empty State
--------------------------------- */

const EmptyEditor = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <FileText size={24} />
      </div>

      <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">
        Select a template
      </p>

      <p className="mt-1 max-w-xs text-[8px] leading-4 text-slate-400">
        Choose an announcement template from the list to start
        editing.
      </p>
    </div>
  );
};

export default AnnouncementTemplates;