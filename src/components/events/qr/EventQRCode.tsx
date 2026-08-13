import React, { useMemo, useState } from "react";

interface EventQRCodeProps {
  eventId: string | number;
  eventName?: string;
  eventUrl?: string;
  isPublic?: boolean;
  isAvailable?: boolean;
}

const EventQRCode: React.FC<EventQRCodeProps> = ({
  eventId,
  eventName = "Event",
  eventUrl,
  isPublic = true,
  isAvailable = true,
}) => {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  /*
   * Build the event URL when one is not supplied.
   * encodeURIComponent prevents invalid characters
   * from breaking the generated URL.
   */
  const resolvedEventUrl = useMemo(() => {
    if (eventUrl) {
      return eventUrl;
    }

    if (typeof window !== "undefined") {
      return `${window.location.origin}/events/${encodeURIComponent(
        String(eventId)
      )}`;
    }

    return `/events/${encodeURIComponent(
      String(eventId)
    )}`;
  }, [eventId, eventUrl]);

  /*
   * Use a public QR image service to generate the QR.
   * The encoded data is the actual Eventra event URL.
   */
  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=20&data=${encodeURIComponent(
      resolvedEventUrl
    )}`;
  }, [resolvedEventUrl]);

  const copyEventLink = async () => {
    try {
      await navigator.clipboard.writeText(
        resolvedEventUrl
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(
        qrImageUrl
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download QR code"
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download = `${eventName
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase() || "event"}-qr-code.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);

      setDownloaded(true);

      window.setTimeout(() => {
        setDownloaded(false);
      }, 2000);
    } catch {
      /*
       * Fallback: open the QR image in a new tab
       * if direct download is blocked.
       */
      window.open(
        qrImageUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  /*
   * Private or unavailable events should not
   * expose a public QR code.
   */
  if (!isPublic || !isAvailable) {
    return (
      <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-xl dark:bg-gray-700">
            🔒
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              QR code unavailable
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              A QR code cannot be generated because
              this event is private or currently
              unavailable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
            📱
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Share Event with QR Code
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Let participants scan this QR code to
              open the event page instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-5 sm:p-6">
        {!showQR ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm dark:bg-gray-900">
              ▦
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
              Generate event QR code
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              Generate a unique QR code that points
              directly to this public event.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowQR(true)
              }
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Generate QR Code
            </button>
          </div>
        ) : (
          <>
            {/* QR display */}
            <div className="flex flex-col items-center">
              <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700">
                <img
                  src={qrImageUrl}
                  alt={`QR code for ${eventName}`}
                  className="h-64 w-64 object-contain sm:h-72 sm:w-72"
                  loading="lazy"
                />
              </div>

              <div className="mt-5 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {eventName}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Scan to open this event
                </p>
              </div>
            </div>

            {/* Event URL */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Event Link
              </p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-700 dark:bg-gray-900">
                  <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                    {resolvedEventUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyEventLink}
                  className="shrink-0 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-900 dark:bg-gray-900 dark:text-blue-400 dark:hover:bg-blue-950"
                >
                  {copied
                    ? "✓ Copied"
                    : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={downloadQRCode}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <span>⬇️</span>

                <span>
                  {downloaded
                    ? "Downloaded"
                    : "Download QR Code"}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowQR(false)
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Hide QR Code
              </button>
            </div>

            {/* Usage information */}
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg dark:bg-blue-900">
                  💡
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Easy event sharing
                  </h3>

                  <ul className="mt-2 space-y-2 text-sm leading-6 text-blue-700 dark:text-blue-300">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>
                        Add the QR code to posters,
                        presentations, or event
                        materials.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>
                        Participants can scan it with
                        their phone camera.
                      </span>
                    </li>

                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>
                        Scanning opens the correct
                        Eventra event page.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* URL behavior */}
            <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-gray-400">
              <span>🔗</span>

              <p>
                This QR code contains the public URL
                for this event. It does not contain
                private participant information.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default EventQRCode;