import React, { useMemo, useState } from "react";

interface EventLocationMapProps {
  eventName: string;
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isOnline?: boolean;
  mapUrl?: string;
}

const EventLocationMap: React.FC<EventLocationMapProps> = ({
  eventName,
  venueName,
  address,
  city,
  state,
  country,
  latitude,
  longitude,
  isOnline = false,
  mapUrl,
}) => {
  const [mapLoaded, setMapLoaded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  /*
   * Build a complete readable address.
   */
  const fullAddress = useMemo(() => {
    return [
      address,
      city,
      state,
      country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [address, city, state, country]);

  /*
   * Build a search query for map services.
   */
  const locationQuery = useMemo(() => {
    return encodeURIComponent(
      [venueName, fullAddress]
        .filter(Boolean)
        .join(", ")
    );
  }, [venueName, fullAddress]);

  /*
   * Google Maps URL.
   */
  const googleMapsUrl = useMemo(() => {
    if (mapUrl) {
      return mapUrl;
    }

    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }

    if (locationQuery) {
      return `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;
    }

    return "";
  }, [
    mapUrl,
    latitude,
    longitude,
    locationQuery,
  ]);

  /*
   * Open directions.
   */
  const handleOpenDirections = () => {
    if (!googleMapsUrl) {
      return;
    }

    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * Open location in Google Maps.
   */
  const handleOpenMap = () => {
    if (!googleMapsUrl) {
      return;
    }

    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * Online event state.
   */
  if (isOnline) {
    return (
      <section className="w-full rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-900">
            💻
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Event Location
            </p>

            <h2 className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-200">
              Online Event
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-700 dark:text-blue-400">
              This is an online event. No physical venue or
              map information is required.
            </p>
          </div>
        </div>
      </section>
    );
  }

  /*
   * No physical location available.
   */
  if (!venueName && !fullAddress) {
    return (
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl dark:bg-gray-800">
            📍
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Event Location
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Location information unavailable
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              The venue address has not been provided for this
              event yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-2xl dark:bg-red-950">
            📍
          </div>

          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Event Location
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {venueName || "Event Venue"}
            </h2>

            {fullAddress && (
              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {fullAddress}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowDetails((previous) => !previous)
          }
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {showDetails
            ? "Hide Details"
            : "View Details"}
        </button>
      </div>

      {/* =====================================================
          MAP AREA
      ====================================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
        {mapLoaded ? (
          <div className="relative h-[320px] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            {/* Decorative map background */}
            <div className="absolute inset-0 opacity-60">
              <div className="absolute left-[8%] top-[18%] h-2 w-[75%] rotate-12 rounded-full bg-white dark:bg-gray-700" />

              <div className="absolute left-[5%] top-[45%] h-3 w-[90%] -rotate-6 rounded-full bg-white dark:bg-gray-700" />

              <div className="absolute left-[20%] top-[70%] h-2 w-[75%] rotate-6 rounded-full bg-white dark:bg-gray-700" />

              <div className="absolute left-[30%] top-0 h-full w-2 rotate-12 rounded-full bg-white dark:bg-gray-700" />

              <div className="absolute left-[65%] top-0 h-full w-3 -rotate-6 rounded-full bg-white dark:bg-gray-700" />

              <div className="absolute left-[45%] top-[20%] h-24 w-32 rounded-xl bg-green-100 dark:bg-green-950" />

              <div className="absolute left-[10%] top-[65%] h-16 w-24 rounded-xl bg-green-100 dark:bg-green-950" />

              <div className="absolute right-[8%] top-[25%] h-20 w-28 rounded-xl bg-green-100 dark:bg-green-950" />
            </div>

            {/* Center marker */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-lg">
                  📍
                </div>

                <div className="mt-2 rounded-xl bg-white px-4 py-2 shadow-lg dark:bg-gray-900">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {venueName || eventName}
                  </p>

                  {city && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {city}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Map attribution */}
            <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] text-gray-500 dark:bg-gray-900/90 dark:text-gray-400">
              Event location
            </div>
          </div>
        ) : (
          <div className="flex h-[320px] items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <span className="text-3xl">📍</span>

              <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">
                Map unavailable
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Use the address below to locate the venue.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          VENUE DETAILS
      ====================================================== */}
      {showDetails && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Venue
            </p>

            <p className="mt-2 font-semibold text-gray-900 dark:text-white">
              {venueName || "Not provided"}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Address
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {fullAddress || "Not provided"}
            </p>
          </div>

          {typeof latitude === "number" &&
            typeof longitude === "number" && (
              <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Coordinates
                </p>

                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {latitude.toFixed(6)},{" "}
                  {longitude.toFixed(6)}
                </p>
              </div>
            )}
        </div>
      )}

      {/* =====================================================
          ADDRESS CARD
      ====================================================== */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">🏢</span>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {venueName || "Venue Address"}
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {fullAddress ||
                "Venue address is not available."}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleOpenMap}
          disabled={!googleMapsUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>🗺️</span>
          Open in Maps
        </button>

        <button
          type="button"
          onClick={handleOpenDirections}
          disabled={!googleMapsUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>🧭</span>
          Get Directions
        </button>
      </div>

      {/* =====================================================
          FALLBACK
      ====================================================== */}
      {!googleMapsUrl && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>

            <div>
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Map service unavailable
              </h3>

              <p className="mt-1 text-sm leading-6 text-yellow-700 dark:text-yellow-400">
                The map could not be opened. Please use the
                venue address shown above to find the location.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          PRIVACY / INFORMATION NOTICE
      ====================================================== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start gap-3">
          <span className="text-lg">ℹ️</span>

          <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
            The map displays the event's public venue
            information. No participant location or private
            user information is displayed.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EventLocationMap;