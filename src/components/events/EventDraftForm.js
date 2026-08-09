import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileEdit,
  MapPin,
  Save,
  Send,
} from "lucide-react";
import {
  saveEventDraft,
  updateEventDraft,
  publishEventDraft,
} from "../../utils/eventDraftUtils";

const INITIAL_FORM = {
  name: "",
  description: "",
  category: "",
  date: "",
  time: "",
  venue: "",
  meetingLink: "",
  capacity: "",
};

const EventDraftForm = ({
  draft = null,
  onSaved,
  onPublished,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft) {
      setFormData({
        ...INITIAL_FORM,
        ...draft,
      });
    }
  }, [draft]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSaveDraft = () => {
    setSaving(true);

    const savedDraft = draft?.id
      ? updateEventDraft(draft.id, formData)
      : saveEventDraft(formData);

    const latestDraft = draft?.id
      ? savedDraft.find(
          (item) => item.id === draft.id
        )
      : savedDraft[0];

    setMessage("Draft saved successfully.");
    setSaving(false);

    onSaved?.(latestDraft);
  };

  const handlePublish = () => {
    if (!formData.name.trim()) {
      setMessage(
        "Please enter an event name before publishing."
      );
      return;
    }

    if (!formData.date) {
      setMessage(
        "Please select an event date before publishing."
      );
      return;
    }

    setSaving(true);

    let draftId = draft?.id;

    if (!draftId) {
      const savedDrafts =
        saveEventDraft(formData);

      draftId = savedDrafts[0]?.id;
    } else {
      updateEventDraft(
        draftId,
        formData
      );
    }

    const publishedEvent =
      publishEventDraft(draftId);

    setSaving(false);

    if (!publishedEvent) {
      setMessage(
        "Unable to publish the event."
      );
      return;
    }

    setMessage(
      "Event published successfully."
    );

    onPublished?.(publishedEvent);
  };

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <FileEdit
            size={24}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            {draft
              ? "Continue Editing Event"
              : "Create Event"}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Save your progress as a draft and publish
            when everything is ready.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Event Name */}
        <FormField
          label="Event Name"
          required
        >
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter event name"
            className={inputClass}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your event..."
            className={inputClass}
          />
        </FormField>

        {/* Category */}
        <FormField label="Category">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">
              Select category
            </option>
            <option value="Hackathon">
              Hackathon
            </option>
            <option value="Workshop">
              Workshop
            </option>
            <option value="Conference">
              Conference
            </option>
            <option value="Webinar">
              Webinar
            </option>
            <option value="Competition">
              Competition
            </option>
            <option value="Seminar">
              Seminar
            </option>
            <option value="Meetup">
              Meetup
            </option>
          </select>
        </FormField>

        {/* Date and Time */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Event Date">
            <div className="relative">
              <CalendarDays
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${inputClass} pl-10`}
              />
            </div>
          </FormField>

          <FormField label="Event Time">
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={inputClass}
            />
          </FormField>
        </div>

        {/* Venue */}
        <FormField label="Venue">
          <div className="relative">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Event venue"
              className={`${inputClass} pl-10`}
            />
          </div>
        </FormField>

        {/* Meeting Link */}
        <FormField label="Meeting Link">
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass}
          />
        </FormField>

        {/* Capacity */}
        <FormField label="Participant Capacity">
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            placeholder="Maximum participants"
            className={inputClass}
          />
        </FormField>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-6 rounded-xl px-4 py-3 text-sm font-medium ${
            message.includes("successfully")
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save as Draft"}
        </button>

        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          Publish Event
        </button>
      </div>
    </section>
  );
};

const FormField = ({
  label,
  required = false,
  children,
}) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default EventDraftForm;