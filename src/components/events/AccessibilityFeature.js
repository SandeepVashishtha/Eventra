import {
  Accessibility,
  Check,
  DoorOpen,
  Droplets,
  Elevator,
  Hand,
  HelpCircle,
  X,
} from "lucide-react";

const ICONS = {
  wheelchair: Accessibility,
  accessibleEntrance: DoorOpen,
  accessibleRestroom: Droplets,
  elevator: Elevator,
  signLanguage: Hand,
  default: Accessibility,
};

const AccessibilityFeature = ({
  feature = {},
}) => {
  const {
    id,
    name = "Accessibility Feature",
    label,
    title,
    description = "",
    available,
    supported,
    enabled,
    value,
  } = feature;

  const featureName =
    label || title || name;

  const isAvailable =
    available !== undefined
      ? Boolean(available)
      : supported !== undefined
        ? Boolean(supported)
        : enabled !== undefined
          ? Boolean(enabled)
          : Boolean(value);

  const Icon =
    ICONS[id] ||
    ICONS[
      String(featureName)
        .toLowerCase()
        .replace(/\s+/g, "")
    ] ||
    ICONS.default;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition ${
        isAvailable
          ? "border-green-200 bg-green-50/60 dark:border-green-900/50 dark:bg-green-900/10"
          : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          isAvailable
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <Icon
          size={19}
          className={
            isAvailable
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400"
          }
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            {featureName}
          </h3>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isAvailable
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            }`}
          >
            {isAvailable ? (
              <>
                <Check size={10} />
                Available
              </>
            ) : (
              <>
                <X size={10} />
                Not available
              </>
            )}
          </span>
        </div>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default AccessibilityFeature;