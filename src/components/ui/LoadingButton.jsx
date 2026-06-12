export function LoadingButton({
  isLoading,
  children,
  loadingText = "Submitting...",
  className = "",
  ...props
}) {
  return (
    <button
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? loadingText : undefined}
      className={`btn-primary relative ${isLoading ? "cursor-not-allowed opacity-70" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          {/* CSS spinner — no library needed */}
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
