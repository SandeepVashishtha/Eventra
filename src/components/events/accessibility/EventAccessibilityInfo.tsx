import React, { useState } from "react";

interface AccessibilityInfo {
  wheelchairAccessible?: boolean;
  accessibleEntrance?: boolean;
  accessibleParking?: boolean;
  elevatorAvailable?: boolean;
  signLanguageSupport?: boolean;
  accessibleRestrooms?: boolean;
  otherNotes?: string;
}

interface EventAccessibilityInfoProps {
  accessibility?: AccessibilityInfo;
  isOrganizer?: boolean;
  onSave?: (accessibility: AccessibilityInfo) => void;
}

const EventAccessibilityInfo: React.FC<
  EventAccessibilityInfoProps
> = ({
  accessibility = {},
  isOrganizer = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] =
    useState(false);

  const [formData, setFormData] =
    useState<AccessibilityInfo>({
      wheelchairAccessible:
        accessibility.wheelchairAccessible ?? false,
      accessibleEntrance:
        accessibility.accessibleEntrance ?? false,
      accessibleParking:
        accessibility.accessibleParking ?? false,
      elevatorAvailable:
        accessibility.elevatorAvailable ?? false,
      signLanguageSupport:
        accessibility.signLanguageSupport ?? false,
      accessibleRestrooms:
        accessibility.accessibleRestrooms ?? false,
      otherNotes:
        accessibility.otherNotes ?? "",
    });

  const [saved, setSaved] = useState(false);

  /*
   * Accessibility options displayed to users.
   */
  const accessibilityOptions = [
    {
      key: "wheelchairAccessible",
      title: "Wheelchair Accessible",
      description:
        "The event venue supports wheelchair access.",
      icon: "♿",
    },
    {
      key: "accessibleEntrance",
      title: "Accessible Entrance",
      description:
        "An accessible entrance is available at the venue.",
      icon: "🚪",
    },
    {
      key: "accessibleParking",
      title: "Accessible Parking",
      description:
        "Accessible parking spaces are available.",
      icon: "🅿️",
    },
    {
      key: "elevatorAvailable",
      title: "Elevator Available",
      description:
        "An elevator is available for accessible floor access.",
      icon: "🛗",
    },
    {
      key: "signLanguageSupport",
      title: "Sign-Language Support",
      description:
        "Sign-language interpretation or support is available.",
      icon: "🤟",
    },
    {
      key: "accessibleRestrooms",
      title: "Accessible Restrooms",
      description:
        "Accessible restroom facilities are available.",
      icon: "🚻",
    },
  ] as const;

  /*
   * Check whether any accessibility information exists.
   */
  const hasAccessibilityInformation =
    accessibilityOptions.some(
      (option) =>
        accessibility[
          option.key as keyof AccessibilityInfo
        ] === true
    ) ||
    Boolean(
      accessibility.otherNotes?.trim()
    );

  /*
   * Update a checkbox.
   */
  const handleCheckboxChange = (
    key: keyof AccessibilityInfo
  ) => {
    setFormData((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  /*
   * Update notes.
   */
  const handleNotesChange = (
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      otherNotes: value,
    }));
  };

  /*
   * Save accessibility information.
   */
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }

    setIsEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /*
   * Cancel editing.
   */
  const handleCancel = () => {
    setFormData({
      wheelchairAccessible:
        accessibility.wheelchairAccessible ?? false,
      accessibleEntrance:
        accessibility.accessibleEntrance ?? false,
      accessibleParking:
        accessibility.accessibleParking ?? false,
      elevatorAvailable:
        accessibility.elevatorAvailable ?? false,
      signLanguageSupport:
        accessibility.signLanguageSupport ?? false,
      accessibleRestrooms:
        accessibility.accessibleRestrooms ?? false,
      otherNotes:
        accessibility.otherNotes ?? "",
    });

    setIsEditing(false);
  };

  /*
   * Organizer editing view.
   */
  if (isOrganizer && isEditing) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            ♿
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Accessibility Information
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Select the accessibility facilities available
              at your event venue. This information helps
              participants plan their visit.
            </p>
          </div>
        </div>

        {/* Accessibility options */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {accessibilityOptions.map((option) => {
            const checked =
              Boolean(
                formData[
                  option.key as keyof AccessibilityInfo
                ]
              );

            return (
              <label
                key={option.key}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${
                  checked
                    ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    handleCheckboxChange(
                      option.key as keyof AccessibilityInfo
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {option.icon}
                    </span>

                    <span className="font-semibold text-gray-900 dark:text-white">
                      {option.title}
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Additional notes */}
        <div className="mt-6">
          <label
            htmlFor="accessibility-notes"
            className="block text-sm font-semibold text-gray-800 dark:text-gray-200"
          >
            Other Accessibility Notes
          </label>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Add any additional information participants may
            need to know.
          </p>

          <textarea
            id="accessibility-notes"
            value={formData.otherNotes}
            onChange={(event) =>
              handleNotesChange(event.target.value)
            }
            placeholder="Example: Quiet room available, accessible seating can be requested in advance..."
            rows={4}
            className="mt-3 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Save Accessibility Information
          </button>
        </div>
      </section>
    );
  }

  /*
   * Organizer management view.
   */
  if (isOrganizer) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              ♿
            </div>

            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Event Accessibility
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Accessibility Information
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Help participants understand the accessibility
                facilities available at your event.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Information
          </button>
        </div>

        {saved && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✓ Accessibility information saved successfully.
            </p>
          </div>
        )}

        <div className="mt-6">
          {hasAccessibilityInformation ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accessibilityOptions.map(
                (option) => {
                  const available =
                    accessibility[
                      option.key as keyof AccessibilityInfo
                    ] === true;

                  if (!available) {
                    return null;
                  }

                  return (
                    <div
                      key={option.key}
                      className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
                    >
                      <span className="text-xl">
                        {option.icon}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                          {option.title}
                        </p>

                        <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                          Available
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                No accessibility information added yet.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add accessibility information so participants
                can plan their visit.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
   * Participant / public view.
   */
  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
          ♿
        </div>

        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Event Details
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Accessibility Information
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Accessibility information provided by the event
            organizer.
          </p>
        </div>
      </div>

      {!hasAccessibilityInformation ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl dark:bg-gray-700">
            ℹ️
          </div>

          <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
            Accessibility information not available
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            The organizer has not provided accessibility
            information for this event yet.
          </p>

          <p className="mt-3 text-xs text-gray-400">
            Please contact the organizer if you have specific
            accessibility requirements.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Available facilities */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {accessibilityOptions.map(
              (option) => {
                const available =
                  accessibility[
                    option.key as keyof AccessibilityInfo
                  ] === true;

                if (!available) {
                  return null;
                }

                return (
                  <div
                    key={option.key}
                    className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg dark:bg-green-900">
                      {option.icon}
                    </div>

                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">
                        {option.title}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-green-700 dark:text-green-400">
                        {option.description}
                      </p>

                      <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                        <span>✓</span>
                        Available
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Other notes */}
          {accessibility.otherNotes?.trim() && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <span className="text-xl">
                  📝
                </span>

                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                    Additional Accessibility Notes
                  </h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-700 dark:text-blue-400">
                    {accessibility.otherNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact notice */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-3">
              <span className="text-xl">
                💬
              </span>

              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Need additional support?
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  If you have accessibility requirements that
                  are not listed here, consider contacting the
                  event organizer before registering.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EventAccessibilityInfo;