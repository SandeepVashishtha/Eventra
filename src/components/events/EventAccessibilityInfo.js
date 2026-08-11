import {
  Accessibility,
  Check,
  CircleHelp,
  Mail,
  X,
} from "lucide-react";

import {
  getAccessibilityFeatures,
  getAccessibilityContact,
  hasAccessibilityInformation,
} from "../../utils/eventAccessibilityUtils";

import AccessibilityFeature from "./AccessibilityFeature";

const EventAccessibilityInfo = ({
  event = {},
}) => {
  const features =
    getAccessibilityFeatures(event);

  const contact =
    getAccessibilityContact(event);

  const hasInformation =
    hasAccessibilityInformation(event);

  if (!hasInformation) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <Accessibility
              size={21}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Accessibility Information
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Accessibility information has not been
              provided for this event yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Accessibility
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Accessibility Information
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review the accessibility features available
              at this event venue before attending.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Feature grid */}
        {features.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <AccessibilityFeature
                key={feature.id}
                feature={feature}
              />
            ))}
          </div>
        )}

        {/* Contact */}
        {contact && (
          <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900">
                <Mail
                  size={18}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Accessibility Contact
                </p>

                {contact.name && (
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                    {contact.name}
                  </p>
                )}

                {contact.description && (
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {contact.description}
                  </p>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-2 inline-flex items-center gap-2 break-all text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Mail size={14} />
                    {contact.email}
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="mt-1 block text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                  >
                    {contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information notice */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <CircleHelp
            size={17}
            className="mt-0.5 shrink-0 text-slate-400"
          />

          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Accessibility features can vary depending on
            the venue and event setup. Contact the organizer
            if you need specific accommodations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventAccessibilityInfo;