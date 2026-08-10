import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const EventImageGallery = ({
  images = [],
  title = "Event Gallery",
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] =
    useState(null);

  const galleryImages = Array.isArray(images)
    ? images.filter(Boolean)
    : [];

  const selectedImage =
    selectedIndex !== null
      ? galleryImages[selectedIndex]
      : null;

  const getImageUrl = (image) => {
    if (typeof image === "string") {
      return image;
    }

    return (
      image?.url ||
      image?.src ||
      image?.imageUrl ||
      image?.path ||
      ""
    );
  };

  const getImageTitle = (
    image,
    index
  ) => {
    if (typeof image === "object") {
      return (
        image?.alt ||
        image?.title ||
        image?.caption ||
        `${title} photo ${index + 1}`
      );
    }

    return `${title} photo ${index + 1}`;
  };

  const closeViewer = () => {
    setSelectedIndex(null);
  };

  const showPrevious = () => {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current === 0
        ? galleryImages.length - 1
        : current - 1;
    });
  };

  const showNext = () => {
    setSelectedIndex((current) => {
      if (current === null) {
        return null;
      }

      return current ===
        galleryImages.length - 1
        ? 0
        : current + 1;
    });
  };

  useEffect(() => {
    if (selectedIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedIndex]);

  if (galleryImages.length === 0) {
    return (
      <section
        className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 ${className}`}
      >
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <ImageIcon
              size={22}
              className="text-slate-400"
            />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">
            No event photos yet
          </h2>

          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
            Event highlights, venue photos, speaker
            photos, and previous editions will appear
            here when available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        aria-labelledby="event-gallery-title"
        className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <ImageIcon
                size={17}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <h2
                id="event-gallery-title"
                className="text-sm font-bold text-slate-800 dark:text-white"
              >
                {title}
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                {galleryImages.length}{" "}
                {galleryImages.length === 1
                  ? "photo"
                  : "photos"}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {galleryImages.map(
            (image, index) => {
              const imageUrl =
                getImageUrl(image);

              if (!imageUrl) {
                return null;
              }

              return (
                <button
                  key={
                    image?.id ||
                    imageUrl ||
                    index
                  }
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      index
                    )
                  }
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-slate-800 dark:focus:ring-offset-slate-900"
                  aria-label={`View ${getImageTitle(
                    image,
                    index
                  )}`}
                >
                  <img
                    src={imageUrl}
                    alt={getImageTitle(
                      image,
                      index
                    )}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35">
                    <div className="scale-90 rounded-full bg-white/90 p-2 opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100">
                      <Expand
                        size={16}
                        className="text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Caption */}
                  {typeof image ===
                    "object" &&
                    image?.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 opacity-0 transition group-hover:opacity-100">
                        <p className="truncate text-[10px] font-medium text-white">
                          {image.caption}
                        </p>
                      </div>
                    )}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Fullscreen viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen event image viewer"
          onClick={closeViewer}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeViewer}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close image viewer"
          >
            <X size={20} />
          </button>

          {/* Previous */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:left-6"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={getImageUrl(
                selectedImage
              )}
              alt={getImageTitle(
                selectedImage,
                selectedIndex
              )}
              className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
            />

            <div className="mt-3 flex max-w-xl flex-col items-center text-center">
              <p className="text-xs font-semibold text-white">
                {getImageTitle(
                  selectedImage,
                  selectedIndex
                )}
              </p>

              <p className="mt-1 text-[10px] text-white/60">
                {(selectedIndex ?? 0) + 1}{" "}
                / {galleryImages.length}
              </p>
            </div>
          </div>

          {/* Next */}
          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white sm:right-6"
              aria-label="Next image"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default EventImageGallery;