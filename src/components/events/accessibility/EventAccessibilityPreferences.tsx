import React, {
  useMemo,
  useState,
} from "react";

export interface AccessibilityPreference {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface EventAccessibilityInformation {
  wheelchairAccessibility?: boolean;
  accessibleParking?: boolean;
  signLanguageSupport?: boolean;
  accessibleRestrooms?: boolean;
  otherAccessibility?: string;
}

interface EventAccessibilityPreferencesProps {
  initialPreferences?: string[];
  onSave?: (
    preferences: string[]
  ) => void;
  className?: string;
}

const ACCESSIBILITY_OPTIONS: AccessibilityPreference[] =
  [
    {
      id: "wheelchair",
      label: "Wheelchair Accessibility",
      description:
        "Accessible entrances, paths, and event areas for wheelchair users.",
      icon: "♿",
    },
    {
      id: "parking",
      label: "Accessible Parking",
      description:
        "Accessible parking spaces are available near the event venue.",
      icon: "🅿️",
    },
    {
      id: "sign-language",
      label: "Sign-Language Support",
      description:
        "Sign-language interpretation or support is available.",
      icon: "🤟",
    },
    {
      id: "restrooms",
      label: "Accessible Restrooms",
      description:
        "Accessible restroom facilities are available at the venue.",
      icon: "🚻",
    },
    {
      id: "other",
      label: "Other Accessibility Requirements",
      description:
        "Specify additional accessibility requirements that may be important to you.",
      icon: "➕",
    },
  ];

const EventAccessibilityPreferences: React.FC<
  EventAccessibilityPreferencesProps
> = ({
  initialPreferences = [],
  onSave,
  className = "",
}) => {
  const [
    selectedPreferences,
    setSelectedPreferences,
  ] = useState<string[]>(
    initialPreferences
  );

  const [
    otherRequirement,
    setOtherRequirement,
  ] = useState("");

  const [
    saved,
    setSaved,
  ] = useState(false);

  const selectedCount =
    selectedPreferences.length;

  const isSelected = (
    preferenceId: string
  ) => {
    return selectedPreferences.includes(
      preferenceId
    );
  };

  const togglePreference = (
    preferenceId: string
  ) => {
    setSaved(false);

    setSelectedPreferences(
      (current) => {
        if (
          current.includes(
            preferenceId
          )
        ) {
          return current.filter(
            (id) =>
              id !==
              preferenceId
          );
        }

        return [
          ...current,
          preferenceId,
        ];
      }
    );
  };

  const clearPreferences = () => {
    setSelectedPreferences([]);
    setOtherRequirement("");
    setSaved(false);
  };

  const handleSave = () => {
    onSave?.(
      selectedPreferences
    );

    setSaved(true);
  };

  const selectedLabels =
    useMemo(() => {
      return ACCESSIBILITY_OPTIONS
        .filter((option) =>
          selectedPreferences.includes(
            option.id
          )
        )
        .map(
          (option) =>
            option.label
        );
    }, [
      selectedPreferences,
    ]);

  return (
    <section
      className={`
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-gray-200
        bg-white
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          border-b
          border-gray-200
          bg-gradient-to-br
          from-blue-50
          via-white
          to-green-50
          p-5
          dark:border-gray-700
          dark:from-blue-950/40
          dark:via-gray-900
          dark:to-green-950/30
          sm:p-6
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-2xl
              dark:bg-blue-950
            "
            aria-hidden="true"
          >
            ♿
          </div>

          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-blue-600
                dark:text-blue-400
              "
            >
              Personalization
            </p>

            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Accessibility Preferences
            </h2>

            <p
              className="
                mt-1
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
                dark:text-gray-400
              "
            >
              Select the accessibility
              features that are important
              to you when choosing events.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-5 sm:p-6">
        {/* Saved message */}
        {saved && (
          <div
            role="status"
            className="
              mb-5
              rounded-xl
              border
              border-green-200
              bg-green-50
              p-4
              text-sm
              font-medium
              text-green-700
              dark:border-green-900
              dark:bg-green-950/40
              dark:text-green-300
            "
          >
            ✓ Your accessibility
            preferences have been saved.
          </div>
        )}

        {/* Selection summary */}
        <div
          className="
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            p-4
            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className="
                  text-sm
                  font-bold
                  text-gray-900
                  dark:text-white
                "
              >
                Selected Preferences
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                  dark:text-gray-400
                "
              >
                {selectedCount === 0
                  ? "No accessibility preferences selected."
                  : `${selectedCount} ${
                      selectedCount === 1
                        ? "preference"
                        : "preferences"
                    } selected.`}
              </p>
            </div>

            {selectedCount > 0 && (
              <button
                type="button"
                onClick={
                  clearPreferences
                }
                className="
                  text-left
                  text-xs
                  font-semibold
                  text-red-600
                  hover:underline
                  dark:text-red-400
                  sm:text-right
                "
              >
                Clear all
              </button>
            )}
          </div>

          {selectedLabels.length > 0 && (
            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {selectedLabels.map(
                (label) => (
                  <span
                    key={label}
                    className="
                      rounded-full
                      bg-blue-100
                      px-3
                      py-1.5
                      text-xs
                      font-semibold
                      text-blue-700
                      dark:bg-blue-950
                      dark:text-blue-300
                    "
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          )}
        </div>

        {/* Preference options */}
        <div className="mt-7">
          <div className="mb-4">
            <h3
              className="
                text-sm
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Accessibility Features
            </h3>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
                dark:text-gray-400
              "
            >
              Select all accessibility
              options that are relevant
              to your event preferences.
            </p>
          </div>

          <div className="grid gap-3">
            {ACCESSIBILITY_OPTIONS.map(
              (option) => {
                const selected =
                  isSelected(
                    option.id
                  );

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      togglePreference(
                        option.id
                      )
                    }
                    aria-pressed={
                      selected
                    }
                    className={`
                      flex
                      w-full
                      items-start
                      gap-4
                      rounded-xl
                      border
                      p-4
                      text-left
                      transition
                      ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        text-xl
                        ${
                          selected
                            ? "bg-blue-100 dark:bg-blue-950"
                            : "bg-gray-100 dark:bg-gray-800"
                        }
                      `}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <span
                          className={`
                            text-sm
                            font-bold
                            ${
                              selected
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-800 dark:text-gray-200"
                            }
                          `}
                        >
                          {option.label}
                        </span>

                        <span
                          className={`
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-md
                            border
                            text-xs
                            font-bold
                            ${
                              selected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 bg-white text-transparent dark:border-gray-600 dark:bg-gray-800"
                            }
                          `}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </span>

                      <span
                        className="
                          mt-1
                          block
                          text-xs
                          leading-5
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        {
                          option.description
                        }
                      </span>
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Other requirement */}
        {isSelected("other") && (
          <div className="mt-6">
            <label
              htmlFor="other-accessibility-requirement"
              className="
                block
                text-sm
                font-semibold
                text-gray-800
                dark:text-gray-200
              "
            >
              Additional Requirements
            </label>

            <p
              className="
                mt-1
                text-xs
                text-gray-500
                dark:text-gray-400
              "
            >
              Add any additional accessibility
              information that may help you
              choose suitable events.
            </p>

            <textarea
              id="other-accessibility-requirement"
              value={
                otherRequirement
              }
              onChange={(event) =>
                setOtherRequirement(
                  event.target.value
                )
              }
              rows={4}
              maxLength={500}
              placeholder="Describe any additional accessibility requirements..."
              className="
                mt-3
                w-full
                resize-none
                rounded-xl
                border
                border-gray-300
                bg-white
                p-3
                text-sm
                text-gray-900
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
                dark:border-gray-600
                dark:bg-gray-900
                dark:text-white
                dark:focus:ring-blue-950
              "
            />

            <div
              className="
                mt-1
                text-right
                text-[11px]
                text-gray-400
              "
            >
              {otherRequirement.length}
              /500
            </div>
          </div>
        )}

        {/* Save section */}
        <div
          className="
            mt-7
            flex
            flex-col
            gap-3
            border-t
            border-gray-200
            pt-6
            dark:border-gray-700
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-gray-500
              dark:text-gray-400
            "
          >
            You can update or remove these
            preferences at any time.
          </p>

          <button
            type="button"
            onClick={handleSave}
            className="
              rounded-xl
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              focus:ring-offset-2
              dark:focus:ring-offset-gray-900
            "
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Information footer */}
      <div
        className="
          border-t
          border-gray-200
          bg-gray-50
          p-5
          dark:border-gray-700
          dark:bg-gray-800
        "
      >
        <div className="flex items-start gap-3">
          <span
            className="text-lg"
            aria-hidden="true"
          >
            💡
          </span>

          <div>
            <p
              className="
                text-sm
                font-semibold
                text-gray-700
                dark:text-gray-300
              "
            >
              Accessibility-aware event discovery
            </p>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-gray-500
                dark:text-gray-400
              "
            >
              Your preferences can be used
              to highlight events that provide
              matching accessibility information.
              Users without preferences can
              continue using Eventra normally.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventAccessibilityPreferences;