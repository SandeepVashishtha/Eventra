import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

interface EventDraft {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  eventType: string;
  organizer: string;
  lastSaved: string;
  status: "draft";
}

interface EventDraftManagerProps {
  initialDrafts?: EventDraft[];
  onEditDraft?: (draft: EventDraft) => void;
  onPublishDraft?: (draft: EventDraft) => void;
}

const STORAGE_KEY = "eventra-event-drafts";

const EventDraftManager: React.FC<
  EventDraftManagerProps
> = ({
  initialDrafts = [],
  onEditDraft,
  onPublishDraft,
}) => {
  const [drafts, setDrafts] =
    useState<EventDraft[]>([]);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [editingDraft, setEditingDraft] =
    useState<EventDraft | null>(null);

  const [draftToDelete, setDraftToDelete] =
    useState<EventDraft | null>(null);

  const [draftToPublish, setDraftToPublish] =
    useState<EventDraft | null>(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState<"newest" | "oldest">(
      "newest"
    );

  const [notification, setNotification] =
    useState("");

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      date: "",
      location: "",
      eventType: "",
      organizer: "",
    });

  /*
   * Load drafts from localStorage.
   */
  useEffect(() => {
    try {
      const storedDrafts =
        localStorage.getItem(STORAGE_KEY);

      if (storedDrafts) {
        const parsed =
          JSON.parse(storedDrafts);

        if (Array.isArray(parsed)) {
          setDrafts(parsed);
          return;
        }
      }

      setDrafts(initialDrafts);
    } catch {
      setDrafts(initialDrafts);
    }
  }, [initialDrafts]);

  /*
   * Save drafts whenever the list changes.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(drafts)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [drafts]);

  /*
   * Display temporary notifications.
   */
  const showNotification = (
    message: string
  ) => {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  /*
   * Reset form.
   */
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      eventType: "",
      organizer: "",
    });
  };

  /*
   * Open create form.
   */
  const handleCreateDraft = () => {
    resetForm();
    setEditingDraft(null);
    setShowCreateForm(true);
  };

  /*
   * Open edit form.
   */
  const handleEdit = (
    draft: EventDraft
  ) => {
    setEditingDraft(draft);

    setFormData({
      title: draft.title,
      description: draft.description,
      date: draft.date,
      location: draft.location,
      eventType: draft.eventType,
      organizer: draft.organizer,
    });

    setShowCreateForm(true);

    onEditDraft?.(draft);
  };

  /*
   * Close form.
   */
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingDraft(null);
    resetForm();
  };

  /*
   * Handle form input.
   */
  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Save a new draft or update existing draft.
   */
  const handleSaveDraft = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const now =
      new Date().toISOString();

    if (
      !formData.title.trim() &&
      !formData.description.trim()
    ) {
      showNotification(
        "Please enter at least an event title or description."
      );
      return;
    }

    if (editingDraft) {
      const updatedDraft: EventDraft = {
        ...editingDraft,
        ...formData,
        lastSaved: now,
      };

      setDrafts((previous) =>
        previous.map((draft) =>
          draft.id === editingDraft.id
            ? updatedDraft
            : draft
        )
      );

      showNotification(
        "Draft updated successfully."
      );
    } else {
      const newDraft: EventDraft = {
        id: `draft-${Date.now()}`,
        ...formData,
        lastSaved: now,
        status: "draft",
      };

      setDrafts((previous) => [
        newDraft,
        ...previous,
      ]);

      showNotification(
        "Event saved as draft."
      );
    }

    handleCloseForm();
  };

  /*
   * Delete draft.
   */
  const handleDeleteDraft = () => {
    if (!draftToDelete) {
      return;
    }

    setDrafts((previous) =>
      previous.filter(
        (draft) =>
          draft.id !== draftToDelete.id
      )
    );

    showNotification(
      "Draft deleted successfully."
    );

    setDraftToDelete(null);
  };

  /*
   * Publish draft.
   */
  const handlePublishDraft = () => {
    if (!draftToPublish) {
      return;
    }

    if (
      !draftToPublish.title.trim() ||
      !draftToPublish.date.trim() ||
      !draftToPublish.location.trim()
    ) {
      showNotification(
        "Please complete the required event information before publishing."
      );

      setDraftToPublish(null);
      return;
    }

    onPublishDraft?.(draftToPublish);

    setDrafts((previous) =>
      previous.filter(
        (draft) =>
          draft.id !==
          draftToPublish.id
      )
    );

    showNotification(
      "Event published successfully."
    );

    setDraftToPublish(null);
  };

  /*
   * Filter and sort drafts.
   */
  const filteredDrafts = useMemo(() => {
    const query =
      searchQuery
        .trim()
        .toLowerCase();

    const filtered = drafts.filter(
      (draft) => {
        if (!query) {
          return true;
        }

        return (
          draft.title
            .toLowerCase()
            .includes(query) ||
          draft.description
            .toLowerCase()
            .includes(query) ||
          draft.location
            .toLowerCase()
            .includes(query) ||
          draft.eventType
            .toLowerCase()
            .includes(query)
        );
      }
    );

    return [...filtered].sort(
      (a, b) => {
        const first =
          new Date(
            a.lastSaved
          ).getTime();

        const second =
          new Date(
            b.lastSaved
          ).getTime();

        return sortOrder ===
          "newest"
          ? second - first
          : first - second;
      }
    );
  }, [
    drafts,
    searchQuery,
    sortOrder,
  ]);

  /*
   * Format date.
   */
  const formatDate = (
    value: string
  ) => {
    if (!value) {
      return "Not specified";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
   * Format last saved time.
   */
  const formatLastSaved = (
    value: string
  ) => {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown";
    }

    return date.toLocaleString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /*
   * Calculate completion percentage.
   */
  const getCompletion = (
    draft: EventDraft
  ) => {
    const fields = [
      draft.title,
      draft.description,
      draft.date,
      draft.location,
      draft.eventType,
      draft.organizer,
    ];

    const completed =
      fields.filter(
        (field) =>
          field.trim().length > 0
      ).length;

    return Math.round(
      (completed / fields.length) *
        100
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              📝
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Organizer Dashboard
              </p>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Event Drafts
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Save incomplete events and continue
            working on them whenever you are ready.
            Draft events remain private until they
            are published.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateDraft}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Create Draft
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <div className="flex items-center gap-3">
            <span className="text-lg">
              ✓
            </span>

            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              {notification}
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Total Drafts
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {drafts.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Almost Complete
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {
              drafts.filter(
                (draft) =>
                  getCompletion(
                    draft
                  ) >= 80
              ).length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Search Results
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {filteredDrafts.length}
          </p>
        </div>
      </div>

      {/* Search / filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 md:flex-row">
        <div className="flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search drafts by title, location, or type..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(
              event.target.value as
                | "newest"
                | "oldest"
            )
          }
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="newest">
            Recently Saved
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>
      </div>

      {/* Empty state */}
      {filteredDrafts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm dark:bg-gray-700">
            📝
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-800 dark:text-white">
            {drafts.length === 0
              ? "No event drafts yet"
              : "No drafts found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
            {drafts.length === 0
              ? "Start creating an event and save it as a draft so you can finish it later."
              : "Try changing your search query."}
          </p>

          {drafts.length === 0 && (
            <button
              type="button"
              onClick={
                handleCreateDraft
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create Your First Draft
            </button>
          )}
        </div>
      )}

      {/* Draft cards */}
      {filteredDrafts.length > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredDrafts.map(
            (draft) => {
              const completion =
                getCompletion(
                  draft
                );

              return (
                <article
                  key={draft.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  {/* Card header */}
                  <div className="border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-xl dark:bg-yellow-950">
                          📄
                        </div>

                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                            {draft.title ||
                              "Untitled Event"}
                          </h2>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Last saved{" "}
                            {formatLastSaved(
                              draft.lastSaved
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                        Draft
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4 p-5">
                    <p className="line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                      {draft.description ||
                        "No description added yet."}
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Date
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(
                            draft.date
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Location
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-700 dark:text-gray-300">
                          {draft.location ||
                            "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Event Type
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {draft.eventType ||
                            "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Organizer
                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {draft.organizer ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Completion */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Completion
                        </span>

                        <span className="text-xs font-bold text-blue-600">
                          {completion}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${completion}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          draft
                        )
                      }
                      className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDraftToPublish(
                          draft
                        )
                      }
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Publish
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setDraftToDelete(
                          draft
                        )
                      }
                      className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingDraft
                    ? "Edit Event Draft"
                    : "Create Event Draft"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You can save incomplete information
                  and continue later.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseForm
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={
                handleSaveDraft
              }
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Event Title
                </label>

                <input
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter event title"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  rows={4}
                  placeholder="Describe your event..."
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Event Date
                  </label>

                  <input
                    type="datetime-local"
                    name="date"
                    value={
                      formData.date
                    }
                    onChange={
                      handleInputChange
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Event Type
                  </label>

                  <select
                    name="eventType"
                    value={
                      formData.eventType
                    }
                    onChange={
                      handleInputChange
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">
                      Select type
                    </option>

                    <option value="Workshop">
                      Workshop
                    </option>

                    <option value="Conference">
                      Conference
                    </option>

                    <option value="Hackathon">
                      Hackathon
                    </option>

                    <option value="Seminar">
                      Seminar
                    </option>

                    <option value="Competition">
                      Competition
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Location
                </label>

                <input
                  name="location"
                  value={
                    formData.location
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter event location"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Organizer
                </label>

                <input
                  name="organizer"
                  value={
                    formData.organizer
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter organizer name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-700">
                <button
                  type="button"
                  onClick={
                    handleCloseForm
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {editingDraft
                    ? "Save Changes"
                    : "Save as Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {draftToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl dark:bg-red-950">
              🗑️
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Delete Draft?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <strong>
                {draftToDelete.title ||
                  "this draft"}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraftToDelete(
                    null
                  )
                }
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Keep Draft
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteDraft
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation */}
      {draftToPublish && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl dark:bg-blue-950">
              🚀
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Publish Event?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Publishing{" "}
              <strong>
                {draftToPublish.title ||
                  "this event"}
              </strong>{" "}
              will make it available according to
              your application's event publishing
              workflow.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDraftToPublish(
                    null
                  )
                }
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handlePublishDraft
                }
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Publish Event
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventDraftManager;