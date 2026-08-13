import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  File,
  FileText,
  History,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

const DEFAULT_RESOURCES = [
  {
    id: "resource-1",
    name: "Event Rulebook",
    type: "PDF",
    versions: [
      {
        id: "version-1",
        version: 1,
        fileName: "event-rulebook-v1.pdf",
        updatedAt: "2026-08-01T10:00:00",
        size: "1.8 MB",
        uploadedBy: "Organizer",
        current: false,
      },
      {
        id: "version-2",
        version: 2,
        fileName: "event-rulebook-v2.pdf",
        updatedAt: "2026-08-10T15:30:00",
        size: "2.1 MB",
        uploadedBy: "Organizer",
        current: true,
      },
    ],
  },
  {
    id: "resource-2",
    name: "Event Schedule",
    type: "PDF",
    versions: [
      {
        id: "version-3",
        version: 1,
        fileName: "event-schedule-v1.pdf",
        updatedAt: "2026-08-05T09:00:00",
        size: "900 KB",
        uploadedBy: "Organizer",
        current: true,
      },
    ],
  },
];

const EventResourceVersionManagement = ({
  initialResources = DEFAULT_RESOURCES,
  onUploadVersion,
  onDownload,
  className = "",
}) => {
  const [resources, setResources] =
    useState(initialResources);

  const [expandedResource, setExpandedResource] =
    useState(null);

  const [selectedResource, setSelectedResource] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [showUpload, setShowUpload] =
    useState(false);

  const [resourceName, setResourceName] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef = useRef(null);

  const totalVersions = useMemo(
    () =>
      resources.reduce(
        (total, resource) =>
          total + resource.versions.length,
        0
      ),
    [resources]
  );

  const updatedResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.versions.length > 1
      ).length,
    [resources]
  );

  const handleSelectFile = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    if (!resourceName) {
      const name =
        file.name
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .replace(
            /[-_v]+\d+$/i,
            ""
          );

      setResourceName(name);
    }
  };

  const handleUpload = async (
    event
  ) => {
    event.preventDefault();

    if (!resourceName.trim()) {
      setMessage(
        "Please enter a resource name."
      );
      return;
    }

    if (!selectedFile) {
      setMessage(
        "Please select a file."
      );
      return;
    }

    setUploading(true);
    setMessage("");

    const existingResource =
      resources.find(
        (resource) =>
          resource.name.toLowerCase() ===
          resourceName
            .trim()
            .toLowerCase()
      );

    const now =
      new Date().toISOString();

    if (existingResource) {
      const nextVersion =
        Math.max(
          ...existingResource.versions.map(
            (version) =>
              Number(version.version) ||
              0
          )
        ) + 1;

      const newVersion = {
        id: createId(),
        version: nextVersion,
        fileName:
          selectedFile.name,
        updatedAt: now,
        size: formatFileSize(
          selectedFile.size
        ),
        uploadedBy: "Organizer",
        current: true,
        file: selectedFile,
      };

      setResources((current) =>
        current.map((resource) => {
          if (
            resource.id !==
            existingResource.id
          ) {
            return resource;
          }

          return {
            ...resource,
            type: getFileType(
              selectedFile.name
            ),
            versions:
              resource.versions
                .map((version) => ({
                  ...version,
                  current: false,
                }))
                .concat(newVersion),
          };
        })
      );

      onUploadVersion?.({
        resourceId:
          existingResource.id,
        resourceName:
          existingResource.name,
        version: nextVersion,
        file: selectedFile,
      });

      setExpandedResource(
        existingResource.id
      );

      setMessage(
        `${existingResource.name} updated to version ${nextVersion}.`
      );
    } else {
      const newResource = {
        id: createId(),
        name: resourceName.trim(),
        type: getFileType(
          selectedFile.name
        ),
        versions: [
          {
            id: createId(),
            version: 1,
            fileName:
              selectedFile.name,
            updatedAt: now,
            size: formatFileSize(
              selectedFile.size
            ),
            uploadedBy: "Organizer",
            current: true,
            file: selectedFile,
          },
        ],
      };

      setResources((current) => [
        ...current,
        newResource,
      ]);

      onUploadVersion?.({
        resourceId: newResource.id,
        resourceName:
          newResource.name,
        version: 1,
        file: selectedFile,
      });

      setExpandedResource(
        newResource.id
      );

      setMessage(
        `${newResource.name} was added as version 1.`
      );
    }

    setSelectedFile(null);
    setResourceName("");
    setUploading(false);
    setShowUpload(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const handleDownload = (
    resource,
    version
  ) => {
    onDownload?.({
      resource,
      version,
    });

    if (version.file instanceof File) {
      const url =
        URL.createObjectURL(
          version.file
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;
      anchor.download =
        version.fileName;

      document.body.appendChild(
        anchor
      );

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    }

    setMessage(
      `Downloading ${version.fileName}.`
    );
  };

  const handleDeleteVersion = (
    resource,
    version
  ) => {
    if (resource.versions.length <= 1) {
      setMessage(
        "The only version of a resource cannot be deleted."
      );
      return;
    }

    if (version.current) {
      setMessage(
        "The current version cannot be deleted. Upload another version first."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete version ${version.version} of "${resource.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setResources((current) =>
      current.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              versions:
                item.versions.filter(
                  (itemVersion) =>
                    itemVersion.id !==
                    version.id
                ),
            }
          : item
      )
    );

    setMessage(
      `Version ${version.version} was removed.`
    );
  };

  const handleSetCurrent = (
    resource,
    version
  ) => {
    setResources((current) =>
      current.map((item) =>
        item.id === resource.id
          ? {
              ...item,
              versions:
                item.versions.map(
                  (itemVersion) => ({
                    ...itemVersion,
                    current:
                      itemVersion.id ===
                      version.id,
                  })
                ),
            }
          : item
      )
    );

    setMessage(
      `Version ${version.version} is now the current version.`
    );
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <History
              size={21}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Event Resources
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Resource Version Management
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Keep event resources up to date while maintaining
              their complete version history.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowUpload(
              (current) => !current
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700"
        >
          <Upload size={14} />
          Upload Resource
        </button>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<FileText size={17} />}
          label="Resources"
          value={resources.length}
          description="Managed event resources"
        />

        <StatCard
          icon={<History size={17} />}
          label="Versions"
          value={totalVersions}
          description="Total stored versions"
        />

        <StatCard
          icon={<RefreshCw size={17} />}
          label="Updated"
          value={updatedResources}
          description="Resources with revisions"
        />
      </div>

      {/* Upload form */}
      {showUpload && (
        <form
          onSubmit={handleUpload}
          className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/30 dark:bg-indigo-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Upload size={16} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                Upload New Version
              </h3>

              <p className="mt-1 text-[9px] leading-4 text-slate-500 dark:text-slate-400">
                Use the existing resource name to create a new
                version, or enter a new name to create a resource.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                Resource Name
              </label>

              <input
                type="text"
                value={resourceName}
                onChange={(event) =>
                  setResourceName(
                    event.target.value
                  )
                }
                placeholder="e.g. Event Rulebook"
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-wide text-slate-400">
                File
              </label>

              <input
                ref={fileInputRef}
                type="file"
                onChange={
                  handleSelectFile
                }
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-xs text-slate-600 dark:border-indigo-800 dark:bg-slate-950 dark:text-slate-300"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white p-3 dark:bg-slate-950">
              <File
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {selectedFile.name}
                </p>

                <p className="text-[9px] text-slate-400">
                  {formatFileSize(
                    selectedFile.size
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(
                    null
                  );

                  if (
                    fileInputRef.current
                  ) {
                    fileInputRef.current.value =
                      "";
                  }
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={13} />

              {uploading
                ? "Uploading..."
                : "Upload Version"}
            </button>

            <button
              type="button"
              onClick={() =>
                setShowUpload(false)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Message */}
      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-[10px] font-semibold text-green-700 dark:border-green-900/40 dark:bg-green-900/10 dark:text-green-400">
          {message}
        </div>
      )}

      {/* Resources */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Event Resources
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              Current and previous versions of uploaded resources.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {resources.length === 0 ? (
            <EmptyState />
          ) : (
            resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                expanded={
                  expandedResource ===
                  resource.id
                }
                onToggle={() =>
                  setExpandedResource(
                    (current) =>
                      current ===
                      resource.id
                        ? null
                        : resource.id
                  )
                }
                onUploadVersion={() => {
                  setSelectedResource(
                    resource
                  );
                  setResourceName(
                    resource.name
                  );
                  setShowUpload(true);
                }}
                onDownload={
                  handleDownload
                }
                onDeleteVersion={
                  handleDeleteVersion
                }
                onSetCurrent={
                  handleSetCurrent
                }
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Resource card
----------------------------------- */

const ResourceCard = ({
  resource,
  expanded,
  onToggle,
  onUploadVersion,
  onDownload,
  onDeleteVersion,
  onSetCurrent,
}) => {
  const currentVersion =
    resource.versions.find(
      (version) =>
        version.current
    ) ||
    resource.versions[
      resource.versions.length - 1
    ];

  const hasMultipleVersions =
    resource.versions.length > 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Main row */}
      <div className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FileText size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                {resource.name}
              </h4>

              {hasMultipleVersions && (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-bold text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  Updated
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[9px] text-slate-400">
              <span>
                {resource.type}
              </span>

              <span>•</span>

              <span>
                Version{" "}
                {currentVersion?.version}
              </span>

              <span>•</span>

              <span>
                {currentVersion?.size ||
                  "Unknown size"}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-[8px] text-slate-400">
              <Clock3 size={10} />

              Last updated{" "}
              {formatDate(
                currentVersion?.updatedAt
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onUploadVersion}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[9px] font-bold text-white hover:bg-indigo-700"
            >
              <Plus size={11} />
              New Version
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <History size={11} />
              History

              <ChevronDown
                size={11}
                className={
                  expanded
                    ? "rotate-180 transition"
                    : "transition"
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* Version history */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                Version History
              </h5>

              <p className="mt-1 text-[9px] text-slate-400">
                {resource.versions.length} version
                {resource.versions.length === 1
                  ? ""
                  : "s"} available
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {[...resource.versions]
              .sort(
                (a, b) =>
                  b.version -
                  a.version
              )
              .map((version) => (
                <VersionRow
                  key={version.id}
                  resource={resource}
                  version={version}
                  onDownload={() =>
                    onDownload(
                      resource,
                      version
                    )
                  }
                  onDelete={() =>
                    onDeleteVersion(
                      resource,
                      version
                    )
                  }
                  onSetCurrent={() =>
                    onSetCurrent(
                      resource,
                      version
                    )
                  }
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------
   Version row
----------------------------------- */

const VersionRow = ({
  resource,
  version,
  onDownload,
  onDelete,
  onSetCurrent,
}) => {
  return (
    <div
      className={`rounded-xl border p-3 ${
        version.current
          ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            version.current
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {version.current ? (
            <CheckCircle2 size={16} />
          ) : (
            <File size={16} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              Version{" "}
              {version.version}
            </p>

            {version.current && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-[7px] font-bold uppercase tracking-wide text-green-600 dark:bg-green-900/30 dark:text-green-400">
                Current
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-[9px] text-slate-500 dark:text-slate-400">
            {version.fileName}
          </p>

          <div className="mt-1 flex flex-wrap gap-2 text-[8px] text-slate-400">
            <span>
              {version.size}
            </span>

            <span>•</span>

            <span>
              {formatDate(
                version.updatedAt
              )}
            </span>

            <span>•</span>

            <span>
              {version.uploadedBy}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[9px] font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download size={11} />
            Download
          </button>

          {!version.current && (
            <button
              type="button"
              onClick={onSetCurrent}
              className="inline-flex items-center gap-1.5 rounded-lg border border-green-100 px-3 py-2 text-[9px] font-semibold text-green-600 hover:bg-green-50 dark:border-green-900/30 dark:hover:bg-green-900/20"
            >
              <CheckCircle2 size={11} />
              Make Current
            </button>
          )}

          {!version.current && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
              aria-label={`Delete version ${version.version}`}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Stat card
----------------------------------- */

const StatCard = ({
  icon,
  label,
  value,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        {icon}
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
   Empty state
----------------------------------- */

const EmptyState = () => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <FileText
        size={20}
        className="mx-auto text-slate-400"
      />

      <h3 className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
        No resources yet
      </h3>

      <p className="mt-1 text-[9px] text-slate-400">
        Upload an event resource to start managing versions.
      </p>
    </div>
  );
};

/* ----------------------------------
   Helpers
----------------------------------- */

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
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
};

const formatFileSize = (
  bytes
) => {
  if (!bytes) {
    return "0 KB";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
};

const getFileType = (
  fileName
) => {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toUpperCase();

  return extension || "FILE";
};

export default EventResourceVersionManagement;