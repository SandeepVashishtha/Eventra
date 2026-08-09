import {
  ExternalLink,
  Map,
  MapPin,
  Navigation,
} from "lucide-react";

import {
  getEventLocation,
  getDirectionsUrl,
  getMeetingUrl,
  isOnlineEvent,
} from "../../utils/eventLocationUtils";

const EventLocationMap = ({
  event = {},
  height = 320,
  showDirections = true,
  showAddress = true,
  showLandmarks = true,
}) => {
  const online = isOnlineEvent(event);
  const location = getEventLocation(event);

  /*
   * Online event:
   * Don't render a physical map. Show the meeting
   * link instead, as requested by the issue.
   */
  if (online) {
    const meetingUrl = getMeetingUrl(event);

    return (
      <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ExternalLink
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Online Event
              </h2>

              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                Online
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This event is being conducted online.
              Use the meeting link below to join.
            </p>

            {meetingUrl ? (
              <a
                href={meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <ExternalLink size={16} />
                Join Online Event
              </a>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                The meeting link has not been provided yet.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  /*
   * Physical event with no location data.
   */
  if (!location) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <MapPin
            size={21}
            className="text-slate-400"
          />

          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">
              Event Location
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Venue location has not been provided.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const directionsUrl =
    getDirectionsUrl(event);

  const mapUrl = buildMapEmbedUrl(
    location
  );

  const landmarks =
    Array.isArray(
      location.landmarks
    )
      ? location.landmarks
      : [];

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <MapPin
              size={21}
              className="text-red-600 dark:text-red-400"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Event Location
              </h2>

              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                Offline
              </span>
            </div>

            {location.name && (
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {location.name}
              </p>
            )}
          </div>
        </div>

        {showDirections &&
          directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <Navigation size={16} />
              Get Directions
            </a>
          )}
      </div>

      {/* Map */}
      <div
        className="relative overflow-hidden bg-slate-100 dark:bg-slate-800"
        style={{
          height: `${height}px`,
        }}
      >
        {mapUrl ? (
          <iframe
            title={`Map showing ${
              location.name ||
              "event venue"
            }`}
            src={mapUrl}
            width="100%"
            height="100%"
            style={{
              border: 0,
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <MapFallback
            location={location}
            directionsUrl={
              directionsUrl
            }
          />
        )}
      </div>

      {/* Location details */}
      <div className="p-5">
        {showAddress &&
          location.address && (
            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Venue Address
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {location.address}
                </p>
              </div>
            </div>
          )}

        {/* Coordinates */}
        {(location.latitude !==
          undefined ||
          location.longitude !==
            undefined) && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400 dark:text-slate-500">
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
                  (landmark, index) => (
                    <span
                      key={`landmark-${index}`}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {typeof landmark ===
                      "string"
                        ? landmark
                        : landmark?.name ||
                          "Landmark"}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </section>
  );
};

/**
 * Build an OpenStreetMap embed URL.
 *
 * No API key is required for this basic map view.
 */
const buildMapEmbedUrl = (
  location
) => {
  const latitude =
    Number(location.latitude);

  const longitude =
    Number(location.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const delta = 0.01;

  const left =
    longitude - delta;
  const right =
    longitude + delta;
  const top =
    latitude + delta;
  const bottom =
    latitude - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    `${left},${bottom},${right},${top}`
  )}&layer=mapnik&marker=${encodeURIComponent(
    `${latitude},${longitude}`
  )}`;
};

/**
 * Fallback when coordinates are unavailable.
 */
const MapFallback = ({
  location,
  directionsUrl,
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-900">
        <Map
          size={24}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 font-semibold text-slate-700 dark:text-slate-200">
        Map location unavailable
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {location.address ||
          "The event venue does not have map coordinates yet."}
      </p>

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Navigation size={16} />
          Get Directions
        </a>
      )}
    </div>
  );
};

export default EventLocationMap;