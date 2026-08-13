import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface EventBannerPreviewProps {
  initialImage?: string;
  onImageChange?: (file: File | null) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
}

const DEFAULT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

const EventBannerPreview: React.FC<
  EventBannerPreviewProps
> = ({
  initialImage,
  onImageChange,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
}) => {
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(
      initialImage || null
    );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [error, setError] =
    useState<string>("");

  const [isDragging, setIsDragging] =
    useState(false);

  const [isPreviewLoaded, setIsPreviewLoaded] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /*
   * Update preview when the initial image
   * changes from the parent component.
   */
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(initialImage || null);
    }
  }, [initialImage, selectedFile]);

  /*
   * Clean up generated object URLs.
   */
  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const formatFileSize = (
    bytes: number
  ): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const validateFile = (
    file: File
  ): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Unsupported image format. Please use ${acceptedTypes
        .map((type) =>
          type.replace("image/", "").toUpperCase()
        )
        .join(", ")}.`;
    }

    if (file.size > maxFileSize) {
      return `Image is too large. Maximum allowed size is ${formatFileSize(
        maxFileSize
      )}.`;
    }

    return null;
  };

  const processFile = (
    file: File
  ) => {
    setError("");
    setIsPreviewLoaded(false);

    const validationError =
      validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      onImageChange?.(null);
      return;
    }

    /*
     * Remove the old generated URL before
     * creating a new one.
     */
    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    const newPreviewUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(newPreviewUrl);

    onImageChange?.(file);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    processFile(file);

    /*
     * Reset input so the same file can be
     * selected again if needed.
     */
    event.target.value = "";
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    processFile(file);
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    if (
      previewUrl &&
      previewUrl.startsWith("blob:")
    ) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setSelectedFile(null);
    setError("");
    setIsPreviewLoaded(false);

    onImageChange?.(null);
  };

  const replaceImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload section */}
      <div>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Event Banner
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload an image and preview how it
            will appear to participants.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onClick={openFilePicker}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:bg-blue-950">
              🖼️
            </div>

            <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              Upload event banner
            </h3>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Click to browse or drag and drop
              an image here
            </p>

            <p className="mt-2 text-xs text-gray-400">
              JPG, PNG or WEBP • Maximum{" "}
              {formatFileSize(maxFileSize)}
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openFilePicker();
              }}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Choose Image
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-lg dark:bg-green-950">
                  ✓
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedFile?.name ||
                      "Current event banner"}
                  </p>

                  {selectedFile && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(
                        selectedFile.size
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={replaceImage}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Replace
                </button>

                <button
                  type="button"
                  onClick={removeImage}
                  className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <span className="text-lg">
              ⚠️
            </span>

            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Unable to use this image
              </p>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview section */}
      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Live Preview
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This is an example of how your banner
              may appear to participants.
            </p>
          </div>

          {previewUrl && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Preview active
            </span>
          )}
        </div>

        {!previewUrl ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <div className="px-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-700">
                🖼️
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Your banner preview will appear
                here
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            {/* Banner image */}
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
              {!isPreviewLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                </div>
              )}

              <img
                src={previewUrl}
                alt="Event banner preview"
                onLoad={() =>
                  setIsPreviewLoaded(true)
                }
                onError={() => {
                  setIsPreviewLoaded(false);
                  setError(
                    "The selected image could not be displayed."
                  );
                }}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  isPreviewLoaded
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              />

              {/* Preview badge */}
              <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                Event Banner
              </div>
            </div>

            {/* Event card preview */}
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Upcoming Event
                  </span>

                  <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
                    Your Event Title
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    This preview shows how your
                    event banner can look alongside
                    event information.
                  </p>
                </div>

                <button
                  type="button"
                  className="shrink-0 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  View Event
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 dark:border-gray-800 sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <span>📅</span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Event date
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span>📍</span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Event location
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span>👥</span>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Participant registration
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information note */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg dark:bg-blue-900">
            ℹ️
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Preview only
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-300">
              Changes to the banner are only previewed
              here. The published event image will not
              be changed until the event is saved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventBannerPreview;