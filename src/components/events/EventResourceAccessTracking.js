import {
  BarChart3,
  Download,
  Eye,
  FileText,
  Search,
  Users,
  Clock3,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "eventra-resource-access";

const DEFAULT_RESOURCES = [
  {
    id: "rulebook",
    name: "Event Rulebook",
    type: "PDF",
    views: 0,
    downloads: 0,
    uniqueParticipants: [],
    lastAccessedAt: null,
  },
  {
    id: "presentation",
    name: "Event Presentation",
    type: "PPT",
    views: 0,
    downloads: 0,
    uniqueParticipants: [],
    lastAccessedAt: null,
  },
  {
    id: "participant-guide",
    name: "Participant Guide",
    type: "PDF",
    views: 0,
    downloads: 0,
    uniqueParticipants: [],
    lastAccessedAt: null,
  },
];

const EventResourceAccessTracking = ({
  eventId = "default-event",
  resources = DEFAULT_RESOURCES,
  storageKey = STORAGE_KEY,
  onResourceAccess,
  className = "",
}) => {
  const getStorageKey = () =>
    `${storageKey}-${eventId}`;

  const [resourceStats, setResourceStats] =
    useState(() => {
      const saved = loadStats(
        getStorageKey()
      );

      return mergeResources(
        resources,
        saved
      );
    });

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  useEffect(() => {
    saveStats(
      getStorageKey(),
      resourceStats
    );
  }, [resourceStats]);

  const totals = useMemo(() => {
    const views = resourceStats.reduce(
      (total, resource) =>
        total + resource.views,
      0
    );

    const downloads =
      resourceStats.reduce(
        (total, resource) =>
          total + resource.downloads,
        0
      );

    const uniqueParticipants =
      new Set(
        resourceStats.flatMap(
          (resource) =>
            resource.uniqueParticipants
        )
      ).size;

    return {
      views,
      downloads,
      uniqueParticipants,
    };
  }, [resourceStats]);

  const mostAccessed = useMemo(() => {
    if (!resourceStats.length) {
      return null;
    }

    return [...resourceStats].sort(
      (a, b) => {
        if (b.views !== a.views) {
          return b.views - a.views;
        }

        return (
          b.downloads -
          a.downloads
        );
      }
    )[0];
  }, [resourceStats]);

  const filteredResources = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return resourceStats.filter(
      (resource) => {
        const matchesSearch =
          !query ||
          resource.name
            .toLowerCase()
            .includes(query) ||
          resource.type
            .toLowerCase()
            .includes(query);

        if (!matchesSearch) {
          return false;
        }

        if (filter === "most-viewed") {
          return resource.views > 0;
        }

        if (filter === "downloads") {
          return resource.downloads > 0;
        }

        if (filter === "accessed") {
          return (
            resource.lastAccessedAt !==
            null
          );
        }

        return true;
      }
    );
  }, [
    resourceStats,
    search,
    filter,
  ]);

  const trackView = (
    resourceId,
    participantId
  ) => {
    updateAccess(
      resourceId,
      "view",
      participantId
    );

    onResourceAccess?.({
      resourceId,
      action: "view",
      participantId,
      timestamp:
        new Date().toISOString(),
    });
  };

  const trackDownload = (
    resourceId,
    participantId
  ) => {
    updateAccess(
      resourceId,
      "download",
      participantId
    );

    onResourceAccess?.({
      resourceId,
      action: "download",
      participantId,
      timestamp:
        new Date().toISOString(),
    });
  };

  const updateAccess = (
    resourceId,
    action,
    participantId
  ) => {
    setResourceStats(
      (current) =>
        current.map((resource) => {
          if (
            resource.id !==
            resourceId
          ) {
            return resource;
          }

          const participants =
            participantId &&
            !resource.uniqueParticipants.includes(
              participantId
            )
              ? [
                  ...resource.uniqueParticipants,
                  participantId,
                ]
              : resource.uniqueParticipants;

          return {
            ...resource,
            views:
              action === "view"
                ? resource.views + 1
                : resource.views,
            downloads:
              action === "download"
                ? resource.downloads +
                  1
                : resource.downloads,
            uniqueParticipants:
              participants,
            lastAccessedAt:
              new Date().toISOString(),
          };
        })
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <BarChart3
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Organizer Analytics
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Resource Access Tracking
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Monitor how participants interact with
              event resources, guides, presentations,
              and other materials.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/40 dark:bg-green-900/10">
          <p className="text-[8px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
            Tracking Active
          </p>

          <p className="mt-0.5 text-[9px] text-green-700 dark:text-green-400">
            Access activity is being recorded
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Eye size={17} />}
          label="Total Views"
          value={totals.views}
          description="Resource views"
        />

        <StatCard
          icon={<Download size={17} />}
          label="Downloads"
          value={totals.downloads}
          description="Resource downloads"
        />

        <StatCard
          icon={<Users size={17} />}
          label="Unique Participants"
          value={
            totals.uniqueParticipants
          }
          description="Participants accessed"
        />

        <StatCard
          icon={<TrendingUp size={17} />}
          label="Most Accessed"
          value={
            mostAccessed
              ? mostAccessed.views
              : 0
          }
          description={
            mostAccessed
              ? mostAccessed.name
              : "No activity yet"
          }
        />
      </div>

      {/* Search / filter */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search resources..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(
              event.target.value
            )
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value="all">
            All Resources
          </option>
          <option value="most-viewed">
            Viewed Resources
          </option>
          <option value="downloads">
            Downloaded Resources
          </option>
          <option value="accessed">
            Recently Accessed
          </option>
        </select>
      </div>

      {/* Resource table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Resource Performance
              </h3>

              <p className="mt-1 text-[10px] text-slate-400">
                {filteredResources.length} resource
                {filteredResources.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <FileText
              size={17}
              className="text-slate-400"
            />
          </div>
        </div>

        {filteredResources.length ===
        0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResources.map(
              (resource) => (
                <ResourceRow
                  key={resource.id}
                  resource={resource}
                  onView={(participantId) =>
                    trackView(
                      resource.id,
                      participantId
                    )
                  }
                  onDownload={(
                    participantId
                  ) =>
                    trackDownload(
                      resource.id,
                      participantId
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Most accessed resource */}
      {mostAccessed &&
        mostAccessed.views > 0 && (
          <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <TrendingUp size={16} />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Most Accessed Resource
                </p>

                <h3 className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
                  {mostAccessed.name}
                </h3>

                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  {mostAccessed.views} views •{" "}
                  {mostAccessed.downloads} downloads •{" "}
                  {
                    mostAccessed
                      .uniqueParticipants
                      .length
                  }{" "}
                  unique participant
                  {mostAccessed
                    .uniqueParticipants
                    .length === 1
                    ? ""
                    : "s"}
                </p>
              </div>
            </div>
          </div>
        )}
    </section>
  );
};

