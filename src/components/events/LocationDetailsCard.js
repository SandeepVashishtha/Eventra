import {
  ExternalLink,
  MapPin,
  Navigation,
  Wifi,
} from "lucide-react";

const LocationDetailsCard = ({
  location = {},
  directionsUrl,
}) => {
  const {
    name,
    address,
    city,
    state,
    country,
    postalCode,
    landmarks = [],
  } = location;

  const fullAddress = [
    address,
    city,
    state,
    country,
    postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
      {/* Venue */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <MapPin
            size={20}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Venue
          </p>

          <h3 className="mt-1 text-base font-bold text-slate-800 dark:text-white">
            {name || "Event Venue"}
          </h3>
        </div>
      </div>

      {/* Address */}
      {fullAddress && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Address
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {fullAddress}
          </p>
        </div>
      )}

      {/* Coordinates */}
      {location.latitude !== undefined &&
        location.longitude !== undefined && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <MapPin size={14} />
            <span>
              {location.latitude},{" "}
              {location.longitude}
            </span>
          </div>
        )}

      {/* Directions */}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <Navigation size={16} />
          Get Directions
          <ExternalLink size={14} />
        </a>
      )}

      {/* Nearby landmarks */}
      {landmarks.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Wifi
              size={16}
              className="text-slate-500 dark:text-slate-400"
            />

            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
              Nearby Landmarks
            </h4>
          </div>

          <ul className="mt-3 space-y-2">
            {landmarks.map(
              (landmark, index) => (
                <li
                  key={`${landmark}-${index}`}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {landmark}
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {!fullAddress &&
        landmarks.length === 0 && (
          <div className="mt-5 rounded-xl bg-white p-4 text-center dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Location details are not available.
            </p>
          </div>
        )}
    </div>
  );
};

export default LocationDetailsCard;