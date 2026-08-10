import {
  ExternalLink,
  FileQuestion,
  Flag,
  HelpCircle,
  Mail,
  MessageCircle,
  ShieldQuestion,
  UserRound,
} from "lucide-react";

import {
  getEventSupportInfo,
  hasSupportInformation,
} from "../../utils/eventSupportUtils";

const EventSupportCenter = ({
  event = {},
  onReportIssue,
  onContactOrganizer,
}) => {
  const support =
    getEventSupportInfo(event);

  if (!hasSupportInformation(event)) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <HelpCircle
              size={21}
              className="text-slate-500"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Support
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Support information for this event has
              not been provided yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const handleReport = () => {
    if (onReportIssue) {
      onReportIssue(event);
      return;
    }

    if (support.reportIssueUrl) {
      window.open(
        support.reportIssueUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const handleContact = () => {
    if (onContactOrganizer) {
      onContactOrganizer(event);
    }
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ShieldQuestion
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Contact &amp; Support
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Need help with this event? Contact the
              organizer or use one of the support options
              below.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Organizer */}
        {support.organizer && (
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <UserRound
                  size={18}
                  className="text-slate-500 dark:text-slate-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Event Organizer
                </p>

                <p className="mt-1 font-semibold text-slate-800 dark:text-white">
                  {support.organizer.name ||
                    "Event Organizer"}
                </p>

                {support.organizer.description && (
                  <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {support.organizer.description}
                  </p>
                )}

                {support.organizer.email && (
                  <a
                    href={`mailto:${support.organizer.email}`}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Mail size={15} />
                    {support.organizer.email}
                  </a>
                )}
              </div>
            </div>

            {onContactOrganizer && (
              <button
                type="button"
                onClick={handleContact}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <MessageCircle size={16} />
                Contact Organizer
              </button>
            )}
          </div>
        )}

        {/* Support email */}
        {support.supportEmail && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex items-start gap-3">
              <Mail
                size={19}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Support Email
                </p>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Contact the event support team for
                  event-specific assistance.
                </p>

                <a
                  href={`mailto:${support.supportEmail}`}
                  className="mt-2 inline-flex items-center gap-2 break-all text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <Mail size={14} />
                  {support.supportEmail}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Event-specific support information */}
        {support.supportInformation && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
            <div className="flex items-start gap-3">
              <MessageCircle
                size={19}
                className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Event-Specific Support
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {support.supportInformation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action links */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {/* FAQ */}
          {support.faqUrl && (
            <a
              href={support.faqUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-slate-800"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <FileQuestion
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Event FAQ
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Find answers to common questions
                </p>
              </div>

              <ExternalLink
                size={15}
                className="shrink-0 text-slate-400 transition group-hover:text-indigo-500"
              />
            </a>
          )}

          {/* Report issue */}
          {(support.reportIssueUrl ||
            onReportIssue) && (
            <button
              type="button"
              onClick={handleReport}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:hover:border-red-800 dark:hover:bg-red-900/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Flag
                  size={18}
                  className="text-red-600 dark:text-red-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Report an Issue
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Report an event-related problem
                </p>
              </div>

              {support.reportIssueUrl && (
                <ExternalLink
                  size={15}
                  className="shrink-0 text-slate-400"
                />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventSupportCenter;