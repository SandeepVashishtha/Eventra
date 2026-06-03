
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
      className={`btn-primary relative ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2 justify-center">
          {/* CSS spinner — no library needed */}
          <span
            className="inline-block w-4 h-4 border-2 border-white
                       border-t-transparent rounded-full animate-spin"
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
