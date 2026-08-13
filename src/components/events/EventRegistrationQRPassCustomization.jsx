import {
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Image as ImageIcon,
  MapPin,
  QrCode,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_FIELDS = {
  eventLogo: true,
  participantName: true,
  registrationId: true,
  teamName: true,
  participantCategory: true,
  checkInStatus: true,
  eventDate: true,
  venue: true,
};

const DEFAULT_EVENT = {
  name: "Tech Innovation Summit 2026",
  date: "2026-08-30",
  venue: "Marwadi University, Rajkot",
  logo: "",
};

const DEFAULT_PARTICIPANT = {
  name: "Jainiksha Patel",
  registrationId: "EVT-2026-00124",
  teamName: "Team Innovators",
  category: "Participant",
  checkInStatus: "Not Checked In",
};

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const EventRegistrationQRPassCustomization = ({
  event = DEFAULT_EVENT,
  participant = DEFAULT_PARTICIPANT,
  initialFields = DEFAULT_FIELDS,
  isOrganizer = false,
  onSave,
  onDownload,
}) => {
  const [fields, setFields] =
    useState(initialFields);

  const [eventLogo, setEventLogo] =
    useState(event.logo || "");

  const [saved, setSaved] =
    useState(false);

  const [showPreview, setShowPreview] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const enabledCount = useMemo(
    () =>
      Object.values(fields).filter(
        Boolean
      ).length,
    [fields]
  );

  const toggleField = (field) => {
    setFields((current) => ({
      ...current,
      [field]: !current[field],
    }));

    setSaved(false);
  };

  const resetFields = () => {
    setFields(DEFAULT_FIELDS);
    setEventLogo(event.logo || "");
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const configuration = {
      fields,
      eventLogo,
    };

    try {
      await onSave?.(configuration);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    await onDownload?.({
      fields,
      eventLogo,
      event,
      participant,
    });
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <QrCode size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Digital Event Pass
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              QR Pass Customization
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Configure which information appears on participant
              QR entry passes.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setShowPreview(
                (value) => !value
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[8px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
          >
            <Eye size={13} />
            {showPreview
              ? "Hide Preview"
              : "Preview"}
          </button>

          {isOrganizer && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={13} />
              {saving
                ? "Saving..."
                : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* Saved Message */}
      {saved && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-[7px] font-semibold text-green-700 dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-400">
          <CheckCircle2 size={14} />
          QR pass customization saved successfully.
        </div>
      )}

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Configuration */}
        <div className="space-y-5">
          {/* Logo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                <ImageIcon size={16} />
              </div>

              <div>
                <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                  Event Logo
                </h3>

                <p className="mt-1 text-[7px] text-slate-400">
                  Add a logo URL to display it on the QR pass.
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                type="url"
                value={eventLogo}
                onChange={(event) => {
                  setEventLogo(
                    event.target.value
                  );
                  setSaved(false);
                }}
                placeholder="https://example.com/event-logo.png"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[8px] outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />

              <button
                type="button"
                onClick={() =>
                  setEventLogo("")
                }
                className="rounded-xl bg-slate-100 px-3 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                title="Remove logo"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  toggleField(
                    "eventLogo"
                  )
                }
                className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                  fields.eventLogo
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                }`}
              >
                {fields.eventLogo && (
                  <Check size={11} />
                )}
              </button>

              <span className="text-[7px] font-semibold text-slate-600 dark:text-slate-300">
                Show event logo on pass
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                  <Settings2 size={16} />
                </div>

                <div>
                  <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
                    Pass Information
                  </h3>

                  <p className="mt-1 text-[7px] text-slate-400">
                    Select the information participants should see.
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                {enabledCount}/8 enabled
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <FieldToggle
                icon={User}
                title="Participant Name"
                description="Display the participant's full name."
                enabled={
                  fields.participantName
                }
                onToggle={() =>
                  toggleField(
                    "participantName"
                  )
                }
              />

              <FieldToggle
                icon={QrCode}
                title="Registration ID"
                description="Display the unique event registration identifier."
                enabled={
                  fields.registrationId
                }
                onToggle={() =>
                  toggleField(
                    "registrationId"
                  )
                }
              />

              <FieldToggle
                icon={Users}
                title="Team Name"
                description="Display the participant's team."
                enabled={
                  fields.teamName
                }
                onToggle={() =>
                  toggleField(
                    "teamName"
                  )
                }
              />

              <FieldToggle
                icon={ShieldCheck}
                title="Participant Category"
                description="Display participant category or role."
                enabled={
                  fields.participantCategory
                }
                onToggle={() =>
                  toggleField(
                    "participantCategory"
                  )
                }
              />

              <FieldToggle
                icon={CheckCircle2}
                title="Check-in Status"
                description="Show whether the participant has checked in."
                enabled={
                  fields.checkInStatus
                }
                onToggle={() =>
                  toggleField(
                    "checkInStatus"
                  )
                }
              />

              <FieldToggle
                icon={CalendarDays}
                title="Event Date"
                description="Display the event date."
                enabled={
                  fields.eventDate
                }
                onToggle={() =>
                  toggleField(
                    "eventDate"
                  )
                }
              />

              <FieldToggle
                icon={MapPin}
                title="Venue"
                description="Display the event venue."
                enabled={
                  fields.venue
                }
                onToggle={() =>
                  toggleField("venue")
                }
              />
            </div>

            <button
              type="button"
              onClick={resetFields}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-[7px] font-bold text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw size={11} />
              Reset Defaults
            </button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-blue-500"
            />

            <div>
              <p className="text-[8px] font-bold text-blue-700 dark:text-blue-400">
                QR code security
              </p>

              <p className="mt-1 text-[7px] leading-4 text-blue-700/70 dark:text-blue-400/70">
                The QR code should contain a unique registration
                identifier rather than sensitive participant information.
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-5 lg:self-start">
            <QRPassPreview
              event={event}
              participant={participant}
              fields={fields}
              eventLogo={eventLogo}
              onDownload={
                handleDownload
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

/* --------------------------------
   Field Toggle
--------------------------------- */

const FieldToggle = ({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
        enabled
          ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/30 dark:bg-indigo-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          enabled
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            : "bg-white text-slate-400 dark:bg-slate-900"
        }`}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-bold text-slate-700 dark:text-slate-300">
          {title}
        </p>

        <p className="mt-1 text-[6px] leading-3 text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          enabled
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
        }`}
      >
        {enabled && <Check size={11} />}
      </div>
    </button>
  );
};

/* --------------------------------
   QR Pass Preview
--------------------------------- */

const QRPassPreview = ({
  event,
  participant,
  fields,
  eventLogo,
  onDownload,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-200 p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Live Preview
          </p>

          <h3 className="mt-1 text-[10px] font-bold text-slate-800 dark:text-white">
            Participant QR Pass
          </h3>
        </div>

        <Eye
          size={15}
          className="text-slate-400"
        />
      </div>

      {/* Pass */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-slate-950">
        {/* Top */}
        <div className="relative bg-indigo-600 px-5 pb-7 pt-6 text-white">
          {fields.eventLogo && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white">
              {eventLogo ? (
                <img
                  src={eventLogo}
                  alt="Event logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon
                  size={20}
                  className="text-indigo-400"
                />
              )}
            </div>
          )}

          <p className="text-[6px] font-bold uppercase tracking-[0.2em] text-indigo-200">
            Event Pass
          </p>

          <h4 className="mt-1 text-lg font-black leading-tight">
            {event.name}
          </h4>

          <div className="mt-3 flex items-center gap-2 text-[7px] text-indigo-100">
            <CalendarDays size={11} />
            {formatDate(event.date)}
          </div>
        </div>

        {/* QR */}
        <div className="-mt-4 flex justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-white p-3 shadow-lg dark:border-slate-950">
            <FakeQRCode />
          </div>
        </div>

        {/* Details */}
        <div className="p-5">
          <div className="space-y-3">
            {fields.participantName && (
              <PassRow
                label="Participant"
                value={
                  participant.name
                }
                icon={User}
              />
            )}

            {fields.registrationId && (
              <PassRow
                label="Registration ID"
                value={
                  participant.registrationId
                }
                icon={QrCode}
              />
            )}

            {fields.teamName && (
              <PassRow
                label="Team"
                value={
                  participant.teamName
                }
                icon={Users}
              />
            )}

            {fields.participantCategory && (
              <PassRow
                label="Category"
                value={
                  participant.category
                }
                icon={ShieldCheck}
              />
            )}

            {fields.checkInStatus && (
              <div className="flex items-center justify-between rounded-xl bg-green-50 p-3 dark:bg-green-900/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={13}
                    className="text-green-500"
                  />

                  <span className="text-[7px] font-semibold text-slate-500 dark:text-slate-400">
                    Check-in Status
                  </span>
                </div>

                <span className="text-[7px] font-bold text-green-600 dark:text-green-400">
                  {participant.checkInStatus}
                </span>
              </div>
            )}

            {fields.eventDate && (
              <PassRow
                label="Event Date"
                value={formatDate(
                  event.date
                )}
                icon={CalendarDays}
              />
            )}

            {fields.venue && (
              <PassRow
                label="Venue"
                value={event.venue}
                icon={MapPin}
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 border-t border-dashed border-slate-200 pt-4 text-center dark:border-slate-800">
            <p className="text-[6px] text-slate-400">
              Scan this QR code at event check-in
            </p>

            <p className="mt-1 text-[5px] text-slate-300">
              {participant.registrationId}
            </p>
          </div>

          <button
            type="button"
            onClick={onDownload}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-[7px] font-bold text-white hover:bg-indigo-700"
          >
            <Download size={12} />
            Download QR Pass
          </button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------
   Pass Row
--------------------------------- */

const PassRow = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon size={12} />
      </div>

      <div className="min-w-0">
        <p className="text-[5px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="truncate text-[7px] font-bold text-slate-700 dark:text-slate-300">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Fake QR Code
--------------------------------- */

const FakeQRCode = () => {
  const pattern = [
    "111111100101101111111",
    "100000101110101000001",
    "101110101011101011101",
    "101110100100101011101",
    "101110101101101011101",
    "100000101010101000001",
    "111111101010101111111",
    "000000001101100000000",
    "101011111001011010101",
    "011100010110101100110",
    "110101101001110011011",
    "001011010111001101100",
    "111001101010110010101",
    "000000001101011001110",
    "111111101011101010101",
    "100000100110010111000",
    "101110101011101101011",
    "101110100101001010101",
    "101110101110101101010",
    "100000101001011011101",
    "111111101110101010111",
  ];

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns:
          "repeat(21, 1fr)",
      }}
      aria-label="QR code preview"
    >
      {pattern
        .join("")
        .split("")
        .map((value, index) => (
          <span
            key={index}
            className={
              value === "1"
                ? "bg-slate-900"
                : "bg-white"
            }
          />
        ))}
    </div>
  );
};

export default EventRegistrationQRPassCustomization;