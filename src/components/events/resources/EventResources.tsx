import React, {
  ChangeEvent,
  useMemo,
  useRef,
  useState,
} from "react";

export interface EventResource {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface EventResourcesProps {
  eventId: string;
  resources?: EventResource[];
  organizer?: boolean;
  maxFileSizeMB?: number;
  onUpload?: (
    file: File,
    eventId: string
  ) => void | Promise<void>;
  onRemove?: (
    resource: EventResource
  ) => void | Promise<void>;
  onReplace?: (
    resource: EventResource,
    file: File
  ) => void | Promise<void>;
}

const DEFAULT_MAX_FILE_SIZE_MB = 10;

const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".txt",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes <= 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type?: string) => {
  if (!type) {
    return "📄";
  }

  if (type.includes("pdf")) {
    return "📕";
  }

  if (
    type.includes("word") ||
    type.includes("document")
  ) {
    return "📘";
  }

  if (
    type.includes("excel") ||
    type.includes("sheet")
  ) {
    return "📗";
  }

  if (
    type.includes("powerpoint") ||
    type.includes("presentation")
  ) {
    return "📙";
  }

  if (type.startsWith("image/")) {
    return "🖼️";
  }

  return "📄";
};

const EventResources: React.FC<
  EventResourcesProps
> = ({
  eventId,
  resources = [],
  organizer = false,
  maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB,
  onUpload,
  onRemove,
  onReplace,
}) => {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const replaceInputRef =
    useRef<HTMLInputElement | null>(null);

  const [
    replacingResource,
    setReplacingResource,
  ] = useState<EventResource | null>(null);

  const [localResources, setLocalResources] =
    useState<EventResource[]>(resources);

  const [error, setError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const [
    removingResourceId,
    setRemovingResourceId,
  ] = useState<string | null>(null);

  const maxFileSizeBytes =
    maxFileSizeMB * 1024 * 1024;

  const resourceCount =
    localResources.length;

  const hasResources =
    resourceCount > 0;

  const supportedFormats = useMemo(
    () =>
      SUPPORTED_EXTENSIONS.join(", "),
    []
  );

  const validateFile = (
    file: File
  ): string | null => {
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      const extension =
        file.name
          .slice(file.name.lastIndexOf("."))
          .toLowerCase();

      if (
        !SUPPORTED_EXTENSIONS.includes(
          extension
        )
      ) {
        return `"${file.name}" is not a supported file type.`;
      }
    }

    if (file.size > maxFileSizeBytes) {
      return `"${file.name}" exceeds the ${maxFileSizeMB} MB file size limit.`;
    }

    return null;
  };

  const handleUploadClick = () => {
    setError("");
    fileInputRef.current?.click();
  };

  const handleFileSelection = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      await onUpload?.(
        file,
        eventId
      );

      /*
       * The parent/API should normally return the
       * uploaded resource and update the resources prop.
       *
       * This fallback keeps the UI useful when no
       * upload callback is connected yet.
       */
      if (!onUpload) {
        const localResource: EventResource = {
          id: `${Date.now()}-${file.name}`,
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          uploadedAt:
            new Date().toISOString(),
        };

        setLocalResources(
          (previous) => [
            ...previous,
            localResource,
          ]
        );
      }
    } catch {
      setError(
        "The resource could not be uploaded. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (
    resource: EventResource
  ) => {
    const confirmed =
      window.confirm(
        `Remove "${resource.name}" from this event?`
      );

    if (!confirmed) {
      return;
    }

    setRemovingResourceId(
      resource.id
    );
    setError("");

    try {
      await onRemove?.(
        resource
      );

      if (!onRemove) {
        setLocalResources(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                resource.id
            )
        );
      }
    } catch {
      setError(
        "The resource could not be removed. Please try again."
      );
    } finally {
      setRemovingResourceId(null);
    }
  };

  const handleReplaceClick = (
    resource: EventResource
  ) => {
    setError("");
    setReplacingResource(resource);

    setTimeout(() => {
      replaceInputRef.current?.click();
    }, 0);
  };

  const handleReplaceSelection = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file || !replacingResource) {
      return;
    }

    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");

    try {
      await onReplace?.(
        replacingResource,
        file
      );

      if (!onReplace) {
        const updatedResource: EventResource =
          {
            ...replacingResource,
            name: file.name,
            url: URL.createObjectURL(
              file
            ),
            size: file.size,
            type: file.type,
            uploadedAt:
              new Date().toISOString(),
          };

        setLocalResources(
          (previous) =>
            previous.map(
              (resource) =>
                resource.id ===
                replacingResource.id
                  ? updatedResource
                  : resource
            )
        );
      }
    } catch {
      setError(
        "The resource could not be replaced. Please try again."
      );
    } finally {
      setUploading(false);
      setReplacingResource(null);
    }
  };

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-5 dark:border-gray-700 dark:from-blue-950/40 dark:via-gray-900 dark:to-purple-950/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-950">
              📚
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Event Resources
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Resources & Documents
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {organizer
                  ? "Attach useful documents and resources for participants."
                  : "Access documents and resources shared for this event."}
              </p>
            </div>
          </div>

          {organizer && (
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : "+ Add Resource"}
            </button>
          )}
        </div>
      </div>

      {/* Hidden inputs */}
      {organizer && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={supportedFormats}
            onChange={
              handleFileSelection
            }
          />

          <input
            ref={replaceInputRef}
            type="file"
            className="hidden"
            accept={supportedFormats}
            onChange={
              handleReplaceSelection
            }
          />
        </>
      )}

      <div className="p-5 sm:p-6">
        {/* Upload information */}
        {organizer && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
            <div className="flex items-start gap-3">
              <span className="text-lg">
                💡
              </span>

              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Resource guidelines
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800 dark:text-blue-400">
                  Supported files: PDF, documents,
                  spreadsheets, presentations, and common
                  image formats. Maximum file size:{" "}
                  {maxFileSizeMB} MB.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}

        {/* Empty state */}
        {!hasResources && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl dark:bg-gray-700">
              📄
            </div>

            <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
              No resources available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {organizer
                ? "Attach guidelines, schedules, templates, rulebooks, or other useful event documents."
                : "The organizer has not added any resources to this event yet."}
            </p>

            {organizer && (
              <button
                type="button"
                onClick={
                  handleUploadClick
                }
                disabled={uploading}
                className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Add First Resource
              </button>
            )}
          </div>
        )}

        {/* Resource list */}
        {hasResources && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Available Resources
                </h3>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {resourceCount}{" "}
                  {resourceCount === 1
                    ? "resource"
                    : "resources"}{" "}
                  available
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {localResources.map(
                (resource) => (
                  <article
                    key={resource.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-800"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {/* Icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl dark:bg-gray-800">
                        {getFileIcon(
                          resource.type
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {resource.name}
                        </h4>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {resource.size !==
                            undefined && (
                            <span>
                              {formatFileSize(
                                resource.size
                              )}
                            </span>
                          )}

                          {resource.uploadedAt && (
                            <>
                              <span>•</span>

                              <span>
                                Added{" "}
                                {new Date(
                                  resource.uploadedAt
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={
                            resource.url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Open
                        </a>

                        <a
                          href={
                            resource.url
                          }
                          download
                          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Download
                        </a>

                        {organizer && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleReplaceClick(
                                  resource
                                )
                              }
                              disabled={
                                uploading
                              }
                              className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                            >
                              Replace
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(
                                  resource
                                )
                              }
                              disabled={
                                removingResourceId ===
                                resource.id
                              }
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              {removingResourceId ===
                              resource.id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-3">
          <span className="text-lg">
            🔐
          </span>

          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Event-specific access
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
              Resources are displayed only when they are
              associated with this event and available to
              the current user.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventResources;