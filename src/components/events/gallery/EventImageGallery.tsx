import React, {
  ChangeEvent,
  useMemo,
  useState,
} from "react";

export interface EventGalleryImage {
  id: string;
  url: string;
  name?: string;
  order: number;
}

interface EventImageGalleryProps {
  images?: EventGalleryImage[];
  isOrganizer?: boolean;
  onAddImages?: (
    images: File[]
  ) => Promise<void> | void;
  onRemoveImage?: (
    imageId: string
  ) => Promise<void> | void;
  onReorderImages?: (
    images: EventGalleryImage[]
  ) => Promise<void> | void;
  maxImages?: number;
  maxFileSizeMB?: number;
  className?: string;
}

const DEFAULT_MAX_IMAGES = 10;
const DEFAULT_MAX_FILE_SIZE_MB = 5;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EventImageGallery: React.FC<
  EventImageGalleryProps
> = ({
  images = [],
  isOrganizer = false,
  onAddImages,
  onRemoveImage,
  onReorderImages,
  maxImages = DEFAULT_MAX_IMAGES,
  maxFileSizeMB =
    DEFAULT_MAX_FILE_SIZE_MB,
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  const [isAdding, setIsAdding] =
    useState(false);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [draggedId, setDraggedId] =
    useState<string | null>(null);

  const sortedImages = useMemo(() => {
    return [...images].sort(
      (a, b) =>
        a.order - b.order
    );
  }, [images]);

  const selectedImage =
    sortedImages[selectedIndex];

  const remainingSlots =
    Math.max(
      maxImages -
        sortedImages.length,
      0
    );

  const validateFiles = (
    files: File[]
  ) => {
    const maxBytes =
      maxFileSizeMB *
      1024 *
      1024;

    for (const file of files) {
      if (
        !ACCEPTED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        return `Unsupported image format: ${file.name}. Please use JPG, PNG, or WebP.`;
      }

      if (file.size > maxBytes) {
        return `${file.name} exceeds the ${maxFileSizeMB}MB file size limit.`;
      }
    }

    return "";
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setError("");

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    if (files.length > remainingSlots) {
      setError(
        `You can add only ${remainingSlots} more image${
          remainingSlots === 1
            ? ""
            : "s"
        }.`
      );

      event.target.value = "";
      return;
    }

    const validationError =
      validateFiles(files);

    if (validationError) {
      setError(
        validationError
      );

      event.target.value = "";
      return;
    }

    setIsAdding(true);

    try {
      await onAddImages?.(
        files
      );
    } catch (uploadError) {
      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Unable to upload images."
      );
    } finally {
      setIsAdding(false);
      event.target.value = "";
    }
  };

  const handleRemove = async (
    imageId: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this image?"
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setRemovingId(imageId);

    try {
      await onRemoveImage?.(
        imageId
      );

      if (
        selectedIndex >=
        sortedImages.length - 1
      ) {
        setSelectedIndex(
          Math.max(
            sortedImages.length - 2,
            0
          )
        );
      }
    } catch (removeError) {
      setError(
        removeError instanceof
          Error
          ? removeError.message
          : "Unable to remove the image."
      );
    } finally {
      setRemovingId(null);
    }
  };

  const moveImage = async (
    imageId: string,
    direction: "left" | "right"
  ) => {
    const currentIndex =
      sortedImages.findIndex(
        (image) =>
          image.id === imageId
      );

    if (
      currentIndex === -1
    ) {
      return;
    }

    const targetIndex =
      direction === "left"
        ? currentIndex - 1
        : currentIndex + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        sortedImages.length
    ) {
      return;
    }

    const reordered = [
      ...sortedImages,
    ];

    const [
      movedImage,
    ] = reordered.splice(
      currentIndex,
      1
    );

    reordered.splice(
      targetIndex,
      0,
      movedImage
    );

    const normalized =
      reordered.map(
        (image, index) => ({
          ...image,
          order: index,
        })
      );

    setSelectedIndex(
      targetIndex
    );

    try {
      await onReorderImages?.(
        normalized
      );
    } catch (reorderError) {
      setError(
        reorderError instanceof
          Error
          ? reorderError.message
          : "Unable to reorder images."
      );
    }
  };

  const handleDragStart = (
    imageId: string
  ) => {
    setDraggedId(imageId);
  };

  const handleDrop = async (
    targetId: string
  ) => {
    if (
      !draggedId ||
      draggedId === targetId
    ) {
      setDraggedId(null);
      return;
    }

    const sourceIndex =
      sortedImages.findIndex(
        (image) =>
          image.id ===
          draggedId
      );

    const targetIndex =
      sortedImages.findIndex(
        (image) =>
          image.id ===
          targetId
      );

    if (
      sourceIndex === -1 ||
      targetIndex === -1
    ) {
      setDraggedId(null);
      return;
    }

    const reordered = [
      ...sortedImages,
    ];

    const [
      movedImage,
    ] = reordered.splice(
      sourceIndex,
      1
    );

    reordered.splice(
      targetIndex,
      0,
      movedImage
    );

    const normalized =
      reordered.map(
        (image, index) => ({
          ...image,
          order: index,
        })
      );

    setDraggedId(null);

    try {
      await onReorderImages?.(
        normalized
      );
    } catch (reorderError) {
      setError(
        reorderError instanceof
          Error
          ? reorderError.message
          : "Unable to reorder images."
      );
    }
  };

  const showPrevious = () => {
    if (!sortedImages.length) {
      return;
    }

    setSelectedIndex(
      (current) =>
        current === 0
          ? sortedImages.length - 1
          : current - 1
    );
  };

  const showNext = () => {
    if (!sortedImages.length) {
      return;
    }

    setSelectedIndex(
      (current) =>
        current ===
        sortedImages.length - 1
          ? 0
          : current + 1
    );
  };

  return (
    <section
      className={`
        w-full
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-5
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-900
        ${className}
      `}
    >
      {/* Header */}
      <div
        className="
          mb-5
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h2
            className="
              text-xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Event Gallery
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {sortedImages.length}{" "}
            {sortedImages.length === 1
              ? "image"
              : "images"}
          </p>
        </div>

        {isOrganizer &&
          remainingSlots > 0 && (
            <label
              className="
                inline-flex
                cursor-pointer
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-700
                has-[:disabled]:cursor-not-allowed
                has-[:disabled]:opacity-50
              "
            >
              {isAdding
                ? "Uploading..."
                : "Add Images"}

              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(
                  ","
                )}
                multiple
                disabled={isAdding}
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>
          )}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="
            mb-5
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-3
            text-sm
            text-red-700
            dark:border-red-900
            dark:bg-red-950/30
            dark:text-red-300
          "
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {sortedImages.length ===
      0 ? (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-gray-300
            p-10
            text-center
            dark:border-gray-700
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-gray-100
              text-2xl
              dark:bg-gray-800
            "
          >
            🖼️
          </div>

          <h3
            className="
              mt-4
              text-base
              font-bold
              text-gray-800
              dark:text-gray-200
            "
          >
            No gallery images yet
          </h3>

          <p
            className="
              mx-auto
              mt-2
              max-w-md
              text-sm
              leading-6
              text-gray-500
              dark:text-gray-400
            "
          >
            Add images to give participants
            a better visual preview of the
            event.
          </p>

          {isOrganizer && (
            <label
              className="
                mt-5
                inline-flex
                cursor-pointer
                rounded-xl
                bg-blue-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-blue-700
              "
            >
              Add Event Images

              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(
                  ","
                )}
                multiple
                onChange={
                  handleFileChange
                }
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        <>
          {/* Main image */}
          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              bg-gray-100
              dark:bg-gray-800
            "
          >
            <div
              className="
                aspect-video
                w-full
              "
            >
              {selectedImage && (
                <img
                  src={
                    selectedImage.url
                  }
                  alt={
                    selectedImage.name ||
                    `Event gallery image ${
                      selectedIndex + 1
                    }`
                  }
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              )}
            </div>

            {sortedImages.length >
              1 && (
              <>
                <button
                  type="button"
                  onClick={
                    showPrevious
                  }
                  aria-label="Previous image"
                  className="
                    absolute
                    left-3
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/60
                    text-xl
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/80
                  "
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={
                    showNext
                  }
                  aria-label="Next image"
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/60
                    text-xl
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-black/80
                  "
                >
                  ›
                </button>

                <div
                  className="
                    absolute
                    bottom-3
                    left-1/2
                    -translate-x-1/2
                    rounded-full
                    bg-black/60
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-white
                    backdrop-blur
                  "
                >
                  {selectedIndex +
                    1}{" "}
                  /{" "}
                  {
                    sortedImages.length
                  }
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div
            className="
              mt-4
              grid
              grid-cols-3
              gap-3
              sm:grid-cols-4
              md:grid-cols-5
              lg:grid-cols-6
            "
          >
            {sortedImages.map(
              (image, index) => (
                <div
                  key={image.id}
                  draggable={
                    isOrganizer
                  }
                  onDragStart={() =>
                    handleDragStart(
                      image.id
                    )
                  }
                  onDragOver={(event) =>
                    event.preventDefault()
                  }
                  onDrop={() =>
                    handleDrop(
                      image.id
                    )
                  }
                  className="
                    group
                    relative
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedIndex(
                        index
                      )
                    }
                    className={`
                      aspect-square
                      w-full
                      overflow-hidden
                      rounded-xl
                      border-2
                      transition
                      ${
                        selectedIndex ===
                        index
                          ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                      }
                    `}
                    aria-label={`View image ${
                      index + 1
                    }`}
                  >
                    <img
                      src={
                        image.url
                      }
                      alt={
                        image.name ||
                        `Gallery thumbnail ${
                          index + 1
                        }`
                      }
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  </button>

                  {isOrganizer && (
                    <div
                      className="
                        absolute
                        bottom-2
                        left-1/2
                        flex
                        -translate-x-1/2
                        gap-1
                        opacity-0
                        transition
                        group-hover:opacity-100
                      "
                    >
                      <button
                        type="button"
                        disabled={
                          index ===
                          0
                        }
                        onClick={() =>
                          moveImage(
                            image.id,
                            "left"
                          )
                        }
                        aria-label="Move image left"
                        className="
                          rounded-md
                          bg-black/70
                          px-2
                          py-1
                          text-xs
                          text-white
                          disabled:opacity-30
                        "
                      >
                        ←
                      </button>

                      <button
                        type="button"
                        disabled={
                          index ===
                          sortedImages.length -
                            1
                        }
                        onClick={() =>
                          moveImage(
                            image.id,
                            "right"
                          )
                        }
                        aria-label="Move image right"
                        className="
                          rounded-md
                          bg-black/70
                          px-2
                          py-1
                          text-xs
                          text-white
                          disabled:opacity-30
                        "
                      >
                        →
                      </button>

                      <button
                        type="button"
                        disabled={
                          removingId ===
                          image.id
                        }
                        onClick={() =>
                          handleRemove(
                            image.id
                          )
                        }
                        aria-label="Remove image"
                        className="
                          rounded-md
                          bg-red-600/90
                          px-2
                          py-1
                          text-xs
                          text-white
                          disabled:opacity-50
                        "
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          {/* Organizer information */}
          {isOrganizer && (
            <div
              className="
                mt-5
                rounded-xl
                bg-gray-50
                p-4
                dark:bg-gray-800
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-2
                  text-xs
                  text-gray-500
                  dark:text-gray-400
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span>
                  {sortedImages.length} /{" "}
                  {maxImages} images
                </span>

                <span>
                  JPG, PNG, or WebP · Max{" "}
                  {maxFileSizeMB}MB each
                </span>
              </div>

              {remainingSlots ===
                0 && (
                <p
                  className="
                    mt-2
                    text-xs
                    font-medium
                    text-amber-600
                    dark:text-amber-400
                  "
                >
                  Gallery image limit
                  reached.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default EventImageGallery;