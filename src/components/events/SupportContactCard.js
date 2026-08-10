import {
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";

const SupportContactCard = ({
  contact = {},
  title = "Contact Support",
  description = "Need help with this event? Contact the organizer or support team.",
  onContact,
}) => {
  const {
    name = "Event Organizer",
    role = "",
    email = "",
    phone = "",
    description: contactDescription = "",
    website = "",
  } = contact;

  const handleContact = () => {
    onContact?.(contact);
  };

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <MessageCircle
            size={21}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* Contact information */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900">
            <UserRound
              size={18}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-800 dark:text-white">
              {name}
            </p>

            {role && (
              <p className="mt-0.5 text-xs font-medium text-slate-400">
                {role}
              </p>
            )}

            {contactDescription && (
              <p className="mt-2 text-sm leading-5 text-slate-500 dark:text-slate-400">
                {contactDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Mail
              size={17}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>

            <p className="mt-0.5 break-all text-sm font-medium text-slate-700 dark:text-slate-300">
              {email}
            </p>
          </div>

          <ExternalLink
            size={15}
            className="shrink-0 text-slate-400"
          />
        </a>
      )}

      {/* Phone */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-green-300 hover:bg-green-50/50 dark:border-slate-700 dark:hover:border-green-700 dark:hover:bg-green-900/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <Phone
              size={17}
              className="text-green-600 dark:text-green-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phone
            </p>

            <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              {phone}
            </p>
          </div>

          <ExternalLink
            size={15}
            className="shrink-0 text-slate-400"
          />
        </a>
      )}

      {/* Website */}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <ExternalLink
              size={17}
              className="text-slate-500 dark:text-slate-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Website
            </p>

            <p className="mt-0.5 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
              {website}
            </p>
          </div>

          <ExternalLink
            size={15}
            className="shrink-0 text-slate-400"
          />
        </a>
      )}

      {/* Contact button */}
      {onContact && (
        <button
          type="button"
          onClick={handleContact}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <MessageCircle size={16} />
          Contact Organizer
        </button>
      )}
    </section>
  );
};

export default SupportContactCard;