// src/components/user/RegistrationsTab.jsx
import { motion } from "framer-motion";
import { Users, Calendar, Trophy, FolderOpen, Search, X, SlidersHorizontal } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import SearchEmptyState from "../common/SearchEmptyState";
import EmptyState from "../common/EmptyState";
import StyledDropdown from "../StyledDropdown";
import { DashboardTableSkeleton } from "../common/SkeletonLoaders";
import { getSmartDateLabel } from "../../utils/relativeTime";
import { downloadBulkICSFile } from "../../utils/calendarExporter";
import CertificateDownload from "../CertificateDownload";
import { useRegistrationFilters, TYPE_OPTIONS, STATUS_OPTIONS } from "../../hooks/useRegistrationFilters";

// Icon mapping (extracted to reduce complexity)
const TYPE_ICON = {
  Event: <Calendar className="ud-type-icon" style={{ color: "#6366f1" }} />,
  Hackathon: <Trophy className="ud-type-icon" style={{ color: "#ec4899" }} />,
  Project: <FolderOpen className="ud-type-icon" style={{ color: "#8b5cf6" }} />,
};

// Helper to render status badge
const renderStatusBadge = (item) => {
  const status = item.projectStatus !== "-" ? item.projectStatus : item.status;
  return <StatusBadge status={status} />;
};

// Helper to render participation actions
const renderParticipationActions = (item, setSelectedTicketEvent) => {
  const isRegistered = item.participationType === "Registered";
  const isCompleted = item.status === "Completed";
  const isEventOrHackathon = item.type === "Event" || item.type === "Hackathon";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
      <StatusBadge status={item.participationType} />
      {isEventOrHackathon && isRegistered && (
        <button
          onClick={() => setSelectedTicketEvent(item)}
          className="ud-btn-ticket"
          style={{
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            borderRadius: "0.5rem",
            background: "#6366f1",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          View Ticket
        </button>
      )}
      {isEventOrHackathon && isCompleted && (
        <CertificateDownload
          eventName={item.title}
          eventDate={item.date}
          eventType={item.type}
          organizerName={item.organizerName}
        />
      )}
    </div>
  );
};

// Helper to render table row
const renderTableRow = (item, setSelectedTicketEvent) => (
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
    <td>{renderStatusBadge(item)}</td>
    <td>{renderParticipationActions(item, setSelectedTicketEvent)}</td>
  </tr>
);

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
  hasRegistrations = false,
  totalRegistrations = 0,
}) => {
  // Derive display value for the type dropdown
  const typeDisplayValue = selectedTypes.includes("All") ? "" : selectedTypes.join(", ");
  const statusDisplayValue = selectedStatuses.includes("All") ? "" : selectedStatuses.join(", ");

  const handleTypeChange = (val) => {
    if (!val) toggleType("All");
    else toggleType(val);
  };

  const handleStatusChange = (val) => {
    if (!val) toggleStatus("All");
    else toggleStatus(val);
  };

  const hasAnyRegistrations = hasRegistrations || totalRegistrations > 0;

  // Render filters
  const renderFilters = () => (
    <div className="ud-filter-row" style={{ flexWrap: "wrap", gap: "0.75rem" }}>
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
          <button className="ud-search-clear" onClick={() => setSearchTerm("")} aria-label="Clear search">
            <X size={13} />
          </button>
        )}
        {isDebouncing && (
          <span
            className="ud-search-spinner"
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

      <StyledDropdown
        label=""
        placeholder="All Types"
        value={typeDisplayValue}
        options={TYPE_OPTIONS}
        onChange={handleTypeChange}
      />

      <StyledDropdown
        label=""
        placeholder="All Statuses"
        value={statusDisplayValue}
        options={STATUS_OPTIONS}
        onChange={handleStatusChange}
      />

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
        >
          <SlidersHorizontal size={13} />
          Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );

  // Render table
  const renderTable = () => (
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
          {filteredData.map((item) => renderTableRow(item, setSelectedTicketEvent))}
        </tbody>
      </table>
    </div>
  );

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
          {!loading && hasAnyRegistrations && (
            <span style={{ fontSize: "0.875rem", fontWeight: "normal", color: "#94a3b8", marginLeft: "0.5rem" }}>
              ({totalRegistrations || filteredData.length})
            </span>
          )}
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

      {/* Filters */}
      {hasAnyRegistrations && renderFilters()}

      {/* Content */}
      {loading ? (
        <DashboardTableSkeleton rows={6} />
      ) : !hasAnyRegistrations ? (
        <EmptyState
          icon={<Users size={48} className="text-indigo-500" />}
          title="No Registrations Found"
          description="You haven't registered for any events or hackathons yet. Start exploring and join your first event today!"
          actionLabel="Browse Events"
          actionPath="/events"
          secondaryActionLabel="Explore Hackathons"
          secondaryActionPath="/hackathons"
        />
      ) : filteredData.length === 0 ? (
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
        renderTable()
      )}
    </motion.div>
  );
};

export default RegistrationsTab;