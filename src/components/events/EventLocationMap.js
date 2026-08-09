import {
  ExternalLink,
  MapPin,
  Navigation,
} from "lucide-react";
import LocationDetailsCard from "./LocationDetailsCard";
import {
  getEventLocation,
  isOnlineEvent,
  buildDirectionsUrl,
  hasValidCoordinates,
} from "../../utils/eventLocationUtils";

const EventLocationMap = ({ event }) => {
  if (!event) return null;

  const location = getEventLocation(event);
  const online = isOnlineEvent(event);

  if (online) {
    return (
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <ExternalLink
              size={22}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Event Location
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This is an online event.
            </p>
          </div>
        </div>

        {event.meetingLink && (
          <a
            href={event.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Join Online Event
            <ExternalLink size={16} />
          </a>
        )}
      </section>
    );
  }

  const hasCoordinates =
    hasValidCoordinates(location);

  const directionsUrl =
    buildDirectionsUrl(location);

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
          <MapPin
            size={23}
            className="text-red-600 dark:text-red-400"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Event Location
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find the venue and get directions to the event.
          </p>
        </div>
      </div>

      {/* Location details */}
      <div className="mt-6">
        <LocationDetailsCard
          location={location}
          directionsUrl={directionsUrl}
        />
      </div>

      {/* Map */}
      {hasCoordinates ? (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
          <iframe
            title={`Map showing ${
              location.name ||
              "event venue"
            }`}
            src={buildMapEmbedUrl(
              location.latitude,
              location.longitude
            )}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Map marker label */}
          <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white px-4 py-3 shadow-lg dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <MapPin
                size={17}
                className="text-red-600"
              />

              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                {location.name ||
                  "Event Venue"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center dark:border-slate-700 dark:bg-slate-800">
          <MapPin
            size={38}
            className="mb-3 text-slate-400"
          />

          <h3 className="font-semibold text-slate-700 dark:text-white">
            Map unavailable
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            GPS coordinates are not available for this venue.
            Please use the address below for navigation.
          </p>
        </div>
      )}

      {/* Directions */}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
        >
          <Navigation size={17} />
          Get Directions
        </a>
      )}

      {/* Nearby landmarks */}
      {location.landmarks?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Nearby Landmarks
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {location.landmarks.map(
              (landmark, index) => (
                <span
                  key={`${landmark}-${index}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {landmark}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
};

const buildMapEmbedUrl = (
  latitude,
  longitude
) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  const delta = 0.01;

  const bbox = [
    lng - delta,
    lat - delta,
    lng + delta,
    lat + delta,
  ].join(",");

  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(
    `${lat},${lng}`
  )}`;
};

export default EventLocationMap;