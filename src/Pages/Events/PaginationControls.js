import { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  EVENTS_PER_PAGE_OPTIONS,
  getVisiblePaginationPages,
} from "./eventPaginationUtils.mjs";

const PageButton = ({ children, isActive = false, onClick, ariaLabel }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 min-w-10 rounded-lg px-3 text-sm font-medium transition ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      }`}
      aria-current={isActive ? "page" : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

const PageGap = () => {
  return (
    <span className="px-1 text-sm text-gray-500 dark:text-gray-400">...</span>
  );
};

const ArrowButton = ({ direction, disabled, onClick }) => {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      aria-label={`${direction === "previous" ? "Previous" : "Next"} page`}
    >
      <Icon size={18} />
    </button>
  );
};

const PageSizeSelector = ({ eventsPerPage, onPageSizeChange }) => {
  return (
    <label
      htmlFor="events-per-page"
      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
    >
      Per page
      <select
        id="events-per-page"
        value={eventsPerPage}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {EVENTS_PER_PAGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

const PageNumberControls = ({ currentPage, totalPages, onPageChange }) => {
  const { firstVisiblePage, lastVisiblePage, pages } =
    getVisiblePaginationPages(currentPage, totalPages);

  return (
    <>
      {firstVisiblePage > 1 && (
        <>
          <PageButton onClick={() => onPageChange(1)} ariaLabel="Go to page 1">
            1
          </PageButton>
          {firstVisiblePage > 2 && <PageGap />}
        </>
      )}

      {pages.map((page) => (
        <PageButton
          key={page}
          isActive={page === currentPage}
          onClick={() => onPageChange(page)}
          ariaLabel={`Go to page ${page}`}
        >
          {page}
        </PageButton>
      ))}

      {lastVisiblePage < totalPages && (
        <>
          {lastVisiblePage < totalPages - 1 && <PageGap />}
          <PageButton
            onClick={() => onPageChange(totalPages)}
            ariaLabel={`Go to page ${totalPages}`}
          >
            {totalPages}
          </PageButton>
        </>
      )}
    </>
  );
};

const PaginationControls = ({
  currentPage,
  eventsPerPage,
  totalEvents,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalEvents === 0) {
    return null;
  }

  const startEvent = (currentPage - 1) * eventsPerPage + 1;
  const endEvent = Math.min(currentPage * eventsPerPage, totalEvents);

  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startEvent}–{endEvent} of {totalEvents} events
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <PageSizeSelector
          eventsPerPage={eventsPerPage}
          onPageSizeChange={onPageSizeChange}
        />

        <nav className="flex items-center gap-2" aria-label="Event pagination">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="First page"
          >
            <ChevronsLeft size={18} />
          </button>

          <ArrowButton
            direction="previous"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />

          <PageNumberControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />

          <ArrowButton
            direction="next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Last page"
          >
            <ChevronsRight size={18} />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default memo(PaginationControls);
