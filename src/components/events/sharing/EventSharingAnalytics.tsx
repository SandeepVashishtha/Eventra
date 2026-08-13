import React, { useMemo, useState } from "react";

interface ShareRecord {
  id: string | number;
  eventId: string | number;
  method: string;
  sharedAt: string;
}

interface EventSharingAnalyticsProps {
  eventId: string | number;
  eventName: string;
  initialShares?: ShareRecord[];
}

const SHARE_METHODS = [
  {
    id: "copy",
    name: "Copy Link",
    icon: "🔗",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
  },
  {
    id: "email",
    name: "Email",
    icon: "✉️",
  },
  {
    id: "twitter",
    name: "X / Twitter",
    icon: "𝕏",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
  },
];

const EventSharingAnalytics: React.FC<
  EventSharingAnalyticsProps
> = ({
  eventId,
  eventName,
  initialShares = [],
}) => {
  const [shares, setShares] =
    useState<ShareRecord[]>(initialShares);

  const [shareMessage, setShareMessage] =
    useState("");

  const [showAnalytics, setShowAnalytics] =
    useState(false);

  /*
   * Only use share records belonging to this event.
   */
  const eventShares = useMemo(() => {
    return shares.filter(
      (share) => String(share.eventId) === String(eventId)
    );
  }, [shares, eventId]);

  /*
   * Total shares.
   */
  const totalShares = eventShares.length;

  /*
   * Calculate sharing method distribution.
   */
  const methodDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    eventShares.forEach((share) => {
      distribution[share.method] =
        (distribution[share.method] || 0) + 1;
    });

    return Object.entries(distribution).sort(
      (a, b) => b[1] - a[1]
    );
  }, [eventShares]);

  /*
   * Most commonly used sharing method.
   */
  const mostPopularMethod = useMemo(() => {
    if (methodDistribution.length === 0) {
      return null;
    }

    const [method, count] = methodDistribution[0];

    return {
      method,
      count,
    };
  }, [methodDistribution]);

  /*
   * Calculate share activity by date.
   */
  const shareActivity = useMemo(() => {
    const activity: Record<string, number> = {};

    eventShares.forEach((share) => {
      const date = new Date(share.sharedAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const dateKey = date.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
        }
      );

      activity[dateKey] =
        (activity[dateKey] || 0) + 1;
    });

    return Object.entries(activity);
  }, [eventShares]);

  /*
   * Calculate percentage for sharing method.
   */
  const getMethodPercentage = (count: number) => {
    if (totalShares === 0) {
      return 0;
    }

    return Math.round(
      (count / totalShares) * 100
    );
  };

  /*
   * Get method information.
   */
  const getMethodInfo = (method: string) => {
    return (
      SHARE_METHODS.find(
        (item) => item.id === method
      ) || {
        id: method,
        name: method,
        icon: "📤",
      }
    );
  };

  /*
   * Create a share record.
   */
  const recordShare = (method: string) => {
    const newShare: ShareRecord = {
      id: `share-${Date.now()}-${Math.random()}`,
      eventId,
      method,
      sharedAt: new Date().toISOString(),
    };

    setShares((previousShares) => [
      ...previousShares,
      newShare,
    ]);

    const shareInfo = getMethodInfo(method);

    setShareMessage(
      `Event shared using ${shareInfo.name}.`
    );

    setTimeout(() => {
      setShareMessage("");
    }, 2500);
  };

  /*
   * Copy event link.
   */
  const handleCopyLink = async () => {
    const eventUrl =
      window.location.href;

    try {
      await navigator.clipboard.writeText(eventUrl);

      recordShare("copy");
    } catch {
      setShareMessage(
        "Unable to copy the event link."
      );
    }
  };

  /*
   * Share using native Web Share API.
   */
  const handleNativeShare = async () => {
    const eventUrl =
      window.location.href;

    if (!navigator.share) {
      setShareMessage(
        "Native sharing is not supported on this browser."
      );

      return;
    }

    try {
      await navigator.share({
        title: eventName,
        text: `Check out this event: ${eventName}`,
        url: eventUrl,
      });

      recordShare("native");
    } catch {
      // User cancelled native share.
    }
  };

  /*
   * WhatsApp share.
   */
  const handleWhatsAppShare = () => {
    const eventUrl =
      window.location.href;

    const message = encodeURIComponent(
      `Check out this event: ${eventName}\n${eventUrl}`
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );

    recordShare("whatsapp");
  };

  /*
   * Email share.
   */
  const handleEmailShare = () => {
    const eventUrl =
      window.location.href;

    const subject = encodeURIComponent(
      `Event: ${eventName}`
    );

    const body = encodeURIComponent(
      `Check out this event:\n\n${eventName}\n${eventUrl}`
    );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;

    recordShare("email");
  };

  /*
   * X/Twitter share.
   */
  const handleTwitterShare = () => {
    const eventUrl =
      window.location.href;

    const text = encodeURIComponent(
      `Check out this event: ${eventName}`
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
        eventUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    );

    recordShare("twitter");
  };

  /*
   * Facebook share.
   */
  const handleFacebookShare = () => {
    const eventUrl =
      window.location.href;

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        eventUrl
      )}`,
      "_blank",
      "noopener,noreferrer"
    );

    recordShare("facebook");
  };

  /*
   * Empty analytics state.
   */
  const renderEmptyAnalytics = () => {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm dark:bg-gray-700">
          📊
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
          No sharing data yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
          Sharing statistics will appear here after users
          start sharing this event.
        </p>
      </div>
    );
  };

  return (
    <section className="w-full space-y-6">
      {/* =====================================================
          SHARE EVENT
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Event Sharing
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              Share {eventName}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Share this event with your friends and community.
            </p>
          </div>

          <div className="rounded-xl bg-blue-50 px-5 py-3 dark:bg-blue-950">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Total Shares
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalShares}
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950"
          >
            <span className="text-xl">🔗</span>

            <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              Copy Link
            </span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-green-300 hover:bg-green-50 dark:border-gray-700 dark:hover:bg-green-950"
          >
            <span className="text-xl">💬</span>

            <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              WhatsApp
            </span>
          </button>

          <button
            type="button"
            onClick={handleEmailShare}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:hover:bg-purple-950"
          >
            <span className="text-xl">✉️</span>

            <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              Email
            </span>
          </button>

          <button
            type="button"
            onClick={handleTwitterShare}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <span className="text-xl">𝕏</span>

            <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              X / Twitter
            </span>
          </button>

          <button
            type="button"
            onClick={handleFacebookShare}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-blue-950"
          >
            <span className="text-xl">f</span>

            <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              Facebook
            </span>
          </button>

          {"share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-200 px-4 py-4 text-center transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-700 dark:hover:bg-indigo-950"
            >
              <span className="text-xl">📤</span>

              <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                More
              </span>
            </button>
          )}
        </div>

        {shareMessage && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">
              ✓ {shareMessage}
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          ANALYTICS HEADER
      ====================================================== */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Organizer Dashboard
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              Sharing Analytics
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Understand how participants are sharing your event.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAnalytics((previous) => !previous)
            }
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {showAnalytics
              ? "Hide Analytics"
              : "View Analytics"}
          </button>
        </div>
      </div>

      {/* =====================================================
          ANALYTICS
      ====================================================== */}
      {showAnalytics && (
        <>
          {totalShares === 0 ? (
            renderEmptyAnalytics()
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Shares
                  </p>

                  <p className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">
                    {totalShares}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Across all sharing methods
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Most Used Method
                  </p>

                  {mostPopularMethod && (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-2xl">
                          {
                            getMethodInfo(
                              mostPopularMethod.method
                            ).icon
                          }
                        </span>

                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {
                            getMethodInfo(
                              mostPopularMethod.method
                            ).name
                          }
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        {mostPopularMethod.count} shares
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Sharing Methods
                  </p>

                  <p className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">
                    {methodDistribution.length}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Different methods used
                  </p>
                </div>
              </div>

              {/* Method distribution */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sharing Methods
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Most commonly used ways participants share
                    the event.
                  </p>
                </div>

                <div className="space-y-5">
                  {methodDistribution.map(
                    ([method, count]) => {
                      const info =
                        getMethodInfo(method);

                      const percentage =
                        getMethodPercentage(count);

                      return (
                        <div key={method}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{info.icon}</span>

                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {info.name}
                              </span>
                            </div>

                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {count} ({percentage}%)
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Activity over time */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Share Activity Over Time
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Daily sharing activity for this event.
                  </p>
                </div>

                {shareActivity.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not enough data available to display
                      sharing activity.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[500px]">
                      <div className="grid grid-cols-2 border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-700">
                        <span>Date</span>
                        <span>Total Shares</span>
                      </div>

                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {shareActivity.map(
                          ([date, count]) => (
                            <div
                              key={date}
                              className="grid grid-cols-2 py-4"
                            >
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {date}
                              </span>

                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* =====================================================
          PRIVACY NOTICE
      ====================================================== */}
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔒</span>

          <div>
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Privacy Protected
            </h3>

            <p className="mt-1 text-sm leading-6 text-green-700 dark:text-green-400">
              Sharing analytics are aggregated by event and
              sharing method. No participant names, email
              addresses, accounts, or other private user
              information are displayed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSharingAnalytics;