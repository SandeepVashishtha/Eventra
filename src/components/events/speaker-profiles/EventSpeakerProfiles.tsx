import React, { useState } from "react";

export interface SpeakerProfile {
  id: string;
  name: string;
  profileImage?: string;
  biography?: string;
  organization?: string;
  expertise?: string[];
  profileLinks?: {
    label: string;
    url: string;
  }[];
}

interface EventSpeakerProfilesProps {
  speakers?: SpeakerProfile[];
  editable?: boolean;
  onAddSpeaker?: (
    speaker: SpeakerProfile,
  ) => void;
  onUpdateSpeaker?: (
    speaker: SpeakerProfile,
  ) => void;
  onRemoveSpeaker?: (
    speakerId: string,
  ) => void;
}

const emptySpeaker: SpeakerProfile = {
  id: "",
  name: "",
  profileImage: "",
  biography: "",
  organization: "",
  expertise: [],
  profileLinks: [],
};

const EventSpeakerProfiles: React.FC<
  EventSpeakerProfilesProps
> = ({
  speakers = [],
  editable = false,
  onAddSpeaker,
  onUpdateSpeaker,
  onRemoveSpeaker,
}) => {
  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [formData, setFormData] =
    useState<SpeakerProfile>(
      emptySpeaker,
    );

  const [expertiseInput, setExpertiseInput] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const resetForm = () => {
    setFormData(emptySpeaker);
    setExpertiseInput("");
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleInputChange = (
    field: keyof SpeakerProfile,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
  };

  const addExpertise = () => {
    const value =
      expertiseInput.trim();

    if (!value) {
      return;
    }

    if (
      formData.expertise?.includes(
        value,
      )
    ) {
      setExpertiseInput("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      expertise: [
        ...(previous.expertise ?? []),
        value,
      ],
    }));

    setExpertiseInput("");
  };

  const removeExpertise = (
    expertise: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      expertise:
        previous.expertise?.filter(
          (item) =>
            item !== expertise,
        ),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Speaker name is required.";
    }

    if (
      formData.profileImage &&
      !/^https?:\/\/.+/i.test(
        formData.profileImage,
      )
    ) {
      return "Profile image must be a valid URL.";
    }

    return null;
  };

  const handleSubmit = () => {
    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const speaker: SpeakerProfile = {
      ...formData,
      id:
        editingId ??
        `speaker-${Date.now()}`,
      name: formData.name.trim(),
      biography:
        formData.biography?.trim(),
      organization:
        formData.organization?.trim(),
      expertise:
        formData.expertise ?? [],
      profileLinks:
        formData.profileLinks ?? [],
    };

    if (editingId) {
      onUpdateSpeaker?.(speaker);
    } else {
      onAddSpeaker?.(speaker);
    }

    resetForm();
  };

  const startEditing = (
    speaker: SpeakerProfile,
  ) => {
    setFormData({
      ...speaker,
      expertise: [
        ...(speaker.expertise ?? []),
      ],
    });

    setEditingId(speaker.id);
    setShowForm(true);
    setError(null);
  };

  return (
    <section
      className="
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-6
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Event Speakers
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Learn more about the speakers
            associated with this event.
          </p>
        </div>

        {editable && (
          <button
            type="button"
            onClick={() => {
              setFormData(emptySpeaker);
              setEditingId(null);
              setShowForm(true);
              setError(null);
            }}
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Add Speaker
          </button>
        )}
      </div>

      {showForm && editable && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            p-5
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <h3
            className="
              text-lg
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            {editingId
              ? "Edit Speaker"
              : "Add Speaker"}
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="speaker-name"
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Name
              </label>

              <input
                id="speaker-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  handleInputChange(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Speaker name"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-blue-500
                  dark:border-gray-600
                  dark:bg-gray-900
                  dark:text-white
                "
              />
            </div>

            <div>
              <label
                htmlFor="speaker-image"
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Profile Image URL
              </label>

              <input
                id="speaker-image"
                type="url"
                value={
                  formData.profileImage ??
                  ""
                }
                onChange={(event) =>
                  handleInputChange(
                    "profileImage",
                    event.target.value,
                  )
                }
                placeholder="https://example.com/photo.jpg"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-blue-500
                  dark:border-gray-600
                  dark:bg-gray-900
                  dark:text-white
                "
              />
            </div>

            <div>
              <label
                htmlFor="speaker-organization"
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Organization
              </label>

              <input
                id="speaker-organization"
                type="text"
                value={
                  formData.organization ??
                  ""
                }
                onChange={(event) =>
                  handleInputChange(
                    "organization",
                    event.target.value,
                  )
                }
                placeholder="Company or organization"
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-blue-500
                  dark:border-gray-600
                  dark:bg-gray-900
                  dark:text-white
                "
              />
            </div>

            <div>
              <label
                htmlFor="speaker-biography"
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Short Biography
              </label>

              <textarea
                id="speaker-biography"
                value={
                  formData.biography ??
                  ""
                }
                onChange={(event) =>
                  handleInputChange(
                    "biography",
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Write a short speaker biography..."
                className="
                  w-full
                  resize-y
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  py-2
                  text-sm
                  outline-none
                  focus:border-blue-500
                  dark:border-gray-600
                  dark:bg-gray-900
                  dark:text-white
                "
              />
            </div>

            <div>
              <label
                htmlFor="speaker-expertise"
                className="
                  mb-1
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  dark:text-gray-200
                "
              >
                Areas of Expertise
              </label>

              <div
                className="
                  flex
                  gap-2
                "
              >
                <input
                  id="speaker-expertise"
                  type="text"
                  value={expertiseInput}
                  onChange={(event) =>
                    setExpertiseInput(
                      event.target.value,
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      addExpertise();
                    }
                  }}
                  placeholder="e.g. Machine Learning"
                  className="
                    flex-1
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2
                    text-sm
                    outline-none
                    focus:border-blue-500
                    dark:border-gray-600
                    dark:bg-gray-900
                    dark:text-white
                  "
                />

                <button
                  type="button"
                  onClick={
                    addExpertise
                  }
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-gray-700
                    hover:bg-gray-100
                    dark:border-gray-600
                    dark:text-gray-200
                    dark:hover:bg-gray-700
                  "
                >
                  Add
                </button>
              </div>

              {formData.expertise &&
                formData.expertise
                  .length > 0 && (
                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {formData.expertise.map(
                      (item) => (
                        <span
                          key={item}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-xs
                            font-medium
                            text-blue-700
                            dark:bg-blue-900/30
                            dark:text-blue-300
                          "
                        >
                          {item}

                          <button
                            type="button"
                            onClick={() =>
                              removeExpertise(
                                item,
                              )
                            }
                            aria-label={`Remove ${item}`}
                          >
                            ×
                          </button>
                        </span>
                      ),
                    )}
                  </div>
                )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="
                mt-4
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-700
                dark:border-red-900
                dark:bg-red-900/20
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          <div
            className="
              mt-5
              flex
              justify-end
              gap-3
            "
          >
            <button
              type="button"
              onClick={resetForm}
              className="
                rounded-lg
                border
                border-gray-300
                px-4
                py-2
                text-sm
                font-semibold
                text-gray-700
                hover:bg-gray-100
                dark:border-gray-600
                dark:text-gray-200
                dark:hover:bg-gray-700
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                handleSubmit
              }
              className="
                rounded-lg
                bg-blue-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                hover:bg-blue-700
              "
            >
              {editingId
                ? "Update Speaker"
                : "Add Speaker"}
            </button>
          </div>
        </div>
      )}

      {speakers.length === 0 ? (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-dashed
            border-gray-300
            p-8
            text-center
            dark:border-gray-700
          "
        >
          <h3
            className="
              font-semibold
              text-gray-900
              dark:text-white
            "
          >
            No speakers added yet
          </h3>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Speaker information will
            appear here when speakers
            are associated with sessions.
          </p>
        </div>
      ) : (
        <div
          className="
            mt-6
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {speakers.map((speaker) => (
            <article
              key={speaker.id}
              className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
                dark:border-gray-700
                dark:bg-gray-800
              "
            >
              <div
                className="
                  flex
                  flex-col
                  items-center
                  p-5
                  text-center
                "
              >
                {speaker.profileImage ? (
                  <img
                    src={
                      speaker.profileImage
                    }
                    alt={`${speaker.name} profile`}
                    className="
                      h-24
                      w-24
                      rounded-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-200
                      text-2xl
                      font-bold
                      text-gray-500
                      dark:bg-gray-700
                      dark:text-gray-300
                    "
                  >
                    {speaker.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <h3
                  className="
                    mt-4
                    text-lg
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {speaker.name}
                </h3>

                {speaker.organization && (
                  <p
                    className="
                      mt-1
                      text-sm
                      font-medium
                      text-blue-600
                      dark:text-blue-400
                    "
                  >
                    {speaker.organization}
                  </p>
                )}

                {speaker.biography && (
                  <p
                    className="
                      mt-3
                      text-sm
                      leading-6
                      text-gray-600
                      dark:text-gray-400
                    "
                  >
                    {speaker.biography}
                  </p>
                )}

                {speaker.expertise &&
                  speaker.expertise
                    .length > 0 && (
                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        justify-center
                        gap-2
                      "
                    >
                      {speaker.expertise.map(
                        (item) => (
                          <span
                            key={item}
                            className="
                              rounded-full
                              bg-gray-100
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              text-gray-700
                              dark:bg-gray-700
                              dark:text-gray-300
                            "
                          >
                            {item}
                          </span>
                        ),
                      )}
                    </div>
                  )}

                {speaker.profileLinks &&
                  speaker.profileLinks
                    .length > 0 && (
                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        justify-center
                        gap-3
                      "
                    >
                      {speaker.profileLinks.map(
                        (link) => (
                          <a
                            key={`${speaker.id}-${link.url}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              text-sm
                              font-semibold
                              text-blue-600
                              hover:underline
                              dark:text-blue-400
                            "
                          >
                            {link.label}
                          </a>
                        ),
                      )}
                    </div>
                  )}

                {editable && (
                  <div
                    className="
                      mt-5
                      flex
                      gap-2
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(
                          speaker,
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-gray-300
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-gray-700
                        hover:bg-gray-100
                        dark:border-gray-600
                        dark:text-gray-200
                        dark:hover:bg-gray-700
                      "
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveSpeaker?.(
                          speaker.id,
                        )
                      }
                      className="
                        rounded-lg
                        border
                        border-red-200
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-red-600
                        hover:bg-red-50
                        dark:border-red-900
                        dark:text-red-400
                        dark:hover:bg-red-900/20
                      "
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default EventSpeakerProfiles;