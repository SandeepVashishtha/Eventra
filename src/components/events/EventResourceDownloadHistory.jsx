import {
  CalendarDays,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileText,
  History,
  Image,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_RESOURCES = [
  {
    id: 1,
    name: "AI Workshop Presentation.pdf",
    event: "AI Innovation Summit",
    date: "Aug 13, 2026",
    type: "PDF",
  },
  {
    id: 2,
    name: "Hackathon Guidelines.pdf",
    event: "Hackathon 2026",
    date: "Aug 12, 2026",
    type: "PDF",
  },
  {
    id: 3,
    name: "Workshop Resources.zip",
    event: "Data Science Workshop",
    date: "Aug 10, 2026",
    type: "ZIP",
  },
  {
    id: 4,
    name: "Speaker Reference Notes.docx",
    event: "AI Innovation Summit",
    date: "Aug 8, 2026",
    type: "DOCX",
  },
  {
    id: 5,
    name: "Event Poster.png",
    event: "Web Development Meetup",
    date: "Aug 6, 2026",
    type: "IMAGE",
  },
];

const getFileIcon = (type) => {
  switch (type) {
    case "PDF":
      return FileText;
    case "ZIP":
      return FileArchive;
    case "IMAGE":
      return Image;
    default:
      return File;
  }
};

const EventResourceDownloadHistory = ({
  resources = DEFAULT_RESOURCES,
  onOpen,
  onDownload,
}) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        resource.name.toLowerCase().includes(query) ||
        resource.event.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" ||
        resource.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [resources, search, typeFilter]);

  const resourceTypes = useMemo(
    () => [
      "All",
      ...new Set(resources.map((resource) => resource.type)),
    ],
    [resources]
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <History size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Participant Resources
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Resource Download History
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Quickly find event resources you previously opened
              or downloaded.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Resources
          </p>

          <p className="mt-1 text-lg font-black text-indigo-600 dark:text-indigo-400">
            {resources.length}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={History}
          label="Total Accessed"
          value={resources.length}
        />

        <SummaryCard
          icon={Download}
          label="Downloads"
          value={resources.length}
        />

        <SummaryCard
          icon={File}
          label="File Types"
          value={
            new Set(resources.map((item) => item.type)).size
          }
        />
      </div>

      {/* Search and Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search resources or events..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-[7px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:focus:ring-indigo-900"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {resourceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-xl px-3 py-2 text-[6px] font-bold transition ${
                  typeFilter === type
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <History
              size={16}
              className="text-indigo-600 dark:text-indigo-400"
            />

            <div>
              <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
                Previously Accessed Resources
              </h3>

              <p className="mt-1 text-[7px] text-slate-400">
                Open or download resources from your event history.
              </p>
            </div>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="p-10 text-center">
            <File
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-4 text-[8px] font-bold text-slate-700 dark:text-slate-300">
              No resources found
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Try changing your search or file type filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResources.map((resource) => (
              <ResourceRow
                key={resource.id}
                resource={resource}
                onOpen={() =>
                  onOpen?.(resource)
                }
                onDownload={() =>
                  onDownload?.(resource)
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const ResourceRow = ({
  resource,
  onOpen,
  onDownload,
}) => {
  const Icon = getFileIcon(resource.type);

  return (
    <div className="p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h4 className="truncate text-[9px] font-bold text-slate-800 dark:text-white">
                {resource.name}
              </h4>

              <p className="mt-1 text-[7px] text-slate-400">
                {resource.event}
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {resource.type}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[6px] text-slate-400">
            <CalendarDays size={10} />
            Accessed {resource.date}
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[6px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300"
          >
            <ExternalLink size={11} />
            Open
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-[6px] font-bold text-white transition hover:bg-indigo-700"
          >
            <Download size={11} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-lg font-black text-slate-800 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

export default EventResourceDownloadHistory;