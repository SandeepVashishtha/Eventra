import {
  ExternalLink,
  MapPin,
  Navigation,
  Wifi,
} from "lucide-react";

import {
  getDirectionsUrl,
  getEventLocation,
  getMeetingUrl,
  isOnlineEvent,
} from "../../utils/eventLocationUtils";

const LocationDetailsCard = ({
  event = {},
  showDirections = true,
  showLandmarks = true,
}) => {
  const online = isOnlineEvent(event);
  const location = getEventLocation(event);

  /*
   * Online event
   */
  if (online) {
    const meetingUrl = getMeetingUrl(event);

    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Wifi
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Event Location
              </h2>

              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                Online
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This event will be conducted online.
            </p>

            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <ExternalLink size={16} />
                Join Meeting
              </a>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Meeting link will be provided by
                the organizer.
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  /*
   * Physical event
   */
  if (!location) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <MapPin
              size={21}
              className="text-slate-500"
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Location
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Venue information has not been provided
              yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const directionsUrl =
    getDirectionsUrl(event);

  const landmarks =
    Array.isArray(location.landmarks)
      ? location.landmarks
      : [];

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <MapPin
            size={21}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
              Event Location
            </h2>

            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Offline
            </span>
          </div>

          {location.name && (
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {location.name}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      {location.address && (
        <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <div className="flex items-start gap-3">
            <MapPin
              size={18}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Venue Address
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                {location.address}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Directions */}
      {showDirections &&
        directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Navigation size={16} />
            Get Directions
          </a>
        )}

      {/* Coordinates */}
      {(location.latitude !==
        undefined ||
        location.longitude !==
          undefined) && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
          {location.latitude !==
            undefined && (
            <span>
              Latitude:{" "}
              {location.latitude}
            </span>
          )}

          {location.longitude !==
            undefined && (
            <span>
              Longitude:{" "}
              {location.longitude}
            </span>
          )}
        </div>
      )}

      {/* Nearby landmarks */}
      {showLandmarks &&
        landmarks.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Nearby Landmarks
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {landmarks.map(
                (landmark, index) => {
                  const label =
                    typeof landmark ===
                    "string"
                      ? landmark
                      : landmark?.name ||
                        landmark?.title ||
                        "Landmark";

                  return (
                    <span
                      key={`landmark-${index}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {label}
                    </span>
                  );
                }
              )}
            </div>
          </div>
        )}
    </section>
  );
};

export default LocationDetailsCard;