/* ----------------------------------
   Statistics card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 truncate text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Resource row
----------------------------------- */

const ResourceRow = ({
  resource,
  onView,
  onDownload,
}) => {
  const uniqueCount =
    resource.uniqueParticipants
      .length;

  return (
    <div className="p-4 transition hover:bg-slate-50 dark:hover:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Resource */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <FileText size={17} />
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-xs font-bold text-slate-800 dark:text-white">
              {resource.name}
            </h4>

            <p className="mt-1 text-[9px] uppercase tracking-wide text-slate-400">
              {resource.type}
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:w-[420px]">
          <Metric
            icon={<Eye size={12} />}
            label="Views"
            value={resource.views}
          />

          <Metric
            icon={<Download size={12} />}
            label="Downloads"
            value={
              resource.downloads
            }
          />

          <Metric
            icon={<Users size={12} />}
            label="Unique"
            value={uniqueCount}
          />
        </div>

        {/* Last accessed */}
        <div className="lg:w-40">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
            Last Accessed
          </p>

          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <Clock3 size={11} />

            {resource.lastAccessedAt
              ? formatDate(
                  resource.lastAccessedAt
                )
              : "No activity"}
          </p>
        </div>

        {/* Demo actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              onView("demo-participant")
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Eye size={11} />
            View
          </button>

          <button
            type="button"
            onClick={() =>
              onDownload(
                "demo-participant"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
          >
            <Download size={11} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Metric
----------------------------------- */

const Metric = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-950">
      <div className="flex items-center gap-1 text-slate-400">
        {icon}

        <span className="text-[8px] font-bold uppercase">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
};

/* ----------------------------------
   Empty state
----------------------------------- */

const EmptyState = () => {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <FileText
          size={20}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
        No resources found
      </h3>

      <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-slate-400">
        Try changing your search or filter to find event
        resources.
      </p>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

const normalizeResource = (
  resource
) => ({
  id:
    resource.id ||
    createId(),
  name:
    resource.name ||
    "Untitled Resource",
  type:
    resource.type ||
    "FILE",
  views:
    Number(resource.views) || 0,
  downloads:
    Number(resource.downloads) ||
    0,
  uniqueParticipants:
    Array.isArray(
      resource.uniqueParticipants
    )
      ? resource.uniqueParticipants
      : [],
  lastAccessedAt:
    resource.lastAccessedAt ||
    null,
});

const mergeResources = (
  resources,
  saved
) => {
  const savedMap = new Map(
    saved.map((item) => [
      item.id,
      item,
    ])
  );

  return resources.map(
    (resource) => {
      const normalized =
        normalizeResource(
          resource
        );

      const stored =
        savedMap.get(
          normalized.id
        );

      if (!stored) {
        return normalized;
      }

      return normalizeResource({
        ...normalized,
        ...stored,
      });
    }
  );
};

const createId = () => {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `resource-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const formatDate = (
  value
) => {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const loadStats = (
  key
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  try {
    const value =
      window.localStorage.getItem(
        key
      );

    if (!value) {
      return [];
    }

    const parsed =
      JSON.parse(value);

    return Array.isArray(
      parsed
    )
      ? parsed.map(
          normalizeResource
        )
      : [];
  } catch {
    return [];
  }
};

const saveStats = (
  key,
  stats
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(stats)
    );
  } catch {
    // Ignore localStorage errors.
  }
};

export default EventResourceAccessTracking;