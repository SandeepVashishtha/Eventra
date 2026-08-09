import { motion } from "framer-motion";
import { Users, Calendar, Trophy, FolderOpen, Search, X, SlidersHorizontal } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import SearchEmptyState from "../common/SearchEmptyState";
import StyledDropdown from "../StyledDropdown";
import { DashboardTableSkeleton } from "../common/SkeletonLoaders";
import { getSmartDateLabel } from "../../utils/relativeTime";
import { downloadBulkICSFile } from "../../utils/calendarExporter";
import CertificateDownload from "../CertificateDownload";

const TYPE_ICON = {
  Event: <Calendar className="ud-type-icon" style={{ color: "#6366f1" }} />,
  Hackathon: <Trophy className="ud-type-icon" style={{ color: "#ec4899" }} />,
  Project: <FolderOpen className="ud-type-icon" style={{ color: "#8b5cf6" }} />,
};

const TYPE_OPTIONS = ["Event", "Hackathon", "Project"];
const STATUS_OPTIONS = ["Upcoming", "Completed", "In Progress", "Done"];

const RegistrationsTab = ({
  filteredData,
  loading,
  searchTerm,
  setSearchTerm,
  isDebouncing,
  selectedTypes,
  toggleType,
  selectedStatuses,
  toggleStatus,
  activeFilterCount,
  clearAll,
  setSelectedTicketEvent,
}) => {
  // Derive display value for the type dropdown
  const typeDisplayValue = selectedTypes.includes("All") ? "" : selectedTypes.join(", ");

  // Derive display value for the status dropdown
  const statusDisplayValue = selectedStatuses.includes("All") ? "" : selectedStatuses.join(", ");

  // Handler adapters for StyledDropdown (single-select per click, but we
  // accumulate via toggleType / toggleStatus for multi-select behaviour)
  const handleTypeChange = (val) => {
    // StyledDropdown passes "" when placeholder is selected (== "All")
    if (!val) {
      toggleType("All");
    } else {
      toggleType(val);
    }
  };

  const handleStatusChange = (val) => {
    if (!val) {
      toggleStatus("All");
    } else {
      toggleStatus(val);
    }
  };

  return (
    <motion.div
      key="registrations"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="ud-content"
    >
      {/* Header */}
      <div className="ud-tab-header" style={{ alignItems: "center", gap: "1rem" }}>
        <h2 className="ud-page-title" style={{ margin: 0 }}>
          <Users size={20} /> All Registrations
        </h2>

        {filteredData.length > 0 && (
          <button
            onClick={() => downloadBulkICSFile(filteredData, "eventra-schedule")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Calendar size={15} /> Export Schedule (.ics)
          </button>
        )}
      </div>

      {/* Filters toolbar */}
      <div className="ud-filter-row" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
        {/* Debounced search input */}
        <div className="ud-search-wrap" style={{ minWidth: 220 }}>
          <Search size={15} className="ud-search-icon" />
          <input
            className="ud-search"
            placeholder="Search registrations…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="registrations-search"
          />
          {searchTerm && (
            <button
              className="ud-search-clear"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
          {isDebouncing && (
            <span
              className="ud-search-spinner"
              aria-label="Searching…"
              style={{
                position: "absolute",
                right: searchTerm ? 32 : 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                border: "2px solid #6366f1",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
          )}
        </div>

        {/* Type filter — StyledDropdown */}
        <StyledDropdown
          label=""
          placeholder="All Types"
          value={typeDisplayValue}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
        />

        {/* Status filter — StyledDropdown */}
        <StyledDropdown
          label=""
          placeholder="All Statuses"
          value={statusDisplayValue}
          options={STATUS_OPTIONS}
          onChange={handleStatusChange}
        />

        {/* Active filter badge + clear */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="ud-clear-filters-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6366f1",
              background: "#6366f110",
              border: "1px solid #6366f130",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            aria-label="Clear all filters"
          >
            <SlidersHorizontal size={13} />
            Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <DashboardTableSkeleton rows={6} />
      ) : filteredData.length === 0 ? (
        /* Empty state — reuse the shared SearchEmptyState component */
        <SearchEmptyState
          query={searchTerm}
          itemLabel="registrations"
          browseLabel="Browse Events"
          browsePath="/events"
          onClear={clearAll}
          suggestions={[
            "Check your spelling",
            "Remove a filter to widen results",
            "Try searching by event name",
          ]}
        />
      ) : (
        <div className="ud-table-wrap">
          <table className="ud-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Date</th>
                <th>Location / Info</th>
                <th>Status</th>
                <th>Participation</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="ud-table-type">
                      {TYPE_ICON[item.type]}
                      {item.type}
                    </span>
                  </td>
                  <td className="ud-table-title" title={item.title}>
                    {item.title}
                  </td>
                  <td title={item.date || ""}>{item.date ? getSmartDateLabel(item.date) : "—"}</td>
                  <td title={item.location || item.lastUpdate || "—"}>
                    {item.location || item.lastUpdate || "—"}
                  </td>
                  <td>
                    <StatusBadge
                      status={item.projectStatus !== "-" ? item.projectStatus : item.status}
                    />
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <StatusBadge status={item.participationType} />
                      {(item.type === "Event" || item.type === "Hackathon") &&
                        item.participationType === "Registered" && (
                          <button
                            onClick={() => setSelectedTicketEvent(item)}
                            className="ud-btn-ticket"
                          >
                            View Ticket
                          </button>
                        )}
                      {(item.type === 'Event' || item.type === 'Hackathon') &&
                        item.status === 'Completed' && (
                          <CertificateDownload
                            eventName={item.title}
                            eventDate={item.date}
                            eventType={item.type}
                            organizerName={item.organizerName}
                          />
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default RegistrationsTab;
